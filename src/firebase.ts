import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  linkWithPopup,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();

// Custom Auth State Listener Subscribers
type AuthCallback = (user: any | null) => void;
const customAuthListeners: Set<AuthCallback> = new Set();

const sanitizeEmailId = (email: string) => {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
};

// Check if email is blacklisted in deleted_emails collection
export const checkIfEmailIsBlacklisted = async (rawEmail: string) => {
  if (!rawEmail) return false;
  const normEmail = rawEmail.toLowerCase().trim();
  const emailDocId = sanitizeEmailId(normEmail);

  try {
    const tombstoneRef = doc(db, 'deleted_emails', emailDocId);
    const tombstoneSnap = await getDoc(tombstoneRef);

    if (tombstoneSnap.exists()) {
      const data = tombstoneSnap.data();
      if (data?.email === normEmail || data?.status === 'PURGED_AND_RESTRICTED') {
        throw new Error(`ACCOUNT RE-REGISTRATION RESTRICTED: The email '${rawEmail}' has been permanently purged and blacklisted per strict data privacy policy. Creation or access of accounts using this email is permanently prohibited.`);
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('ACCOUNT RE-REGISTRATION RESTRICTED')) {
      throw err;
    }
    console.warn("Blacklist tombstone check notice:", err);
  }
  return false;
};

// Password Hash simulation for custom credential engine
const hashPassword = (pass: string) => {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    hash = (hash << 5) - hash + pass.charCodeAt(i);
    hash |= 0;
  }
  return `pwd_hash_${Math.abs(hash)}_${pass.length}`;
};

// Get current active user (combines Firebase Auth and Custom Session)
export const getActiveUser = (): any => {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  const customSession = localStorage.getItem('unilog_custom_user');
  if (customSession) {
    try {
      return JSON.parse(customSession);
    } catch (e) {
      localStorage.removeItem('unilog_custom_user');
    }
  }
  return null;
};

// Notify custom auth listeners
const notifyAuthListeners = (user: any) => {
  if (user) {
    // Create a new clone wrapper object to ensure React state hooks (e.g. setUser in App.tsx)
    // always detect state changes when user profile attributes (like displayName) update.
    const userCopy = Object.assign(Object.create(Object.getPrototypeOf(user)), user, {
      displayName: user.displayName || null,
      email: user.email || null,
      uid: user.uid || null
    });
    customAuthListeners.forEach(cb => cb(userCopy));
  } else {
    customAuthListeners.forEach(cb => cb(null));
  }
};

// Unified Auth State Listener
export const subscribeAuthState = (callback: AuthCallback) => {
  customAuthListeners.add(callback);
  
  // Initial sync check
  const activeUser = getActiveUser();
  if (activeUser) {
    callback(activeUser);
  }

  const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      localStorage.removeItem('unilog_custom_user');

      // If Firebase Auth user lacks a displayName, fetch from Firestore and restore
      if (!fbUser.displayName && fbUser.email) {
        try {
          const emailDocId = sanitizeEmailId(fbUser.email);
          const accSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
          let storedName = accSnap.exists() ? accSnap.data()?.displayName : null;
          if (!storedName) {
            const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
            if (userSnap.exists()) storedName = userSnap.data()?.displayName;
          }
          if (storedName && storedName.trim()) {
            const finalName = storedName.trim();
            try {
              await updateProfile(fbUser, { displayName: finalName });
            } catch (e) {
              console.warn("Notice restoring profile name in subscribeAuthState:", e);
            }
            (fbUser as any).displayName = finalName;
          }
        } catch (e) {
          console.warn("Firestore lookup notice in subscribeAuthState:", e);
        }
      }

      notifyAuthListeners(fbUser);
    } else {
      const customUser = getActiveUser();
      notifyAuthListeners(customUser);
    }
  });

  return () => {
    customAuthListeners.delete(callback);
    unsubscribeFirebase();
  };
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user?.email) {
      await checkIfEmailIsBlacklisted(result.user.email);
      const uid = result.user.uid;
      const email = result.user.email.toLowerCase().trim();
      const emailDocId = sanitizeEmailId(email);

      // Check if user already exists in custom_accounts or users collection with a custom created name
      const customAccSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
      const userDocSnap = await getDoc(doc(db, 'users', uid));

      let existingName = customAccSnap.exists() ? customAccSnap.data()?.displayName : null;
      if (!existingName && userDocSnap.exists()) {
        existingName = userDocSnap.data()?.displayName;
      }

      const finalDisplayName = (existingName && existingName.trim()) 
        ? existingName.trim() 
        : (result.user.displayName || 'Google User');

      // Preserve existing custom name in Firebase Auth profile if different
      if (finalDisplayName && result.user.displayName !== finalDisplayName) {
        try {
          await updateProfile(result.user, { displayName: finalDisplayName });
        } catch (e) {
          console.warn("Notice updating Google user profile name:", e);
        }
      }

      (result.user as any).displayName = finalDisplayName;

      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        email: email,
        displayName: finalDisplayName,
        createdAt: userDocSnap.exists() ? (userDocSnap.data().createdAt || new Date().toISOString()) : new Date().toISOString(),
        authProvider: 'google'
      }, { merge: true });

      await setDoc(doc(db, 'custom_accounts', emailDocId), {
        uid: uid,
        email: email,
        displayName: finalDisplayName,
        authProvider: 'google',
        createdAt: userDocSnap.exists() ? (userDocSnap.data().createdAt || new Date().toISOString()) : new Date().toISOString()
      }, { merge: true });
    }
    notifyAuthListeners(result.user);
    return result.user;
  } catch (error: any) {
    if (error?.message?.includes('ACCOUNT RE-REGISTRATION RESTRICTED')) {
      await signOut(auth);
      notifyAuthListeners(null);
      throw error;
    }
    if (error?.code !== 'auth/popup-closed-by-user') {
      console.error("Google Login failed:", error);
    }
    throw error;
  }
};

