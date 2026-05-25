import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { getSession } from '../api/authApi';
import { setUserId, setUserProps, trackEvent } from '../services/analyticsService';

const UserContext = createContext();
const SESSION_KEY = 'userSession';
const SESSION_DURATION = 15 * 60 * 1000;

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);

  // Check session timeout when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (next !== 'active') return;
      try {
        const saved = await AsyncStorage.getItem(SESSION_KEY);
        if (saved) {
          const d = JSON.parse(saved);
          if (d.mantenerSesion && d.expiresAt && Date.now() > d.expiresAt) {
            setNeedsCaptcha(true);
          }
        }
      } catch (e) {
        console.error('Error en AppState session check:', e);
      }
    });
    return () => sub.remove();
  }, []);

  // Init: restore local session + validate with server
  useEffect(() => {
    let alive = true;
    const init = async () => {
      let restored = false;
      let savedExpiresAt = null;

      try {
        const saved = await AsyncStorage.getItem(SESSION_KEY);
        if (saved && alive) {
          const d = JSON.parse(saved);

          // Migrate old sessions (pre-mantenerSesion format)
          if (!d.mantenerSesion && d.user && d.perfil) {
            d.mantenerSesion = true;
            d.expiresAt = d.expiresAt || Date.now() + SESSION_DURATION;
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(d));
          }

          if (d.mantenerSesion && d.user && d.perfil) {
            setUser(d.user);
            setPerfil(d.perfil);
            savedExpiresAt = d.expiresAt || null;
            restored = true;
          }
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      }

      if (!alive) return;

      try {
        const data = await getSession();
        if (!alive) return;

        if (data.autenticado && data.user) {
          setUser(data.user);
          setPerfil(data.user);

          if (restored) {
            if (savedExpiresAt && Date.now() > savedExpiresAt) {
              setNeedsCaptcha(true);
            }
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
              user: data.user,
              perfil: data.user,
              mantenerSesion: true,
              expiresAt: savedExpiresAt,
            }));
          } else {
            setUser(null);
            setPerfil(null);
            await AsyncStorage.removeItem(SESSION_KEY);
          }
        } else {
          setUser(null);
          setPerfil(null);
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        console.error('Error verifying session:', err);
        if (alive) {
          setUser(null);
          setPerfil(null);
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    init();
    return () => { alive = false; };
  }, []);

  const login = useCallback((userData, perfilData, persist = false) => {
    setUser(userData);
    setPerfil(perfilData);
    setNeedsCaptcha(false);
    setUserId(userData.boleta);
    setUserProps({ role: 'student' });

    if (persist) {
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
        user: userData,
        perfil: perfilData,
        mantenerSesion: true,
        expiresAt: Date.now() + SESSION_DURATION,
      })).catch(e => console.error('Error saving session:', e));
    } else {
      AsyncStorage.removeItem(SESSION_KEY).catch(e => console.error('Error clearing session:', e));
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setPerfil(null);
    setNeedsCaptcha(false);
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Error removing session:', e);
    }
  }, []);

  const resolveCaptcha = useCallback(async () => {
    setNeedsCaptcha(false);
    trackEvent('captcha_completed');
    const newExpiresAt = Date.now() + SESSION_DURATION;
    try {
      const saved = await AsyncStorage.getItem(SESSION_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        d.expiresAt = newExpiresAt;
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(d));
      }
    } catch (e) {
      console.error('Error refreshing captcha timestamp:', e);
    }
  }, []);

  const isAuthenticated = useCallback(() => perfil !== null, [perfil]);

  const getUserBoleta = useCallback(() => perfil?.boleta || null, [perfil]);

  const value = {
    user,
    perfil,
    login,
    logout,
    isAuthenticated,
    getUserBoleta,
    isLoading,
    needsCaptcha,
    resolveCaptcha,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
