import HttpServices from "@/service/http.service";

class AuthService extends HttpServices {
    async login(data: any) {
        try {
            const response = await this.postRequest({
                url: "/teacher/login",
                data,
            })
            console.log(response)
            return response?.data
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }

    async logout() {
        try {
            const response = await this.postRequest({
                url: "/teacher/logout",
            })
            return response?.data
        } catch (error) {
            console.error(`Error logging out: ${error}`)
            throw error
        }
    }

}

const authService = new AuthService()

export default authService