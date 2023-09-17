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

    /*  useEffect(() => {
         const requestInterceptor = axios.interceptors.request.use(
             async (config) => {
                 if (user && user.accessToken) {
                     config.headers['Authorization'] = `Bearer ${user.accessToken}`
                 }
                 return config;
             },
             (error) => {
                 return Promise.reject(error)
             }
         )
 
         const responseInterceptor = axios.interceptors.response.use(
             async (response) => {
                 return response;
             },
             async (error) => {
 
                 if (error.response !== null) {
                     if (error.response.status === 401 && !error.config._retry) {
                         error.config._retry = true
                         try {
                             // If access token is expired then server return 401 http code
                             // If refresh token is wrong then server return 400 http code
                             const refreshResponse = await axios.get(`https://localhost:7093/api/Auth/refresh`, { withCredentials: true })
                             if (refreshResponse.data) {
                                 const newAccessToken = refreshResponse.data.token;
                                 axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
                                 setUser({ ...user, accessToken: newAccessToken });
                                 return axios(error.config);
                             }
                         } catch (refreshError) {
                             logout();
                             return Promise.reject(refreshError);
                         }
                     }
                 }
                 return Promise.reject(error);
             }
         );
 
         return () => {
             axios.interceptors.request.eject(requestInterceptor);
             axios.interceptors.response.eject(responseInterceptor);
         }
 
     }, [user]) */

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
