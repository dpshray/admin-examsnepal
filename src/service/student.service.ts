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

    async subscribeStudent(studentId: number, payload: { subscription_type_id: number; remark?: string }) {
        try {
            const response = await this.postRequest({
                url: `/add-subscriber/${studentId}`,
                data: payload,
                config: { auth: true }
            }); 
            return response;
        } catch (err) {
            console.error("Error subscribing student:", err);
            throw err;
        }
    }

    async subscriptionType(studentId: number) {
        try {
            const response = await this.getRequest({
                url: `/subtype/${studentId}`,
                config: { auth: true }
            });
            return response;
        } catch (err) {
            console.error("Error fetching subscription types:", err);
            throw err;
        }
    }

    async getAllSubmissions(params: any) {
        try {
            const response = await this.getRequest({
                url: "/submissionslist",
                config: { 
                    auth: true,
                    params: {
                        ...params,
                    }
                }
            });
            return response;
        } catch (err) {
            console.error("Error fetching submission details:", err);
            throw err;
        }
    }

    async verifyStudent(studentId: number) {
        try {
            const response = await this.getRequest({
                url: `/admin/manual-student-email-verify/${studentId}`,
                config: { auth: true }
            });
            return response;
        } catch (err) {
            console.error("Error verifying student:", err);
            throw err;
        }
    }

}

export const studentService = new StudentService()