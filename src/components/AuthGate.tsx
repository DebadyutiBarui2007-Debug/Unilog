import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { registerWithEmail, loginWithEmail, loginWithGoogle } from '../firebase';

interface AuthGateProps {
  onSuccess: () => void;
  onSkip: () => void;
  themeStyles: any;
  isLight: boolean;
  isAmber: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onSuccess, onSkip, themeStyles, isLight, isAmber }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onSuccess();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential' || msg.includes('invalid-credential')) {
        setError('Invalid email or password. Please check your credentials or create an account.');
      } else if (code === 'auth/weak-password' || msg.includes('weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        setError('Network request failed or popups are blocked by your browser/iframe environment. Please use email & password sign-up below for instant access.');
      } else if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed')) {
        setError('Google sign-in popup was closed before completion.');
      } else {
        setError(msg || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto ${isLight ? 'bg-slate-900/40' : 'bg-[#04060A]/80'}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className={`relative w-full max-w-md flex flex-col p-8 sm:p-10 rounded-3xl overflow-y-auto max-h-[90vh] custom-scrollbar shadow-2xl ${
          isLight ? 'bg-white shadow-slate-900/20 border border-slate-200' : isAmber ? 'bg-[#101114] border border-[#2B2E38] shadow-amber-900/20' : 'bg-[#0B0D14] border border-[#1E2638] shadow-indigo-900/30'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.03)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <ShieldCheck size={24} />
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${themeStyles.textMain}`}>
              {isSignUp ? 'Secure Your Workspace' : 'Welcome Back'}
            </h2>
            <p className={`text-sm ${themeStyles.textMuted}`}>
              {isSignUp ? 'Create a secure account with enterprise-grade encryption to save your telemetry.' : 'Sign in to access your saved pipelines and history.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 rounded-lg border border-red-500/20 flex flex-col gap-2">
                <div>{error}</div>
                {error.includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className="self-start text-[11px] font-bold underline hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    → Switch to Sign In mode
                  </button>
                )}
              </div>
            )}
            
            {isSignUp && (
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>Full Name</label>
                <div className="relative">
                  <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                        : 'bg-slate-900/50 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>Email Address</label>
              <div className="relative">
                <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                      : 'bg-slate-900/50 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>Secure Password</label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                      : 'bg-slate-900/50 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`relative w-full group overflow-hidden flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  isLight 
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20' 
                    : isAmber 
                    ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50'
                }`}
              >
                <span className="relative z-10">{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                {!loading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="relative flex items-center py-1">
            <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
            <span className={`flex-shrink-0 mx-4 text-[9px] font-mono uppercase tracking-widest ${themeStyles.textMuted}`}>or login with</span>
            <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold text-sm border transition-all duration-300 ${
              isLight 
                ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm' 
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 text-white'
            }`}
          >
            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className={`text-xs font-medium hover:underline transition-all ${themeStyles.textMuted} hover:${themeStyles.textMain}`}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>

          <div className="relative flex items-center py-1">
            <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
            <span className={`flex-shrink-0 mx-4 text-[9px] font-mono uppercase tracking-widest ${themeStyles.textMuted}`}>or explore offline</span>
            <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
          </div>

          <button
            onClick={onSkip}
            className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs border transition-all duration-300 ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900' 
                : 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border-slate-600'
            }`}
          >
            Skip & Explore as Guest
          </button>
          
        </div>
      </motion.div>
    </motion.div>
  );
};
