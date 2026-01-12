import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept: string
  label: string
  description: string
}

interface FileSizeInfo {
  size: number
  sizeFormatted: string
  isLarge: boolean
  estimatedTime: string
  warning?: string
}

function getFileSizeInfo(file: File): FileSizeInfo {
  const size = file.size
  const sizeInMB = size / (1024 * 1024)
  
  let sizeFormatted: string
  if (size < 1024) {
    sizeFormatted = `${size} bytes`
  } else if (size < 1024 * 1024) {
    sizeFormatted = `${(size / 1024).toFixed(1)} KB`
  } else {
    sizeFormatted = `${sizeInMB.toFixed(1)} MB`
  }
  
  // Estimate processing time (rough calculation: 1MB = ~10 seconds)
  const estimatedSeconds = Math.max(1, Math.round(sizeInMB * 10))
  const estimatedTime = estimatedSeconds < 60 
    ? `~${estimatedSeconds} seconds`
    : `~${Math.round(estimatedSeconds / 60)} minutes`
  
  const isLarge = sizeInMB > 1
  const warning = sizeInMB > 5 
    ? 'Very large file - processing may take several minutes'
    : isLarge 
    ? 'Large file detected - processing may take longer than usual'
    : undefined
  
  return {
    size,
    sizeFormatted,
    isLarge,
    estimatedTime,
    warning
  }
}

export function FileUpload({ onFileSelect, accept, label, description }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileSizeInfo, setFileSizeInfo] = useState<FileSizeInfo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    setSelectedFile(file)
    const sizeInfo = getFileSizeInfo(file)
    setFileSizeInfo(sizeInfo)
    // Don't auto-process, wait for explicit upload
  }

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFileSizeInfo(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="drop-zone"
        >
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
              id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {fileSizeInfo?.sizeFormatted} • Estimated processing: {fileSizeInfo?.estimatedTime}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFile}>
              Remove
            </Button>
          </div>
          
          {fileSizeInfo?.warning && (
            <div className={`p-3 rounded-md ${
              fileSizeInfo.size > 5 * 1024 * 1024 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-start space-x-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-medium">Large File Warning</p>
                  <p className="text-sm">{fileSizeInfo.warning}</p>
                  <p className="text-sm mt-1">
                    Processing will happen in the background with progress updates.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleUpload}>
              Upload CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
