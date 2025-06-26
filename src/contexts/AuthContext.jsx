import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
   getAuth,
   onAuthStateChanged,
   GoogleAuthProvider,
   signInWithPopup,
   signOut,
   setPersistence,
   browserLocalPersistence
 } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase';

const app            = initializeApp(firebaseConfig);
const auth           = getAuth(app);
const db             = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe immediately—this will fire when the redirect completes
    const unsubscribe = onAuthStateChanged(auth, async u => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Persist basic profile info
        const userRef = doc(db, 'users', u.uid);
        await setDoc(userRef, {
          email: u.email,
          name:  u.displayName
        }, { merge: true });
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    // Ensure auth state is saved to localStorage so it persists after redirect
    setPersistence(auth, browserLocalPersistence)
      .then(() => signInWithPopup(auth, googleProvider))
      .catch(err => console.error('Persistence error', err));
  };

  const logout = () =>
    signOut(auth).catch(err => console.error('Sign-out error', err));

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