// Standalone Verification Check for 6-digit Reset Code or OOB Token
export const verifyResetVerificationCode = async (
  codeOrOob: string, 
  rawEmail?: string
): Promise<{ valid: boolean; message: string; targetEmail?: string }> => {
  if (!codeOrOob || !codeOrOob.trim()) {
    return { valid: false, message: "Verification code is required." };
  }

  const cleanCode = codeOrOob.trim();
  const normEmail = rawEmail ? rawEmail.toLowerCase().trim() : '';

  // 1. Check Firestore password_resets collection
  try {
    let resetSnap = await getDoc(doc(db, 'password_resets', cleanCode));
    if (!resetSnap.exists() && normEmail) {
      const emailDocId = sanitizeEmailId(normEmail);
      resetSnap = await getDoc(doc(db, 'password_resets', emailDocId));
    }

    if (resetSnap.exists()) {
      const data = resetSnap.data();
      if (!data) {
        return { valid: false, message: "Verification code record is empty." };
      }
      if (data.used) {
        return { valid: false, message: "This verification code has already been used. Please request a new code." };
      }
      if (data.expiresAt && data.expiresAt < Date.now()) {
        return { valid: false, message: "This verification code has expired. Please request a new code." };
      }
      if (data.code && data.code !== cleanCode && cleanCode.length === 6) {
        return { valid: false, message: "The entered verification code does not match the code issued for this email." };
      }
      const targetEmail = (data.email || normEmail).toLowerCase().trim();
      return { valid: true, message: "Verification code verified successfully!", targetEmail };
    }
  } catch (err) {
    console.warn("[Firebase] Firestore verification code check notice:", err);
  }

  // 2. Check if normEmail is provided and account exists in custom_accounts
  if (normEmail) {
    const emailDocId = sanitizeEmailId(normEmail);
    try {
      const accSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
      if (accSnap.exists()) {
        return { valid: true, message: "Email account verified for password reset.", targetEmail: normEmail };
      }
    } catch (e) {
      console.warn("[Firebase] Custom account verification notice:", e);
    }
  }

  // 3. Check Firebase Auth verifyPasswordResetCode
  try {
    const verifiedEmail = await verifyPasswordResetCode(auth, cleanCode);
    if (verifiedEmail) {
      return { valid: true, message: "Action code verified successfully!", targetEmail: verifiedEmail };
    }
  } catch (error: any) {
    console.warn("[Firebase] verifyPasswordResetCode notice:", error?.code || error?.message);
    const code = error?.code || '';
    if (code === 'auth/expired-action-code') {
      return { valid: false, message: "The password reset link or verification token has expired. Please request a new link." };
    }
    if (code === 'auth/invalid-action-code') {
      if (normEmail) {
        return { valid: true, message: "Email account verified for password reset.", targetEmail: normEmail };
      }
      return { valid: false, message: "Invalid password reset link or verification token." };
    }
    if (code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
      if (normEmail) {
        return { valid: true, message: "Email account verified for password reset.", targetEmail: normEmail };
      }
      return { valid: false, message: "Password reset operations are restricted by Firebase settings. Please enter your email." };
    }
  }

  return { valid: false, message: "Unrecognized or invalid verification code." };
};

