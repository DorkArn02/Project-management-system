import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
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
    const [user, setUser] = useState<LoginResponse | null>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null)

    const login = useCallback((userObject: LoginResponse) => {
        setUser(userObject)
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        localStorage.removeItem("user")
    }, [])

    const parseJwt = useMemo(() => {
        try {
            return JSON.parse(atob(user!.accessToken.split(".")[1]))
        } catch (e) {
            return null
        }
    }, [user])

    const isAccessTokenExpired = useCallback(() => {
        if (user) {
            const decodedJwt = parseJwt
            if (decodedJwt.exp * 1000 < Date.now()) {
                return true
            } else {
                return false
            }
        }
        return false
    }, [user, parseJwt])

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.accessToken}`
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [user])

    return (
        <AuthContext.Provider value={{ user, login, logout, isAccessTokenExpired, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}
