import { useEffect, useState } from 'react'
import './styles/App.css'
import { Auth } from './components/auth'
import TaskManager from './components/task-manager'
import { supabase } from './supabase-client'

function App() {
  const [session, setSession] = useState<any>(null)

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession()
    console.log(currentSession)
    setSession(currentSession.data.session)
  }

  useEffect(() => {
    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      {session ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1rem',
            }}
          >
            <button onClick={logout}>Log Out</button>
          </div>
          <TaskManager session={session} />
        </>
      ) : (
        <Auth />
      )}
    </>
  )
}

export default App
