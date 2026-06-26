import axios from "axios";
import Cookies from "js-cookie";

const URL = `http://127.0.0.1:8000/api/`

const axiosClient = axios.create({
    baseURL: URL
})

axiosClient.interceptors.request.use(config => {
    const token = Cookies.get("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

axiosClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        const { response } = error;
        if (response && response.status === 401) {
            Cookies.remove('accessToken');
            Cookies.remove('currentUser');
        }
        return Promise.reject(error);
    }
)

export default axiosClient;