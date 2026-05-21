import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession } from '../api/authApi';

const UserContext = createContext();

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

  const checkSession = useCallback(async () => {
    try {
      const data = await getSession();
      if (data.autenticado && data.user) {
        setUser(data.user);
        setPerfil(data.user);
        await AsyncStorage.setItem('userSession', JSON.stringify({
          user: data.user,
          perfil: data.user,
        }));
      } else {
        setUser(null);
        setPerfil(null);
        await AsyncStorage.removeItem('userSession');
      }
    } catch (err) {
      console.error('Error verificando sesion:', err);
      setUser(null);
      setPerfil(null);
      await AsyncStorage.removeItem('userSession');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadSavedSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('userSession');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          setUser(sessionData.user);
          setPerfil(sessionData.perfil);
        }
      } catch (error) {
        console.error('Error cargando sesion guardada:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSession();
  }, []);

  const login = (userData, perfilData) => {
    setUser(userData);
    setPerfil(perfilData);
    AsyncStorage.setItem('userSession', JSON.stringify({
      user: userData,
      perfil: perfilData,
    })).catch(e => console.error('Error guardando sesion:', e));
  };

  const logout = async () => {
    setUser(null);
    setPerfil(null);
    try {
      await AsyncStorage.removeItem('userSession');
    } catch (error) {
      console.error('Error eliminando sesion guardada:', error);
    }
  };

  const isAuthenticated = () => {
    return perfil !== null;
  };

  const getUserBoleta = () => {
    return perfil?.boleta || null;
  };

  const value = {
    user,
    perfil,
    login,
    logout,
    isAuthenticated,
    getUserBoleta,
    isLoading,
    checkSession,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
