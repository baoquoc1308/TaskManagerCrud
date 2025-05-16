import { useEffect, useState } from "react";
import "./styles/App.css";
import TaskManager from "./components/task-manager";
import { supabase } from "./supabase-client";
import AuthPage from "./components/AuthPage";

function App() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {session ? (
        <>
          <div
            style={{
              color: "black",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "1rem",
              gap: "1rem",
            }}
          >
            <span>{session.user?.email}</span>
            <button onClick={logout}>Log Out</button>
          </div>
          <TaskManager session={session} />
        </>
      ) : (
        <AuthPage />
      )}
    </>
  );
}

export default App;
