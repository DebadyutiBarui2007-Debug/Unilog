import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, LogOut, CheckCircle, Database, Trash2, AlertTriangle, X, KeyRound, Lock, CheckCircle2, RefreshCw, Edit2, Check } from 'lucide-react';
import { auth, linkGoogleAccount, logout, deleteCurrentUser, checkAccountHasPassword, setOrUpdateAccountPassword, sendPasswordReset, verifyAndResetPasswordWithCode, updateUserDisplayName } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileTabProps {
  user: FirebaseUser;
  themeStyles: any;
  isLight: boolean;
  isAmber: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, themeStyles, isLight, isAmber }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Password State
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [showPassForm, setShowPassForm] = useState(false);
  const [isResetCodeMode, setIsResetCodeMode] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState('');
  const [passError, setPassError] = useState('');

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(user?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [nameError, setNameError] = useState('');

  const isGoogleLinked = user.providerData?.some(provider => provider.providerId === 'google.com');

  useEffect(() => {
    setEditNameValue(user?.displayName || '');
  }, [user?.displayName]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameValue.trim()) {
      setNameError('Display name cannot be empty.');
      return;
    }
    setNameLoading(true);
    setNameError('');
    setNameMessage('');
    try {
      const msg = await updateUserDisplayName(editNameValue.trim());
      setNameMessage(msg);
      setIsEditingName(false);
    } catch (err: any) {
      setNameError(err.message || 'Failed to update user name.');
    } finally {
      setNameLoading(false);
    }
  };

  useEffect(() => {
    const checkPass = async () => {
      if (user?.email) {
        const exists = await checkAccountHasPassword(user.email);
        setHasPassword(exists);
      }
    };
    checkPass();
  }, [user]);

  const handleLinkGoogle = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await linkGoogleAccount();
      setMessage('Google account linked successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to link Google account.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match. Please verify.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    setPassError('');
    setPassMessage('');

    try {
      if (isResetCodeMode) {
        if (!resetCodeInput.trim()) {
          setPassError('Please enter the 6-digit Reset Code.');
          setPassLoading(false);
          return;
        }
        const msg = await verifyAndResetPasswordWithCode(
          resetCodeInput.trim(),
          newPassword,
          user.email || undefined
        );
        setPassMessage(msg);
        setHasPassword(true);
        setIsResetCodeMode(false);
        setShowPassForm(false);
        setResetCodeInput('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const msg = await setOrUpdateAccountPassword(
          user.email || '',
          newPassword,
          hasPassword ? oldPassword : undefined
        );
        setPassMessage(msg);
        setHasPassword(true);
        setShowPassForm(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user.email) return;
    setPassLoading(true);
    setPassError('');
    setPassMessage('');

    try {
      const msg = await sendPasswordReset(user.email);
      setPassMessage(msg);
      setIsResetCodeMode(true);
      setShowPassForm(true);
      const codeMatch = msg.match(/\((\d{6})\)/);
      if (codeMatch && codeMatch[1]) {
        setResetCodeInput(codeMatch[1]);
      }
    } catch (err: any) {
      setPassError(err.message || 'Failed to send password reset email.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteCurrentUser();
      setShowDeleteModal(false);
      // User deletion triggers auth state change globally, resetting the app session
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      if (err.code === 'auth/requires-recent-login' || err.message?.includes('recent-login')) {
        setDeleteError('Security Notice: Account deletion requires recent authentication. Please sign out and sign back in before purging your profile.');
      } else {
        setDeleteError(err.message || 'Failed to delete account and purge data.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className={`p-6 sm:p-8 rounded-3xl border ${themeStyles.cardBg} w-full max-w-2xl mx-auto space-y-8 mt-6 shadow-xl`}>
        {/* User Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/30 pb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md shrink-0 ${
              isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={32} />}
            </div>
            <div>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <input
                    type="text"
                    required
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    placeholder="Enter your name"
                    className={`px-3 py-1.5 rounded-xl text-base font-bold border focus:ring-2 focus:outline-none ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20' 
                        : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={nameLoading}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Check size={14} /> {nameLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditNameValue(user.displayName || '');
                        setNameError('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isLight ? 'text-slate-600 hover:text-slate-900 bg-slate-200' : 'text-slate-300 hover:text-white bg-slate-800'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className={`text-2xl font-black tracking-tight ${themeStyles.textMain}`}>
                    {user.displayName || 'Unilog Workspace User'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setEditNameValue(user.displayName || '');
                      setNameMessage('');
                      setNameError('');
                    }}
                    title="Change Name"
                    className={`p-1.5 rounded-lg transition-all ${
                      isLight ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
                    }`}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <Mail size={14} className={themeStyles.textMuted} />
                <span className={`text-sm font-medium ${themeStyles.textMuted}`}>{user.email}</span>
              </div>
            </div>
          </div>

          {!isEditingName && (
            <button
              onClick={() => {
                setIsEditingName(true);
                setEditNameValue(user.displayName || '');
                setNameMessage('');
                setNameError('');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 self-start sm:self-center ${
                isLight
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit2 size={14} /> Change Name
            </button>
          )}
        </div>

        {nameMessage && (
          <div className="p-3 text-sm font-medium text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle size={16} /> {nameMessage}
          </div>
        )}
        {nameError && (
          <div className="p-3 text-sm font-medium text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            {nameError}
          </div>
        )}

        {/* Account Security & Integrations */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121622] border-slate-800'} space-y-5`}>
          <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
            <ShieldCheck size={18} className="text-teal-400" />
            <h3 className={`font-bold text-base ${themeStyles.textMain}`}>Account Security & Integrations</h3>
          </div>

          <div className="space-y-4">
            {message && (
              <div className="p-3 text-sm font-medium text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle size={16} /> {message}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm font-medium text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            {/* Google Integration Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/10 border border-slate-700/30">
              <div>
                <p className={`font-semibold text-sm ${themeStyles.textMain}`}>Google Workspace Identity</p>
                <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                  {isGoogleLinked 
                    ? 'Your account is securely connected with Google SSO.' 
                    : 'Link your Google account for single sign-on and seamless access.'}
                </p>
              </div>
              
              {isGoogleLinked ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 bg-teal-500/10 px-3.5 py-2 rounded-xl border border-teal-500/20 shrink-0">
                  <CheckCircle size={14} /> Connected
                </div>
              ) : (
                <button
                  onClick={handleLinkGoogle}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' 
                      : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'
                  }`}
                >
                  {loading ? 'Linking...' : 'Link Google Account'}
                </button>
              )}
            </div>

            {/* Password Credentials Section */}
            <div className="p-4 rounded-xl bg-slate-800/10 border border-slate-700/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-indigo-400" />
                    <p className={`font-semibold text-sm ${themeStyles.textMain}`}>Password Credentials</p>
                  </div>
                  <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                    {hasPassword 
                      ? 'A password is set for email authentication.' 
                      : 'No password is set yet for email sign-in (Google / Passwordless account).'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasPassword ? (
                    <button
                      onClick={() => {
                        setShowPassForm(!showPassForm);
                        setPassError('');
                        setPassMessage('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
                    >
                      {showPassForm ? 'Cancel' : 'Change Password'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowPassForm(!showPassForm);
                        setPassError('');
                        setPassMessage('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                    >
                      {showPassForm ? 'Cancel' : 'Create Password'}
                    </button>
                  )}
                </div>
              </div>

              {passMessage && (
                <div className="p-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 size={16} /> {passMessage}
                </div>
              )}
              {passError && (
                <div className="p-3 text-xs font-medium text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                  {passError}
                </div>
              )}

              {/* Password Form Drawer */}
              {showPassForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePasswordSubmit} 
                  className="pt-3 border-t border-slate-700/30 space-y-3"
                >
                  {hasPassword && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                      <span className="text-xs font-bold text-indigo-400">
                        {isResetCodeMode ? 'Reset Password with 6-Digit Code' : 'Change Password with Current Password'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetCodeMode(!isResetCodeMode);
                          setPassError('');
                          setPassMessage('');
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-indigo-300 underline"
                      >
                        {isResetCodeMode ? 'Use Current Password' : 'Enter Reset Code'}
                      </button>
                    </div>
                  )}

                  {isResetCodeMode ? (
                    <div className="space-y-1">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                        6-Digit Reset Code
                      </label>
                      <div className="relative">
                        <KeyRound size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                        <input
                          type="text"
                          required
                          value={resetCodeInput}
                          onChange={(e) => setResetCodeInput(e.target.value)}
                          placeholder="Enter 6-digit code (e.g. 722159)"
                          className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-mono border focus:outline-none transition-all ${
                            isLight 
                              ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500' 
                              : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    hasPassword && (
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                          <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter current password"
                            className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                              isLight 
                                ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500' 
                                : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  )}

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                      {hasPassword && !isResetCodeMode ? 'New Password' : 'New Password'}
                    </label>
                    <div className="relative">
                      <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                          isLight 
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500' 
                            : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                          isLight 
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500' 
                            : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                    {isResetCodeMode ? (
                      <button
                        type="button"
                        onClick={handleSendResetEmail}
                        disabled={passLoading}
                        className="text-[11px] font-semibold text-indigo-400 hover:underline"
                      >
                        Resend Reset Code & Link
                      </button>
                    ) : (
                      hasPassword && (
                        <button
                          type="button"
                          onClick={handleSendResetEmail}
                          disabled={passLoading}
                          className="text-[11px] font-semibold text-indigo-400 hover:underline"
                        >
                          Forgot current password? Send reset code & link
                        </button>
                      )
                    )}

                    <button
                      type="submit"
                      disabled={passLoading}
                      className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 ${
                        passLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {passLoading ? 'Saving...' : isResetCodeMode ? 'Reset & Save Password' : hasPassword ? 'Save New Password' : 'Create Password'}
                    </button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Data Persistence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/10 border border-slate-700/30">
              <div>
                <p className={`font-semibold text-sm ${themeStyles.textMain}`}>Data Persistence Engine</p>
                <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                  Your workspace state, pipeline overrides, and ML model logs are securely persisted in Cloud Firestore.
                </p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border shrink-0 ${
                isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                <Database size={14} /> Active Sync
              </div>
            </div>
          </div>
        </div>

        {/* Account Session Management */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121622] border-slate-800'} space-y-4`}>
          <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
            <LogOut size={18} className="text-indigo-400" />
            <h3 className={`font-bold text-base ${themeStyles.textMain}`}>Account Session</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/10 border border-slate-700/30">
            <div>
              <p className={`font-semibold text-sm ${themeStyles.textMain}`}>Sign Out of Workspace</p>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                Safely end your active session for <strong className="text-indigo-400 font-mono">{user.email}</strong>.
              </p>
            </div>
            <button
              id="btn-sign-out-profile"
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 transition-all shadow-md shadow-indigo-600/20 shrink-0"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Danger Zone: Permanent Account Deletion */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-red-50/50 border-red-200' : 'bg-red-950/10 border-red-900/30'} space-y-4`}>
          <div className="flex items-center gap-2 border-b border-red-900/20 pb-3">
            <Trash2 size={18} className="text-red-500" />
            <h3 className="font-bold text-base text-red-500">Account Deletion & Data Purge</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
            <div>
              <p className="font-semibold text-sm text-red-500">Permanently Delete Account & Purge Data</p>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                Purges Firebase Auth user via <code className="text-red-400 font-mono">deleteUser</code> and cascade-deletes user Firestore documents, custom credentials, and telemetry subcollections.
              </p>
            </div>
            <button
              id="btn-delete-account-profile"
              onClick={() => {
                setDeleteConfirmationText('');
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-600/20 shrink-0"
            >
              <Trash2 size={15} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Overlay Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl z-10 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0E1220] border-red-900/40'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5 text-red-500">
                  <AlertTriangle size={24} />
                  <h3 className="text-lg font-bold">Purge User Profile & Data?</h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`p-1 rounded-lg hover:bg-slate-800/10 transition-all ${
                    isLight ? 'text-slate-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                  This action executes <strong className="text-red-500 uppercase">deleteUser</strong> in Firebase Auth and permanently purges all Firestore documents under <code className="font-mono text-indigo-400">/users/{user.uid}</code> and <code className="font-mono text-indigo-400">/custom_accounts</code>. Per strict privacy compliance, your email address (<span className="font-mono text-amber-400 font-bold">{user.email}</span>) will be blacklisted and <strong className="text-red-400">restricted from future account registration</strong>.
                </p>

                <div className={`p-3 rounded-xl text-xs font-mono ${
                  isLight ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-950/20 text-amber-300 border border-amber-500/15'
                }`}>
                  To confirm permanent purge, type <strong className="underline decoration-wavy">DELETE</strong> below:
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="DELETE"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold tracking-wider font-mono uppercase text-center transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-red-500 text-slate-900' 
                        : 'bg-slate-900/80 border-slate-800 focus:bg-slate-900 focus:border-red-500 text-white'
                    }`}
                  />
                  {deleteError && (
                    <p className="text-xs text-red-500 font-semibold text-center">{deleteError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-slate-900 border-slate-800 text-gray-300 hover:bg-slate-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || deleteConfirmationText !== 'DELETE'}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 ${
                      (deleteLoading || deleteConfirmationText !== 'DELETE') ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    {deleteLoading ? 'Purging Profile...' : 'Confirm Purge'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
