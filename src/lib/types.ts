// ----------------------------------------------------------------------------
// Organ Library — domain model (mirrors the original app schema)
// Numeric-ish fields are stored as strings, exactly as the source records do.
// ----------------------------------------------------------------------------

export interface Builder {
  id: string
  name: string
  year: string
  work: string
}

export interface Stop {
  id: string
  name: string // includes pitch length, e.g. "Open Diapason 8" or "Mixture III-IV"
  original: boolean // true = original pipework, false = revoiced/new (see provenance)
  provenance: string
}

export interface Division {
  id: string
  name: string
  chestType: string
  windPressure: string
  chestOriginal: boolean
  chestProvenance: string
  stops: Stop[]
}

export interface Contact {
  id: string
  name: string
  role: string
  phone: string
  email: string
}

export interface Visit {
  id: string
  date: string
  durationMinutes: string
  tempC: string
  tempSite: string // 'ambient' | 'pipe'
  humidity: string
  pitchHz: string
  workDone: string
  technician: string
  unresolved: string
  resolved: string
  createdAt: string
}

export interface Organ {
  id: string
  venue: string
  suburb: string
  address: string
  lat: string
  lng: string
  builders: Builder[]
  manuals: string
  nominalPitchHz: string
  pitchRefTempC: string
  divisions: Division[]
  baseTuneMinutes: string
  keyNumber: string
  ladderRequired: boolean
  thermalMass: string // 'stone' | 'brick' | 'light'
  contacts: Contact[]
  accessNotes: string
  standingNotes: string
  reviewed: boolean
  createdAt: string
  visits: Visit[]
}

export interface AppState {
  version: number
  instruments: Organ[]
}

export type TabId = 'library' | 'schedule' | 'pitch'
