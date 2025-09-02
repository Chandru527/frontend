import axios from "axios";

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("cc_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err)
);

export default axiosClient;
