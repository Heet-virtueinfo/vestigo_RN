import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  username: string;
  name?: string;
  email?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, refreshToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setUser({
          username: 'User',
          name: 'Admin',
          email: 'admin@vestigo.com',
          token,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string, refreshToken?: string) => {
    await AsyncStorage.setItem('access_token', token);
    if (refreshToken) {
      await AsyncStorage.setItem('refresh_token', refreshToken);
    }
    setUser({
      username: 'User',
      name: 'Admin',
      email: 'admin@vestigo.com',
      token,
    });
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
