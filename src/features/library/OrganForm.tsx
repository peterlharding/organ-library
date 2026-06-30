import { useState } from 'react'

import type {
  Builder,
  Contact,
  Division,
  Organ,
  Stop,
  Visit,
} from '../../lib/types'
import {
  CHEST_TYPES,
  DIVISION_NAMES,
  TEMP_SITES,
  THERMAL_MASS,
  blankBuilder,
  blankContact,
  blankDivision,
  blankStop,
  blankVisit,
} from '../../lib/defaults'

// ----------------------------------------------------------------------------

interface OrganFormProps {
  initial: Organ
  isNew: boolean
  onSave: (organ: Organ) => void
  onCancel: () => void
}

const OrganForm = ({ initial, isNew, onSave, onCancel }: OrganFormProps) => {
  const [draft, setDraft] = useState<Organ>(initial)
  const [error, setError] = useState('')

  const set = <K extends keyof Organ>(key: K, value: Organ[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  // --- builders ---------------------------------------------------------
  const updateBuilder = (id: string, patch: Partial<Builder>) =>
    set('builders', draft.builders.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const addBuilder = () => set('builders', [...draft.builders, blankBuilder()])
  const removeBuilder = (id: string) =>
    set('builders', draft.builders.filter((b) => b.id !== id))

  // --- divisions / stops ------------------------------------------------
  const updateDivision = (id: string, patch: Partial<Division>) =>
    set('divisions', draft.divisions.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  const addDivision = () => set('divisions', [...draft.divisions, blankDivision()])
  const removeDivision = (id: string) =>
    set('divisions', draft.divisions.filter((d) => d.id !== id))

  const updateStop = (divId: string, stopId: string, patch: Partial<Stop>) =>
    set(
      'divisions',
      draft.divisions.map((d) =>
        d.id === divId
          ? { ...d, stops: d.stops.map((s) => (s.id === stopId ? { ...s, ...patch } : s)) }
          : d,
      ),
    )
  const addStop = (divId: string) =>
    set(
      'divisions',
      draft.divisions.map((d) =>
        d.id === divId ? { ...d, stops: [...d.stops, blankStop()] } : d,
      ),
    )
  const removeStop = (divId: string, stopId: string) =>
    set(
      'divisions',
      draft.divisions.map((d) =>
        d.id === divId ? { ...d, stops: d.stops.filter((s) => s.id !== stopId) } : d,
      ),
    )

  // --- contacts ---------------------------------------------------------
  const updateContact = (id: string, patch: Partial<Contact>) =>
    set('contacts', draft.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const addContact = () => set('contacts', [...draft.contacts, blankContact()])
  const removeContact = (id: string) =>
    set('contacts', draft.contacts.filter((c) => c.id !== id))

  // --- visits -----------------------------------------------------------
  const updateVisit = (id: string, patch: Partial<Visit>) =>
    set('visits', draft.visits.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  const addVisit = () => set('visits', [...draft.visits, blankVisit()])
  const removeVisit = (id: string) =>
    set('visits', draft.visits.filter((v) => v.id !== id))

  // --- save -------------------------------------------------------------
  const handleSave = () => {
    if (!draft.venue.trim()) {
      setError('venue is required')
      return
    }
    onSave({
      ...draft,
      builders: draft.builders.filter((b) => b.name.trim()),
      contacts: draft.contacts.filter(
        (c) => c.name.trim() || c.phone.trim() || c.email.trim(),
      ),
    })
  }

  return (
    <div className="ol-form">
      <h2 className="ol-h">{isNew ? 'Add organ' : 'Edit organ'}</h2>

      {/* venue / location */}
      <div className="ol-section-label">Venue</div>
      <div className="ol-fields">
        <div className="ol-field full">
          <label>Venue *</label>
          <input
            value={draft.venue}
            onChange={(e) => set('venue', e.target.value)}
            placeholder="e.g. Christ Church South Yarra"
          />
        </div>
        <div className="ol-field">
          <label>Suburb</label>
          <input value={draft.suburb} onChange={(e) => set('suburb', e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Key number</label>
          <input value={draft.keyNumber} onChange={(e) => set('keyNumber', e.target.value)} />
        </div>
        <div className="ol-field full">
          <label>Address</label>
          <input value={draft.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Latitude</label>
          <input value={draft.lat} onChange={(e) => set('lat', e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Longitude</label>
          <input value={draft.lng} onChange={(e) => set('lng', e.target.value)} />
        </div>
        <div className="ol-field full">
          <button
            type="button"
            className={`ol-ladder-toggle${draft.ladderRequired ? ' on' : ''}`}
            onClick={() => set('ladderRequired', !draft.ladderRequired)}
          >
            {draft.ladderRequired ? '✓ ' : ''}Ladder required for access
          </button>
        </div>
        <div className="ol-field full">
          <label>Access notes</label>
          <textarea value={draft.accessNotes} onChange={(e) => set('accessNotes', e.target.value)} />
        </div>
      </div>

      {/* instrument / pitch */}
      <div className="ol-section-label">Instrument &amp; pitch</div>
      <div className="ol-fields">
        <div className="ol-field">
          <label>Manuals</label>
          <input value={draft.manuals} onChange={(e) => set('manuals', e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Base tune (min)</label>
          <input value={draft.baseTuneMinutes} onChange={(e) => set('baseTuneMinutes', e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Nominal pitch (Hz)</label>
          <input value={draft.nominalPitchHz} onChange={(e) => set('nominalPitchHz', e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Pitch ref temp (°C)</label>
          <input value={draft.pitchRefTempC} onChange={(e) => set('pitchRefTempC', e.target.value)} />
        </div>
        <div className="ol-field full">
          <label>Thermal mass</label>
          <select value={draft.thermalMass} onChange={(e) => set('thermalMass', e.target.value)}>
            {THERMAL_MASS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* builders */}
      <div className="ol-section-label">Builders &amp; history</div>
      {draft.builders.map((b) => (
        <div className="ol-builderrow" key={b.id}>
          <input value={b.name} onChange={(e) => updateBuilder(b.id, { name: e.target.value })} placeholder="Builder" />
          <input value={b.year} onChange={(e) => updateBuilder(b.id, { year: e.target.value })} placeholder="Year" />
          <input value={b.work} onChange={(e) => updateBuilder(b.id, { work: e.target.value })} placeholder="Work done" />
          <button type="button" className="ol-x" onClick={() => removeBuilder(b.id)}>remove</button>
        </div>
      ))}
      <div className="ol-row">
        <button type="button" className="ol-btn small" onClick={addBuilder}>+ Builder</button>
      </div>

      {/* divisions */}
      <div className="ol-section-label">Divisions &amp; stops</div>
      {draft.divisions.map((div) => (
        <div className={`ol-divcard${div.chestOriginal ? '' : ' swappedchest'}`} key={div.id}>
          <div className="ol-divhead">
            <div className="ol-field">
              <label>Division</label>
              <input
                list="ol-division-names"
                value={div.name}
                onChange={(e) => updateDivision(div.id, { name: e.target.value })}
                placeholder="Great"
              />
            </div>
            <div className="ol-field">
              <label>Chest type</label>
              <select value={div.chestType} onChange={(e) => updateDivision(div.id, { chestType: e.target.value })}>
                <option value="">—</option>
                {CHEST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="ol-field">
              <label>Wind pressure</label>
              <input value={div.windPressure} onChange={(e) => updateDivision(div.id, { windPressure: e.target.value })} placeholder='e.g. 3"' />
            </div>
            <label className="ol-stopsep">
              <input
                type="checkbox"
                checked={!div.chestOriginal}
                onChange={(e) => updateDivision(div.id, { chestOriginal: !e.target.checked })}
              />
              rebuilt chest
            </label>
            <button type="button" className="ol-x" onClick={() => removeDivision(div.id)}>remove</button>
          </div>

          {!div.chestOriginal && (
            <div className="ol-chestprov">
              <input
                value={div.chestProvenance}
                onChange={(e) => updateDivision(div.id, { chestProvenance: e.target.value })}
                placeholder="Chest provenance / rebuild note"
              />
            </div>
          )}

          <div className="ol-divstops">
            {div.stops.map((stop) => (
              <div className={`ol-stoprow${stop.original ? '' : ' swapped'}`} key={stop.id}>
                <input
                  list="ol-stop-names"
                  value={stop.name}
                  onChange={(e) => updateStop(div.id, stop.id, { name: e.target.value })}
                  placeholder="Open Diapason 8"
                />
                <label className="ol-stopsep">
                  <input
                    type="checkbox"
                    checked={!stop.original}
                    onChange={(e) => updateStop(div.id, stop.id, { original: !e.target.checked })}
                  />
                  revoiced
                </label>
                <button type="button" className="ol-x" onClick={() => removeStop(div.id, stop.id)}>✕</button>
                {!stop.original && (
                  <div className="ol-prov">
                    <input
                      value={stop.provenance}
                      onChange={(e) => updateStop(div.id, stop.id, { provenance: e.target.value })}
                      placeholder="Pipework provenance"
                    />
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="ol-btn small" onClick={() => addStop(div.id)}>+ Stop</button>
          </div>
        </div>
      ))}
      <div className="ol-row">
        <button type="button" className="ol-btn small" onClick={addDivision}>+ Division</button>
      </div>

      {/* contacts */}
      <div className="ol-section-label">Contacts</div>
      {draft.contacts.map((c) => (
        <div className="ol-contactcard" key={c.id}>
          <div className="ol-contacthead">
            <span className="ol-contactnum">Contact</span>
            <button type="button" className="ol-x" onClick={() => removeContact(c.id)}>remove</button>
          </div>
          <div className="ol-fields">
            <div className="ol-field">
              <label>Name</label>
              <input value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Role</label>
              <input value={c.role} onChange={(e) => updateContact(c.id, { role: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Phone</label>
              <input value={c.phone} onChange={(e) => updateContact(c.id, { phone: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Email</label>
              <input value={c.email} onChange={(e) => updateContact(c.id, { email: e.target.value })} />
            </div>
          </div>
        </div>
      ))}
      <div className="ol-row">
        <button type="button" className="ol-btn small" onClick={addContact}>+ Contact</button>
      </div>

      {/* visits */}
      <div className="ol-section-label">Visits</div>
      {draft.visits.map((v) => (
        <div className="ol-visit" key={v.id}>
          <div className="ol-fields">
            <div className="ol-field">
              <label>Date</label>
              <input type="date" value={v.date} onChange={(e) => updateVisit(v.id, { date: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Duration (min)</label>
              <input value={v.durationMinutes} onChange={(e) => updateVisit(v.id, { durationMinutes: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Temp (°C)</label>
              <input value={v.tempC} onChange={(e) => updateVisit(v.id, { tempC: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Temp site</label>
              <select value={v.tempSite} onChange={(e) => updateVisit(v.id, { tempSite: e.target.value })}>
                {TEMP_SITES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="ol-field">
              <label>Humidity (%)</label>
              <input value={v.humidity} onChange={(e) => updateVisit(v.id, { humidity: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Pitch (Hz)</label>
              <input value={v.pitchHz} onChange={(e) => updateVisit(v.id, { pitchHz: e.target.value })} />
            </div>
            <div className="ol-field">
              <label>Technician</label>
              <input value={v.technician} onChange={(e) => updateVisit(v.id, { technician: e.target.value })} />
            </div>
            <div className="ol-field full">
              <label>Work done</label>
              <textarea value={v.workDone} onChange={(e) => updateVisit(v.id, { workDone: e.target.value })} />
            </div>
          </div>
          <div className="ol-row">
            <button type="button" className="ol-x" onClick={() => removeVisit(v.id)}>remove visit</button>
          </div>
        </div>
      ))}
      <div className="ol-row">
        <button type="button" className="ol-btn small" onClick={addVisit}>+ Visit</button>
      </div>

      {/* standing notes */}
      <div className="ol-section-label">Standing notes</div>
      <div className="ol-field full">
        <textarea
          value={draft.standingNotes}
          onChange={(e) => set('standingNotes', e.target.value)}
          placeholder="General notes about the instrument…"
        />
      </div>

      {/* reviewed drawknob */}
      <div className="ol-review-toggle" onClick={() => set('reviewed', !draft.reviewed)}>
        <div className={`ol-drawknob ${draft.reviewed ? 'out' : 'in'}`}>
          <span className="face">{draft.reviewed ? 'REVIEWED' : 'PENDING'}</span>
        </div>
        <div>
          <div className="txt">{draft.reviewed ? 'Reviewed' : 'Pending review'}</div>
          <div className="sub">Pull the drawknob to mark as reviewed.</div>
        </div>
      </div>

      {error && <div className="ol-hint" style={{ color: '#a8412f' }}>{error}</div>}

      <div className="ol-row">
        <button type="button" className="ol-btn primary" onClick={handleSave}>Save</button>
        <button type="button" className="ol-btn ghost" onClick={onCancel}>Cancel</button>
      </div>

      <datalist id="ol-division-names">
        {DIVISION_NAMES.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <datalist id="ol-stop-names">
        {['Open Diapason 8', 'Stopped Diapason 8', 'Principal 4', 'Fifteenth 2', 'Twelfth 2-2/3', 'Mixture III', 'Trumpet 8', 'Oboe 8', 'Bourdon 16', 'Salicional 8', 'Tremulant'].map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  )
}

// ----------------------------------------------------------------------------

export default OrganForm
