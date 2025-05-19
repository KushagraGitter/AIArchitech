
"use client";

import type { FirebaseError } from 'firebase/app';
import {
  type User,
  type AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase'; // Assuming your firebase init file is here

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, pass: string) => Promise<User | null>;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        // This error callback for onAuthStateChanged is usually for initial load problems
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      }
    );
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const clearError = () => {
    setError(null);
  };

  const signup = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user); // Set user immediately
      setLoading(false);
      return userCredential.user;
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error('Signup error:', firebaseError);
      setError(firebaseError.message);
      setLoading(false);
      return null;
    }
  };

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user); // Set user immediately
      setLoading(false);
      return userCredential.user;
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error('Login error:', firebaseError);
      setError(firebaseError.message);
      setLoading(false);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null); // Clear user immediately
      setLoading(false);
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error('Logout error:', firebaseError);
      setError(firebaseError.message);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
