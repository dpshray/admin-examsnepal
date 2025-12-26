import axiosInstance from "@/config/axiosConfig";
import {AxiosRequestConfig} from 'axios';

;

interface RequestProps<T = any> {
    url: string;
    data?: T;
    config?: HeaderConfigProps;
}

interface HeaderConfigProps {
    auth?: boolean;
    file?: boolean;
    params?: Record<string, any>;
    customHeaders?: Record<string, string>;
}


class HttpServices {
    private headers: Record<string, string> = {};


    private setHeaders(config?: HeaderConfigProps) {
        this.headers = {};
        if (config?.auth) {
            const token = localStorage.getItem("_at");
            if (!token) {
                window.location.href = "/login";
                throw new Error("Authentication required. Please login first.");

            }
            this.headers["Authorization"] = `Bearer ${token}`;
        }
        if (config?.file) {
            this.headers["Content-Type"] = "multipart/form-data";
        }
        if (config?.customHeaders) {
            this.headers = {...this.headers, ...config.customHeaders};
        }
    }

    private getAuthToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("_at");
        }
        return null;
    }

    private buildAxiosConfig(config?: HeaderConfigProps): AxiosRequestConfig {
        const axiosConfig: AxiosRequestConfig = {
            headers: this.headers,
        };
        if (config?.params) {
            axiosConfig.params = config.params;
        }
        return axiosConfig;
    }

    async postRequest<TResponse = any, TBody = any>({
                                                        url,
                                                        data,
                                                        config,
                                                    }: RequestProps<TBody>): Promise<TResponse> {
        try {
            this.setHeaders(config);
            const axiosConfig = this.buildAxiosConfig(config);
            return await axiosInstance.post(url, data, axiosConfig);
        } catch (error) {
            console.error(`POST request failed for ${url}:`, error);
            throw error;
        }
    }

    async getRequest<TResponse = any>({
                                          url,
                                          config,
                                      }: Omit<RequestProps, 'data'>): Promise<TResponse> {
        try {
            this.setHeaders(config);
            const axiosConfig = this.buildAxiosConfig(config);
            return await axiosInstance.get(url, axiosConfig);
        } catch (error) {
            console.error(`GET request failed for ${url}:`, error);
            throw error;
        }
    }

    async putRequest<TResponse = any, TBody = any>({
                                                       url,
                                                       data,
                                                       config,
                                                   }: RequestProps<TBody>): Promise<TResponse> {
        try {
            this.setHeaders(config);
            const axiosConfig = this.buildAxiosConfig(config);
            return await axiosInstance.put(url, data, axiosConfig);
        } catch (error) {
            console.error(`PUT request failed for ${url}:`, error);
            throw error;
        }
    }

    async patchRequest<TResponse = any, TBody = any>({
                                                         url,
                                                         data,
                                                         config,
                                                     }: RequestProps<TBody>): Promise<TResponse> {
        try {
            this.setHeaders(config);
            const axiosConfig = this.buildAxiosConfig(config);
            return await axiosInstance.patch(url, data, axiosConfig);
        } catch (error) {
            console.error(`PATCH request failed for ${url}:`, error);
            throw error;
        }
    }

    async deleteRequest<TResponse = any, TBody = any>({
                                                          url,
                                                          data,
                                                          config,
                                                      }: RequestProps<TBody>): Promise<TResponse> {
        this.setHeaders(config);
        const axiosConfig = {...this.buildAxiosConfig(config), data};
        return axiosInstance.delete(url, axiosConfig);
    }


}

export default HttpServices
