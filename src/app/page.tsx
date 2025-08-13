"use client";

import {useCallback, useState} from "react";
import {Button} from "@/components/ui/button";
import {ExamModal} from "@/components/modal/exam-modal";
import {useRouter} from "next/navigation";
import {examService} from "@/service/exam.service";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = useCallback(
        async (data: any) => {
            const response = await examService.createExam(data);
            console.log('  Response:', response);
            // if (response.ok) {
            //     setIsModalOpen(false);
            //     router.refresh();
            // }

        },
        []
    );

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Exam Management</h1>
                <Button onClick={() => setIsModalOpen(true)}>Create New Exam</Button>

                <ExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmitAction={handleSubmit}/>
            </div>
        </main>
    );
}
