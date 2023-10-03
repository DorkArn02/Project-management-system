import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")))

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user))
    }, [user])

    const login = (userObject) => {
        setUser(userObject)
        axios.defaults.headers.common['Authorization'] = `Bearer ${userObject.accessToken}`
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
        delete axios.defaults.headers.common['Authorization'];
    }

    const parseJwt = () => {
        try {
            return JSON.parse(atob(user.accessToken.split(".")[1]))
        } catch (e) {
            return null
        }
    }

    const isAccessTokenExpired = () => {
        if (user) {
            const decodedJwt = parseJwt()
            if (decodedJwt.exp * 1000 < Date.now()) {
                return true;
            } else {
                return false;
            }
        }
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAccessTokenExpired, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}
