import type { Organ } from '../../lib/types'

// ----------------------------------------------------------------------------
// Reed pitch model — ported from the original Organ Library app.
//
// Flues sharpen markedly with temperature; reeds barely move. To keep reeds in
// tune with the flues on a warmer/cooler playing day, you set the reeds sharp
// (or flat) of the tuning-day flues by `offset` cents.
// ----------------------------------------------------------------------------

export const TEXTBOOK_SLOPE = 2.5 // cents/°C, used when no measured curve exists

export interface SunLevel {
  id: string
  label: string
  f: number
}

export const SUN_LEVELS: SunLevel[] = [
  { id: 'overcast', label: 'Overcast', f: 0 },
  { id: 'partly', label: 'Partly sunny', f: 0.5 },
  { id: 'full', label: 'Full sun', f: 1 },
]

export const sunFraction = (id: string): number =>
  (SUN_LEVELS.find((s) => s.id === id) ?? SUN_LEVELS[1]).f

export const SITE_LABELS: Record<string, string> = {
  ambient: 'ambient (floor)',
  pipe: 'at the pipework',
  box: 'in the box',
}

// ----------------------------------------------------------------------------
// measured-drift regression
// ----------------------------------------------------------------------------

export interface Reading {
  t: number
  hz: number
  date: string
  site: string
}

export interface Fit {
  slope: number
  r2: number
  n: number
  tRange: number
  site: string
}

export const extractReadings = (organ: Organ): Reading[] =>
  (organ.visits ?? [])
    .map((v) => ({
      t: Number(v.tempC),
      hz: Number(v.pitchHz),
      date: v.date,
      site: v.tempSite || 'ambient',
    }))
    .filter((r) => !Number.isNaN(r.t) && !Number.isNaN(r.hz) && r.hz > 0)

// Least-squares fit of cents-vs-temperature for one thermometer site.
const linearFit = (rows: Reading[]): Omit<Fit, 'site'> | null => {
  if (rows.length < 3) return null
  const meanHz = rows.reduce((s, r) => s + r.hz, 0) / rows.length
  const temps = rows.map((r) => r.t)
  const cents = rows.map((r) => 1200 * Math.log2(r.hz / meanHz))
  const tRange = Math.max(...temps) - Math.min(...temps)
  if (tRange < 3) return null

  const tMean = temps.reduce((a, b) => a + b, 0) / temps.length
  const cMean = cents.reduce((a, b) => a + b, 0) / cents.length
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < temps.length; i++) {
    sxy += (temps[i] - tMean) * (cents[i] - cMean)
    sxx += (temps[i] - tMean) ** 2
  }
  if (sxx === 0) return null
  const slope = sxy / sxx

  const ssTot = cents.reduce((a, c) => a + (c - cMean) ** 2, 0)
  const ssRes = cents.reduce(
    (a, c, i) => a + (c - (cMean + slope * (temps[i] - tMean))) ** 2,
    0,
  )
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  return { slope, r2, n: rows.length, tRange }
}

const SITES = ['ambient', 'pipe', 'box']

// Pick the best per-site fit (most readings, then best r², preferring ambient).
export const bestFit = (readings: Reading[]): Fit | null => {
  const fits: Fit[] = []
  for (const site of SITES) {
    const fit = linearFit(readings.filter((r) => r.site === site))
    if (fit) fits.push({ ...fit, site })
  }
  if (!fits.length) return null
  fits.sort(
    (a, b) => b.n - a.n || b.r2 - a.r2 || (a.site === 'ambient' ? -1 : 1),
  )
  return fits[0]
}

// ----------------------------------------------------------------------------
// offset computation
// ----------------------------------------------------------------------------

export interface DayBetween {
  id: string
  hi: string
  lo: string
}

export interface PitchInputs {
  tuningTemp: string
  playingTemp: string
  sunTuning: string
  sunPlaying: string
  daysBetween: DayBetween[]
  buildingGain: number
}

export interface PitchResult {
  measured: boolean
  lowConfidence: boolean
  slope: number // cents/°C basis
  fit: Fit | null
  outdoorDelta: number | null
  sunDelta: number | null
  effective: number | null
  offset: number | null // cents to set reeds sharp(+)/flat(-)
  band: number | null // +/- likely range
  maxSwing: number | null
}

const round1 = (n: number): number => Math.round(n * 10) / 10

export const computePitch = (
  organ: Organ,
  inputs: PitchInputs,
): PitchResult => {
  const readings = extractReadings(organ)
  const fit = bestFit(readings)
  const measured = !!fit
  const slope = measured ? fit!.slope : TEXTBOOK_SLOPE
  const lowConfidence = measured && (fit!.r2 < 0.7 || fit!.n < 5)

  const { tuningTemp, playingTemp, sunTuning, sunPlaying, daysBetween } = inputs
  const hasTemps = tuningTemp !== '' && playingTemp !== ''
  const outdoorDelta = hasTemps ? Number(playingTemp) - Number(tuningTemp) : null

  const sunDelta =
    outdoorDelta == null
      ? null
      : round1(
          inputs.buildingGain * (sunFraction(sunPlaying) - sunFraction(sunTuning)),
        )

  const effective =
    outdoorDelta == null || sunDelta == null ? null : outdoorDelta + sunDelta
  const offset = effective == null ? null : round1(effective * slope)

  // per-degree uncertainty, widened when the basis is weak
  const perDeg = measured ? (lowConfidence ? slope * 1.6 : slope * 1.15) : slope * 2

  const pairs = daysBetween
    .map((d) => ({ hi: Number(d.hi), lo: Number(d.lo) }))
    .filter((d) => !Number.isNaN(d.hi) && !Number.isNaN(d.lo) && d.hi >= d.lo)
  const maxSwing = pairs.length ? Math.max(...pairs.map((d) => d.hi - d.lo)) : null
  const rangeFactor =
    maxSwing == null ? 1 : Math.min(1.8, Math.max(1, 1 + (maxSwing - 4) / 10))
  const band = effective == null ? null : round1(2 * perDeg * rangeFactor)

  return {
    measured,
    lowConfidence,
    slope,
    fit,
    outdoorDelta,
    sunDelta,
    effective,
    offset,
    band,
    maxSwing,
  }
}
