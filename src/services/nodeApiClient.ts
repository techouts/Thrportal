import axios, { AxiosInstance } from "axios";

const NODE_API_BASE_URL = import.meta.env.VITE_API_BASE_NODE_URL;

const NodeApiClient: AxiosInstance = axios.create({
  baseURL: NODE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - adds auth token
NodeApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && !config.url?.includes("/auth/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles 401 errors
NodeApiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginCall) {
      console.warn("[AUTH] Token expired or invalid");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user_id");
      window.location.href = "/Auth/SignIn";
    }
    return Promise.reject(error);
  }
);

export default NodeApiClient;
