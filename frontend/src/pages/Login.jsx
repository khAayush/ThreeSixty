import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import PasswordInput from "../components/PasswordInput";
import { showLoading, showSuccess, showError, showPending } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ allowedEmailDomains: [], filteredEmailNames: [] });

  useEffect(() => {
    // Fetch settings for client-side Google login validation
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => { if (data.settings) setSettings(data.settings); })
      .catch(() => {});
  }, []);

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const userRole = userData.role;

          // Redirect based on role
          if (userRole === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/employee-dashboard");
          }
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand text-white font-medium text-lg">
              360
            </div>
            <span className="text-gray-900 text-xl font-medium">
              ThreeSixty
            </span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto bg-white py-10 px-8 rounded-2xl shadow border border-gray-100">
          <h2 className="text-xl mb-2 font-normal text-center text-gray-700">
            Welcome Back
          </h2>
          <div className="w-full mb-4">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const toastId = showLoading("Authenticating with Google...");
                try {
                  const idToken = credentialResponse.credential;

                  // Decode the JWT to get user info including profile picture
                  const decodedToken = jwtDecode(idToken);

                  // Validate email domain (client-side check)
                  const userEmail = decodedToken.email;
                  const emailDomain = userEmail.split("@")[1];
                  const emailName = userEmail.split("@")[0];

                  const { allowedEmailDomains, filteredEmailNames } = settings;

                  if (
                    filteredEmailNames.some((name) => emailName.startsWith(name))
                  ) {
                    showError(`This email is not allowed to login.`, toastId);
                    return;
                  }

                  if (
                    allowedEmailDomains.length > 0 &&
                    !allowedEmailDomains.includes(emailDomain)
                  ) {
                    showError(
                      `Please use your organization email to login.`,
                      toastId,
                    );
                    return;
                  }

                  // Extract profile picture from Google token
                  const profileImage = decodedToken.picture || null;

                  const res = await fetch(`${API_URL}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      idToken,
                      profileImage,
                    }),
                  });

                  const data = await res.json();

                  // Handle specific error messages
                  if (!res.ok) {
                    const errorMsg =
                      data.message || data.error || "Google login failed";
                    showError(errorMsg, toastId);
                    return;
                  }

                  // Handle pending approval (202 status)
                  if (res.status === 202 && data.status === "pending") {
                    showPending(`Your account is pending approval.`, toastId);
                    return;
                  }

                  // Successful login - store token and redirect
                  const userData = {
                    ...data.user,
                  };

                  document.cookie = `token=${data.token}; path=/`;
                  localStorage.setItem("token", data.token);
                  localStorage.setItem("user", JSON.stringify(userData));

                  setCurrentUser(userData);

                  if (userData.role === "admin") {
                    showSuccess(`Welcome back, ${userData.name}!`, toastId);
                    setTimeout(() => navigate("/admin-dashboard"), 500);
                  } else {
                    showSuccess(`Welcome back, ${userData.name}!`, toastId);
                    setTimeout(() => navigate("/employee-dashboard"), 500);
                  }
                } catch (err) {
                  const errorMsg =
                    err.message || "An error occurred during Google login";
                  showError(errorMsg, toastId);
                  console.error("Google login error:", err);
                }
              }}
              onError={() => {
                showError("Google Login Failed");
              }}
              shape="pill"
              width="100%"
            />
          </div>

          <div className="flex items-center my-6">
            <span className="flex-1 h-px bg-gray-200"></span>
            <span className="px-3 text-gray-400 text-sm">Login with Email</span>
            <span className="flex-1 h-px bg-gray-200"></span>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const toastId = showLoading("Logging in...");

              try {
                const res = await fetch(`${API_URL}/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                  showError(data.message || "Login failed", toastId);
                  return;
                }

                // Check if password change is required
                if (data.requiresPasswordChange) {
                  // Store temporary token and user data for password change
                  localStorage.setItem("tempToken", data.token);
                  localStorage.setItem("tempUser", JSON.stringify(data.user));
                  localStorage.setItem("requiresPasswordChange", "true");
                  
                  showSuccess("Redirecting to change password...", toastId);
                  setTimeout(() => navigate("/change-password-first-time"), 500);
                  return;
                }

                // Store user data if provided
                if (data.user) {
                  localStorage.setItem("user", JSON.stringify(data.user));
                }
                if (data.token) {
                  localStorage.setItem("token", data.token);
                }

                const userData = {
                    ...data.user,
                  };
                  
                setCurrentUser(userData);
                
                if (data.user.role === "admin") {
                  showSuccess(`Welcome back, ${data.user.name}!`, toastId);

                  setTimeout(() => navigate("/admin-dashboard"), 500);
                } else {
                  showSuccess(`Welcome back, ${data.user.name}!`, toastId);

                  setTimeout(() => navigate("/employee-dashboard"), 500);
                }
              } catch (err) {
                showError("An error occurred. Please try again.", toastId);
                console.error("Login error:", err);
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 font-medium">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 outline-none transition"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-gray-700 font-medium">
                Password
              </label>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex items-center justify-between mb-5">
              <Link
                to="/forgot-password"
                className="text-brand hover:underline text-sm font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-base transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2026 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
