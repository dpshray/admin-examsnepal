import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config: any) => {
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {

        console.error("Response Error from axios:", error?.response?.data);
        return Promise.reject(error?.response);
    }
);

export default axiosInstance;


