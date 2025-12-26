
import {useQuery} from "@tanstack/react-query";
import {examService} from "@/service/exam.service";

export const useExamCategories = () => {
    return useQuery({
        queryKey: ["exam-categories"],
        queryFn: async () => {
            try {
                const response = await examService.examCategory();
                console.log("response from useExamCategories", response);
                return response;
            } catch (error) {
                console.error("Error fetching exam categories:", error);
                throw error;
            }
        },
    });
};
