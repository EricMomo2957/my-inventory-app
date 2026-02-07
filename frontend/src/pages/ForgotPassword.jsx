import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Check your inbox! Reset instructions have been sent.");
      } else {
        setError(data.message || "No account found with that email.");
      }
    } catch {
      // LINT FIX: Removed 'err' entirely. 
      // This is valid in modern JS and prevents "unused variable" errors.
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 font-sans text-slate-300">
      <div className="w-full max-w-md bg-[#111827] rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-3xl rounded-full"></div>

        <div className="relative z-10">
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors mb-6 flex items-center gap-2"
          >
            <span className="text-sm">←</span> Back to Login
          </button>
          
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Password Recovery</h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-8">
            Enter your registered email below. We will verify your account and provide reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clerk@inventorypro.com"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-4 rounded-xl flex items-center gap-3 animate-pulse">
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
              disabled={isLoading}
              className="w-full bg-linear-to-r from-[#4338ca] to-[#6d28d9] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white text-xs font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 tracking-widest"
            >
              {isLoading ? "VERIFYING..." : "SEND RECOVERY LINK"}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Need more help? <span className="text-indigo-400 cursor-pointer hover:underline">Contact Admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}