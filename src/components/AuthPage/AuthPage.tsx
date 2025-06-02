import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase-client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import "./AuthPage.css";
import { useState, useEffect, useRef } from "react";

export default function AuthPage() {
  const [authView, setAuthView] = useState<"sign_in" | "sign_up" | "forgotten_password">("sign_in");
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const node = authRef.current;
      if (!node) return;

      let newCalculatedView: "sign_in" | "sign_up" | "forgotten_password";

      // ✅ Truy cập nút submit chính
      const submitButton = node.querySelector('button[type="submit"]');
      const submitButtonText =
        submitButton instanceof HTMLElement ? submitButton.innerText.toLowerCase().trim() : "";

      // Xác định chế độ theo text của nút
      if (submitButtonText === "sign in") {
        newCalculatedView = "sign_in";
      } else if (submitButtonText === "sign up") {
        newCalculatedView = "sign_up";
      } else if (
        submitButtonText.includes("send") &&
        (submitButtonText.includes("instructions") || submitButtonText.includes("link"))
      ) {
        newCalculatedView = "forgotten_password";
      } else {
        const html = node.innerHTML.toLowerCase();

        const isForgottenPasswordView =
          html.includes("reset your password") ||
          html.includes("send reset link") ||
          html.includes("send magic link") ||
          html.includes("send recovery link") ||
          html.includes("send instructions");

        const isSignUpViewSpecific =
          html.includes("create an account") ||
          html.includes("create your account") ||
          html.includes("confirm password");

        if (isForgottenPasswordView) {
          newCalculatedView = "forgotten_password";
        } else if (isSignUpViewSpecific) {
          newCalculatedView = "sign_up";
        } else {
          const mainHeaderElement = node.querySelector(".supabase-auth-ui_ui-typography-headline");
          const mainHeaderText =
            mainHeaderElement instanceof HTMLElement
              ? mainHeaderElement.textContent?.toLowerCase().trim() || ""
              : "";

          if (mainHeaderText === "sign up") {
            newCalculatedView = "sign_up";
          } else if (mainHeaderText === "reset your password") {
            newCalculatedView = "forgotten_password";
          } else {
            newCalculatedView = "sign_in";
          }
        }
      }

      // Chỉ cập nhật nếu có sự thay đổi
      setAuthView((currentView) => (currentView !== newCalculatedView ? newCalculatedView : currentView));
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
            <button className="social-login-btn" onClick={() => handleSocialLogin("google")}>
              <FcGoogle size={14} />
              Continue with Google
            </button>
            <button className="social-login-btn" onClick={() => handleSocialLogin("github")}>
              <FaGithub size={14} />
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
