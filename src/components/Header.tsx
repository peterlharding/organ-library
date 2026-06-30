import { useRef } from 'react'

import logo from '../assets/apo-logo.png'

// ----------------------------------------------------------------------------

interface HeaderProps {
  count: number
  pendingCount: number
  onExport: () => void
  onImport: (file: File) => void
  onAdd: () => void
}

const Header = ({
  count,
  pendingCount,
  onExport,
  onImport,
  onAdd,
}: HeaderProps) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = ''
  }

  return (
    <div className="ol-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          alt="Australian Pipe Organs"
          src={logo}
          style={{ height: 42, width: 'auto', display: 'block' }}
        />
        <div>
          <h1 className="ol-title">Organ Library</h1>
          <div className="ol-sub">
            {count} {count === 1 ? 'organ' : 'organs'}
            {pendingCount > 0 && (
              <span className="ol-status">
                {' · '}
                {pendingCount} pending review
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ol-actions">
        <button type="button" className="ol-btn" onClick={onExport}>
          Export JSON
        </button>
        <label className="ol-btn" style={{ display: 'inline-block' }}>
          Import
          <input
            ref={fileRef}
            accept="application/json"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </label>
        <button type="button" className="ol-btn primary" onClick={onAdd}>
          + Organ
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------

export default Header
