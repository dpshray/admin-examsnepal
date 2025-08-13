import axiosInstance from "@/config/axiosConfig";

interface RequestProps<T = any> {
    url: string;
    data?: T;
    config?: HeaderConfigProps;
}

interface HeaderConfigProps {
    auth?: boolean;
    file?: boolean;
    params?: Record<string, any>;
}

class HttpServices {
    private buildHeaders(config?: HeaderConfigProps): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (config?.auth) {
            const token = localStorage.getItem("_at");
            if (!token) throw new Error("Login first to access this resource");
            headers["Authorization"] = `Bearer ${token}`;
            // headers["Authorization"] = `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3NvY2lhbGFwaS5zdGFnZS5kd29ya2xhYnMuY29tL2FwaS92MS9sb2dpbiIsImlhdCI6MTc1MTYxNTYxMCwiZXhwIjoxNzUxNjE5MjEwLCJuYmYiOjE3NTE2MTU2MTAsImp0aSI6IkxNMlV6YzJ0RWowZFNMVTYiLCJzdWIiOiIyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.yRAn17MAp9b-4_6bumRoQONhdHekDPc9BnHwcZyMtVM'}`;
        }

        if (config?.file) {
            headers["Content-Type"] = "multipart/form-data";
        }

        return headers;
    }

    async postRequest<TResponse = any, TBody = any>({
                                                        url,
                                                        data,
                                                        config,
                                                    }: RequestProps<TBody>): Promise<TResponse> {
        const headers = this.buildHeaders(config);
        const response = await axiosInstance.post(url, data, {
            headers,
            params: config?.params,
        });
        return response.data;
    }

    async getRequest<TResponse = any>({
                                          url,
                                          config,
                                      }: RequestProps): Promise<TResponse> {
        const headers = this.buildHeaders(config);
        const response = await axiosInstance.get(url, {
            headers,
            params: config?.params,
        });
        return response.data;
    }

    async putRequest<TResponse = any, TBody = any>({
                                                       url,
                                                       data,
                                                       config,
                                                   }: RequestProps<TBody>): Promise<TResponse> {
        const headers = this.buildHeaders(config);
        const response = await axiosInstance.put(url, data, {
            headers,
            params: config?.params,
        });
        return response.data;
    }

    async deleteRequest<TResponse = any>({
                                             url,
                                             config,
                                         }: RequestProps): Promise<TResponse> {
        const headers = this.buildHeaders(config);
        const response = await axiosInstance.delete(url, {
            headers,
            params: config?.params,
        });
        return response.data;
    }
}

export default HttpServices;
