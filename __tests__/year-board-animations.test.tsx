import { render, fireEvent, screen } from '@testing-library/react'
import { YearCard } from '@/components/year-board/YearCard'
import { QuarterColumn } from '@/components/year-board/QuarterColumn'

describe('YearCard Drag Animations', () => {
  const mockItem = {
    id: '1',
    title: 'Test Card',
    rationale: 'Test rationale',
    type: 'play' as const,
    department: 'company' as const,
    quarter: 1 as const,
    status: 'planned' as const,
    alignment_status: 'linked' as const,
    year_plan_id: 'test-plan'
  }

  it('should have entrance animation class', () => {
    const { container } = render(
      <YearCard item={mockItem} onEdit={() => {}} onDelete={() => {}} onUpdate={() => {}} />
    )
    expect(container.querySelector('.animate-slide-in')).toBeInTheDocument()
  })

  it('should apply transition classes for drag interactions', () => {
    const { container } = render(
      <YearCard item={mockItem} onEdit={() => {}} onDelete={() => {}} onUpdate={() => {}} />
    )
    const card = container.querySelector('[draggable="true"]')
    expect(card).toHaveClass('transition-[transform,shadow]')
  })
})

describe('QuarterColumn Drop Animations', () => {
  it('should show racing-pulse on drag over', () => {
    const { container } = render(
      <QuarterColumn quarter={1} department="company" onCardMove={() => {}} />
    )
    const column = container.firstChild as HTMLElement

    fireEvent.dragEnter(column, {
      dataTransfer: { types: ['text/plain'] }
    })

    expect(column).toHaveClass('animate-racing-pulse')
  })
})
