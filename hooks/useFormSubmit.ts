import { useState } from 'react'

export type SubmitState = 'idle' | 'processing' | 'success' | 'error'

interface UseFormSubmitOptions {
  minLoadingTime?: number // Minimum time to show loading state (ms)
  successDuration?: number // How long to show success state (ms)
}

export function useFormSubmit(options: UseFormSubmitOptions = {}) {
  const { minLoadingTime = 800, successDuration = 1500 } = options
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [progress, setProgress] = useState(0)

  const handleSubmit = async <T,>(
    submitFn: () => Promise<T> | T
  ): Promise<T | null> => {
    setSubmitState('processing')
    setProgress(0)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, minLoadingTime / 10)

    const startTime = Date.now()

    try {
      const result = await Promise.resolve(submitFn())
      const elapsed = Date.now() - startTime

      // Ensure minimum loading time for perceived quality
      if (elapsed < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsed)
        )
      }

      clearInterval(progressInterval)
      setProgress(100)
      setSubmitState('success')

      // Reset to idle after success duration
      setTimeout(() => {
        setSubmitState('idle')
        setProgress(0)
      }, successDuration)

      return result
    } catch (error) {
      clearInterval(progressInterval)
      setSubmitState('error')
      setProgress(0)

      // Reset to idle after a delay
      setTimeout(() => {
        setSubmitState('idle')
      }, 3000)

      return null
    }
  }

  return {
    submitState,
    progress,
    isProcessing: submitState === 'processing',
    isSuccess: submitState === 'success',
    isError: submitState === 'error',
    handleSubmit
  }
}
