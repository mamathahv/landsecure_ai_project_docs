import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('React error:', error, info) }
  render() {
    if (this.state.error) {
      return <div style={{ color: 'red', padding: 20, fontFamily: 'monospace' }}>
        <h2>Runtime error</h2>
        <pre>{String(this.state.error && this.state.error.stack || this.state.error)}</pre>
      </div>
    }
    return this.props.children
  }
}

window.addEventListener('error', (e) => { console.error('window error:', e.error) })
window.addEventListener('unhandledrejection', (e) => { console.error('unhandled rejection:', e.reason) })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
