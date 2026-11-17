import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import RecordDetail from './pages/RecordDetail'
import RecordForm from './pages/RecordForm'
import Threat from './pages/Threat'
import Security from './pages/Security'
import Alerts from './pages/Alerts'
import Blockchain from './pages/Blockchain'
import Audit from './pages/Audit'
import Users from './pages/Users'
import Settings from './pages/Settings'

function Protected({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="records/new" element={<RecordForm />} />
          <Route path="records/:id" element={<RecordDetail />} />
          <Route path="records/:id/edit" element={<RecordForm />} />
          <Route path="threat" element={<Threat />} />
          <Route path="security" element={<Security />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="blockchain" element={<Blockchain />} />
          <Route path="audit" element={<Audit />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

