import axios from "axios"

export const api = axios.create({
    baseURL: import.meta.env.MODE === "development" ? 'https://localhost:7093/api' : "/api/api",
    withCredentials: true,
    headers: {
        "Content-type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        if (localStorage.getItem("user")) {
            const { accessToken } = JSON.parse(localStorage.getItem("user") || "");
            if (accessToken) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use((response) => {
    return response
}, async function (error) {
    const originalRequest = error.config;
    if (error.response)
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const access_token = await api.get(`/Auth/refresh`, { withCredentials: true });
                if (access_token.data) {
                    const user = JSON.parse(localStorage.getItem("user") || "")
                    const newUser = { ...user, accessToken: access_token.data }
                    localStorage.setItem("user", JSON.stringify(newUser))
                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token.data}`
                    return api(originalRequest);
                }
            } catch (e) {
                localStorage.removeItem("user")
                return Promise.reject(e);
            }
        }

    if (localStorage.getItem("user")) {
        const { accessToken } = JSON.parse(localStorage.getItem("user") || "");

        if (isAccessTokenExpired(accessToken)) {
            window.location.href = "/"
        }
    } else {
        window.location.href = "/"
    }

    return Promise.reject(error);
});


const parseJwt = (accessToken: string) => {
    try {
        return JSON.parse(atob(accessToken.split(".")[1]))
    } catch (e) {
        return null
    }
}

const isAccessTokenExpired = (accessToken: string) => {
    const decodedJwt = parseJwt(accessToken)
    if (decodedJwt.exp * 1000 < Date.now()) {
        return true;
    } else {
        return false;
    }
}