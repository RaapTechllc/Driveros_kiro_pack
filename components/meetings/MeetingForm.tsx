import { useState } from 'react'
import { MeetingTemplate, MeetingFormData, QuickWin } from '@/lib/types'
import { generateMeetingActions, saveMeetingNotes } from '@/lib/meeting-templates'
import { parseTranscript, validateTranscript, convertToQuickWins, ExtractedMeetingData } from '@/lib/transcript-parser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileText, Keyboard, Upload, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

type InputMode = 'manual' | 'transcript'

interface MeetingFormProps {
  template: MeetingTemplate
  acceleratorKPI?: string
  onComplete: (actions: QuickWin[]) => void
  onBack: () => void
}

export function MeetingForm({ template, acceleratorKPI, onComplete, onBack }: MeetingFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>('manual')
  const [formData, setFormData] = useState<MeetingFormData>({})
  const [notes, setNotes] = useState('')
  const [decisions, setDecisions] = useState<string[]>([''])
  
  // Transcript-related state
  const [transcript, setTranscript] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedMeetingData | null>(null)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let actions: QuickWin[]
    let cleanDecisions: string[]
    let finalNotes: string
    
    if (inputMode === 'transcript' && extractedData) {
      // Use extracted data from transcript
      actions = convertToQuickWins(extractedData.actionItems)
      cleanDecisions = extractedData.decisions
      finalNotes = `## Transcript Summary\n${extractedData.summary}\n\n## Key Topics\n${extractedData.keyTopics.join(', ')}\n\n## Participants\n${extractedData.participants.join(', ')}\n\n## Manual Notes\n${notes}`
      
      // Add any blockers as actions if found
      if (extractedData.blockers.length > 0) {
        extractedData.blockers.forEach(blocker => {
          actions.push({
            title: `Address blocker: ${blocker.substring(0, 50)}...`,
            why: blocker,
            owner_role: 'Owner',
            eta_days: 3,
            engine: 'Leadership'
          })
        })
      }
    } else {
      // Use manual input
      actions = generateMeetingActions(template.type, formData, acceleratorKPI)
      cleanDecisions = decisions.filter(d => d.trim())
      finalNotes = notes
    }
    
    saveMeetingNotes(template.type, finalNotes, cleanDecisions, actions)
    onComplete(actions)
  }
  
  const handleProcessTranscript = () => {
    setTranscriptError(null)
    setIsProcessing(true)
    
    // Validate transcript
    const validation = validateTranscript(transcript)
    if (!validation.valid) {
      setTranscriptError(validation.error || 'Invalid transcript')
      setIsProcessing(false)
      return
    }
    
    // Parse and extract data
    try {
      const data = parseTranscript(transcript)
      setExtractedData(data)
      
      // Pre-fill notes with summary
      if (data.summary) {
        setNotes(data.summary)
      }
      
      // Pre-fill decisions
      if (data.decisions.length > 0) {
        setDecisions(data.decisions)
      }
    } catch (error) {
      setTranscriptError('Failed to parse transcript. Please check the format.')
    }
    
    setIsProcessing(false)
  }
  
  const handleClearTranscript = () => {
    setTranscript('')
    setExtractedData(null)
    setTranscriptError(null)
    setUploadedFileName(null)
  }
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const validExtensions = ['.txt', '.vtt', '.srt', '.md']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(fileExtension) && !file.type.startsWith('text/')) {
      setTranscriptError('Please upload a text file (.txt, .vtt, .srt, or .md)')
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setTranscriptError('File too large. Maximum size is 2MB.')
      return
    }
    
    try {
      const text = await file.text()
      setTranscript(text)
      setUploadedFileName(file.name)
      setTranscriptError(null)
    } catch (error) {
      setTranscriptError('Failed to read file. Please try again.')
    }
    
    // Reset input
    e.target.value = ''
  }

  const addDecision = () => {
    setDecisions([...decisions, ''])
  }

  const updateDecision = (index: number, value: string) => {
    const newDecisions = [...decisions]
    newDecisions[index] = value
    setDecisions(newDecisions)
  }

  const removeDecision = (index: number) => {
    setDecisions(decisions.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{template.title}</h2>
          <p className="text-muted-foreground">{template.duration_min} minutes • {template.description}</p>
        </div>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </div>

      <div className="bg-secondary p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Meeting Agenda</h3>
        <ol className="space-y-1">
          {template.agenda.map((item, index) => (
            <li key={index} className="text-sm">
              {index + 1}. {item}
            </li>
          ))}
        </ol>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'manual'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Keyboard className="h-4 w-4" />
          Manual Input
        </button>
        <button
          type="button"
          onClick={() => setInputMode('transcript')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'transcript'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          Import Transcript
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transcript Import Mode */}
        {inputMode === 'transcript' && (
          <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Transcript Processing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paste your meeting transcript from Read.ai, Otter, Fireflies, or any other tool
                </p>
              </div>
              {extractedData && (
                <Button type="button" variant="outline" size="sm" onClick={handleClearTranscript}>
                  Clear
                </Button>
              )}
            </div>
            
            {!extractedData ? (
              <>
                {/* File Upload Zone */}
                <div className="relative">
                  <input
                    type="file"
                    id="transcript-upload"
                    accept=".txt,.vtt,.srt,.md,text/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Upload transcript file</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </div>
                    <span className="text-xs text-muted-foreground">.txt, .vtt, .srt, .md (max 2MB)</span>
                  </div>
                </div>
                
                {uploadedFileName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Loaded: {uploadedFileName}</span>
                    <button
                      type="button"
                      onClick={() => { setUploadedFileName(null); setTranscript(''); }}
                      className="text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                <div className="text-center text-sm text-muted-foreground">— or paste directly —</div>
                
                <textarea
                  value={transcript}
                  onChange={(e) => { setTranscript(e.target.value); setUploadedFileName(null); }}
                  className="w-full p-3 border rounded-md min-h-[200px] font-mono text-sm"
                  placeholder={`Paste your meeting transcript here...

Example formats supported:
• Read.ai: "John Smith (00:01:23): We need to focus on..."
• Otter: "John Smith: The main priority is..."
• Generic: "Speaker: Content of what they said..."`}
                />
                
                {transcriptError && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {transcriptError}
                  </div>
                )}
                
                <Button
                  type="button"
                  onClick={handleProcessTranscript}
                  disabled={!transcript.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Process Transcript
                    </>
                  )}
                </Button>
              </>
            ) : (
              /* Extracted Data Preview */
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Transcript processed successfully!</span>
                </div>
                
                {/* Summary */}
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="text-sm font-medium mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{extractedData.summary}</p>
                </div>
                
                {/* Participants */}
                {extractedData.participants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Participants ({extractedData.participants.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {extractedData.participants.map((p, i) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded text-xs">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Items */}
                {extractedData.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Action Items Found ({extractedData.actionItems.length})</h4>
                    <ul className="space-y-1">
                      {extractedData.actionItems.slice(0, 5).map((action, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{action.title}</span>
                          {action.owner && <span className="text-muted-foreground">({action.owner})</span>}
                        </li>
                      ))}
                      {extractedData.actionItems.length > 5 && (
                        <li className="text-sm text-muted-foreground">
                          +{extractedData.actionItems.length - 5} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {/* Decisions */}
                {extractedData.decisions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Decisions ({extractedData.decisions.length})</h4>
                    <ul className="space-y-1">
                      {extractedData.decisions.slice(0, 3).map((d, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {d.substring(0, 100)}...</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Blockers */}
                {extractedData.blockers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-yellow-600 dark:text-yellow-400">
                      Blockers Identified ({extractedData.blockers.length})
                    </h4>
                    <ul className="space-y-1">
                      {extractedData.blockers.slice(0, 3).map((b, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {b.substring(0, 100)}...</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Key Topics */}
                {extractedData.keyTopics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Key Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {extractedData.keyTopics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{topic}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Dynamic inputs based on meeting type - Manual Mode Only */}
        {inputMode === 'manual' && template.type === 'warm_up' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Yesterday's result (1 line)</label>
              <Input
                value={formData.yesterday_result || ''}
                onChange={(e) => setFormData({...formData, yesterday_result: e.target.value})}
                placeholder="What did you accomplish yesterday toward the Accelerator?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Today's focus (1 line)</label>
              <Input
                value={formData.today_focus || ''}
                onChange={(e) => setFormData({...formData, today_focus: e.target.value})}
                placeholder="What's your main focus today?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Top brake (1 line)</label>
              <Input
                value={formData.top_brake || ''}
                onChange={(e) => setFormData({...formData, top_brake: e.target.value})}
                placeholder="What's blocking progress today?"
              />
            </div>
          </div>
        )}

        {inputMode === 'manual' && template.type === 'pit_stop' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Accelerator Result</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accelerator_result"
                    value="win"
                    checked={formData.accelerator_result === 'win'}
                    onChange={(e) => setFormData({...formData, accelerator_result: e.target.value as 'win' | 'miss'})}
                    className="mr-2"
                  />
                  Win - Hit weekly target
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accelerator_result"
                    value="miss"
                    checked={formData.accelerator_result === 'miss'}
                    onChange={(e) => setFormData({...formData, accelerator_result: e.target.value as 'win' | 'miss'})}
                    className="mr-2"
                  />
                  Miss - Didn't hit target
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Actual vs Target</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={formData.accelerator_actual || ''}
                  onChange={(e) => setFormData({...formData, accelerator_actual: e.target.value})}
                  placeholder="Actual result"
                />
                <Input
                  value={formData.accelerator_target || ''}
                  onChange={(e) => setFormData({...formData, accelerator_target: e.target.value})}
                  placeholder="Target"
                />
              </div>
            </div>
          </div>
        )}

        {inputMode === 'manual' && template.type === 'full_tune_up' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">North Star Review</label>
              <Input
                value={formData.north_star_review || ''}
                onChange={(e) => setFormData({...formData, north_star_review: e.target.value})}
                placeholder="Is the North Star still the right goal?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Accelerator Review</label>
              <Input
                value={formData.accelerator_review || ''}
                onChange={(e) => setFormData({...formData, accelerator_review: e.target.value})}
                placeholder="Is the weekly Accelerator still the right lever?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goal Alignment</label>
              <Input
                value={formData.goal_alignment || ''}
                onChange={(e) => setFormData({...formData, goal_alignment: e.target.value})}
                placeholder="How well do department goals align with North Star?"
              />
            </div>
          </div>
        )}

        {/* Meeting Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Meeting Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-md min-h-[100px]"
            placeholder="Key discussion points, insights, concerns..."
          />
        </div>

        {/* Decisions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Decisions Made</label>
            <Button type="button" variant="outline" size="sm" onClick={addDecision}>
              Add Decision
            </Button>
          </div>
          <div className="space-y-2">
            {decisions.map((decision, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={decision}
                  onChange={(e) => updateDecision(index, e.target.value)}
                  placeholder="Decision or commitment made..."
                />
                {decisions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDecision(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full"
          disabled={inputMode === 'transcript' && !extractedData}
        >
          {inputMode === 'transcript' 
            ? extractedData 
              ? `Complete Meeting (${extractedData.actionItems.length + extractedData.blockers.length} actions)`
              : 'Process transcript first'
            : 'Complete Meeting & Generate Actions'
          }
        </Button>
      </form>
    </div>
  )
}
