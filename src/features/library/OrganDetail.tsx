import { useState } from 'react'

import type { Organ } from '../../lib/types'
import { TEMP_SITES } from '../../lib/defaults'

// ----------------------------------------------------------------------------

interface OrganDetailProps {
  organ: Organ
  onEdit: () => void
  onDelete: () => void
}

const stopCount = (organ: Organ): number =>
  organ.divisions.reduce((sum, d) => sum + d.stops.length, 0)

const siteLabel = (id: string): string =>
  TEMP_SITES.find((s) => s.id === id)?.label ?? id

const OrganDetail = ({ organ, onEdit, onDelete }: OrganDetailProps) => {
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <>
      <div className="ol-detail-head">
        <h2 className="ol-h">{organ.venue || 'Untitled venue'}</h2>
        {organ.suburb && (
          <div className="ol-detail-builder">{organ.suburb}</div>
        )}
        <div className="ol-card-meta">
          {organ.manuals && <span>{organ.manuals} manuals · </span>}
          <span>{organ.divisions.length} divisions · </span>
          <span>{stopCount(organ)} stops</span>
        </div>

        <div className="ol-whowhere">
          {organ.address && (
            <div className="ol-ww-row">
              <span className="ol-ww-label">Address</span>
              <span className="ol-ww-val">{organ.address}</span>
            </div>
          )}
          {(organ.lat || organ.lng) && (
            <div className="ol-ww-row">
              <span className="ol-ww-label">Coords</span>
              <span className="ol-ww-val">
                {organ.lat}, {organ.lng}
              </span>
            </div>
          )}
          <div className="ol-ww-row">
            <span className="ol-ww-label">Pitch</span>
            <span className="ol-ww-val">
              {organ.nominalPitchHz} Hz @ {organ.pitchRefTempC} °C
              {organ.thermalMass && <span className="lk"> {organ.thermalMass}</span>}
            </span>
          </div>
          <div className="ol-ww-row">
            <span className="ol-ww-label">Access</span>
            <span className="ol-ww-val">
              {organ.keyNumber ? `Key ${organ.keyNumber}` : 'No key recorded'}
              {organ.ladderRequired && <span className="lk"> ladder required</span>}
            </span>
          </div>
          {organ.accessNotes && (
            <div className="ol-ww-row">
              <span className="ol-ww-label">Notes</span>
              <span className="ol-ww-val">{organ.accessNotes}</span>
            </div>
          )}
        </div>

        <div className="ol-fieldinfo">
          <span className={`ol-review-badge ${organ.reviewed ? 'approved' : 'pending'}`}>
            {organ.reviewed ? 'Reviewed' : 'Pending review'}
          </span>
        </div>
      </div>

      {/* Builders / history */}
      {organ.builders.some((b) => b.name.trim()) && (
        <>
          <div className="ol-section-label">History</div>
          {organ.builders
            .filter((b) => b.name.trim())
            .map((b) => (
              <div className="ol-visit" key={b.id}>
                <div className="ol-visit-top">
                  <span className="ol-visit-date">
                    {b.year} · {b.name}
                  </span>
                </div>
                {b.work && <div className="ol-visit-notes">{b.work}</div>}
              </div>
            ))}
        </>
      )}

      {/* Stoplist */}
      {organ.divisions.length > 0 && (
        <>
          <div className="ol-section-label">Stoplist</div>
          {organ.divisions.map((div) => (
            <div className="ol-div-group" key={div.id}>
              <span className="ol-div-name">{div.name || 'Division'}</span>
              {div.chestType && (
                <div className="ol-div-chest">
                  {div.chestType} chest
                  {div.chestOriginal ? '' : ' · rebuilt'}
                </div>
              )}
              <div className="ol-div-stops">
                {div.stops.map((stop) => (
                  <div
                    className={`ol-stop-line${stop.original ? '' : ' swapped'}`}
                    key={stop.id}
                  >
                    {stop.name || 'Stop'}
                    {!stop.original && stop.provenance && (
                      <span className="from">{stop.provenance}</span>
                    )}
                  </div>
                ))}
                {div.stops.length === 0 && (
                  <div className="ol-stop-line">No stops listed</div>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Contacts */}
      {organ.contacts.some((c) => c.name || c.phone || c.email) && (
        <>
          <div className="ol-section-label">Contacts</div>
          <div className="ol-poc-list">
            {organ.contacts
              .filter((c) => c.name || c.phone || c.email)
              .map((c) => (
                <div className="ol-poc" key={c.id}>
                  <span className="nm">
                    {c.name}
                    {c.role && <span className="role"> — {c.role}</span>}
                  </span>
                  <span className="lks">
                    {c.phone && (
                      <a className="lk" href={`tel:${c.phone}`}>
                        {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a className="lk" href={`mailto:${c.email}`}>
                        {c.email}
                      </a>
                    )}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Visits */}
      {organ.visits.length > 0 && (
        <>
          <div className="ol-section-label">Visit history</div>
          {organ.visits.map((v) => (
            <div className="ol-visit" key={v.id}>
              <div className="ol-visit-top">
                <span className="ol-visit-date">{v.date}</span>
                <span className="ol-visit-stats">
                  {v.pitchHz && <span className="t">{v.pitchHz} Hz</span>}
                  {v.tempC && ` · ${v.tempC} °C ${siteLabel(v.tempSite)}`}
                  {v.humidity && ` · ${v.humidity}% RH`}
                </span>
              </div>
              {v.workDone && <div className="ol-visit-notes">{v.workDone}</div>}
              {(v.durationMinutes || v.technician) && (
                <div className="ol-card-meta">
                  {v.durationMinutes && <span>{v.durationMinutes} min</span>}
                  {v.technician && <span className="est"> · {v.technician}</span>}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Standing notes */}
      {organ.standingNotes && (
        <>
          <div className="ol-section-label">Standing notes</div>
          <div className="ol-visit-notes">{organ.standingNotes}</div>
        </>
      )}

      <div className="ol-row">
        <button type="button" className="ol-btn primary" onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className="ol-delbottom">
        {confirmDel ? (
          <span className="ol-delconfirm">
            Delete this organ?
            <button type="button" className="yes" onClick={onDelete}>
              ✓
            </button>
            <button
              type="button"
              className="no"
              onClick={() => setConfirmDel(false)}
            >
              ✕
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="ol-btn danger ghost"
            onClick={() => setConfirmDel(true)}
          >
            Delete organ
          </button>
        )}
      </div>
    </>
  )
}

// ----------------------------------------------------------------------------

export default OrganDetail
