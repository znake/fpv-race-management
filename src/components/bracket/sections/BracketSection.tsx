import { BracketHeatBox } from '../heat-boxes/BracketHeatBox'
import { calculateColumnWidth, calculateLBColumnWidth, calculateRoundGap } from '@/lib/bracket-layout-calculator'
import { groupHeatsByRound } from '@/lib/bracket-utils'
import type { Heat, Pilot } from '@/types'

interface BracketSectionProps {
  type: 'winner' | 'loser'
  heats: Heat[]
  pilots: Pilot[]
  onHeatClick: (heatId: string) => void
  registerHeatRef: (heatId: string, el: HTMLDivElement | null) => void
  columnWidth?: number
  onPilotHover?: (pilotId: string | null) => void
}

export function BracketSection({
  type,
  heats,
  pilots,
  onHeatClick,
  registerHeatRef,
  columnWidth: propColumnWidth,
  onPilotHover
}: BracketSectionProps) {
  const isWinner = type === 'winner'

  const allBracketHeats = heats.filter(h => h.bracketType === type)
  const regularHeats = allBracketHeats.filter(h => !h.isFinale)
  const finaleHeat = allBracketHeats.find(h => h.isFinale)

  if (allBracketHeats.length === 0) {
    return null
  }

  const sortedRounds = groupHeatsByRound(regularHeats)
  const maxHeatsPerRound = Math.max(...sortedRounds.map(([, heats]) => heats.length), 1)

  const calcWidth = isWinner ? calculateColumnWidth : calculateLBColumnWidth
  const columnWidth = propColumnWidth ?? calcWidth(maxHeatsPerRound)

  const cssClass = isWinner ? 'bracket-column wb' : 'bracket-column lb'
  const testId = isWinner ? 'winner-bracket-section' : 'loser-bracket-section'
  const treeId = isWinner ? 'wb-tree' : 'lb-tree'
  const headerText = isWinner ? 'WINNER BRACKET' : 'LOSER BRACKET'

  const getRoundGap = (roundIndex: number): string =>
    isWinner ? `${calculateRoundGap(roundIndex)}px` : '10px'

  const renderBetweenRoundIndicator = (roundNumber: number) => {
    if (isWinner) {
      return (
        <div className="connector-space" id={`wb-conn-r${roundNumber}-r${roundNumber + 1}`} />
      )
    }
    return (
      <div className="pool-indicator">
        <span className="arrow">↓</span>
        {' '}Top Piloten{' '}
        <span className="arrow">→</span>
        {' '}Neu gemischt
      </div>
    )
  }

  const renderHeatWrapper = (heat: Heat) => {
    const threePilotProps = !isWinner
      ? { 'data-three-pilot': heat.pilotIds.length === 3 ? 'true' : 'false' }
      : {}

    return (
      <div
        key={heat.id}
        ref={(el) => registerHeatRef(heat.id, el)}
        {...threePilotProps}
      >
        <BracketHeatBox
          heat={heat}
          pilots={pilots}
          bracketType={type}
          onClick={() => onHeatClick(heat.id)}
          onPilotHover={onPilotHover}
        />
      </div>
    )
  }

  return (
    <div
      className={cssClass}
      style={{
        width: `${columnWidth}px`,
        minWidth: `${columnWidth}px`
      }}
      data-testid={testId}
    >
      <div className="bracket-column-header">{headerText}</div>

      <div className="bracket-tree" id={treeId}>
        {sortedRounds.map(([roundNumber, roundHeats], roundIndex) => {
          const totalPilotsInRound = roundHeats.reduce((sum, h) => sum + h.pilotIds.length, 0)
          const isLastRound = roundIndex === sortedRounds.length - 1

          return (
            <div key={`round-${roundNumber}`}>
              <div className="round-section">
                <div className="round-label">
                  RUNDE {roundNumber} ({totalPilotsInRound} Piloten)
                </div>
                <div className="round-heats" style={{ gap: getRoundGap(roundIndex) }}>
                  {roundHeats.map((heat) => renderHeatWrapper(heat))}
                </div>
              </div>

              {(!isLastRound || finaleHeat) && renderBetweenRoundIndicator(roundNumber)}
            </div>
          )
        })}

        {finaleHeat && (
          <div className="round-section">
            <div className="round-label">
              FINALE ({finaleHeat.pilotIds.length} Piloten)
            </div>
            <div className="round-heats" style={!isWinner ? { gap: '10px' } : undefined}>
              {renderHeatWrapper(finaleHeat)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
