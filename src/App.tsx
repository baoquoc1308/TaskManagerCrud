import { useEffect, useState } from 'react'
import './styles/App.css'
import TaskManager from './components/taskManager'
import { supabase } from './supabase-client'
import AuthPage from './components/AuthPage'
import TaskDetail from './components/TaskDetail'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <p>Loading...</p>

  return (
    <Routes>
      {/* Trang đăng nhập (nếu chưa đăng nhập) */}
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Trang chính (home) */}
      <Route
        path="/"
        element={
          session ? (
            <TaskManager
              session={session}
              onLogout={logout}
              userEmail={session.user.email}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Trang chi tiết task */}
      <Route
        path="/task/:id"
        element={session ? <TaskDetail /> : <Navigate to="/login" replace />}
      />

      {/* Route fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
