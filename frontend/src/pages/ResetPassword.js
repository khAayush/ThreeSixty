import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PasswordInput from '../components/PasswordInput';

const API_URL = 'http://localhost:8000/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qToken = searchParams.get('token');
    setEmail(qEmail);
    setToken(qToken);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !token) {
      setError('Invalid or missing reset link.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setMessage('Password reset successfully. You can now sign in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <div className="pt-6 pl-8">
        <Link
          to="/"
          className="flex items-center text-gray-400 hover:text-gray-900 text-sm font-medium"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white font-medium text-lg">
              360
            </div>
            <span className="text-gray-900 text-xl font-medium">ThreeSixty</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto bg-white py-10 px-8 rounded-2xl shadow border border-gray-100">
          <div className="mb-5">
            <Link
              to="/signin"
              className="flex items-center text-gray-400 hover:text-gray-900 text-sm font-medium mb-2"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to login
            </Link>
            <div className="flex flex-col items-center mt-4">
              <div className="bg-blue-50 rounded-full p-3 mb-3">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <rect x="5" y="11" width="14" height="8" rx="2" />
                  <path d="M9 11V8a3 3 0 0 1 6 0v3" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Reset your password</h2>
              <div className="text-gray-400 text-base mb-4 text-center">
                Enter a new password for your account
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block mb-1 text-gray-700 font-medium">Password</label>
              <PasswordInput
                id="reset-new"
                label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block mb-1 text-gray-700 font-medium">Confirm Password</label>
              <PasswordInput
                id="reset-confirm"
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
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2025 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
