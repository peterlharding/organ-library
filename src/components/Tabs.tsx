import type { ReactNode } from 'react'

import type { TabId } from '../lib/types'

// ----------------------------------------------------------------------------

interface TabDef {
  id: TabId
  label: ReactNode
}

const TABS: TabDef[] = [
  { id: 'library', label: 'Library' },
  { id: 'schedule', label: 'Schedule' },
  {
    id: 'pitch',
    label: (
      <>
        Pitch
        <br />
        Calc
      </>
    ),
  },
]

interface TabsProps {
  active: TabId
  onChange: (id: TabId) => void
}

const Tabs = ({ active, onChange }: TabsProps) => (
  <div className="ol-tabspanel">
    <div className="ol-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={active === tab.id ? 'on' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
)

// ----------------------------------------------------------------------------

export default Tabs
