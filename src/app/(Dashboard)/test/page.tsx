import QuestionForm from "@/components/question/Question-Form";

export default function TestPage(){
    return (
        <div>
            <h1>Test Page</h1>
            <QuestionForm
                questionId={192019}
                mode="edit"
            />
        </div>
    )
}