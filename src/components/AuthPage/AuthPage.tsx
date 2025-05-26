import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase-client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import "./AuthPage.css";
import { useState, useEffect, useRef } from "react";

export default function AuthPage() {
  const [authView, setAuthView] = useState<
    "sign_in" | "sign_up" | "forgotten_password"
  >("sign_in");
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const node = authRef.current;
      if (!node) return;

      // Dò tìm các nội dung đặc trưng để xác định chế độ
      const html = node.innerHTML.toLowerCase();

      if (html.includes("reset password")) {
        setAuthView("forgotten_password");
      } else if (html.includes("sign up")) {
        setAuthView("sign_up");
      } else {
        setAuthView("sign_in");
      }
    });

    if (authRef.current) {
      observer.observe(authRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  const handleSocialLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) console.error("Error logging in:", error.message);
  };

  return (
    <div className="login-page">
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <div className="login-form">
          <h2>
            {authView === "sign_in" && "Sign in"}
            {authView === "sign_up" && "Sign up"}
            {authView === "forgotten_password" && "Reset Password"}
          </h2>
          <div ref={authRef}>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#3fcf8e",
                      brandAccent: "#35b97f",
                      inputBorder: "#d1d5db",
                      inputText: "#111827",
                      inputLabelText: "white",
                      anchorTextColor: "white",
                      anchorTextHoverColor: "green",
                    },
                  },
                },
              }}
              theme="default"
              providers={[]}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              className="social-login-btn"
              onClick={() => handleSocialLogin("google")}
            >
              <FcGoogle size={14} />
              Continue with Google
            </button>
            <button
              className="social-login-btn"
              onClick={() => handleSocialLogin("github")}
            >
              <FaGithub size={14} />
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
