import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface Question {
  question_number: number
  image_url?: string
  choices: string[]
}

interface TestPaper {
  id: number
  grade: number
  semester: number
  questions: Question[]
}

interface StudentInfo {
  name: string
  phone: string
  grade: string
  semester: string
}

export default function StudentTest() {
  const location = useLocation()
  const navigate = useNavigate()
  const { studentInfo, testPaper } = location.state as { studentInfo: StudentInfo; testPaper: TestPaper } || {}

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedChoice, setSelectedChoice] = useState<number>(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const totalQuestions = testPaper?.questions.length || 0

  useEffect(() => {
    if (!studentInfo || !testPaper) {
      navigate('/student/info')
      return
    }

    // 답안 배열 초기화
    setAnswers(new Array(testPaper.questions.length).fill(0))

    // 브라우저 이탈 경고
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [studentInfo, testPaper, navigate])

  if (!studentInfo || !testPaper) {
    return null
  }

  const question = testPaper.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const handleChoiceSelect = (choiceIndex: number) => {
    setSelectedChoice(choiceIndex + 1) // 1-based index
  }

  const handleNext = () => {
    if (selectedChoice === 0) return

    // 답안 저장
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedChoice
    setAnswers(newAnswers)

    if (currentQuestion === totalQuestions - 1) {
      // 마지막 문제 - 제출 확인
      setShowConfirm(true)
    } else {
      // 다음 문제로
      setCurrentQuestion(currentQuestion + 1)
      setSelectedChoice(0)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const response = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentInfo.name,
          student_phone: studentInfo.phone,
          grade: parseInt(studentInfo.grade),
          semester: parseInt(studentInfo.semester),
          test_paper_id: testPaper.id,
          answers: answers.map((answer, index) => ({
            question_number: index + 1,
            selected_answer: answer
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        navigate('/student/result', {
          state: {
            score: data.data.score,
            correct_count: data.data.correct_count,
            total: data.data.total
          }
        })
      } else {
        alert('채점에 실패했습니다: ' + data.message)
        setSubmitting(false)
      }
    } catch (error) {
      alert('채점 중 오류가 발생했습니다')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* 진행 표시 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-gray-700">
              문제 {currentQuestion + 1} / {totalQuestions}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">문제 {question.question_number}</h2>

          {/* 문제 이미지 (있는 경우) */}
          {question.image_url && (
            <div className="mb-6">
              <img
                src={question.image_url}
                alt={`문제 ${question.question_number}`}
                className="max-w-full h-auto rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          {/* 선지 */}
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <div
                key={index}
                onClick={() => handleChoiceSelect(index)}
                className={`choice-card ${selectedChoice === index + 1 ? 'selected' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                    selectedChoice === index + 1
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-400 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 text-lg text-gray-700 pt-1">{choice}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={selectedChoice === 0}
          className={`w-full ${currentQuestion === totalQuestions - 1 ? 'btn-secondary' : 'btn-primary'}`}
        >
          {currentQuestion === totalQuestions - 1 ? '제출하기' : '다음'}
        </button>
      </div>

      {/* 제출 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">제출하시겠습니까?</h3>
            <p className="text-gray-600 mb-6">제출 후에는 수정할 수 없습니다.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={submitting}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 btn-secondary"
                disabled={submitting}
              >
                {submitting ? '채점 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
