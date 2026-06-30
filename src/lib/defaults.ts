import type {
  AppState,
  Builder,
  Contact,
  Division,
  Organ,
  Stop,
  Visit,
} from './types'

// ----------------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------------

export const uid = (): string =>
  crypto.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2)}`

const today = (): string => new Date().toISOString().slice(0, 10)

// ----------------------------------------------------------------------------
// catalogs (used by editor selects / datalists)
// ----------------------------------------------------------------------------

export const DIVISION_NAMES = [
  'Great',
  'Swell',
  'Choir',
  'Pedal',
  'Positive',
  'Solo',
  'Echo',
  'Bombarde',
  'Antiphonal',
]

export const CHEST_TYPES = [
  'slider',
  'pitman',
  'ventil',
  'unit',
  'direct electric',
  'tubular-pneumatic',
  'mechanical',
]

export const THERMAL_MASS: { id: string; label: string; gain: number }[] = [
  { id: '', label: 'Not set', gain: 0 },
  { id: 'stone', label: 'Heavy stone / barely moves', gain: 1.5 },
  { id: 'brick', label: 'Typical brick / masonry', gain: 3.5 },
  { id: 'light', label: 'Light-framed / heats fast', gain: 8 },
]

export const thermalGain = (id: string): number =>
  (THERMAL_MASS.find((t) => t.id === id) ?? THERMAL_MASS[0]).gain

export const thermalLabel = (id: string): string =>
  (THERMAL_MASS.find((t) => t.id === id) ?? THERMAL_MASS[0]).label

export const TEMP_SITES: { id: string; label: string }[] = [
  { id: 'ambient', label: 'Ambient (floor)' },
  { id: 'pipe', label: 'At the pipework' },
]

// ----------------------------------------------------------------------------
// blank factories (match the original record shapes exactly)
// ----------------------------------------------------------------------------

export const blankBuilder = (): Builder => ({
  id: uid(),
  name: '',
  year: '',
  work: 'built',
})

export const blankStop = (
  name = '',
  original = true,
  provenance = '',
): Stop => ({ id: uid(), name, original, provenance })

export const blankDivision = (name = ''): Division => ({
  id: uid(),
  name,
  chestType: '',
  windPressure: '',
  chestOriginal: true,
  chestProvenance: '',
  stops: [],
})

export const blankContact = (): Contact => ({
  id: uid(),
  name: '',
  role: '',
  phone: '',
  email: '',
})

export const blankVisit = (): Visit => ({
  id: uid(),
  date: today(),
  durationMinutes: '',
  tempC: '',
  tempSite: 'ambient',
  humidity: '',
  pitchHz: '',
  workDone: '',
  technician: '',
  unresolved: '',
  resolved: '',
  createdAt: new Date().toISOString(),
})

export const blankOrgan = (): Organ => ({
  id: uid(),
  venue: '',
  suburb: '',
  address: '',
  lat: '',
  lng: '',
  builders: [],
  manuals: '',
  nominalPitchHz: '523.3',
  pitchRefTempC: '18',
  divisions: [],
  baseTuneMinutes: '',
  keyNumber: '',
  ladderRequired: false,
  thermalMass: '',
  contacts: [],
  accessNotes: '',
  standingNotes: '',
  reviewed: false,
  createdAt: new Date().toISOString(),
  visits: [],
})

// ----------------------------------------------------------------------------
// example organ — Christ Church South Yarra (reconstructed from the source app)
// ----------------------------------------------------------------------------

const REVOICED =
  'Older Hill / Fincham / Hill, Norman & Beard pipework, revoiced by Kenneth Jones 1998'

// N(name, original?, provenance?) — mirrors the source helper.
const N = (name: string, original = true, provenance = ''): Stop =>
  blankStop(name, original, provenance)

const division = (
  name: string,
  chestType: string,
  stops: Stop[],
): Division => ({
  id: uid(),
  name,
  chestType,
  windPressure: '',
  chestOriginal: true,
  chestProvenance: '',
  stops,
})

const visit = (
  date: string,
  durationMinutes: string,
  tempC: string,
  humidity: string,
  pitchHz: string,
  workDone: string,
): Visit => ({
  id: uid(),
  date,
  durationMinutes,
  tempC,
  tempSite: 'pipe',
  humidity,
  pitchHz,
  workDone,
  technician: 'Will',
  unresolved: '',
  resolved: '',
  createdAt: `${date}T09:00:00.000Z`,
})

export const exampleOrgan = (): Organ => ({
  id: uid(),
  venue: 'Christ Church South Yarra (example)',
  suburb: 'South Yarra',
  address: 'Cnr Toorak Rd & Punt Rd, South Yarra VIC 3141',
  lat: '-37.8386',
  lng: '144.9859',
  builders: [
    { id: uid(), name: 'Hill & Son', year: '1870', work: 'Original organ, London (job no. 1343)' },
    { id: uid(), name: 'George Fincham & Son', year: '1916', work: 'Rebuild — tubular-pneumatic, Choir added' },
    { id: uid(), name: 'Hill, Norman & Beard', year: '1954', work: 'Rebuild & enlargement (o/n V281), electro-pneumatic' },
    { id: uid(), name: 'J.W. Walker & Sons', year: '1962', work: 'Additions' },
    { id: uid(), name: 'Kenneth Jones & Associates', year: '1998', work: 'Present organ, Bray, Ireland — older pipework revoiced, new façade, mixtures & reeds' },
  ],
  manuals: '3',
  nominalPitchHz: '523.3',
  pitchRefTempC: '18',
  divisions: [
    division('Great', 'slider', [
      N('Bourdon 16', false, REVOICED),
      N('Open Diapason 8', false, REVOICED),
      N('Violin Diapason 8', false, REVOICED),
      N('Stopped Diapason 8', false, REVOICED),
      N('Principal 4'),
      N('Wald Flute 4'),
      N('Quint Flute 2-2/3'),
      N('Fifteenth 2'),
      N('Open Flute 2'),
      N('Tierce 1-3/5'),
      N('Mixture III-IV'),
      N('Trumpet 8'),
      N('Tremulant'),
    ]),
    division('Swell', 'slider', [
      N('Open Diapason 8', false, REVOICED),
      N('Stopped Diapason 8', false, REVOICED),
      N('Salicional 8', false, REVOICED),
      N('Voix Celeste 8', false, REVOICED),
      N('Principal 4'),
      N('Harmonic Flute 4'),
      N('Fifteenth 2'),
      N('Sesquialtera III'),
      N('Sharp Mixture III'),
      N('Double Trumpet 16'),
      N('Horn 8'),
      N('Oboe 8'),
      N('Tremulant'),
    ]),
    division('Choir', 'slider', [
      N('Stopped Diapason 8', false, REVOICED),
      N('Dulciana 8', false, REVOICED),
      N('Principal 4'),
      N('Chimney Flute 4'),
      N('Twelfth 2-2/3'),
      N('Flautina 2'),
      N('Clarionet 8'),
      N('Tromba 8'),
      N('Tromba Octave 4'),
    ]),
    division('Pedal', '', [
      N('Open Diapason 16', false, REVOICED),
      N('Subbass 16', false, REVOICED),
      N('Quint 10-2/3'),
      N('Octave 8'),
      N('Bass Flute 8'),
      N('Nazard 5-1/3'),
      N('Fifteenth 4'),
      N('Trombone 16'),
    ]),
  ],
  baseTuneMinutes: '150',
  keyNumber: '',
  ladderRequired: true,
  thermalMass: 'stone',
  contacts: [],
  accessNotes: '',
  standingNotes:
    "Example record from the OHTA survey (J. Maidment). Kenneth Jones & Associates, 1998, incorporating revoiced Hill / Fincham / HN&B / Walker pipework. Mechanical manual action, electro-pneumatic pedal, compass 58/30. Sample visits below are illustrative so the Pitch Calc can show a measured drift curve — delete this organ once you've had a look.",
  reviewed: false,
  createdAt: new Date().toISOString(),
  visits: [
    visit('2024-07-15', '150', '14.2', '62', '519.8', 'Full tuning, mid-winter'),
    visit('2024-11-03', '120', '17.1', '55', '522.5', 'Tuning before Advent'),
    visit('2025-02-20', '135', '22.8', '48', '527.6', 'Summer tuning, reeds drifting sharp'),
    visit('2025-05-12', '120', '19.6', '58', '524.4', 'Autumn tuning'),
  ],
})

// ----------------------------------------------------------------------------

export const emptyState = (): AppState => ({ version: 1, instruments: [] })
