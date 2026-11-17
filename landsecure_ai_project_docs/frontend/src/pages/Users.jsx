import { useEffect, useState } from 'react'
import http from '../services/api'

export default function Users() {
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await http.get('/users')
      setItems(r.data.items)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const changeRole = async (id, role) => {
    setUpdatingId(id)
    try {
      await http.patch(`/users/${id}/role`, { role })
      load()
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Identity &amp; Role Management (RBAC)</h1>
        <p className="text-xs text-slate-400">
          Administrator console to allocate cryptographic permissions across Citizens, Land Officers, and Admins.
        </p>
      </div>

      {err && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {err}
        </div>
      )}

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Registered System Identities: <b>{items.length}</b></span>
          {loading && <span className="text-teal-400 font-mono text-[11px] animate-pulse">Syncing...</span>}
        </div>

        <div className="divide-y divide-slate-800/60">
          {items.map(u => (
            <div key={u.id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-white text-sm flex items-center space-x-2">
                  <span>{u.full_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                    u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                    u.role === 'land_officer' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {u.role}
                  </span>
                </div>
                <div className="font-mono text-slate-400 text-[11px] flex items-center space-x-2">
                  <span>{u.email}</span>
                  {u.phone_number ? (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-teal-400 font-medium">📱 +91-{u.phone_number}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500 italic">No phone unlinked</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <span className="text-[11px] text-slate-500">Modify Role:</span>
                <select
                  disabled={updatingId === u.id}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-teal-300 font-medium focus:outline-none focus:border-teal-500"
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                >
                  <option value="citizen">Citizen (Public Reader)</option>
                  <option value="land_officer">Land Officer (Registrar)</option>
                  <option value="admin">Administrator (Security Controller)</option>
                </select>
              </div>
            </div>
          ))}

          {!items.length && !loading && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No users available or access restricted to administrator accounts.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
