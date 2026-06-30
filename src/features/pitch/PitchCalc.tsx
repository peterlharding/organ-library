import { useState } from 'react'

import type { Organ, TabId } from '../../lib/types'
import Tabs from '../../components/Tabs'
import ReedPitchCalculator from './ReedPitchCalculator'

// ----------------------------------------------------------------------------

interface PitchCalcProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
  instruments: Organ[]
  onOpenInstrument: (id: string) => void
}

const builderLabel = (organ: Organ): string => {
  const named = organ.builders.filter((b) => b.name.trim())
  return named.length ? named[named.length - 1].name : '—'
}

const PitchCalc = ({
  activeTab,
  onTabChange,
  instruments,
  onOpenInstrument,
}: PitchCalcProps) => {
  const sorted = [...instruments].sort((a, b) =>
    (a.venue || '').localeCompare(b.venue || ''),
  )
  const [pitchId, setPitchId] = useState<string | null>(
    sorted.length ? sorted[0].id : null,
  )

  const selected =
    instruments.find((o) => o.id === pitchId) ?? sorted[0] ?? null

  return (
    <div className="ol-grid">
      <div className="ol-listcol">
        <Tabs active={activeTab} onChange={onTabChange} />
        <div className="ol-list">
          {sorted.length === 0 ? (
            <div className="ol-empty">
              Add an organ first, then pick it here to estimate reed pitch.
            </div>
          ) : (
            sorted.map((organ) => (
              <button
                key={organ.id}
                type="button"
                className={`ol-card${organ.id === selected?.id ? ' sel' : ''}`}
                onClick={() => setPitchId(organ.id)}
              >
                <div className="ol-card-name">
                  <span className="venue">{organ.venue}</span>
                </div>
                <div className="ol-card-builder">{builderLabel(organ)}</div>
                {organ.suburb && (
                  <div className="ol-card-line">
                    <span className="lbl">Suburb</span> {organ.suburb}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="ol-detail">
        {selected ? (
          <ReedPitchCalculator
            key={selected.id}
            organ={selected}
            onOpenInstrument={onOpenInstrument}
          />
        ) : (
          <div className="ol-empty">
            Pick an instrument to estimate how far to set the reeds.
          </div>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------

export default PitchCalc
