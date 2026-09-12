import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    if (!token) return;

    const TIMEOUT = 30 * 60 * 1000; // 30 minutes
    let timer;

    const startTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        alert('Session expired due to inactivity. Please login again.');
        window.location.href = '/login';
      }, TIMEOUT);
    };

    startTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, startTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, startTimer));
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);