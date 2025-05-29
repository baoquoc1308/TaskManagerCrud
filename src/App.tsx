import { useEffect, useState } from "react";
import "./styles/App.css";
import TaskManager from "./components/TaskManager";
import { supabase } from "./supabase-client";
import AuthPage from "./components/AuthPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/SearchTasks/SearchTasks.css";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
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
      setSession(null); // Luôn clear session local dù lỗi gì xảy ra
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Routes>
        {/* Trang đăng nhập */}
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <AuthPage />}
        />

        {/* Trang chính */}
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

        {/* Bỏ route chi tiết task /task/:id */}

        {/* Route fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
