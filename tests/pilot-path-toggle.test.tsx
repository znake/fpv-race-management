import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PilotPathToggle } from '@/components/bracket/pilot-path-toggle'

describe('PilotPathToggle', () => {
  it('renders the toggle label and inactive state from props', () => {
    render(<PilotPathToggle showPilotPaths={false} onToggle={() => {}} />)

    expect(screen.getByText('Pilot-Pfade')).toBeInTheDocument()
    expect(screen.getByTestId('pilot-path-toggle')).toHaveAttribute('data-active', 'false')
  })

  it('renders the active state from props', () => {
    render(<PilotPathToggle showPilotPaths={true} onToggle={() => {}} />)

    expect(screen.getByTestId('pilot-path-toggle')).toHaveAttribute('data-active', 'true')
  })

  it('invokes onToggle exactly once when clicked', () => {
    const onToggle = vi.fn()
    render(<PilotPathToggle showPilotPaths={false} onToggle={onToggle} />)

    fireEvent.click(screen.getByTestId('pilot-path-toggle'))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
