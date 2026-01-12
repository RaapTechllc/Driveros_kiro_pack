import { render, screen } from '@testing-library/react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { RacingSpinner } from '../components/ui/LoadingSpinner'

describe('UI Animations', () => {
  describe('Button', () => {
    it('should render with default styles', () => {
      render(<Button>Test Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('active:scale-95')
    })

    it('should show loading state with spinner', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should show success state with checkmark', () => {
      render(<Button success>Success Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-600')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('should render with focus glow classes', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-orange-500')
    })

    it('should show error state with shake animation', () => {
      render(<Input error />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('animate-shake')
    })
  })

  describe('RacingSpinner', () => {
    it('should render with racing theme elements', () => {
      const { container } = render(<RacingSpinner />)
      const spinner = container.firstChild
      expect(spinner).toHaveClass('relative')
    })
  })
})
