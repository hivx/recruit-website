import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // config qua .env
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor request
axiosClient.interceptors.request.use((config) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhjZjkwNTE1OTJmNTZhNTNhNTBmZmUiLCJyb2xlIjoicmVjcnVpdGVyIiwiaWF0IjoxNzU1MTAyMTk2LCJleHAiOjE3NTUxODg1OTZ9.L_UYtGzxEui46OOOM9G2p-2URfSB9uukaYi445Pk92I';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor response
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    throw error.response?.data || error;
  }
);

export default axiosClient;