"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BookOpen } from "lucide-react";
import { ExamModal } from "@/components/modal/exam-modal";
import { ExamCard } from "@/components/card/exam-card";
import { examService } from "@/service/exam.service";
import CustomPagination from "@/components/Custom-Pagination";
import ExamSkeletonCard from "@/components/skeleton/ExamSkeletonCard";
import { toast } from "sonner";

export default function ExamDashboard() {
  const router = useRouter();
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: 12,
      };
      const response = await examService.getAllExams(params);
      setExams(response?.data ?? []);
      setCurrentPage(response?.current_page ?? 1);
      setTotalPages(response?.last_page ?? 1);
    } catch {
      setError("Failed to load exams. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openExamModal = () => {
    setIsExamModalOpen(true);
    setError(null);
  };

  const closeExamModal = () => {
    setIsExamModalOpen(false);
    setError(null);
    fetchExams();
  };

  const handleUploadQuestions = (id: string | number) => {
    router.push(`/exam/${id}`);
  };

  const handleDeleteExam = async (id: number) => {
    try {
      await examService.deleteExam(id); 
      toast.success("Exam deleted successfully"); 
      fetchExams();
    } catch {
      toast.error("Failed to delete exam"); 
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Exam Management
            </h1>
            <p className="text-gray-600">
              Create and manage your exams and questions
            </p>
          </div>
          <Button
            onClick={openExamModal}
            disabled={isLoading}
            className="flex items-center gap-2"
            aria-label="Create new exam"
          >
            <BookOpen className="w-4 h-4" />
            Create New Exam
          </Button>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <section aria-label="Loading exams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ExamSkeletonCard key={index} />
              ))}
            </div>
          </section>
        ) : exams.length > 0 ? (
          <section aria-label="Exam list">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  id={exam.id}
                  publish={exam.published}
                  exam_type={exam.exam_type}
                  exam_name={exam.exam_name}
                  total_questions={exam.total_questions}
                  hasQuestions={exam.hasQuestions}
                  description={exam.description}
                  assign={exam.assign}
                  live={exam.live}
                  onUploadQuestions={handleUploadQuestions}
                  onDelete={handleDeleteExam}
                />
              ))}
            </div>
            <div className="flex items-center justify-center mt-6">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChangeAction={handlePageChange}
                maxPagesToShow={5}
              />
            </div>
          </section>
        ) : (
          <section className="text-center py-12" aria-label="Empty state">
            <BookOpen
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No exams created yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first exam
            </p>
            <Button onClick={openExamModal} disabled={isLoading}>
              Create New Exam
            </Button>
          </section>
        )}

        <ExamModal isOpen={isExamModalOpen} onClose={closeExamModal} />
      </div>
    </main>
  );
}
