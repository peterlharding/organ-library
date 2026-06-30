import type { TabId } from '../../lib/types'
import Tabs from '../../components/Tabs'

// ----------------------------------------------------------------------------
// Schedule — placeholder. Calendar / teams / crews to be implemented.
// ----------------------------------------------------------------------------

interface ScheduleProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
}

const Schedule = ({ activeTab, onTabChange }: ScheduleProps) => (
  <div className="ol-grid solo">
    <div className="ol-listcol">
      <Tabs active={activeTab} onChange={onTabChange} />
      <div className="ol-list">
        <div className="ol-empty">
          <strong>Schedule</strong>
          <br />
          <br />
          The tuning calendar, teams and crews live here.
          <br />
          Coming next.
        </div>
      </div>
    </div>
  </div>
)

// ----------------------------------------------------------------------------

export default Schedule
