import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // In a real app, you get the token from the URL (e.g., ?token=xyz)
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 font-sans text-slate-300">
      <div className="w-full max-w-md bg-[#111827] rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">New Password</h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-8">
            Please enter and confirm your new secure password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-4 rounded-xl flex items-center gap-3">
                <span>⚠️</span> {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold p-4 rounded-xl flex items-center gap-3">
                <span>✅</span> {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-linear-to-r from-[#4338ca] to-[#6d28d9] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white text-xs font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 tracking-widest"
            >
              {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>

            {!token && (
              <p className="text-amber-500 text-[10px] text-center font-bold uppercase mt-2">
                Invalid or missing reset token.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}