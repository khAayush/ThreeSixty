import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PasswordInput from "../components/PasswordInput";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

const Dashboard = () => {
const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    // getting the user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setShowSetPassword(!u.hasPassword); // for setting password
    }
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to set password");
        setLoading(false);
        return;
      }

      toast.success("Password set successfully!");
      setShowSetPassword(false); // hide password fields
      setPassword("");
      setConfirm("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };    

  if (!user) {
    navigate("/login");
    return null;
  }

    return ( 
        <div className="min-h-screen bg-[#f7f8fa]">
      {showSetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-lg px-6 py-6">
            <h2 className="text-lg font-medium text-gray-800 text-center mb-2">
              Set your password
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Please set a secure password first.
            </p>

            {error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <PasswordInput
                  id="set-password-new"
                  label="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <PasswordInput
                  id="set-password-confirm"
                  label="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-base transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {!showSetPassword && (
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome, {user.name}
          </h1>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                Welcome To Dashboard
              </h2>
              <p>Add an asset</p>
            </div>
          </div>
        </div>
      )}
    </div>
     );
}
 
export default Dashboard;