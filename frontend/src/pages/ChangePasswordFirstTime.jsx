import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PasswordInput from "../components/PasswordInput";
import { showLoading, showSuccess, showError } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

const ChangePasswordFirstTime = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [user, setUser] = useState(null);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) errors.push("At least 6 characters");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/\d/.test(password)) errors.push("One digit");
    if (!/[@$!%*?&]/.test(password))
      errors.push("One special character (@$!%*?&)");
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

  useEffect(() => {
    const requiresPasswordChange = localStorage.getItem(
      "requiresPasswordChange",
    );
    const tempUser = localStorage.getItem("tempUser");

    if (!requiresPasswordChange || !tempUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(tempUser));
    } catch (err) {
      console.error("Error parsing temp user:", err);
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      showError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    setLoading(true);
    const toastId = showLoading("Updating your password...");

    try {
      const tempToken = localStorage.getItem("tempToken");
      const tempUserData = JSON.parse(localStorage.getItem("tempUser"));

      const res = await fetch(`${API_URL}/auth/${tempUserData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Failed to update password", toastId);
        return;
      }

      // Clear temporary data
      localStorage.removeItem("tempToken");
      localStorage.removeItem("tempUser");
      localStorage.removeItem("requiresPasswordChange");

      // Now redirect to login to get the full session token
      showSuccess(
        "Password changed successfully! Please log in again.",
        toastId,
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      showError("An error occurred. Please try again.", toastId);
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
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
          <h2 className="text-2xl mb-2 font-semibold text-center text-gray-900">
            Change Your Password
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Your account was created with a temporary password. Please change it
            now to secure your account.
          </p>

          <form onSubmit={handleSubmit}>
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
                placeholder="Confirm your password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                passwordErrors.length > 0 ||
                newPassword !== confirmPassword
              }
              className="w-full bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-base transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                localStorage.removeItem("tempToken");
                localStorage.removeItem("tempUser");
                localStorage.removeItem("requiresPasswordChange");
                navigate("/login");
              }}
              className="text-brand hover:underline text-sm font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2026 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordFirstTime;