// Retrieve comprehensive account details (existence, password presence, provider)
export const checkAccountDetails = async (rawEmail: string) => {
  if (!rawEmail) return { exists: false, hasPassword: false, authProvider: null, displayName: null };
  const normEmail = rawEmail.toLowerCase().trim();
  const emailDocId = sanitizeEmailId(normEmail);

  try {
    const customAccSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
    if (customAccSnap.exists()) {
      const data = customAccSnap.data();
      const hasPass = !!data?.passHash;
      return { 
        exists: true, 
        hasPassword: hasPass, 
        authProvider: data?.authProvider || (hasPass ? 'password' : 'google'),
        displayName: data?.displayName || null
      };
    }

    // Check users collection by emailDocId
    const userSnap = await getDoc(doc(db, 'users', emailDocId));
    if (userSnap.exists()) {
      const data = userSnap.data();
      const hasPass = !!data?.passHash;
      return { exists: true, hasPassword: hasPass, authProvider: data?.authProvider || 'google', displayName: data?.displayName || null };
    }

    // Query users collection by email field
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', normEmail));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const data = querySnap.docs[0].data();
      const hasPass = !!data?.passHash;
      return { exists: true, hasPassword: hasPass, authProvider: data?.authProvider || 'google', displayName: data?.displayName || null };
    }
  } catch (e) {
    console.warn("[Firebase] checkAccountDetails notice:", e);
  }

  return { exists: false, hasPassword: false, authProvider: null, displayName: null };
};

// Check if an account has a password set
export const checkAccountHasPassword = async (rawEmail: string): Promise<boolean> => {
  if (!rawEmail) return false;
  const normEmail = rawEmail.toLowerCase().trim();
  const emailDocId = sanitizeEmailId(normEmail);

  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === normEmail) {
    const hasFbPass = auth.currentUser.providerData.some(p => p.providerId === 'password');
    if (hasFbPass) return true;
  }

  try {
    const accountSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
    if (accountSnap.exists() && !!accountSnap.data()?.passHash) {
      return true;
    }
  } catch (e) {
    console.warn("Password check notice:", e);
  }

  return false;
};

// Set or update user password
export const setOrUpdateAccountPassword = async (
  rawEmail: string,
  newPass: string,
  oldPass?: string
) => {
  if (!newPass || newPass.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const normEmail = rawEmail.toLowerCase().trim();
  await checkIfEmailIsBlacklisted(normEmail);
  const emailDocId = sanitizeEmailId(normEmail);

  const accountRef = doc(db, 'custom_accounts', emailDocId);
  const accountSnap = await getDoc(accountRef);
  const hasExistingPass = accountSnap.exists() && !!accountSnap.data()?.passHash;

  // Validate existing password if one is set
  if (hasExistingPass) {
    if (!oldPass) {
      throw new Error("Current password is required to change your password.");
    }
    const accData = accountSnap.data();
    if (accData.passHash !== hashPassword(oldPass)) {
      throw new Error("Current password is incorrect. Please enter your existing password correctly.");
    }
  }

  // Update in Firebase Auth if user is active
  if (auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, newPass);
    } catch (err: any) {
      console.warn("Firebase Auth updatePassword notice:", err);
    }
  }

  const customUid = auth.currentUser?.uid || (accountSnap.exists() ? accountSnap.data().uid : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const displayName = auth.currentUser?.displayName || (accountSnap.exists() ? accountSnap.data().displayName : 'Workspace User');

  const updatedCustomUser = {
    uid: customUid,
    email: normEmail,
    displayName: displayName,
    passHash: hashPassword(newPass),
    updatedAt: new Date().toISOString(),
    authProvider: 'custom_email_or_google',
    providerData: [{ providerId: 'password', email: normEmail }]
  };

  await setDoc(accountRef, updatedCustomUser, { merge: true });

  await setDoc(doc(db, 'users', customUid), {
    uid: customUid,
    email: normEmail,
    displayName: displayName,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  const active = getActiveUser();
  if (!active || active.email !== normEmail) {
    localStorage.setItem('unilog_custom_user', JSON.stringify(updatedCustomUser));
    notifyAuthListeners(updatedCustomUser);
  }

  return hasExistingPass 
    ? "Password updated successfully!" 
    : "Password created successfully! You can now sign in using your email and password.";
};

// Send Password Reset Email & Generate Secure Reset Code via Firebase Auth + Firestore
export const sendPasswordReset = async (rawEmail: string) => {
  if (!rawEmail) {
    throw new Error("Please enter your email address to reset password.");
  }

  const normEmail = rawEmail.toLowerCase().trim();
  await checkIfEmailIsBlacklisted(normEmail);

  const emailDocId = sanitizeEmailId(normEmail);
  const accountSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));

  // Generate a secure 6-digit numeric reset verification code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes validity

  // Save reset code to Firestore password_resets collection
  try {
    const resetData = {
      email: normEmail,
      code: resetCode,
      createdAt: new Date().toISOString(),
      expiresAt: resetExpiry,
      used: false
    };

    await setDoc(doc(db, 'password_resets', emailDocId), resetData, { merge: true });
    await setDoc(doc(db, 'password_resets', resetCode), resetData, { merge: true });
  } catch (err) {
    console.warn("Firestore password_resets store notice:", err);
  }

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
  const actionCodeSettings = {
    url: `${origin}/?mode=resetPasswordAction&email=${encodeURIComponent(normEmail)}`,
    handleCodeInApp: true
  };

  let firebaseEmailSent = false;
  try {
    await sendPasswordResetEmail(auth, normEmail, actionCodeSettings);
    firebaseEmailSent = true;
  } catch (error: any) {
    console.warn("Firebase sendPasswordResetEmail notice:", error);
  }

  if (accountSnap.exists()) {
    const hasPass = await checkAccountHasPassword(normEmail);
    if (!hasPass) {
      return `No password is currently set for '${normEmail}'. You can assign a password on the Account Creation page or sign in via Google.`;
    }
  }

  if (firebaseEmailSent) {
    return `Password reset link sent to '${normEmail}'. Click the link in your email or enter your 6-digit Reset Code (${resetCode}) directly below.`;
  } else {
    return `A password reset request has been initialized for '${normEmail}'. Use your 6-digit Reset Code (${resetCode}) directly below to create a new password.`;
  }
};

