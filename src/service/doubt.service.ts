import HttpService from "@/service/http.service";

class DoubtService extends HttpService {
    async getAllDoubts(params: any) {
        try {
            const response = await this.getRequest({
                url: "/doubtslist",
                config: {
                    auth: true,
                    params: {
                        ...params,
                    }
                }
            });
            return response;
        } catch (err) {
            console.error("Error fetching doubts:", err);
            throw err;
        }
    }

    async resolveDoubt(doubtId: number, payload: any) {
        try {
            const response = await this.postRequest({
                url: `/doubtsresolve/${doubtId}`,
                data: payload,
                config: {auth: true}
            });
            return response;
        } catch (err) {
            console.error("Error resolving doubt:", err);
            throw err;
        }
    }
}

export const doubtService = new DoubtService()