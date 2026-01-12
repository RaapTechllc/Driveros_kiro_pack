'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { Calendar, Clock, Users, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

interface StoredMeeting {
  id: string
  company_id: string
  type: 'warm_up' | 'pit_stop' | 'full_tune_up'
  scheduled_for: string
  notes: string
  decisions: string[]
  action_ids: string[]
  created_at: string
}

interface StoredAction {
  title: string
  why: string
  owner_role: string
  eta_days: number
  engine: string
  meeting_id: string
  created_at: string
}

const MEETING_TYPE_INFO = {
  warm_up: {
    title: 'Daily Warm-Up',
    icon: '🌅',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  pit_stop: {
    title: 'Weekly Pit Stop',
    icon: '🏁',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  full_tune_up: {
    title: 'Full Tune-Up',
    icon: '🔧',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
}

export default function MeetingHistoryPage() {
  const [meetings, setMeetings] = useState<StoredMeeting[]>([])
  const [actions, setActions] = useState<StoredAction[]>([])
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null)

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = () => {
    try {
      const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]')
      const storedActions = JSON.parse(localStorage.getItem('meeting-actions') || '[]')
      
      // Sort meetings by date, newest first
      storedMeetings.sort((a: StoredMeeting, b: StoredMeeting) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setMeetings(storedMeetings)
      setActions(storedActions)
    } catch (error) {
      console.error('Failed to load meetings:', error)
    }
  }

  const deleteMeeting = (meetingId: string) => {
    if (!confirm('Delete this meeting and its associated actions?')) return
    
    const updatedMeetings = meetings.filter(m => m.id !== meetingId)
    const updatedActions = actions.filter(a => a.meeting_id !== meetingId)
    
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings))
    localStorage.setItem('meeting-actions', JSON.stringify(updatedActions))
    
    setMeetings(updatedMeetings)
    setActions(updatedActions)
  }

  const getActionsForMeeting = (meetingId: string) => {
    return actions.filter(a => a.meeting_id === meetingId)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (meetings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meeting History</h1>
            <p className="text-muted-foreground">View past meetings and their outcomes</p>
          </div>
          <Link href="/meetings">
            <Button variant="outline">Back to Templates</Button>
          </Link>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No meetings yet</h2>
            <p className="text-muted-foreground mb-4">
              Complete your first meeting to see it here
            </p>
            <Link href="/meetings">
              <Button>Start a Meeting</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting History</h1>
          <p className="text-muted-foreground">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Link href="/meetings">
          <Button variant="outline">Back to Templates</Button>
        </Link>
      </div>

      {/* Meeting Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {meetings.filter(m => m.type === 'warm_up').length}
            </div>
            <p className="text-sm text-muted-foreground">Warm-Ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {meetings.filter(m => m.type === 'pit_stop').length}
            </div>
            <p className="text-sm text-muted-foreground">Pit Stops</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {meetings.filter(m => m.type === 'full_tune_up').length}
            </div>
            <p className="text-sm text-muted-foreground">Tune-Ups</p>
          </CardContent>
        </Card>
      </div>

      {/* Meeting List */}
      <div className="space-y-4">
        {meetings.map((meeting) => {
          const typeInfo = MEETING_TYPE_INFO[meeting.type]
          const meetingActions = getActionsForMeeting(meeting.id)
          const isExpanded = expandedMeeting === meeting.id

          return (
            <Card key={meeting.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedMeeting(isExpanded ? null : meeting.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{typeInfo.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(meeting.created_at)}
                        <Clock className="h-3 w-3 ml-2" />
                        {formatTime(meeting.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {meetingActions.length} action{meetingActions.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="secondary">
                      {meeting.decisions.length} decision{meeting.decisions.length !== 1 ? 's' : ''}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t pt-4 space-y-4">
                  {/* Notes */}
                  {meeting.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                        {meeting.notes}
                      </div>
                    </div>
                  )}

                  {/* Decisions */}
                  {meeting.decisions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Decisions Made
                      </h4>
                      <ul className="space-y-1">
                        {meeting.decisions.map((decision, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            {decision}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {meetingActions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Actions Generated
                      </h4>
                      <div className="space-y-2">
                        {meetingActions.map((action, i) => (
                          <div key={i} className="p-2 border rounded text-sm">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-muted-foreground text-xs mt-1">
                              {action.owner_role} • {action.eta_days}d • {action.engine}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete Button */}
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMeeting(meeting.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Meeting
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
