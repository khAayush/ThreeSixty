import {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import PasswordInput from "../components/PasswordInput";

const API_URL = 'http://localhost:8000/api';

const Signup = () => {

  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = `${firstName} ${lastName}`.trim();

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: workEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // navigate("/dashboard");
      console.log("Signup successful");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    return ( 
       <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <div className="pt-6 pl-8">
        <Link to="/" className="flex items-center text-gray-400 hover:text-gray-900 text-sm font-medium">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white font-medium text-lg">
              360°
            </div>
            <span className="text-gray-900 text-xl font-medium">ThreeSixty</span>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto bg-white py-10 px-8 rounded-2xl shadow border border-gray-100">
          <h2 className="text-xl mb-2 font-normal text-center text-gray-700">Create your account</h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block mb-1 text-gray-700 font-medium">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Aayush"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-gray-700 font-medium">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Khatiwada"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-gray-700 font-medium">Work Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="you@company.com"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
              />
            </div>
            <div className="mb-1">
              <label className="block mb-1 text-gray-700 font-medium">Password</label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>
            <div className="text-xs text-gray-400 mb-4">Must be at least 8 characters</div>
            <div className="flex items-center mb-4">
              <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300" required />
              <span className="text-xs text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-blue-500 hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-500 hover:underline font-medium">
                  Privacy Policy
                </a>
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-base transition"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <span className="flex-1 h-px bg-gray-200"></span>
            <span className="px-3 text-gray-400 text-sm">Or sign up with</span>
            <span className="flex-1 h-px bg-gray-200"></span>
          </div>

          <div className="w-full mb-4">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const idToken = credentialResponse.credential;

                  const res = await fetch(`${API_URL}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    console.error(data);
                    return;
                  }

                  localStorage.setItem("token", data.token);
                  localStorage.setItem("user", JSON.stringify(data.user));

                  navigate("/dashboard");
                } catch (err) {
                  console.error("Google login error", err);
                }
              }}
              onError={() => {
                console.error("Google Login Failed");
              }}
              shape="pill"
              width="100%"
            />
          </div>

          <div className="text-center text-sm text-gray-500 mt-2">
            Already have an account?
            <Link to="/login" className="text-blue-500 font-medium ml-1 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2025 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
     );
}
 
export default Signup;