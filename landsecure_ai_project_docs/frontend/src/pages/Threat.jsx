import { useState } from 'react'
import http from '../services/api'

const fields = [
  { key: 'failed_login_count', label: 'Failed Login Attempts', desc: 'Consecutive authentication failures' },
  { key: 'requests_per_minute', label: 'Request Rate / min', desc: 'API queries per 60 seconds' },
  { key: 'access_outside_normal_hours', label: 'Off-Hours Access', desc: '1 if access is outside 08:00–18:00' },
  { key: 'permission_mismatch', label: 'Permission Mismatch', desc: '1 if actor tried role-restricted action' },
  { key: 'records_modified_short_period', label: 'Rapid Modifications', desc: 'Records altered in < 5 minutes' },
  { key: 'repeated_requests_same_source', label: 'Repeated Source Hits', desc: 'High frequency single-IP volume' },
  { key: 'hash_mismatch', label: 'Cryptographic Hash Mismatch', desc: '1 if database hash != on-chain hash' },
  { key: 'auth_result', label: 'Authentication Result', desc: '1 for success, 0 for failure' }
]

const presets = [
  {
    name: 'Normal Query',
    tag: 'Benign',
    color: 'border-emerald-500/40 text-emerald-300',
    data: {
      failed_login_count: 0,
      requests_per_minute: 5,
      access_outside_normal_hours: 0,
      permission_mismatch: 0,
      records_modified_short_period: 0,
      repeated_requests_same_source: 1,
      hash_mismatch: 0,
      auth_result: 1
    }
  },
  {
    name: 'Brute Force Attack',
    tag: 'Critical',
    color: 'border-red-500/40 text-red-300',
    data: {
      failed_login_count: 12,
      requests_per_minute: 90,
      access_outside_normal_hours: 1,
      permission_mismatch: 1,
      records_modified_short_period: 0,
      repeated_requests_same_source: 25,
      hash_mismatch: 0,
      auth_result: 0
    }
  },
  {
    name: 'Data Tampering Attempt',
    tag: 'High Risk',
    color: 'border-rose-500/40 text-rose-300',
    data: {
      failed_login_count: 1,
      requests_per_minute: 20,
      access_outside_normal_hours: 1,
      permission_mismatch: 1,
      records_modified_short_period: 8,
      repeated_requests_same_source: 10,
      hash_mismatch: 1,
      auth_result: 1
    }
  }
]

export default function Threat() {
  const [form, setForm] = useState({
    failed_login_count: 0,
    requests_per_minute: 5,
    access_outside_normal_hours: 0,
    permission_mismatch: 0,
    records_modified_short_period: 0,
    repeated_requests_same_source: 1,
    hash_mismatch: 0,
    auth_result: 1,
    model: 'random_forest'
  })
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const applyPreset = (presetData) => {
    setForm(f => ({ ...f, ...presetData }))
    setRes(null)
    setErr('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const r = await http.post('/ml/predict', form)
      setRes(r.data)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Cyber Threat Prediction</h1>
        <p className="text-xs text-slate-400">
          Dual-engine inference using Random Forest &amp; K-Nearest Neighbors trained on cyber access patterns.
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Load Pre-Engineered Attack Scenarios:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.data)}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/40 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">{p.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Click to populate parameters</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${p.color}`}>
                {p.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form & Prediction Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <form onSubmit={submit} className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Feature Input Vector</h2>
            <div className="flex items-center space-x-2">
              <label htmlFor="model-select" className="text-xs text-slate-400">Model:</label>
              <select
                id="model-select"
                aria-label="Model"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
              >
                <option value="random_forest">Random Forest Classifier</option>
                <option value="knn">K-Nearest Neighbors (KNN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor={`field-${f.key}`} className="text-slate-300 font-medium">{f.label}</label>
                  <span className="text-[10px] text-teal-400 font-mono">{form[f.key]}</span>
                </div>
                <input
                  id={`field-${f.key}`}
                  type="number"
                  step="any"
                  aria-label={f.label}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: Number(e.target.value) })}
                />
                <div className="text-[10px] text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <span>Executing Inference...</span> : <span>Compute Threat Prediction</span>}
          </button>
        </form>

        {/* Prediction Results Display */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4">
              Prediction Verdict
            </h2>

            {err && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                {err}
              </div>
            )}

            {res ? (
              <div className="space-y-4">
                {/* Result Pill */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  res.predicted_class === 'suspicious'
                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                }`}>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider opacity-75">Classification</div>
                    <div className="text-xl font-black capitalize tracking-tight">{res.predicted_class}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    res.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                    res.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                    res.severity === 'MEDIUM' ? 'bg-yellow-500 text-slate-900' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {res.severity}
                  </span>
                </div>

                {/* Score Meter */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Anomaly Risk Probability</span>
                    <span className="font-mono text-teal-300 font-bold">{(res.score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${res.predicted_class === 'suspicious' ? 'bg-red-500' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, Math.max(5, res.score * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Model Details */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Evaluated By:</span>
                    <span className="font-mono text-white capitalize">{res.model?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model Features:</span>
                    <span className="font-mono text-slate-300">8 Vector Dimensions</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-slate-500 mb-1">Explanation:</div>
                    <div className="text-slate-300 leading-relaxed font-sans text-[11px]">
                      {res.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <svg className="w-10 h-10 mx-auto text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-xs">Select a preset or enter parameters and click Compute.</div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-4 border-t border-slate-800/80 mt-4">
            LandSecure AI ML Pipeline • joblib Scaler + Scikit-Learn Model
          </div>
        </div>
      </div>
    </div>
  )
}
