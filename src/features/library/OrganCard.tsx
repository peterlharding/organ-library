import type { Organ } from '../../lib/types'

// ----------------------------------------------------------------------------

interface OrganCardProps {
  organ: Organ
  selected: boolean
  onSelect: (id: string) => void
}

const stopCount = (organ: Organ): number =>
  organ.divisions.reduce((sum, d) => sum + d.stops.length, 0)

const builderLabel = (organ: Organ): string => {
  const named = organ.builders.filter((b) => b.name.trim())
  if (named.length === 0) return '—'
  const latest = named[named.length - 1]
  return latest.year ? `${latest.name} (${latest.year})` : latest.name
}

const OrganCard = ({ organ, selected, onSelect }: OrganCardProps) => (
  <button
    type="button"
    className={`ol-card${selected ? ' sel' : ''}`}
    onClick={() => onSelect(organ.id)}
  >
    <div className="ol-card-name">{organ.venue || 'Untitled venue'}</div>
    {organ.suburb && <div className="ol-card-venue">{organ.suburb}</div>}
    <div className="ol-card-builder">{builderLabel(organ)}</div>
    <div className="ol-card-meta">
      {organ.manuals && <span>{organ.manuals} man · </span>}
      <span>{organ.divisions.length} div</span>
      <span className="est"> · {stopCount(organ)} stops</span>
      {organ.ladderRequired && <span className="lad"> · ladder</span>}
    </div>

    <div className="ol-card-corner">
      {organ.keyNumber && <span className="ol-card-key">{organ.keyNumber}</span>}
      <span className={`ol-dot ${organ.reviewed ? 'approved' : 'pending'}`} />
    </div>
  </button>
)

// ----------------------------------------------------------------------------

export default OrganCard
