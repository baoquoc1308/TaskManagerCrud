import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../supabase-client'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import '../styles/App.css'

export default function AuthPage() {
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) console.error('Error logging in:', error.message)
  }
  return (
    <div className="login-page">
      <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
        <div className="login-form">
          <h2>Sign in</h2>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3fcf8e', // xanh lá
                    brandAccent: '#35b97f', // accent
                    inputBorder: '#d1d5db',
                    inputText: '#111827',
                    inputLabelText: 'white',
                    anchorTextColor: 'white',
                    anchorTextHoverColor: 'green',
                  },
                },
              },
            }}
            theme="default"
            providers={[]}
          />
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <button
              style={{ padding: '10px', width: '100%' }}
              onClick={() => handleSocialLogin('google')}
            >
              <FcGoogle size={14} />
              Continue with Google
            </button>
            <button
              style={{ padding: '10px', width: '100%' }}
              onClick={() => handleSocialLogin('github')}
            >
              <FaGithub size={14} />
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
