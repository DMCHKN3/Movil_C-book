import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Verificar sesión guardada al iniciar
  useEffect(() => {
    const loadSavedSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('userSession');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          // Sesión permanente hasta que el usuario decida cerrarla
          setUser(sessionData.user);
          setPerfil(sessionData.perfil);
        }
      } catch (error) {
        console.error('Error cargando sesión guardada:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSession();
  }, []);

  const login = (userData, perfilData) => {
    setUser(userData);
    setPerfil(perfilData);
  };

  const logout = async () => {
    setUser(null);
    setPerfil(null);
    try {
      await AsyncStorage.removeItem('userSession');
    } catch (error) {
      console.error('Error eliminando sesión guardada:', error);
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
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};