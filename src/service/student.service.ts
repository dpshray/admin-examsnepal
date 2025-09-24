import HttpService from "@/service/http.service";

class StudentService extends HttpService {
    async getAllStudents(params: { [key: string]: any } = {}, page: number = 1) {
        try {
            const response = await this.getRequest({
                url: "/all-students",
                config: {
                    auth: true,
                    params: {
                        ...params,
                        page,
                    },
                }
            });
            return response;
        } catch (error) {
            console.error(`Error fetching exams: ${error}`);
            throw error;
        }
    }

    async subscribeStudent(studentEmail: string, payload: { start_date: string; end_date: string; remark?: string }) {
    try {
        const response = await this.postRequest({
            url: `/subscribe-student/${studentEmail}`,
            data: payload,
            config: { auth: true }
        });
        return response;
    } catch (err) {
        console.error("Error subscribing student:", err);
        throw err;
    }
    }

}

export const studentService = new StudentService()