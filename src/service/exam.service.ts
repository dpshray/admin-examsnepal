import HttpService from "@/service/http.service";

class ExamService extends HttpService {

    async getExamType() {
        try {
            const response = await this.getRequest({
                url: "/exam-types",
            })
            return response?.data
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }

    async examCategory() {
        try {
            const response = await this.getRequest({
                url: "/category-types",
            })
            return response?.data
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }

    createExam(data: any) {
        try {
            return this.postRequest({
                url: "/teacher/exam",
                data,
                config: {
                    auth: true
                }
            })
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }

    async getAllExams(params: { [key: string]: any } = {}, page: number = 1) {
        try {
            const response = await this.getRequest({
                url: "teacher/exam",
                config: {
                    auth: true,
                    params: {
                        ...params,
                        page,
                    },
                }
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching exams: ${error}`);
            throw error;
        }
    }

    async getExamById(id: string, page: number = 1) {
        try {
            const response = await this.getRequest({
                // teacher/exam/1/question
                url: `teacher/exam/${id}/question?page=${page}`,
                config: {
                    auth: true,
                }
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching exams: ${error}`);
            throw error;
        }
    }

    async uploadQuestion(examId: number, data: any) {
        try {
            return await this.postRequest({
                url: `/teacher/exam/${examId}/question`,
                data,
                config: {auth: true}
            });
        } catch (error) {
            console.error(`Error uploading question:`, error);
            throw error;
        }
    }

    async deleteExam(id: number) {
        try {
        return await this.deleteRequest({
            url: `/teacher/exam/${id}`,
            config: { auth: true },
        });
        } catch (error) {
        console.error(`Error deleting exam: ${error}`);
        throw error;
        }
    }

    async deleteQuestion(id: number) {
        try {
        return await this.deleteRequest({
            url: `/teacher/question/${id}`,
            config: { auth: true },
        });
        } catch (error) {
        console.error(`Error deleting question: ${error}`);
        throw error;
        }
    }

    async updateExam(id: number, data: any) {
        try {
        return await this.putRequest({
            url: `/teacher/exam/${id}`,
            data,
            config: { auth: true },
        });
        } catch (error) {
        console.error(`Error updating exam: ${error}`);
        throw error;
        }
    }

    async updateQuestion(id: number, data: any) {
        try {
        return await this.putRequest({
            url: `/teacher/question/${id}`,
            data,
            config: { auth: true },
        });
        } catch (error) {
        console.error(`Error updating question: ${error}`);
        throw error;
        }
    }

}

export const examService = new ExamService()