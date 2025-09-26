import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    if (!auth) {
      // Demo mode - create a mock user
      const demoUser = {
        uid: 'demo-user',
        email: 'demo@rayyan-farm.com',
        displayName: 'مستخدم تجريبي'
      };
      setUser(demoUser as any);
      setUserProfile({
        name: 'مستخدم تجريبي',
        email: 'demo@rayyan-farm.com',
        displayName: 'مستخدم تجريبي',
        createdAt: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check if Firestore is available
      if (db) {
        // Try to get profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          return;
        }
      }
      
      // Fallback to localStorage for MVP
      const profile = localStorage.getItem(`profile_${userId}`);
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to localStorage
      const profile = localStorage.getItem(`profile_${userId}`);
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Check if Firebase Auth is available
      if (!auth) {
        // Demo mode - simulate signup
        const demoUser = {
          uid: `demo-${Date.now()}`,
          email: email,
          displayName: userData.displayName || userData.name
        };
        
        const profile = {
          uid: demoUser.uid,
          email: email,
          displayName: userData.displayName || userData.name,
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem(`profile_${demoUser.uid}`, JSON.stringify(profile));
        setUser(demoUser as any);
        setUserProfile(profile);
        
        return { user: demoUser, error: null };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name if provided
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }
      
      // Create user profile
      const profile = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || '',
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      try {
        // Try to save to Firestore if available
        if (db) {
          await setDoc(doc(db, 'users', user.uid), profile);
        } else {
          // Fallback to localStorage
          localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profile));
        }
      } catch (firestoreError) {
        console.warn('Failed to save to Firestore, using localStorage:', firestoreError);
        // Fallback to localStorage
        localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profile));
      }
      
      setUserProfile(profile);
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Firebase Auth is available
      if (!auth) {
        // Demo mode - simulate signin
        if (email === 'demo@rayyan-farm.com' && password === 'demo123') {
          const demoUser = {
            uid: 'demo-user',
            email: 'demo@rayyan-farm.com',
            displayName: 'مستخدم تجريبي'
          };
          setUser(demoUser as any);
          return { user: demoUser, error: null };
        } else {
          return { user: null, error: { message: 'بيانات دخول خاطئة. استخدم: demo@rayyan-farm.com / demo123' } };
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      } else {
        // Demo mode - just clear state
        setUser(null);
      }
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};