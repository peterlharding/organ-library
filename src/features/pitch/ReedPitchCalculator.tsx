import { useState } from 'react'

import type { Organ } from '../../lib/types'
import { thermalGain, thermalLabel } from '../../lib/defaults'
import {
  SITE_LABELS,
  SUN_LEVELS,
  TEXTBOOK_SLOPE,
  computePitch,
  extractReadings,
  type DayBetween,
} from './pitch'

// ----------------------------------------------------------------------------

interface ReedPitchCalculatorProps {
  organ: Organ
  onOpenInstrument: (id: string) => void
}

const uid = (): string =>
  crypto.randomUUID?.() ?? `d-${Math.random().toString(36).slice(2)}`

const round1 = (n: number): number => Math.round(n * 10) / 10
const signed = (n: number): string => `${n > 0 ? '+' : ''}${n}`

const ReedPitchCalculator = ({
  organ,
  onOpenInstrument,
}: ReedPitchCalculatorProps) => {
  const [tuningTemp, setTuningTemp] = useState('')
  const [playingTemp, setPlayingTemp] = useState('')
  const [sunTuning, setSunTuning] = useState('partly')
  const [sunPlaying, setSunPlaying] = useState('partly')
  const [daysBetween, setDaysBetween] = useState<DayBetween[]>([])

  const buildingGain = thermalGain(organ.thermalMass)
  const readings = extractReadings(organ)

  const result = computePitch(organ, {
    tuningTemp,
    playingTemp,
    sunTuning,
    sunPlaying,
    daysBetween,
    buildingGain,
  })

  const {
    measured,
    lowConfidence,
    fit,
    outdoorDelta,
    sunDelta,
    effective,
    offset,
    band,
    maxSwing,
  } = result

  const updateDay = (id: string, patch: Partial<DayBetween>) =>
    setDaysBetween((days) =>
      days.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    )

  return (
    <div>
      <h2 className="ol-h">Reed pitch calculator</h2>
      <div className="ol-pitch-venue">{organ.venue}</div>

      <div className="ol-pitch-rules">
        <div className="rule">
          <span className="up">Flues</span> +3 cents / °C
        </div>
        <div className="rule">
          <span className="flat">Reeds</span> +0.5 cents / °C
        </div>
      </div>

      {/* temperatures */}
      <div className="ol-section-label">Temperatures</div>
      <div className="ol-fields ol-fields-pitch">
        <div className="ol-field">
          <label>Tuning day temp (°C)</label>
          <input
            type="number"
            placeholder="e.g. 14"
            value={tuningTemp}
            onChange={(e) => setTuningTemp(e.target.value)}
          />
        </div>
        <div className="ol-field">
          <label>Playing day temp (°C)</label>
          <input
            type="number"
            placeholder="e.g. 18"
            value={playingTemp}
            onChange={(e) => setPlayingTemp(e.target.value)}
          />
        </div>
      </div>
      <div className="ol-hint" style={{ marginTop: 8, marginBottom: 8 }}>
        Outside temps. The building runs warmer in sun — set how it responds
        below.
      </div>

      {/* sun & building */}
      <div className="ol-section-label">Sun &amp; building</div>
      <div className="ol-sunbuilding">
        <div className="ol-sunrow">
          <span className="ol-sun-lbl">Building</span>
          {organ.thermalMass ? (
            <span className="ol-sun-val">
              {thermalLabel(organ.thermalMass)} (+{buildingGain}°C in full sun)
            </span>
          ) : (
            <span className="ol-sun-val muted">
              Not set — add building character on the venue for sun-adjusted
              prediction
            </span>
          )}
        </div>
        <div className="ol-sunrow">
          <span className="ol-sun-lbl">Sun at tuning</span>
          <div className="ol-segm">
            {SUN_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                className={`ol-seg${sunTuning === lvl.id ? ' on' : ''}`}
                onClick={() => setSunTuning(lvl.id)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ol-sunrow">
          <span className="ol-sun-lbl">Sun at playing</span>
          <div className="ol-segm">
            {SUN_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                className={`ol-seg${sunPlaying === lvl.id ? ' on' : ''}`}
                onClick={() => setSunPlaying(lvl.id)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* days between */}
      <div className="ol-section-label">Days between (optional)</div>
      <div className="ol-hint" style={{ marginTop: -6, marginBottom: 10 }}>
        Additional data between tuning day and playing day will better predict
        future flue pitch.
      </div>
      {daysBetween.map((day, i) => (
        <div className="ol-daybetween" key={day.id}>
          <span className="ol-daybetween-lbl">Day {i + 1}</span>
          <div className="ol-field">
            <label>High °C</label>
            <input
              type="number"
              value={day.hi}
              onChange={(e) => updateDay(day.id, { hi: e.target.value })}
            />
          </div>
          <div className="ol-field">
            <label>Low °C</label>
            <input
              type="number"
              value={day.lo}
              onChange={(e) => updateDay(day.id, { lo: e.target.value })}
            />
          </div>
          <button
            type="button"
            className="ol-x"
            title="Remove day"
            onClick={() =>
              setDaysBetween((days) => days.filter((d) => d.id !== day.id))
            }
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="ol-btn small"
        onClick={() =>
          setDaysBetween((days) => [...days, { id: uid(), hi: '', lo: '' }])
        }
      >
        + Add day
      </button>

      {/* result */}
      <div className="ol-pitch-result">
        {offset == null || effective == null ? (
          <div className="ol-hint" style={{ marginTop: 0 }}>
            Enter both temperatures to get an offset.
          </div>
        ) : (
          <>
            <div className="ol-pitch-big">
              {offset > 0 ? '+' : ''}
              {offset}
              <span className="u">cents</span>
            </div>
            {band != null && band > 0 && (
              <div className="ol-pitch-band">
                likely range {signed(round1(offset - band))} to{' '}
                {signed(round1(offset + band))} cents
              </div>
            )}
            {maxSwing != null && (
              <div
                className={`ol-pitch-stab ${
                  maxSwing >= 10 ? 'churny' : maxSwing >= 6 ? 'mid' : 'calm'
                }`}
              >
                {maxSwing >= 10
                  ? `Unsettled week (up to ${Math.round(
                      maxSwing,
                    )}°C daily swing) — tune conservative, trust your ear`
                  : maxSwing >= 6
                    ? `Some movement (up to ${Math.round(
                        maxSwing,
                      )}°C daily swing) — prediction is reasonable`
                    : `Settled week (${Math.round(
                        maxSwing,
                      )}°C daily swing) — prediction is reliable`}
              </div>
            )}
            <div className="ol-pitch-sub">
              {effective > 0
                ? `Set reeds ${Math.abs(offset)} cents SHARP of today’s flues `
                : effective < 0
                  ? `Set reeds ${Math.abs(offset)} cents FLAT of today’s flues `
                  : 'No change — same temperature '}
              ({effective > 0 ? '+' : ''}
              {round1(effective)}°C effective)
              {sunDelta !== 0 && sunDelta != null && outdoorDelta != null && (
                <span className="ol-pitch-solar">
                  {' '}
                  — outside {outdoorDelta > 0 ? '+' : ''}
                  {round1(outdoorDelta)}°C, sun {sunDelta > 0 ? '+' : ''}
                  {sunDelta}°C
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* basis */}
      <div className="ol-section-label">Basis</div>
      {measured && fit ? (
        <div className={`ol-pitch-basis ${lowConfidence ? 'lowconf' : 'measured'}`}>
          <div className="lead">
            {lowConfidence
              ? 'Measured drift — low confidence'
              : 'Using this organ’s measured drift'}
          </div>
          <div className="ol-hint" style={{ marginTop: 4 }}>
            {fit.slope.toFixed(2)} cents/°C from {fit.n} readings (
            {SITE_LABELS[fit.site]}) spanning {Math.round(fit.tRange)}°C, r²{' '}
            {fit.r2.toFixed(2)}.
            {lowConfidence
              ? ' Thin or scattered — treat as a hint until more readings land.'
              : ' This beats the textbook figure.'}
          </div>
        </div>
      ) : (
        <div className="ol-pitch-basis estimate">
          <div className="lead">
            Using the textbook estimate ({TEXTBOOK_SLOPE} cents/°C)
          </div>
          <div className="ol-hint" style={{ marginTop: 4 }}>
            {readings.length === 0
              ? 'No temperature + pitch readings logged for this organ yet.'
              : `Need 3+ readings from the SAME thermometer site (floor, pipework, or box) across a 3°C+ spread. ${readings.length} logged so far, but not yet enough within one site.`}{' '}
            Keep the site consistent and this switches to the organ’s own curve.
          </div>
          <button
            type="button"
            className="ol-btn small"
            style={{ marginTop: 10 }}
            onClick={() => onOpenInstrument(organ.id)}
          >
            Open {organ.venue}
          </button>
        </div>
      )}

      {/* logged readings */}
      {readings.length > 0 && (
        <>
          <div className="ol-section-label">Logged readings</div>
          {readings
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((r, i) => (
              <div className="ol-pitch-pt" key={`${r.date}-${i}`}>
                <span className="d">{r.date}</span>
                <span className="site">{SITE_LABELS[r.site] ?? r.site}</span>
                <span>{r.t}°C</span>
                <span className="hz">{r.hz} Hz</span>
              </div>
            ))}
        </>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------

export default ReedPitchCalculator
