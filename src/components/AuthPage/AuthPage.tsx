import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabase-client";
import { FcGoogle } from "react-icons/fc";
import { 
  FaGithub, 
  FaLock, 
  FaUser, 
  FaEnvelope, 
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaPlus
} from "react-icons/fa";
import "./AuthPage.css";
import { useState, useEffect, useRef } from "react";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export default function AuthPage() {
  const [authView, setAuthView] = useState<
    "sign_in" | "sign_up" | "forgotten_password"
  >("sign_in");
  const authRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [signUpErrors, setSignUpErrors] = useState<Partial<SignUpFormData>>({});
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const node = authRef.current;
      if (!node) return;

      let newCalculatedView: "sign_in" | "sign_up" | "forgotten_password";

      const submitButton = node.querySelector('button[type="submit"]');
      const submitButtonText =
        submitButton instanceof HTMLElement
          ? submitButton.innerText.toLowerCase().trim()
          : "";

      if (submitButtonText === "sign in") {
        newCalculatedView = "sign_in";
      } else if (submitButtonText === "sign up") {
        newCalculatedView = "sign_up";
      } else if (
        submitButtonText.includes("send") &&
        (submitButtonText.includes("instructions") ||
          submitButtonText.includes("link"))
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
          const mainHeaderElement = node.querySelector(
            ".supabase-auth-ui_ui-typography-headline"
          );
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

      setAuthView((currentView) =>
        currentView !== newCalculatedView ? newCalculatedView : currentView
      );
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

  const validateSignUpForm = (): boolean => {
    const errors: Partial<SignUpFormData> = {};

    if (!signUpData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!signUpData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!signUpData.password) {
      errors.password = "Password is required";
    } else if (signUpData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) {
      return;
    }
  
    setIsSignUpLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            phone: signUpData.phone,
          },
        },
      });
  
      if (error) {
        console.error("Sign up error details:", {
          message: error.message,
          status: error.status,
          details: error
        });
        setSignUpErrors({ email: error.message });
      } else {
        console.log("Sign up successful:", data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSignUpErrors({ email: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const handleSignUpInputChange = (field: keyof SignUpFormData, value: string) => {
    setSignUpData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (signUpErrors[field]) {
      setSignUpErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setIsSignInLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        setSignInError(error.message);
        console.error("Sign in error:", error.message);
      } else {
        console.log("Sign in successful!");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSignInError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSignInLoading(false);
    }
  };

  const renderSignInForm = () => (
    <div className="auth-form-card">
      <div className="auth-header">
        <div className="brand-section">
          <div className="brand-icon">
            <div className="cube-icon">
              <div className="cube-face"></div>
              <div className="cube-face"></div>
              <div className="cube-face"></div>
            </div>
          </div>
          <h1 className="brand-title">Task Management Tool</h1>
        </div>
        
        <div className="auth-title-section">
          <h2 className="auth-main-title">Sign in to your account</h2>
          <p className="auth-subtitle">Manage your tasks and projects securely</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSignIn}>
        {signInError && (
          <div className="error-message" style={{ marginBottom: '16px', textAlign: 'center' }}>
            {signInError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={signInData.email}
              onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={signInData.password}
              onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkmark">
              {rememberMe && <FaCheck />}
            </span>
            Remember me
          </label>
          <button 
            type="button" 
            className="forgot-password-btn"
            onClick={() => setAuthView("forgotten_password")}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={isSignInLoading}>
          {isSignInLoading ? (
            <>
              Signing In...
            </>
          ) : (
            "Log In"
          )}
        </button>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-buttons">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={() => handleSocialLogin("google")}
          >
            <FcGoogle />
            Google
          </button>
          <button
            type="button"
            className="social-btn github-btn"
            onClick={() => handleSocialLogin("github")}
          >
            <FaGithub />
            GitHub
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? 
            <button 
              type="button" 
              className="link-btn"
              onClick={() => setAuthView("sign_up")}
            >
              Create account
            </button>
          </p>
        </div>
      </form>

      <div className="copyright">
        © 2025 Task Management System • All rights reserved
      </div>
    </div>
  );

  const renderSignUpForm = () => (
    <div className="auth-form-card">
      <div className="auth-header">
        <div className="brand-section">
          <div className="brand-icon">
            <div className="cube-icon">
              <div className="cube-face"></div>
              <div className="cube-face"></div>
              <div className="cube-face"></div>
            </div>
          </div>
          <h1 className="brand-title">Task Management Tool</h1>
        </div>
        
        <div className="auth-title-section">
          <h2 className="auth-main-title">Create your account</h2>
          <p className="auth-subtitle">Get started with task management system</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={signUpData.fullName}
              onChange={(e) => handleSignUpInputChange('fullName', e.target.value)}
              className={signUpErrors.fullName ? 'error' : ''}
              required
            />
          </div>
          {signUpErrors.fullName && <span className="error-message">{signUpErrors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={signUpData.email}
              onChange={(e) => handleSignUpInputChange('email', e.target.value)}
              className={signUpErrors.email ? 'error' : ''}
              required
            />
          </div>
          {signUpErrors.email && <span className="error-message">{signUpErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={signUpData.password}
              onChange={(e) => handleSignUpInputChange('password', e.target.value)}
              className={signUpErrors.password ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {signUpErrors.password && <span className="error-message">{signUpErrors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={signUpData.confirmPassword}
              onChange={(e) => handleSignUpInputChange('confirmPassword', e.target.value)}
              className={signUpErrors.confirmPassword ? 'error' : ''}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {signUpErrors.confirmPassword && <span className="error-message">{signUpErrors.confirmPassword}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={isSignUpLoading}>
          {isSignUpLoading ? (
            <>
              <div className="loading-spinner"></div>
              Creating Account...
            </>
          ) : (
            <>
              <FaPlus />
              Create Account
            </>
          )}
        </button>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-buttons">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={() => handleSocialLogin("google")}
          >
            <FcGoogle />
            Google
          </button>
          <button
            type="button"
            className="social-btn github-btn"
            onClick={() => handleSocialLogin("github")}
          >
            <FaGithub />
            GitHub
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?
            <button 
              type="button" 
              className="link-btn"
              onClick={() => setAuthView("sign_in")}
            >
            Sign in
            </button>
          </p>
        </div>
      </form>

      <div className="copyright">
        © 2025 Task Management System • All rights reserved
      </div>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="auth-form-card forgot-password-form">
      <div className="auth-header">
        <div className="brand-section">
          <div className="brand-icon">
            <div className="cube-icon">
              <div className="cube-face"></div>
              <div className="cube-face"></div>
              <div className="cube-face"></div>
            </div>
          </div>
          <h1 className="brand-title">Task Management Tool</h1>
        </div>
        
        <div className="auth-title-section">
          <h2 className="auth-main-title">Reset your password</h2>
          <p className="auth-subtitle">Enter your email to receive reset instructions</p>
        </div>
      </div>

      <div className="auth-form" ref={authRef}>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#22c55e",
                  brandAccent: "#16a34a",
                  inputBorder: "#e5e7eb",
                  inputText: "#374151",
                  inputBackground: "#ffffff",
                  inputLabelText: "#6b7280",
                  anchorTextColor: "#22c55e",
                  anchorTextHoverColor: "#16a34a",
                  defaultButtonBackground: "#22c55e",
                  defaultButtonBackgroundHover: "#16a34a",
                },
              },
            },
            className: {
              container: "supabase-auth-container",
              button: "supabase-auth-button",
              input: "supabase-auth-input",
            },
          }}
          theme="default"
          providers={[]}
          view="forgotten_password"
        />
      </div>

      <div className="auth-footer">
        <p>
          Remember your password? 
          <button 
            type="button" 
            className="link-btn"
            onClick={() => setAuthView("sign_in")}
          >
            Sign in
          </button>
        </p>
      </div>

      <div className="copyright">
        © 2025 Task Management System • All rights reserved
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        {authView === "sign_in" && renderSignInForm()}
        {authView === "sign_up" && renderSignUpForm()}
        {authView === "forgotten_password" && renderForgotPasswordForm()}
      </div>
    </div>
  );
}