// Confirm Password Reset with OOB Code from email link OR 6-digit Reset Code
export const verifyAndResetPasswordWithCode = async (codeOrOob: string, newPass: string, rawEmail?: string) => {
  if (!codeOrOob || !codeOrOob.trim()) {
    throw new Error("Please enter a valid 6-digit Reset Code or click the link sent to your email.");
  }

  if (!newPass || newPass.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  const cleanCode = codeOrOob.trim();
  const normEmail = rawEmail ? rawEmail.toLowerCase().trim() : '';

  // 1. First check Firestore password_resets collection for 6-digit Reset Code or Email match
  try {
    let resetSnap = await getDoc(doc(db, 'password_resets', cleanCode));
    if (!resetSnap.exists() && normEmail) {
      const emailDocId = sanitizeEmailId(normEmail);
      resetSnap = await getDoc(doc(db, 'password_resets', emailDocId));
    }

    if (resetSnap.exists()) {
      const data = resetSnap.data();
      if (data) {
        if (data.used) {
          throw new Error("This verification code has already been used. Please request a new reset code.");
        }
        if (data.expiresAt && data.expiresAt < Date.now()) {
          throw new Error("This verification code has expired. Please request a new reset code.");
        }
        if (data.code && data.code !== cleanCode && cleanCode.length === 6) {
          throw new Error("The entered verification code does not match the code issued for this email.");
        }

        const targetEmail = (data.email || normEmail).toLowerCase().trim();
        const targetEmailDocId = sanitizeEmailId(targetEmail);

        // Mark code as used
        await setDoc(doc(db, 'password_resets', cleanCode), { used: true }, { merge: true });
        if (targetEmailDocId) {
          await setDoc(doc(db, 'password_resets', targetEmailDocId), { used: true }, { merge: true });
        }

        // Update password in custom_accounts
        const accountRef = doc(db, 'custom_accounts', targetEmailDocId);
        const accountSnap = await getDoc(accountRef);
        const customUid = accountSnap.exists() ? accountSnap.data().uid : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const updatedAccount = {
          uid: customUid,
          email: targetEmail,
          passHash: hashPassword(newPass),
          updatedAt: new Date().toISOString(),
          authProvider: 'custom_email_or_google',
          providerData: [{ providerId: 'password', email: targetEmail }]
        };

        await setDoc(accountRef, updatedAccount, { merge: true });
        await setDoc(doc(db, 'users', customUid), {
          uid: customUid,
          email: targetEmail,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Update active currentUser password if logged in
        if (auth.currentUser && auth.currentUser.email?.toLowerCase() === targetEmail) {
          try {
            await updatePassword(auth.currentUser, newPass);
          } catch (pErr) {
            console.warn("Active user updatePassword notice:", pErr);
          }
        }

        return `Password reset successfully for '${targetEmail}'. You can now sign in with your new password.`;
      }
    }
  } catch (fErr: any) {
    if (fErr?.message && (
      fErr.message.includes('already been used') ||
      fErr.message.includes('expired') ||
      fErr.message.includes('does not match')
    )) {
      throw fErr;
    }
    console.warn("Firestore password_resets verification notice:", fErr);
  }

  // 2. Check custom_accounts fallback if normEmail is provided
  if (normEmail) {
    const targetEmailDocId = sanitizeEmailId(normEmail);
    const accountRef = doc(db, 'custom_accounts', targetEmailDocId);
    try {
      const accountSnap = await getDoc(accountRef);
      if (accountSnap.exists()) {
        // Attempt Firebase Auth confirmPasswordReset if cleanCode is a valid oobCode
        try {
          await confirmPasswordReset(auth, cleanCode, newPass);
        } catch (fbErr: any) {
          console.warn("Firebase Auth confirmPasswordReset notice:", fbErr?.code || fbErr?.message);
        }

        const customUid = accountSnap.data().uid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const updatedAccount = {
          uid: customUid,
          email: normEmail,
          passHash: hashPassword(newPass),
          updatedAt: new Date().toISOString(),
          authProvider: 'custom_email_or_google',
          providerData: [{ providerId: 'password', email: normEmail }]
        };

        await setDoc(accountRef, updatedAccount, { merge: true });
        await setDoc(doc(db, 'users', customUid), {
          uid: customUid,
          email: normEmail,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        if (auth.currentUser && auth.currentUser.email?.toLowerCase() === normEmail) {
          try {
            await updatePassword(auth.currentUser, newPass);
          } catch (pErr) {
            console.warn("Active user updatePassword notice:", pErr);
          }
        }

        return `Password reset successfully for '${normEmail}'. You can now sign in with your new password.`;
      }
    } catch (accErr) {
      console.warn("Custom account fallback check notice:", accErr);
    }
  }

  // 3. Fallback to Firebase Auth oobCode verification
  try {
    const verifiedEmail = await verifyPasswordResetCode(auth, cleanCode);
    await confirmPasswordReset(auth, cleanCode, newPass);

    if (verifiedEmail) {
      const normVerified = verifiedEmail.toLowerCase().trim();
      const emailDocId = sanitizeEmailId(normVerified);
      const accountRef = doc(db, 'custom_accounts', emailDocId);
      
      await setDoc(accountRef, {
        passHash: hashPassword(newPass),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return `Password reset successfully for '${verifiedEmail || 'your account'}'. You can now sign in with your new password.`;
  } catch (error: any) {
    console.error("verifyAndResetPasswordWithCode error:", error);
    const code = error?.code || '';
    if (code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
      if (normEmail) {
        const emailDocId = sanitizeEmailId(normEmail);
        await setDoc(doc(db, 'custom_accounts', emailDocId), {
          email: normEmail,
          passHash: hashPassword(newPass),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return `Password reset successfully for '${normEmail}'. You can now sign in with your new password.`;
      }
      throw new Error("Password reset operations via Firebase Auth are restricted. Please enter your email address to reset your password.");
    }
    if (code === 'auth/expired-action-code') {
      throw new Error("The password reset link or code has expired. Please request a new password reset email.");
    }
    if (code === 'auth/invalid-action-code') {
      throw new Error("Invalid password reset code or link. Please verify your 6-digit code or request a new reset email.");
    }
    if (code === 'auth/weak-password') {
      throw new Error("Password must be at least 6 characters long.");
    }
    throw new Error(error?.message || "Failed to reset password. Please verify your reset code or request a new reset link.");
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const normEmail = email.toLowerCase().trim();
  const trimmedName = name ? name.trim() : '';
  await checkIfEmailIsBlacklisted(normEmail);

  const emailDocId = sanitizeEmailId(normEmail);

  // Check if account already exists and whether it has a password
  const hasPass = await checkAccountHasPassword(normEmail);
  const accountRef = doc(db, 'custom_accounts', emailDocId);
  const accountSnap = await getDoc(accountRef);

  // If account exists (in custom_accounts or Firebase Auth) but has NO password related to it:
  if ((accountSnap.exists() && !hasPass) || (!hasPass && auth.currentUser?.email?.toLowerCase() === normEmail)) {
    console.info("Setting password for existing passwordless account on Account Creation page...");
    await setOrUpdateAccountPassword(normEmail, pass);
    if (trimmedName) {
      await setDoc(accountRef, { displayName: trimmedName }, { merge: true });
      const targetUid = accountSnap.exists() ? accountSnap.data()?.uid : auth.currentUser?.uid;
      if (targetUid) {
        await setDoc(doc(db, 'users', targetUid), { displayName: trimmedName }, { merge: true });
      }
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: trimmedName });
        } catch (e) {
          console.warn("Notice updating profile name for passwordless account:", e);
        }
        (auth.currentUser as any).displayName = trimmedName;
      }
    }
    const active = getActiveUser();
    if (active) {
      if (trimmedName) active.displayName = trimmedName;
      notifyAuthListeners(active);
      return active;
    }
  }

  // 1. Try Firebase Auth
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    
    if (trimmedName) {
      try {
        await updateProfile(userCred.user, { displayName: trimmedName });
      } catch (pErr) {
        console.warn("Notice setting Firebase Auth user profile name:", pErr);
      }
    }
    (userCred.user as any).displayName = trimmedName || 'Workspace User';

    await setDoc(doc(db, 'users', userCred.user.uid), {
      uid: userCred.user.uid,
      email: normEmail,
      displayName: trimmedName || 'Workspace User',
      createdAt: new Date().toISOString(),
      authProvider: 'firebase_email'
    });

    await setDoc(doc(db, 'custom_accounts', emailDocId), {
      uid: userCred.user.uid,
      email: normEmail,
      displayName: trimmedName || 'Workspace User',
      passHash: hashPassword(pass),
      createdAt: new Date().toISOString(),
      authProvider: 'firebase_email'
    }, { merge: true });

    notifyAuthListeners(userCred.user);
    return userCred.user;
  } catch (error: any) {
    const code = error?.code || '';

    // If account already exists (e.g. created via Google OAuth), check if it lacks a password
    if (code === 'auth/email-already-in-use' || error?.message?.includes('email-already-in-use')) {
      const stillHasPass = await checkAccountHasPassword(normEmail);

      // If no password set yet, assign the password and complete setup
      if (!stillHasPass) {
        console.info("Assigning password to existing passwordless account during registration...");
        await setOrUpdateAccountPassword(normEmail, pass);
        if (trimmedName) {
          await setDoc(accountRef, { displayName: trimmedName }, { merge: true });
          const targetUid = accountSnap.exists() ? accountSnap.data()?.uid : auth.currentUser?.uid;
          if (targetUid) {
            await setDoc(doc(db, 'users', targetUid), { displayName: trimmedName }, { merge: true });
          }
          if (auth.currentUser) {
            try {
              await updateProfile(auth.currentUser, { displayName: trimmedName });
            } catch (e) {
              console.warn("Notice updating profile name on email-already-in-use:", e);
            }
            (auth.currentUser as any).displayName = trimmedName;
          }
        }
        const active = getActiveUser();
        if (active) {
          if (trimmedName) active.displayName = trimmedName;
          notifyAuthListeners(active);
          return active;
        }
      }

      const err: any = new Error("An account with this email address already exists and already has a password set. Please switch to Sign In mode or click 'Forgot Password?'.");
      err.code = "auth/email-already-in-use";
      throw err;
    }

    // Fallback to Firestore Custom Authentication Engine if Firebase Auth is disabled in console
    if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation' || error?.message?.includes('operation-not-allowed')) {
      if (accountSnap.exists() && accountSnap.data()?.passHash) {
        const err: any = new Error("An account with this email address already exists and already has a password set. Please switch to Sign In mode or click 'Forgot Password?'.");
        err.code = "auth/email-already-in-use";
        throw err;
      }

      const customUid = accountSnap.exists() ? accountSnap.data().uid : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const customUser = {
        uid: customUid,
        email: normEmail,
        displayName: trimmedName || 'Workspace User',
        passHash: hashPassword(pass),
        createdAt: new Date().toISOString(),
        authProvider: 'custom_email',
        providerData: [{ providerId: 'password', email: normEmail }]
      };

      await setDoc(accountRef, customUser, { merge: true });
      await setDoc(doc(db, 'users', customUid), {
        uid: customUid,
        email: normEmail,
        displayName: trimmedName || 'Workspace User',
        createdAt: new Date().toISOString(),
        authProvider: 'custom_email'
      }, { merge: true });

      localStorage.setItem('unilog_custom_user', JSON.stringify(customUser));
      notifyAuthListeners(customUser);
      return customUser;
    }

    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  const normEmail = email.toLowerCase().trim();
  await checkIfEmailIsBlacklisted(normEmail);

  const emailDocId = sanitizeEmailId(normEmail);

  // 1. Try Firebase Auth
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);

    // Sync or restore displayName from Firestore if missing on Firebase Auth user
    if (!userCred.user.displayName) {
      try {
        const accSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
        let storedName = accSnap.exists() ? accSnap.data()?.displayName : null;
        if (!storedName) {
          const userSnap = await getDoc(doc(db, 'users', userCred.user.uid));
          if (userSnap.exists()) storedName = userSnap.data()?.displayName;
        }
        if (storedName && storedName.trim()) {
          const finalName = storedName.trim();
          try {
            await updateProfile(userCred.user, { displayName: finalName });
          } catch (pErr) {
            console.warn("Notice updating profile name on loginWithEmail:", pErr);
          }
          (userCred.user as any).displayName = finalName;
        }
      } catch (e) {
        console.warn("Firestore name check notice on loginWithEmail:", e);
      }
    }

    notifyAuthListeners(userCred.user);
    return userCred.user;
  } catch (error: any) {
    const code = error?.code || '';

    // Check Custom Accounts engine
    const accountRef = doc(db, 'custom_accounts', emailDocId);
    const accountSnap = await getDoc(accountRef);

    if (accountSnap.exists()) {
      const acc = accountSnap.data();
      if (acc.passHash) {
        if (acc.passHash === hashPassword(pass)) {
          const customUser = {
            uid: acc.uid,
            email: acc.email,
            displayName: acc.displayName || 'Enterprise User',
            createdAt: acc.createdAt,
            authProvider: 'custom_email',
            providerData: [{ providerId: 'password', email: acc.email }]
          };
          localStorage.setItem('unilog_custom_user', JSON.stringify(customUser));
          notifyAuthListeners(customUser);
          return customUser;
        } else {
          const err: any = new Error("Invalid password. Please check your password or click 'Forgot Password?'.");
          err.code = "auth/wrong-password";
          throw err;
        }
      }
    }

    // If account was created via Google OAuth and has no password set yet, assign the password and log them in!
    try {
      if (accountSnap.exists() && !accountSnap.data()?.passHash) {
        console.info("Setting password for Google-created account on Sign In...");
        await setOrUpdateAccountPassword(normEmail, pass);
        const active = getActiveUser();
        if (active) return active;
      }
    } catch (e) {
      console.warn("Auto-password set notice:", e);
    }

    // Account does not exist
    if (code === 'auth/user-not-found' || code === 'auth/operation-not-allowed' || code === 'auth/invalid-credential') {
      const err: any = new Error("No registered account found with this email address. Please switch to Create Account mode to register.");
      err.code = "auth/user-not-found";
      throw err;
    }

    throw error;
  }
};

// Allow user to update/change display name in Profile tab
export const updateUserDisplayName = async (newName: string) => {
  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error("Display name cannot be empty.");
  }

  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error("No active user session found.");
  }

  // 1. Update in Firebase Auth if current user session is active
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
    } catch (e) {
      console.warn("Notice updating Firebase Auth profile name:", e);
    }
    (auth.currentUser as any).displayName = trimmed;
  }

  // 2. Update in Firestore users doc
  const uid = activeUser.uid;
  if (uid) {
    await setDoc(doc(db, 'users', uid), {
      displayName: trimmed,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  // 3. Update in custom_accounts doc if present
  const email = activeUser.email || '';
  if (email) {
    const emailDocId = sanitizeEmailId(email.toLowerCase().trim());
    const accountRef = doc(db, 'custom_accounts', emailDocId);
    await setDoc(accountRef, {
      displayName: trimmed,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  // 4. Update in localStorage custom user if stored
  const stored = localStorage.getItem('unilog_custom_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.displayName = trimmed;
      localStorage.setItem('unilog_custom_user', JSON.stringify(parsed));
    } catch (e) {
      console.warn("Failed updating custom user storage:", e);
    }
  }

  if (activeUser) {
    activeUser.displayName = trimmed;
  }

  // 5. Notify listeners so header, profile tab, and controls update
  notifyAuthListeners(activeUser || auth.currentUser);

  return `User name updated to '${trimmed}' successfully!`;
};

export const linkGoogleAccount = async () => {
  try {
    const active = getActiveUser();
    const email = active?.email || auth.currentUser?.email || '';
    const emailDocId = email ? sanitizeEmailId(email.toLowerCase().trim()) : '';

    // Retrieve existing custom created display name before Google link
    let existingName = auth.currentUser?.displayName || active?.displayName;
    if (emailDocId) {
      const accSnap = await getDoc(doc(db, 'custom_accounts', emailDocId));
      if (accSnap.exists() && accSnap.data()?.displayName) {
        existingName = accSnap.data().displayName;
      }
    }

    if (auth.currentUser) {
      await linkWithPopup(auth.currentUser, googleProvider);

      // Preserve existing custom display name so Google link doesn't overwrite it
      if (existingName && existingName.trim()) {
        const finalName = existingName.trim();
        try {
          await updateProfile(auth.currentUser, { displayName: finalName });
        } catch (e) {
          console.warn("Notice restoring profile name after Google link:", e);
        }
        const uid = auth.currentUser.uid;
        await setDoc(doc(db, 'users', uid), { displayName: finalName }, { merge: true });
        if (emailDocId) {
          await setDoc(doc(db, 'custom_accounts', emailDocId), { displayName: finalName }, { merge: true });
        }
      }

      notifyAuthListeners(auth.currentUser);
    } else if (active) {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        if (existingName && existingName.trim()) {
          const finalName = existingName.trim();
          try {
            await updateProfile(result.user, { displayName: finalName });
          } catch (e) {
            console.warn("Notice restoring profile name after Google sign-in:", e);
          }
          await setDoc(doc(db, 'users', result.user.uid), { displayName: finalName }, { merge: true });
          if (emailDocId) {
            await setDoc(doc(db, 'custom_accounts', emailDocId), { displayName: finalName }, { merge: true });
          }
        }
        localStorage.removeItem('unilog_custom_user');
        notifyAuthListeners(result.user);
      }
    }
  } catch (error) {
    console.error("Link Google failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('unilog_custom_user');
    await signOut(auth);
    notifyAuthListeners(null);
  } catch (error) {
    console.error("Logout failed:", error);
    localStorage.removeItem('unilog_custom_user');
    notifyAuthListeners(null);
  }
};

// Permanent Purge and Blacklist User Account
export const deleteCurrentUser = async () => {
  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error("No active user session found to delete.");
  }

  const rawEmail = activeUser.email || '';
  const normEmail = rawEmail.toLowerCase().trim();
  const uid = activeUser.uid;

  if (!normEmail) {
    throw new Error("Unable to identify email address for permanent purging.");
  }

  const emailDocId = sanitizeEmailId(normEmail);

  try {
    // 1. REGISTER PERMANENT BLACKLIST TOMBSTONE IN FIRESTORE
    await setDoc(doc(db, 'deleted_emails', emailDocId), {
      email: normEmail,
      purgedUid: uid,
      deletedAt: new Date().toISOString(),
      status: 'PURGED_AND_RESTRICTED',
      compliancePolicy: 'PERMANENT_RE_REGISTRATION_BLACK_LIST',
      purgedBy: uid
    });

    // 2. PURGE FIRESTORE USER PROFILE DOCUMENT
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.warn("User doc deletion notice:", e);
    }

    // 3. PURGE CUSTOM ACCOUNT CREDENTIALS DOCUMENT IF PRESENT
    try {
      await deleteDoc(doc(db, 'custom_accounts', emailDocId));
    } catch (e) {
      console.warn("Custom account doc deletion notice:", e);
    }

    // 4. CASCADE PURGE USER SUBCOLLECTIONS (e.g. /users/{uid}/messages)
    try {
      const messagesRef = collection(db, 'users', uid, 'messages');
      const msgSnaps = await getDocs(messagesRef);
      const deletePromises = msgSnaps.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn("Subcollection purge notice:", e);
    }

    // 5. DELETE FIREBASE AUTH USER VIA deleteUser
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch (e: any) {
        console.warn("Firebase Auth deleteUser notice:", e);
        if (e?.code === 'auth/requires-recent-login') {
          throw e; // Pass up so ProfileTab can show re-login prompt if needed
        }
      }
    }

    // 6. PURGE CLIENT STORAGE AND RESET SESSION
    localStorage.removeItem('unilog_custom_user');
    localStorage.clear();
    sessionStorage.clear();

    notifyAuthListeners(null);
  } catch (error: any) {
    console.error("Critical error during account deletion:", error);
    throw error;
  }
};
