import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saveUser = sessionStorage.getItem('user');
        return saveUser ? JSON.parse(saveUser) : null;
    });
    
    console.log('Usuario:', user);

    const login = (userData, token) => {
        console.log('Login - userData:', userData);
        console.log('Login - token:', token);
        
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
