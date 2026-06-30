import { useMemo, useState } from 'react'

import type { Organ, TabId } from '../../lib/types'
import Tabs from '../../components/Tabs'
import OrganCard from './OrganCard'
import OrganDetail from './OrganDetail'
import OrganForm from './OrganForm'

// ----------------------------------------------------------------------------

interface LibraryProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
  instruments: Organ[]
  selectedId: string | null
  editing: Organ | null
  isNewEdit: boolean
  onSelect: (id: string) => void
  onEditStart: () => void
  onEditCancel: () => void
  onSave: (organ: Organ) => void
  onDelete: (id: string) => void
  onLoadExample: () => void
}

const Library = ({
  activeTab,
  onTabChange,
  instruments,
  selectedId,
  editing,
  isNewEdit,
  onSelect,
  onEditStart,
  onEditCancel,
  onSave,
  onDelete,
  onLoadExample,
}: LibraryProps) => {
  const [search, setSearch] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return instruments
      .filter((o) => (pendingOnly ? !o.reviewed : true))
      .filter((o) =>
        q
          ? `${o.venue} ${o.suburb} ${o.builders
              .map((b) => b.name)
              .join(' ')}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => (a.venue || '').localeCompare(b.venue || ''))
  }, [instruments, search, pendingOnly])

  const pendingCount = instruments.filter((o) => !o.reviewed).length
  const selected = instruments.find((o) => o.id === selectedId) ?? null

  return (
    <div className="ol-grid">
      <div className="ol-listcol">
        <Tabs active={activeTab} onChange={onTabChange} />
        <div className="ol-list">
          <div className="ol-searchrow">
            <div className="ol-search">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search venue, name, builder…"
              />
              {search && (
                <button
                  type="button"
                  className="ol-x clear"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              className={`ol-pending${pendingOnly ? ' on' : ''}`}
              onClick={() => setPendingOnly((v) => !v)}
            >
              <span className="ol-dot pending" />
              {pendingCount}
            </button>
          </div>

          {(search || pendingOnly) && (
            <div className="ol-search-count">
              {filtered.length} of {instruments.length}
              {pendingOnly ? ' pending review' : ' match'}
            </div>
          )}

          {instruments.length === 0 ? (
            <div className="ol-empty">
              Organs you add will populate here.
              <br />
              <br />
              <button
                type="button"
                className="ol-btn small"
                onClick={onLoadExample}
              >
                Load example organ
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ol-empty">Nothing matches your filters.</div>
          ) : (
            filtered.map((organ) => (
              <OrganCard
                key={organ.id}
                organ={organ}
                selected={organ.id === selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>

      <div className="ol-detail">
        {editing ? (
          <OrganForm
            key={editing.id}
            initial={editing}
            isNew={isNewEdit}
            onSave={onSave}
            onCancel={onEditCancel}
          />
        ) : selected ? (
          <OrganDetail
            organ={selected}
            onEdit={onEditStart}
            onDelete={() => onDelete(selected.id)}
          />
        ) : (
          <div className="ol-empty">
            Select an instrument, or add one to begin.
          </div>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------

export default Library
