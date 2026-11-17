import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import http from '../services/api'

export default function Records() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    setLoading(true)
    setErr('')
    try {
      const r = await http.get('/records', { params: { search, limit: 50 } })
      setItems(r.data.items)
      setTotal(r.data.total)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Land Revenue Records</h1>
          <p className="text-xs text-slate-400">
            Registered parcel identifiers, ownership credentials, and immutable on-chain hashes.
          </p>
        </div>
        <Link
          to="/records/new"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Register New Parcel</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
            placeholder="Search by survey number, owner name, or property location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
        </div>
        <button
          onClick={load}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          Search
        </button>
      </div>

      {err && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {err}
        </div>
      )}

      {/* Records Table Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Displaying <b>{items.length}</b> of <b>{total}</b> registered parcels</span>
          {loading && <span className="text-teal-400 font-mono text-[11px] animate-pulse">Syncing...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Survey Number</th>
                <th className="py-3 px-4">Registered Owner</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Blockchain Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {items.map(r => {
                const isConfirmed = r.blockchain_status === 'confirmed'
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-teal-300">
                      {r.survey_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {r.owner_name}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                      {r.property_location}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {r.district}, {r.state}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {r.area} {r.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        <span>{r.blockchain_status || 'not_submitted'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/records/${r.id}`}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-medium transition-colors"
                      >
                        Inspect & Verify
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!items.length && !loading && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No land records found. Click &quot;Register New Parcel&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
