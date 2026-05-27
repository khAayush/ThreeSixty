import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { showLoading, showSuccess, showError } from "../utils/toast";
import PasswordInput from "../components/PasswordInput";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    } else if (resendCooldown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown, resendDisabled]);

  // Password validation regex
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) errors.push("At least 6 characters");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/\d/.test(password)) errors.push("One digit");
    if (!/[@$!%*?&]/.test(password)) errors.push("One special character (@$!%*?&)");
    return errors;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (value) {
      setPasswordErrors(validatePassword(value));
    } else {
      setPasswordErrors([]);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = showLoading("Sending OTP...");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        showError(data.message || "Failed to send OTP", toastId);
        return;
      }

      showSuccess("If this email is registered, an OTP has been sent.", toastId);
      setStep(2);
    } catch (err) {
      showError("An error occurred. Please try again.", toastId);
      console.error("Request OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setResendDisabled(true);
    setResendCooldown(60);
    const toastId = showLoading("Resending OTP...");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        showError(data.message || "Failed to resend OTP", toastId);
        setResendDisabled(false);
        setResendCooldown(0);
        return;
      }

      showSuccess("OTP resent successfully. Check your email.", toastId);
    } catch (err) {
      showError("An error occurred. Please try again.", toastId);
      console.error("Resend OTP error:", err);
      setResendDisabled(false);
      setResendCooldown(0);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      showError("Please fix password requirements", "");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Passwords do not match", "");
      return;
    }

    setLoading(true);
    const toastId = showLoading("Verifying OTP and resetting password...");

    try {
      // First verify OTP
      const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        showError(data.message || "Invalid or expired OTP", toastId);
        return;
      }

      // Then reset password
      const resetRes = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!resetRes.ok) {
        const data = await resetRes.json();
        showError(data.message || "Failed to reset password", toastId);
        return;
      }

      showSuccess("Password changed successfully. Please log in again.", toastId);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showError("An error occurred. Please try again.", toastId);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

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
          {step === 1 ? (
            <>
              <h2 className="text-xl mb-2 font-normal text-center text-gray-700">
                Reset Your Password
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>

              <form onSubmit={handleRequestOtp}>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-700 font-medium">
                    Email Address
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-base transition"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-brand hover:underline text-sm font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl mb-2 font-normal text-center text-gray-700">
                Enter OTP & New Password
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Check your email for the 6-digit OTP. It expires in 5 minutes.
              </p>

              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-700 font-medium">
                    OTP
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 outline-none transition"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                    className="mt-2 text-brand hover:underline text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resendDisabled ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-gray-700 font-medium">
                    New Password
                  </label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                  {passwordErrors.length > 0 && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 font-medium mb-1">
                        Password must include:
                      </p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {passwordErrors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block mb-1 text-gray-700 font-medium">
                    Confirm Password
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || passwordErrors.length > 0 || newPassword !== confirmPassword}
                  className="w-full bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-base transition"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setStep(1);
                    setResendCooldown(0);
                    setResendDisabled(false);
                  }}
                  className="text-brand hover:underline text-sm font-medium"
                >
                  Back to Email
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2026 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
