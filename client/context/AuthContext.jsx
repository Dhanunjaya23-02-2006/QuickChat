import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            if (token) {
                config.headers = {
                    ...config.headers,
                    token,
                };
            }
            return config;
        });

        return () => axios.interceptors.request.eject(interceptor);
    }, [token]);

    const connectSocket = useCallback((userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
        });

        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUser(userIds);
        });
    }, [socket]);

    const checkAuth = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            } else {
                setAuthUser(null);
            }
        } catch (error) {
            setAuthUser(null);
            toast.error(error.response?.data?.message || error.message);
        }
    }, [connectSocket]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const timer = setTimeout(() => {
            void checkAuth();
        }, 0);

        return () => clearTimeout(timer);
    }, [token, checkAuth]);

    const login = useCallback(async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                setToken(data.token);
                localStorage.setItem("token", data.token);
                connectSocket(data.userData);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, [connectSocket]);

    const logout = useCallback(async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);

        if (socket) {
            socket.disconnect();
            setSocket(null);
        }

        toast.success("Logged out succesfully");
    }, [socket]);

    const updateProfile = useCallback(async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated succesfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, []);

    const value = useMemo(() => ({
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile,
    }), [authUser, onlineUser, socket, login, logout, updateProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};