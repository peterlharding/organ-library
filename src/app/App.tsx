import { useEffect, useState } from 'react'

import type { AppState, Organ, TabId } from '../lib/types'
import { blankOrgan, exampleOrgan } from '../lib/defaults'
import { exportJSON, importJSON, loadState, saveState } from '../lib/storage'
import Header from '../components/Header'
import Library from '../features/library/Library'
import Schedule from '../features/schedule/Schedule'
import PitchCalc from '../features/pitch/PitchCalc'

// ----------------------------------------------------------------------------

const App = () => {
  const [state, setState] = useState<AppState>(() => loadState())
  const [tab, setTab] = useState<TabId>('library')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Organ | null>(null)
  const [isNewEdit, setIsNewEdit] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    saveState(state)
  }, [state])

  const pendingCount = state.instruments.filter((o) => !o.reviewed).length

  const handleAdd = () => {
    setTab('library')
    setSelectedId(null)
    setEditing(blankOrgan())
    setIsNewEdit(true)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setEditing(null)
  }

  const handleEditStart = () => {
    const current = state.instruments.find((o) => o.id === selectedId)
    if (current) {
      setEditing({ ...current })
      setIsNewEdit(false)
    }
  }

  const handleSave = (organ: Organ) => {
    setState((s) => {
      const exists = s.instruments.some((o) => o.id === organ.id)
      return {
        ...s,
        instruments: exists
          ? s.instruments.map((o) => (o.id === organ.id ? organ : o))
          : [...s.instruments, organ],
      }
    })
    setSelectedId(organ.id)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    setState((s) => ({
      ...s,
      instruments: s.instruments.filter((o) => o.id !== id),
    }))
    if (selectedId === id) setSelectedId(null)
    setEditing(null)
  }

  const handleLoadExample = () => {
    const organ = exampleOrgan()
    setState((s) => ({ ...s, instruments: [...s.instruments, organ] }))
    setSelectedId(organ.id)
    setEditing(null)
  }

  const handleExport = () => exportJSON(state)

  const handleImport = async (file: File) => {
    try {
      const next = await importJSON(file)
      setState(next)
      setSelectedId(null)
      setEditing(null)
      setNotice('Library imported.')
    } catch {
      setNotice('Could not import that file.')
    }
  }

  return (
    <div className="ol-root">
      <Header
        count={state.instruments.length}
        pendingCount={pendingCount}
        onExport={handleExport}
        onImport={handleImport}
        onAdd={handleAdd}
      />

      {notice && (
        <div className="ol-savefail">
          <span>{notice}</span>
          <button type="button" className="ol-x" onClick={() => setNotice('')}>
            dismiss
          </button>
        </div>
      )}

      {tab === 'library' ? (
        <Library
          activeTab={tab}
          onTabChange={setTab}
          instruments={state.instruments}
          selectedId={selectedId}
          editing={editing}
          isNewEdit={isNewEdit}
          onSelect={handleSelect}
          onEditStart={handleEditStart}
          onEditCancel={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          onLoadExample={handleLoadExample}
        />
      ) : tab === 'schedule' ? (
        <Schedule activeTab={tab} onTabChange={setTab} />
      ) : (
        <PitchCalc
          activeTab={tab}
          onTabChange={setTab}
          instruments={state.instruments}
          onOpenInstrument={(id) => {
            setTab('library')
            handleSelect(id)
          }}
        />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------

export default App
