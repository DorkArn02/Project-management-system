import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { LoginResponse } from '../interfaces/interfaces';

interface IAuthContext {
    login(userObject: LoginResponse): void,
    logout(): void,
    isAccessTokenExpired(): boolean,
    user: LoginResponse | null,
    setUser: React.Dispatch<React.SetStateAction<any>>
}

interface IAuthContextProps {
    children: React.ReactNode
}

const AuthContext = createContext<Partial<IAuthContext>>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }: IAuthContextProps) => {
    const [user, setUser]
        = useState<LoginResponse | null>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null)

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
    }, [user])

    const login = (userObject: LoginResponse) => {
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
            return JSON.parse(atob(user!.accessToken.split(".")[1]))
        } catch (e) {
            return null
        }
    }

    const isAccessTokenExpired = () => {
        if (user) {
            const decodedJwt = parseJwt()
            if (decodedJwt.exp * 1000 < Date.now()) {
                return true
            } else {
                return false
            }
        }
        return false
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAccessTokenExpired, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}
