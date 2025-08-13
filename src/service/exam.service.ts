import HttpService from "@/service/http.service";

class ExamService extends HttpService {

    async getExamType(){
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
    async examCategory(){
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
    createExam(data: any){
        try {
            const response = this.postRequest({
                url: "/teacher/exam",
                data,
                config: {
                    auth: true
                }
            })
            return response
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }
}

export const examService = new ExamService()