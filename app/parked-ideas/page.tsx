'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrg } from '@/components/providers/OrgProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Trash2 } from 'lucide-react'
import { createAction } from '@/lib/data/actions'
import { deleteParkedIdea, getParkedIdeas } from '@/lib/data/parked-ideas'
import { getActiveNorthStar } from '@/lib/data/north-star'
import { useMemoryEvent } from '@/hooks/useMemoryEvent'
import type { ParkedIdea } from '@/lib/supabase/types'

export default function ParkedIdeasPage() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const [ideas, setIdeas] = useState<ParkedIdea[]>([])
  const [northStarId, setNorthStarId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fireMemoryEvent = useMemoryEvent()

  useEffect(() => {
    const loadIdeas = async () => {
      if (!user) return
      try {
        const [loadedIdeas, northStar] = await Promise.all([
          getParkedIdeas(currentOrg?.id),
          getActiveNorthStar(currentOrg?.id),
        ])
        setIdeas(loadedIdeas)
        setNorthStarId(northStar?.id ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load parked ideas')
      }
    }

    loadIdeas()
  }, [user, currentOrg?.id])

  const handleDelete = async (idea: ParkedIdea) => {
    if (!user) return
    setError(null)
    setIsDeleting(idea.id)
    try {
      await deleteParkedIdea(idea.id)
      setIdeas((prev) => prev.filter((item) => item.id !== idea.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete idea')
    } finally {
      setIsDeleting(null)
    }
  }

  const handlePromote = async (idea: ParkedIdea) => {
    if (!user) return
    setError(null)
    if (!northStarId) {
      setError('Set an active North Star before promoting ideas.')
      return
    }

    setIsSubmitting(idea.id)
    try {
      await createAction(
        {
          title: idea.title,
          description: idea.description,
          why: idea.reason,
          owner: null,
          engine: 'vision',
          priority: 'do_next',
          status: 'not_started',
          effort: 2,
          due_date: null,
          north_star_id: northStarId,
          source: 'parked_ideas',
        },
        currentOrg?.id,
        user.id
      )
      await deleteParkedIdea(idea.id)
      setIdeas((prev) => prev.filter((item) => item.id !== idea.id))

      // Update AI coach memory — promoting an idea is a prioritization decision
      fireMemoryEvent({
        type: 'meeting_held',
        meetingType: 'Prioritization',
        decisions: [`Promoted parked idea to action: ${idea.title}`],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote idea')
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parked Ideas</h1>
        <p className="text-muted-foreground mt-1">
          Keep unaligned ideas visible without cluttering execution.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {ideas.length === 0 ? (
        <p className="text-sm text-muted-foreground">No parked ideas yet.</p>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription>{idea.reason || 'No reason provided.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {idea.description && (
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePromote(idea)}
                    loading={isSubmitting === idea.id}
                    disabled={!northStarId || isDeleting === idea.id}
                  >
                    Promote to Action
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(idea)}
                    loading={isDeleting === idea.id}
                    disabled={isSubmitting === idea.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
