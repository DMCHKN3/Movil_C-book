import React, { createContext, useContext, useState } from 'react';

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

  const login = (userData, perfilData) => {
    setUser(userData);
    setPerfil(perfilData);
  };

  const logout = () => {
    setUser(null);
    setPerfil(null);
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
    getUserBoleta
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};