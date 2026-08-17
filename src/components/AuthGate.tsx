import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ShieldCheck, ArrowRight, UserPlus, LogIn, KeyRound, ArrowLeft, CheckCircle2, RefreshCw, Check, AlertTriangle, UserCheck, X } from 'lucide-react';
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle, 
  sendPasswordReset, 
  verifyAndResetPasswordWithCode, 
  verifyResetVerificationCode, 
  checkAccountDetails 
} from '../firebase';

interface AuthGateProps {
  onSuccess: () => void;
  onSkip: () => void;
  onClose?: () => void;
  themeStyles: any;
  isLight: boolean;
  isAmber: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onSuccess, onSkip, onClose, themeStyles, isLight, isAmber }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSentMessage, setResetSentMessage] = useState('');
  
  // Link Action States for Password Reset
  const [isResetPasswordAction, setIsResetPasswordAction] = useState(false);
  const [resetOobCode, setResetOobCode] = useState('');
  const [newPasswordReset, setNewPasswordReset] = useState('');
  const [confirmNewPasswordReset, setConfirmNewPasswordReset] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verification Code Logic Check States
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState('');

  // Passwordless Account & Registration State Detection Prompt States
  const [passwordlessNotice, setPasswordlessNotice] = useState<string | null>(null);
  const [isExistingPasswordlessAccount, setIsExistingPasswordlessAccount] = useState(false);
  const [accountModeNotice, setAccountModeNotice] = useState<{
    type: 'exists_has_password' | 'not_exists' | 'passwordless';
    message: string;
    actionLabel: string;
    onAction: () => void;
  } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Check & Handle URL Parameters on Mount for Password Reset Links & Page Mode Identification
  useEffect(() => {
    const handleUrlModeParsing = async () => {
      if (typeof window === 'undefined') return;

      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash
      );
      
      const mode = searchParams.get('mode') || hashParams.get('mode');
      const oobCode = searchParams.get('oobCode') || searchParams.get('code') || searchParams.get('resetCode') || hashParams.get('oobCode') || hashParams.get('code');
      const emailParam = searchParams.get('email') || hashParams.get('email');

      console.info(`[AuthGate] URL params parsed. Page mode: '${mode || 'default'}', Code present: ${!!oobCode}, Email param: '${emailParam || 'none'}'`);

      if (emailParam) {
        setEmail(emailParam);
      }

      if (mode === 'resetPassword' || mode === 'resetPasswordAction' || oobCode) {
        setIsResetPasswordAction(true);
        setError('');

        if (oobCode) {
          setResetOobCode(oobCode);
          console.info(`[AuthGate] Password reset token detected: '${oobCode.substring(0, 4)}...'. Pre-verifying code validity.`);
          
          try {
            const check = await verifyResetVerificationCode(oobCode, emailParam || undefined);
            if (check.valid) {
              setCodeVerified(true);
              setVerifiedMessage(check.message || 'Valid verification code detected.');
              if (check.targetEmail) setEmail(check.targetEmail);
              console.info(`[AuthGate] Reset token pre-verification succeeded for email: '${check.targetEmail || emailParam}'`);
            } else {
              setCodeVerified(false);
              console.warn(`[AuthGate] Reset link pre-verification failed: ${check.message}`);
              setError(`The reset link or verification code clicked is invalid or expired (${check.message}). Please enter your email to request a new 6-digit code below.`);
            }
          } catch (vErr: any) {
            console.error(`[AuthGate] Exception during reset link token pre-verification:`, vErr);
            setError('Unable to verify reset link status. Please request a fresh 6-digit code below.');
          }
        } else {
          console.warn(`[AuthGate] Reset password mode specified in URL, but no oobCode or resetCode parameter was provided.`);
          setError('The password reset link clicked was missing a verification code. Please enter your email below to receive a new code.');
        }

        // Clean query parameters from URL state gracefully without forced page reloads
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleUrlModeParsing();
  }, []);

  // 2. Real-time Email Passwordless Account & Registration State Detection
  useEffect(() => {
    let isSubscribed = true;
    const checkEmailStatus = async () => {
      if (!email || !email.includes('@') || email.trim().length < 5) {
        setPasswordlessNotice(null);
        setIsExistingPasswordlessAccount(false);
        setAccountModeNotice(null);
        return;
      }

      try {
        const details = await checkAccountDetails(email);
        if (isSubscribed) {
          if (details.exists && !details.hasPassword) {
            setIsExistingPasswordlessAccount(true);
            setPasswordlessNotice(
              `An account associated with '${email}' exists (created via Google / Social Login). No password is set yet. Type your desired password below to assign password credentials and log in seamlessly!`
            );
            setAccountModeNotice({
              type: 'passwordless',
              message: `Google Account detected without a password. Enter a password below to assign password credentials.`,
              actionLabel: 'Assign Password',
              onAction: () => {}
            });
            console.info(`[AuthGate] Account associated with '${email}' lacks a password (social/Google account).`);
          } else if (details.exists && details.hasPassword) {
            setIsExistingPasswordlessAccount(false);
            setPasswordlessNotice(null);
            if (isSignUp) {
              setAccountModeNotice({
                type: 'exists_has_password',
                message: `An account with '${email}' already exists.`,
                actionLabel: 'Switch to Sign In',
                onAction: () => handleTabSwitch(false)
              });
            } else {
              setAccountModeNotice(null);
            }
          } else {
            // Account does not exist
            setIsExistingPasswordlessAccount(false);
            setPasswordlessNotice(null);
            if (!isSignUp) {
              setAccountModeNotice({
                type: 'not_exists',
                message: `No registered account found for '${email}'.`,
                actionLabel: 'Switch to Create Account',
                onAction: () => handleTabSwitch(true)
              });
            } else {
              setAccountModeNotice(null);
            }
          }
        }
      } catch (e) {
        console.warn(`[AuthGate] Email check notice for '${email}':`, e);
      }
    };

    const timer = setTimeout(checkEmailStatus, 350);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [email, isSignUp]);

  const handleTabSwitch = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setIsForgotPassword(false);
    setIsResetPasswordAction(false);
    setError('');
    setResetSentMessage('');
    setCodeVerified(false);
    setVerifiedMessage('');
    setAccountModeNotice(null);
  };

  // Logic check function to verify code entered matches the one sent to email
  const handleVerifyCode = async (codeToVerify?: string): Promise<boolean> => {
    const code = (codeToVerify || resetOobCode).trim();
    if (!code) {
      setError('Please enter the 6-digit Verification Code sent to your email.');
      setCodeVerified(false);
      return false;
    }

    setIsVerifyingCode(true);
    setError('');

    try {
      const result = await verifyResetVerificationCode(code, email);
      if (result.valid) {
        setCodeVerified(true);
        setVerifiedMessage(result.message || 'Verification code verified successfully!');
        if (result.targetEmail) setEmail(result.targetEmail);
        console.info(`[AuthGate] Logic check passed: Verification code '${code}' matches email '${result.targetEmail || email}'`);
        return true;
      } else {
        setCodeVerified(false);
        setError(result.message || 'Verification code mismatch or expired. Please check your email.');
        console.warn(`[AuthGate] Logic check failed: Verification code '${code}' is invalid or expired for email '${email}'`);
        return false;
      }
    } catch (err: any) {
      setCodeVerified(false);
      setError(err.message || 'Error executing verification code logic check.');
      console.error(`[AuthGate] Logic check exception for verification code:`, err);
      return false;
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleConfirmResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOobCode.trim()) {
      setError('Please enter your 6-digit Verification Code or Action Token.');
      return;
    }
    if (newPasswordReset !== confirmNewPasswordReset) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }
    if (newPasswordReset.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Execute logic check: verify code entered matches the one sent to email
      const isCodeValid = await handleVerifyCode(resetOobCode.trim());
      if (!isCodeValid) {
        console.warn(`[AuthGate] Halting password reset execution: Code logic check failed.`);
        setLoading(false);
        return;
      }

      const msg = await verifyAndResetPasswordWithCode(resetOobCode.trim(), newPasswordReset, email);
      setResetSuccess(true);
      setResetSentMessage(msg);
      console.info(`[AuthGate] Password reset completed successfully.`);
      
      // Clean query parameters from URL without page reload
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      console.error(`[AuthGate] Error during password reset submit:`, err);
      setError(err.message || 'Failed to reset password. The reset link or code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

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
      
      if (msg.includes('ACCOUNT RE-REGISTRATION RESTRICTED')) {
        setError(msg);
      } else if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use') || msg.includes('already exists')) {
        if (isExistingPasswordlessAccount) {
          setError(`An account associated with '${email}' exists via Google. Enter your password below to assign password login credentials.`);
        } else {
          setError('An account with this email address already exists. Please sign in instead.');
        }
      } else if (code === 'auth/user-not-found' || msg.includes('user-not-found') || msg.includes('No registered account found')) {
        setError('No registered account found with this email. Please switch to Create Account mode.');
      } else if (code === 'auth/wrong-password' || msg.includes('wrong-password') || msg.includes('Invalid password')) {
        setError('Invalid password. Please verify your credentials or click "Forgot Password?".');
      } else if (code === 'auth/invalid-credential' || msg.includes('invalid-credential')) {
        setError('Invalid email or password credentials. Please check your details or create an account.');
      } else if (code === 'auth/weak-password' || msg.includes('weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else {
        const cleanedMsg = msg.replace(/^Firebase:\s*Error\s*\(auth\/[^\)]+\)\.?\s*/i, '');
        setError(cleanedMsg || 'Authentication failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }
    setLoading(true);
    setError('');
    setResetSentMessage('');

    try {
      const msg = await sendPasswordReset(email);
      setResetSentMessage(msg);
      
      // Auto transition to Verification Code form
      setIsResetPasswordAction(true);
      const codeMatch = msg.match(/\((\d{6})\)/);
      if (codeMatch && codeMatch[1]) {
        setResetOobCode(codeMatch[1]);
        setCodeVerified(true);
        setVerifiedMessage(`Verification Code (${codeMatch[1]}) auto-detected for ${email}. Enter your new password below.`);
      }
    } catch (err: any) {
      console.error(`[AuthGate] Password reset request error:`, err);
      setError(err.message || 'Failed to send password reset email.');
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
        setError('Network request failed or popups are blocked by your browser environment. Click "Explore as Guest" below for instant workspace access.');
      } else if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed')) {
        setError('Google sign-in window was closed before completion. You can try again or click "Explore as Guest".');
      } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        setError('Google authentication is disabled in your Firebase Console. Click "Explore as Guest" to proceed.');
      } else {
        const cleanedMsg = msg.replace(/^Firebase:\s*Error\s*\(auth\/[^\)]+\)\.?\s*/i, '');
        setError(cleanedMsg || 'Google authentication failed.');
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
        
        {/* Top-Right Dismiss / Skip Button */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            else onSkip();
          }}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition-all z-20 ${
            isLight 
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600' 
              : 'bg-slate-850 hover:bg-slate-750 border-slate-700/60 text-slate-400 hover:text-white'
          }`}
          title="Close and Launch Guided Tutorial"
        >
          <X size={16} />
        </button>

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {isResetPasswordAction || isForgotPassword ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${themeStyles.textMain}`}>
              {isResetPasswordAction ? 'Set New Password' : isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Workspace Account' : 'Welcome Back'}
            </h2>
            <p className={`text-xs sm:text-sm ${themeStyles.textMuted}`}>
              {isResetPasswordAction
                ? 'Enter your 6-digit verification code and new password to complete the reset.'
                : isForgotPassword 
                ? 'Enter your account email to receive a password recovery verification code.' 
                : isSignUp 
                ? 'Register a new account or assign a password to an existing social account.' 
                : 'Sign in with your email and password to access your saved workspace.'}
            </p>
          </div>

          {!isForgotPassword && !isResetPasswordAction && (
            /* Mode Switcher Tabs */
            <div className={`p-1 rounded-xl flex items-center gap-1 border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/70 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSignUp
                    ? isLight 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'bg-indigo-600 text-white shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus size={14} />
                Create Account
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !isSignUp
                    ? isLight 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'bg-indigo-600 text-white shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn size={14} />
                Sign In
              </button>
            </div>
          )}

          {isResetPasswordAction ? (
            /* Confirm Password Reset Action Form with Verification Code Field & Logic Check */
            <form onSubmit={handleConfirmResetSubmit} className="space-y-4 pt-1">
              {error && (
                <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}
              {verifiedMessage && (
                <div className="p-3 text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                  <div>{verifiedMessage}</div>
                </div>
              )}

              {resetSuccess ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPasswordAction(false);
                      setIsForgotPassword(false);
                      setIsSignUp(false);
                      setError('');
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md`}
                  >
                    Sign In with New Password
                  </button>
                </div>
              ) : (
                <>
                  {/* Verification Code Input Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>Verification Code</label>
                      {codeVerified ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check size={12} /> Code Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerifyCode()}
                          disabled={isVerifyingCode || !resetOobCode.trim()}
                          className="text-[10px] font-bold text-indigo-400 hover:underline disabled:opacity-50"
                        >
                          {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                      <input
                        type="text"
                        required
                        value={resetOobCode}
                        onChange={(e) => {
                          setResetOobCode(e.target.value);
                          setCodeVerified(false);
                          setVerifiedMessage('');
                        }}
                        className={`w-full pl-9 pr-24 py-2.5 rounded-xl text-sm border font-mono focus:ring-2 focus:outline-none transition-all ${
                          isLight 
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                            : 'bg-slate-900/50 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                        placeholder="Enter 6-digit code or reset token"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyCode()}
                        disabled={isVerifyingCode || !resetOobCode.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-40"
                      >
                        {isVerifyingCode ? <RefreshCw size={12} className="animate-spin" /> : 'Check'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>New Password</label>
                    <div className="relative">
                      <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPasswordReset}
                        onChange={(e) => setNewPasswordReset(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                          isLight 
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                            : 'bg-slate-900/50 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>Confirm New Password</label>
                    <div className="relative">
                      <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmNewPasswordReset}
                        onChange={(e) => setConfirmNewPasswordReset(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                          isLight 
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                            : 'bg-slate-900/50 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={loading || isVerifyingCode}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      } ${
                        isLight 
                          ? 'bg-slate-900 text-white hover:bg-slate-800' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {loading ? 'Updating Password...' : 'Verify Code & Set Password'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleTabSwitch(false)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : isForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-1">
              {error && (
                <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}
              {resetSentMessage && (
                <div className="p-3 text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                    <div>{resetSentMessage}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPasswordAction(true);
                      setError('');
                    }}
                    className="self-start px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm uppercase tracking-wider flex items-center gap-1"
                  >
                    → Enter Verification Code & Set Password
                  </button>
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

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  } ${
                    isLight 
                      ? 'bg-slate-900 text-white hover:bg-slate-800' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(''); }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Standard Auth Form with Passwordless Account Prompt */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {error && (
                <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 rounded-lg border border-red-500/20 flex flex-col gap-2">
                  <div>{error}</div>
                  {error.includes('already exists') && (
                    <button
                      type="button"
                      onClick={() => handleTabSwitch(false)}
                      className="self-start text-[11px] font-bold underline hover:text-red-400 transition-colors uppercase tracking-wider"
                    >
                      → Switch to Sign In mode
                    </button>
                  )}
                  {(error.includes('No registered account') || error.includes('create an account') || error.includes('Create Account')) && (
                    <button
                      type="button"
                      onClick={() => handleTabSwitch(true)}
                      className="self-start text-[11px] font-bold underline hover:text-red-400 transition-colors uppercase tracking-wider"
                    >
                      → Switch to Create Account mode
                    </button>
                  )}
                  {error.includes('Forgot Password') && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(''); }}
                      className="self-start text-[11px] font-bold underline hover:text-red-400 transition-colors uppercase tracking-wider"
                    >
                      → Reset Password Now
                    </button>
                  )}
                  {(error.includes('disabled') || error.includes('closed') || error.includes('operation-not-allowed') || error.includes('Guest')) && (
                    <button
                      type="button"
                      onClick={onSkip}
                      className="self-start px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors uppercase tracking-wider shadow-sm mt-1 flex items-center gap-1"
                    >
                      → Explore Workspace as Guest
                    </button>
                  )}
                </div>
              )}

              {/* Account Registration State Switch Prompt Banner */}
              {accountModeNotice && !passwordlessNotice && (
                <div className={`p-3 text-xs font-semibold rounded-xl border flex items-center justify-between gap-2 shadow-sm transition-all ${
                  accountModeNotice.type === 'exists_has_password'
                    ? isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="shrink-0 text-indigo-400" />
                    <span>{accountModeNotice.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={accountModeNotice.onAction}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all uppercase tracking-wider flex items-center gap-1"
                  >
                    {accountModeNotice.actionLabel} →
                  </button>
                </div>
              )}

              {/* Passwordless Account Explicit UI Prompt */}
              {passwordlessNotice && (
                <div className="p-3.5 text-xs font-semibold text-amber-300 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-amber-400">Passwordless Account Prompt</div>
                    <p className="text-amber-200/90 font-medium leading-relaxed">{passwordlessNotice}</p>
                  </div>
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
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                    {isExistingPasswordlessAccount ? 'Assign New Password' : 'Secure Password'}
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(''); }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                  <span className="relative z-10">
                    {loading ? 'Processing...' : isExistingPasswordlessAccount ? 'Set Password & Sign In' : isSignUp ? 'Create Account' : 'Sign In'}
                  </span>
                  {!loading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          )}

          {!isForgotPassword && !isResetPasswordAction && (
            <>
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
            </>
          )}
          
        </div>
      </motion.div>
    </motion.div>
  );
};
