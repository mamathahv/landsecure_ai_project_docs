import { useState, useEffect } from 'react'
import http from '../services/api'

export default function Blockchain() {
  const [recordId, setRecordId] = useState('')
  const [statusInfo, setStatusInfo] = useState(null)
  const [msg, setMsg] = useState('')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentRecords, setRecentRecords] = useState([])

  const loadStatus = async () => {
    try {
      const r = await http.get('/blockchain/status')
      setStatusInfo(r.data)
      const recs = await http.get('/records', { params: { limit: 5 } })
      setRecentRecords(recs.data.items || [])
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const register = async () => {
    if (!recordId) return setErr('Please provide a valid Record ID')
    setErr('')
    setMsg('')
    setLoading(true)
    try {
      const r = await http.post('/blockchain/register', { record_id: recordId })
      setMsg(`Success! Anchored to EVM. Tx Hash: ${r.data.tx_hash}`)
      setRes(r.data)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    if (!recordId) return setErr('Please provide a valid Record ID')
    setErr('')
    setRes(null)
    setLoading(true)
    try {
      const r = await http.post('/blockchain/verify', { record_id: recordId })
      setRes(r.data)
      if (r.data.verified) {
        setMsg('Verified! Database hash matches immutable on-chain record.')
      } else {
        setErr('Warning: Cryptographic hash mismatch! Data may be tampered.')
      }
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Blockchain Cryptographic Verification</h1>
        <p className="text-xs text-slate-400">
          Direct verification of land record hashes against Solidity smart contract on local EVM.
        </p>
      </div>

      {/* Network & Contract Specs Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Node Status</div>
          <div className="text-sm font-bold text-white mt-1 flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${statusInfo?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span>{statusInfo?.connected ? 'Hardhat Node Active' : 'Disconnected'}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">RPC: http://127.0.0.1:8545</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Deployed Contract</div>
          <div className="text-xs font-mono text-teal-300 font-semibold mt-1 truncate">
            0x5FbDB2315678afecb367f032d93F642f64180aa3
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Solidity 0.8.20 • LandRecordRegistry</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Hash Standard</div>
          <div className="text-sm font-bold text-white mt-1">SHA-256 (Canonical JSON)</div>
          <div className="text-[10px] text-slate-400 mt-0.5">bytes32 EVM storage</div>
        </div>
      </div>

      {/* Interactive Verification Console */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
        <h2 className="text-sm font-bold text-white">Record Hash Operations</h2>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Target Record Identifier (MongoDB Object ID)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-500"
              placeholder="Paste 24-character hexadecimal Record ID (e.g. 6af49559e9ea1232064749b5)"
              value={recordId}
              onChange={e => setRecordId(e.target.value)}
            />
            <button
              onClick={verify}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              Verify On-Chain Hash
            </button>
            <button
              onClick={register}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Register / Update Hash
            </button>
          </div>
        </div>

        {/* Quick select from recent records */}
        {recentRecords.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] text-slate-400 mb-1.5">Quick-test with sample records:</div>
            <div className="flex flex-wrap gap-2">
              {recentRecords.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRecordId(r.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-teal-300 transition-colors flex items-center space-x-1.5"
                >
                  <span className="font-sans font-medium text-teal-400">{r.survey_number}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 truncate max-w-[100px]">{r.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{msg}</span>
          </div>
        )}

        {err && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{err}</span>
          </div>
        )}

        {res && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-[10px] text-teal-400 uppercase tracking-wider font-bold">On-Chain EVM Response</div>
            <pre className="overflow-x-auto text-teal-200 text-[11px]">{JSON.stringify(res, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
