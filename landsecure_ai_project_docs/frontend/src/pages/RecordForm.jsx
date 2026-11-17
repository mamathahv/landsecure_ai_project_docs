import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import http from '../services/api'

export default function RecordForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState({
    survey_number: '',
    property_location: '',
    district: '',
    state: 'Andhra Pradesh',
    area: '',
    unit: 'sqft',
    owner_name: '',
    owner_phone: '',
    registration_date: '2025-01-01',
    status: 'active'
  })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      http.get(`/records/${id}`).then(r => {
        const d = r.data
        setForm({
          survey_number: d.survey_number,
          property_location: d.property_location,
          district: d.district,
          state: d.state,
          area: d.area,
          unit: d.unit,
          owner_name: d.owner_name,
          owner_phone: d.owner_phone || '',
          registration_date: d.registration_date,
          status: d.status
        })
      }).catch(e => setErr(e?.response?.data?.detail || e.message))
    }
  }, [id, isEdit])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const payload = { ...form, area: parseFloat(form.area), owner_phone: form.owner_phone?.trim() || null }
      if (isEdit) await http.put(`/records/${id}`, payload)
      else await http.post('/records', payload)
      nav('/records')
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isEdit ? 'Edit Land Record' : 'Register New Land Parcel'}
          </h1>
          <p className="text-xs text-slate-400">
            {isEdit
              ? 'Update parcel details. A new cryptographic revision will be anchored to the blockchain.'
              : 'Add an authentic synthetic land record to the database and initialize on-chain hash tracking.'}
          </p>
        </div>
        <Link to="/records" className="text-xs text-slate-400 hover:text-white transition-colors">
          Cancel
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        {err && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-survey">
                Survey Number / Identifier
              </label>
              <input
                id="rec-survey"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                placeholder="e.g. SV-2045"
                value={form.survey_number}
                onChange={e => set('survey_number', e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-owner">
              Registered Owner Name
            </label>
            <input
              id="rec-owner"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              placeholder="e.g. Rajesh Sharma"
              value={form.owner_name}
              onChange={e => set('owner_name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-owner-phone">
              Owner Alert Phone Number <span className="text-slate-500 font-normal">(10 digits, for title alteration alerts)</span>
            </label>
            <input
              id="rec-owner-phone"
              type="tel"
              maxLength={10}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
              placeholder="e.g. 9876543210"
              value={form.owner_phone}
              onChange={e => set('owner_phone', e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-location">
              Property Location / Address
            </label>
            <input
              id="rec-location"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              placeholder="e.g. Sector 4, Plot 12, Revenue Village"
              value={form.property_location}
              onChange={e => set('property_location', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-district">
                District
              </label>
              <input
                id="rec-district"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                placeholder="e.g. Anantapur"
                value={form.district}
                onChange={e => set('district', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-state">
                State
              </label>
              <input
                id="rec-state"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                placeholder="e.g. Andhra Pradesh"
                value={form.state}
                onChange={e => set('state', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-area">
                Parcel Area Measurement
              </label>
              <input
                id="rec-area"
                type="number"
                step="any"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                placeholder="e.g. 1500"
                value={form.area}
                onChange={e => set('area', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="rec-unit">
                Measurement Unit
              </label>
              <select
                id="rec-unit"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
              >
                <option value="sqft">Square Feet (sqft)</option>
                <option value="acres">Acres</option>
                <option value="sqm">Square Meters (sqm)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : isEdit ? 'Save Revision & Update Hash' : 'Register Parcel & Anchor to Chain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
