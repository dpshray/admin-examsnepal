import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL?.endsWith("/") 
        ? process.env.NEXT_PUBLIC_BASE_API_URL.slice(0, -1) 
        : process.env.NEXT_PUBLIC_BASE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});


axiosInstance.interceptors.request.use(
    (config: any) => {
        const params = new URLSearchParams(config.params).toString();
        const queryString = params ? `?${params}` : "";
        console.log("➡️ FULL REQUEST URL:", `${config.baseURL}${config.url?.startsWith("/") ? "" : "/"}${config.url}${queryString}`);
        return config;
    },

    (error: AxiosError) => {
        console.error("Request Error from axios:", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log("⬅️ FULL RESPONSE DATA:", response.data);
        return response.data;
    },
    (error: AxiosError) => {
        const token = localStorage.getItem("_at");

        console.error("Response Error from axios:", error);
        if (error.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("_at");
            localStorage.removeItem("_role");
            window.location.href = "/";

        }

        return Promise.reject(error?.response?.data);
    }
);

export default axiosInstance;


