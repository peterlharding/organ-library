import type { AppState, Organ } from './types'
import { blankOrgan, emptyState } from './defaults'

// ----------------------------------------------------------------------------

const STORAGE_KEY = 'organ-library:v1'

// Merge a loaded organ with the blank shape so older/partial records stay valid.
const normalizeOrgan = (raw: Partial<Organ>): Organ => ({
  ...blankOrgan(),
  ...raw,
  builders: raw.builders ?? [],
  divisions: raw.divisions ?? [],
  contacts: raw.contacts ?? [],
  visits: raw.visits ?? [],
})

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (!parsed || !Array.isArray(parsed.instruments)) return emptyState()
    return {
      version: parsed.version ?? 1,
      instruments: parsed.instruments.map(normalizeOrgan),
    }
  } catch {
    return emptyState()
  }
}

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / serialization errors
  }
}

// ----------------------------------------------------------------------------

export const exportJSON = (state: AppState): void => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `organ-library-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const importJSON = (file: File): Promise<AppState> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppState>
        if (!parsed || !Array.isArray(parsed.instruments)) {
          throw new Error('invalid file')
        }
        resolve({
          version: parsed.version ?? 1,
          instruments: parsed.instruments.map(normalizeOrgan),
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('parse error'))
      }
    }
    reader.onerror = () => reject(new Error('read error'))
    reader.readAsText(file)
  })
