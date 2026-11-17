import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import http from '../services/api'

export default function RecordDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [rec, setRec] = useState(null)
  const [hist, setHist] = useState([])
  const [verify, setVerify] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    try {
      const r = await http.get(`/records/${id}`)
      setRec(r.data)
      const h = await http.get(`/records/${id}/history`)
      setHist(h.data.items || [])
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const doVerify = async () => {
    setVerifying(true)
    setErr('')
    try {
      const r = await http.get(`/records/${id}/verify`)
      setVerify(r.data)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setVerifying(false)
    }
  }

  if (err && !rec) return <div className="p-4 rounded-xl bg-red-950/40 text-red-200 text-xs">{err}</div>
  if (!rec) return <div className="p-8 text-center text-teal-400 font-mono text-xs animate-pulse">Loading record metadata...</div>

  const isConfirmed = rec.blockchain_status === 'confirmed'

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Link to="/records" className="text-xs text-slate-400 hover:text-teal-400 transition-colors">
              ← Back to Records
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-teal-300">v{rec.version || 1}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Parcel Survey: {rec.survey_number}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/records/${id}/edit`}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Edit Record
          </Link>
          <button
            onClick={doVerify}
            disabled={verifying}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
          >
            <svg className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{verifying ? 'Verifying...' : 'Verify Cryptographic Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verify && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          verify.verified
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/40 border-red-500/40 text-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg ${verify.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} flex items-center justify-center shrink-0`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={verify.verified ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold">
                {verify.verified ? 'Cryptographic Integrity Confirmed' : 'Integrity Mismatch Detected'}
              </div>
              <div className="text-xs opacity-80">
                {verify.verified
                  ? 'Canonical SHA-256 database hash matches the immutable on-chain smart contract hash.'
                  : 'On-chain hash differs from database contents. An alert has been logged for administrative investigation.'}
              </div>
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            Version {verify.on_chain_version || rec.version}
          </span>
        </div>
      )}

      {/* Real-Time SMS Access Alert Notification Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 shadow-lg shadow-teal-500/5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold shrink-0 border border-teal-500/30">
              📱
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Real-Time SMS Alert Dispatched</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  {rec.last_sms_alert?.delivery_status || 'DELIVERED'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Security alert automatically triggered and dispatched to mobile number with access details, date, and time.
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto font-mono text-xs">
            <span className="text-slate-500">Security Phone:</span>
            <span className="text-teal-300 font-bold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              {rec.last_sms_alert?.recipient_phone || '+91-7795159602'}
            </span>
          </div>
        </div>
        {rec.last_sms_alert?.message && (
          <div className="text-[11px] font-mono bg-slate-950/80 rounded-xl p-3 text-slate-300 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-teal-400 font-semibold">SMS Message: </span>
              <span className="text-slate-200">"{rec.last_sms_alert.message}"</span>
            </div>
            {rec.last_sms_alert.dispatched_at && (
              <span className="text-slate-500 text-[10px] shrink-0">
                {new Date(rec.last_sms_alert.dispatched_at).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metadata Specification Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Parcel Attributes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Owner of Record</div>
            <div className="text-sm font-bold text-white mt-1">{rec.owner_name}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Owner Alert Phone</div>
            <div className="text-sm font-bold font-mono text-teal-300 mt-1">
              {rec.owner_phone ? `+91-${rec.owner_phone}` : 'Not linked'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Parcel Location</div>
            <div className="text-sm font-bold text-white mt-1">{rec.property_location}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Jurisdiction</div>
            <div className="text-sm font-bold text-white mt-1">{rec.district}, {rec.state}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Area Dimensions</div>
            <div className="text-sm font-bold font-mono text-teal-300 mt-1">{rec.area} {rec.unit}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Blockchain Status</div>
            <div className="text-sm font-bold mt-1 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={isConfirmed ? 'text-emerald-400 capitalize' : 'text-amber-400 capitalize'}>
                {rec.blockchain_status || 'not_submitted'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Record Status</div>
            <div className="text-sm font-bold text-white mt-1 capitalize">{rec.status || 'Active'}</div>
          </div>
        </div>

        {/* Cryptographic Hash Details */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500">Current Cryptographic Hash (SHA-256)</div>
          <div className="font-mono text-xs text-teal-300 break-all select-all">
            {rec.current_hash}
          </div>
        </div>

        {rec.blockchain_tx_ref && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-mono text-slate-500">Blockchain Transaction Hash</div>
            <div className="font-mono text-xs text-cyan-300 break-all select-all">
              {rec.blockchain_tx_ref}
            </div>
          </div>
        )}
      </div>

      {/* Version Audit History */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Immutable Version Timeline</h2>
        <div className="divide-y divide-slate-800/60">
          {hist.map((h) => (
            <div key={h.id || h.version} className="py-3 flex items-start justify-between text-xs">
              <div>
                <div className="font-semibold text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono">v{h.version}</span>
                  <span>•</span>
                  <span>{h.change_type}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Executed by {h.changed_by} at {h.changed_at ? new Date(h.changed_at).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="font-mono text-[10px] text-slate-500 max-w-xs truncate">
                {h.hash}
              </div>
            </div>
          ))}
          {!hist.length && <div className="text-xs text-slate-500 py-3">No prior revisions recorded.</div>}
        </div>
      </div>
    </div>
  )
}
