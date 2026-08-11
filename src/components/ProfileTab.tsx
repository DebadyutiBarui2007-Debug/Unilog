import React, { useState } from 'react';
import { User, ShieldCheck, Mail, LogOut, CheckCircle, Database, Trash2, AlertTriangle, X } from 'lucide-react';
import { auth, linkGoogleAccount, logout, deleteCurrentUser } from '../firebase';
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
  
  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isGoogleLinked = user.providerData.some(provider => provider.providerId === 'google.com');

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
      // User deletion triggers an auth state change globally, so the app will auto-gate
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Sensitive operations require recent sign-in. Please sign out and sign back in before trying again.');
      } else {
        setDeleteError(err.message || 'Failed to delete account. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className={`p-6 rounded-2xl border ${themeStyles.cardBg} w-full max-w-2xl mx-auto space-y-8 mt-10`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
            isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={32} />}
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${themeStyles.textMain}`}>
              {user.displayName || 'Unilog User'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={14} className={themeStyles.textMuted} />
              <span className={`text-sm ${themeStyles.textMuted}`}>{user.email}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121622] border-slate-800'} space-y-4`}>
          <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
            <ShieldCheck size={18} className="text-teal-500" />
            <h3 className={`font-semibold ${themeStyles.textMain}`}>Account Security & Integrations</h3>
          </div>

          <div className="space-y-4 pt-2">
            {message && (
              <div className="p-3 text-sm font-medium text-green-600 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle size={16} /> {message}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/10 border border-slate-700/30">
              <div>
                <p className={`font-medium ${themeStyles.textMain}`}>Google Workspace Integration</p>
                <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                  {isGoogleLinked 
                    ? 'Your account is securely linked to Google.' 
                    : 'Link your Google account for faster sign-in and Workspace access.'}
                </p>
              </div>
              
              {isGoogleLinked ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-teal-500 bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/20">
                  <CheckCircle size={16} /> Linked
                </div>
              ) : (
                <button
                  onClick={handleLinkGoogle}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' 
                      : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'
                  }`}
                >
                  {loading ? 'Linking...' : 'Link Google Account'}
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/10 border border-slate-700/30">
              <div>
                <p className={`font-medium ${themeStyles.textMain}`}>Data Persistence</p>
                <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                  Your telemetry and pipeline overrides are safely stored in Firebase.
                </p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border ${
                isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                <Database size={16} /> Active
              </div>
            </div>
          </div>
        </div>

        {/* Account Session Management */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121622] border-slate-800'} space-y-4`}>
          <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
            <LogOut size={18} className="text-indigo-400" />
            <h3 className={`font-semibold ${themeStyles.textMain}`}>Account Session</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/10 border border-slate-700/30">
            <div>
              <p className={`font-medium ${themeStyles.textMain}`}>Sign Out of Workspace</p>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                Safely end your current session for <strong className="text-indigo-400 font-mono">{user.email}</strong>.
              </p>
            </div>
            <button
              id="btn-sign-out-profile"
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 transition-all shadow-md shadow-indigo-600/20 shrink-0"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className={`p-4 rounded-xl border ${isLight ? 'bg-red-50/50 border-red-200' : 'bg-red-950/10 border-red-900/30'} space-y-4`}>
          <div className="flex items-center gap-2 border-b border-red-900/20 pb-3">
            <Trash2 size={18} className="text-red-500" />
            <h3 className="font-semibold text-red-500">Account Deletion & Data Purge</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
            <div>
              <p className="font-medium text-red-500">Permanently Delete Account</p>
              <p className={`text-xs mt-1 ${themeStyles.textMuted}`}>
                Purge your user credentials, saved catalog overrides, telemetry logs, and custom models permanently.
              </p>
            </div>
            <button
              id="btn-delete-account-profile"
              onClick={() => {
                setDeleteConfirmationText('');
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-600/20 shrink-0"
            >
              <Trash2 size={16} /> Delete Account
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
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl z-10 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0E1220] border-red-900/30'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5 text-red-500">
                  <AlertTriangle size={24} />
                  <h3 className="text-lg font-bold">Purge User Profile?</h3>
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
                  This action is <strong className="text-red-500 uppercase">irreversible</strong>. You will permanently lose your saved Unilog product enrichments, active ML dataset overrides, and all associated catalog pipeline histories.
                </p>

                <div className={`p-3 rounded-lg text-xs font-mono ${
                  isLight ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-950/20 text-amber-300 border border-amber-500/15'
                }`}>
                  To prevent accidental deletion, type <strong className="underline decoration-wavy">DELETE</strong> in the input field below:
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="DELETE"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold tracking-wider font-mono uppercase text-center transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-red-500' 
                        : 'bg-slate-900/80 border-slate-800 focus:bg-slate-900 focus:border-red-500 text-white'
                    }`}
                  />
                  {deleteError && (
                    <p className="text-xs text-red-500 font-medium text-center">{deleteError}</p>
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
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/10 ${
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
