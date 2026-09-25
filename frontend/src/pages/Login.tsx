import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

export default function Login() {
    const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Demo login state save
  localStorage.setItem("avplat_demo_logged_in", "true");

  navigate("/");
};

  return (
    <div className="login-page">
      {/* Left Side */}
      <div className="login-visual">
        <div className="login-brand">
          <div className="brand-icon">A</div>
          <span>AVPLAT</span>
        </div>

        <div className="visual-content">
          <span className="visual-tag">
            <span className="live-dot" />
            AVIATION MANAGEMENT PLATFORM
          </span>

          <h1>
            Elevate your
            <br />
            aviation <span>operations.</span>
          </h1>

          <p>
            A unified platform to manage flights, aircraft,
            crew, and passengers with confidence.
          </p>

          <div className="flight-visual">
            <div className="flight-orbit orbit-one" />
            <div className="flight-orbit orbit-two" />
            <div className="flight-glow" />

            <svg
              className="flight-plane"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M60 8L72 53L110 75L108 84L70 73L67 103L82 113L80 119L60 111L40 119L38 113L53 103L50 73L12 84L10 75L48 53L60 8Z"
                fill="url(#planeGradient)"
              />
              <defs>
                <linearGradient
                  id="planeGradient"
                  x1="10"
                  y1="8"
                  x2="110"
                  y2="119"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8AE8FF" />
                  <stop offset="1" stopColor="#4A8BFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="visual-footer">
          <span>AVIATION. SIMPLIFIED.</span>
          <span>© 2026 AVPLAT</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="login-panel">
        <div className="login-form-wrapper">
          <div className="mobile-brand">
            <div className="brand-icon">A</div>
            <span>AVPLAT</span>
          </div>

          <div className="login-heading">
            <span className="welcome-tag">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="text-link"
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3L21 21M10.6 10.6A2 2 0 0013.4 13.4M9.9 5.2A10.9 10.9 0 0112 5c5.5 0 9 7 9 7a15 15 0 01-3.1 3.9M6.2 6.2C3.8 7.7 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="custom-checkbox" />
              <span>Remember me</span>
            </label>

            <button type="submit" className="login-submit">
              Sign In
              <span>→</span>
            </button>
          </form>

          <div className="login-divider">
            <span />
            <p>OR CONTINUE WITH</p>
            <span />
          </div>

          <button
            type="button"
            className="google-login"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                transform="translate(0 4)"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.64 5.93c4.46-4.13 7.13-10.2 7.13-17.58Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.2a23.98 23.98 0 0 0 0 21.58l7.98-6.2Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.65-5.93c-2.13 1.43-4.87 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.2C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="login-notice">
            Secure access to your aviation workspace.
          </p>
        </div>
      </div>
    </div>
  );
}