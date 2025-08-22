import axios from "axios";

const http = axios.create({
  baseURL: "https://hacktivfoods.dimz.biz.id/api",
});

// Attach token automatically
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic error logging (can extend for global toast)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data || {};
    const message = data.message || data.error || err.message || "Terjadi kesalahan";


    if (status === 401) {
      console.warn('Unauthorized (401) - token mungkin invalid atau expired');
    }

    return Promise.reject(err);
  }
);

export default http;
