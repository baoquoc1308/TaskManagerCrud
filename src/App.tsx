import { useEffect, useState } from "react";
import "./styles/App.css";
import TaskManager from "./components/TaskManager";
import { supabase } from "./supabase-client";
import AuthPage from "./components/AuthPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/SearchTasks/SearchTasks.css";
import ManagerDashboard from "./components/ManagerDashboard";
import UserDashboard from "./components/UserDashboard/UserDashboard";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user?.id) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
        setUserRole(userData?.role || "user");
      }

      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (session?.user?.id) {
          supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data: userData }) => {
              setUserRole(userData?.role || "user");
            });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.status === 403) {
          console.warn("Token expired or invalid, clearing session locally.");
        } else {
          console.error("Logout error:", error.message);
          return;
        }
      }
    } catch (e) {
      console.error("Unexpected error during logout:", e);
    } finally {
      setSession(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Routes>
        {}
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <AuthPage />}
        />

        {}
        <Route
          path="/"
          element={
            session ? (
              <TaskManager
                session={session}
                onLogout={logout}
                userEmail={session.user.email}
                userRole={userRole || "user"}
                userId={session.user.id}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {}

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/manager-dashboard"
          element={
            session && userRole === "manager" ? (
              <ManagerDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/user-dashboard"
          element={
            session && userRole === "user" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
