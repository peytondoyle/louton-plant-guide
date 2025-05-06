import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [browseOnly, setBrowseOnly] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('plantAppAuth');
    const storedBrowse = localStorage.getItem('plantAppBrowseOnly');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    } else if (storedBrowse === 'true') {
      setBrowseOnly(true);
    }
  }, []);

  const login = (password) => {
    if (password === process.env.NEXT_PUBLIC_MEGA_PASSWORD) {
      localStorage.setItem('plantAppAuth', 'true');
      localStorage.removeItem('plantAppBrowseOnly');
      setIsAuthenticated(true);
      setBrowseOnly(false);
      return true;
    } else {
      return false;
    }
  };

  const enableBrowseOnly = () => {
    localStorage.setItem('plantAppBrowseOnly', 'true');
    localStorage.removeItem('plantAppAuth');
    setBrowseOnly(true);
    setIsAuthenticated(false);
  };

  const logout = () => {
    localStorage.removeItem('plantAppAuth');
    localStorage.removeItem('plantAppBrowseOnly');
    setIsAuthenticated(false);
    setBrowseOnly(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, browseOnly, login, logout, enableBrowseOnly }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);