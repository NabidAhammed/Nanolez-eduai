
// Login component

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  theme: 'light' | 'dark';
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export function Login({ theme, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';
  const bodyColor = isDark ? 'text-slate-400' : 'text-[#475569]';
  const cardBg = isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
  const inputBg = isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0]';
  const inputTextColor = isDark ? 'text-white' : 'text-[#475569]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    
    try {
      const success = await onLogin(email.toLowerCase().trim(), password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[2.5rem] flex items-center justify-center text-white shadow-lg">
            <img src="/favicon.svg" className="w-12 h-12" />
          </div>
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            NANOLEZ
          </h1>
          <p className={`text-sm font-bold tracking-widest uppercase ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Edu AI Platform
          </p>
        </div>

        {/* Login Form */}
        <div className={`p-8 rounded-[2.5rem] border ${cardBg}`}>
          <div className="mb-8">
            <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Welcome Back
            </h2>
            <p className={`text-sm ${bodyColor}`}>
              Sign in to access your personalized learning dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none ${inputBg} ${inputTextColor} placeholder:text-slate-400`}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
                Password
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none ${inputBg} ${inputTextColor} placeholder:text-slate-400`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-[#64748B] hover:text-[#475569]'}`}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <p className={`text-xs font-bold mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Demo Access
            </p>
            <p className={`text-xs ${bodyColor}`}>
              Use any email and password to access the platform. Your data will be stored locally and associated with your email address.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-xs ${bodyColor}`}>
            Secured by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}

