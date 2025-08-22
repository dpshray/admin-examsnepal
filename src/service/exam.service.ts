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

    async getAllExams(params?: { [key: string]: any }) {
        try {
            const response = await this.getRequest({
                url: "teacher/exam",
                config: {
                    auth: true,
                    params,
                }
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching exams: ${error}`);
            throw error;
        }
    }

    async getExamById(id: string) {
        try {
            const response = await this.getRequest({
                // teacher/exam/1/question
                url: `teacher/exam/${id}/question`,
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
}

export const examService = new ExamService()