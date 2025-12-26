import {useQuery} from "@tanstack/react-query";
import {examService} from "@/service/exam.service";

export const useExamTypes = () => {
    return useQuery({
        queryKey: ["exam-types"],
        queryFn: async () => {
            const res = await examService.getAllExamType();
            console.log("response", res);
            return res;
        },
    });
};
