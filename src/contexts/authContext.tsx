import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

type User = {
  uid: string;
  email: string | null;
  isAdmin: boolean;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  screenLoading: boolean;
  setScreenLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, isAdmin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};


export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenLoading, setScreenLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isAdmin: userData.isAdmin || false,
            name: userData.name
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isAdmin: false
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setScreenLoading(true);
      await signInWithEmailAndPassword(auth, email, password);

    } catch (error) {
      setScreenLoading(false);
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, isAdmin = false) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      // Salvar informações adicionais do usuário no Firestore
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        isAdmin,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // O estado do usuário será atualizado para null pelo useEffect que observa o estado de autenticação
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      screenLoading, 
      setScreenLoading,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
