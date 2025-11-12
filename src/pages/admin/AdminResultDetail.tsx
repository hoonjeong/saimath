import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

interface Question {
  question_number: number
  image_url?: string
  choices: string[]
  answer: number
}

interface Answer {
  question_number: number
  selected_answer: number
}

interface ResultDetail {
  id: number
  student_name: string
  student_phone: string
  grade: number
  semester: number
  test_paper_id: number
  taken_at: string
  score: number
  correct_count: number
  answers: Answer[]
  questions: Question[]
}

export default function AdminResultDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<ResultDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      navigate('/admin/login')
      return
    }

    fetchResultDetail()
  }, [id, navigate])

  const fetchResultDetail = async () => {
    try {
      const response = await fetch(`/api/admin/results/${id}`)
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        alert('결과를 찾을 수 없습니다')
        navigate('/admin/results')
      }
    } catch (error) {
      console.error(error)
      alert('결과를 불러오는 중 오류가 발생했습니다')
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  const totalQuestions = result?.questions.length || 0
  const percentage = Math.round((result.correct_count / totalQuestions) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* 헤더 */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{result.student_name} 학생 상세 결과</h1>
              <p className="text-gray-600">
                응시일시: {formatDate(result.taken_at)}<br />
                학년/학기: 초등 {result.grade}학년 {result.semester}학기<br />
                전화번호: {result.student_phone}
              </p>
            </div>
            <Link to="/admin/results" className="text-gray-500 hover:text-gray-700">
              ← 목록으로
            </Link>
          </div>

          {/* 점수 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-1">{result.score}점</div>
              <div className="text-sm opacity-90">총점</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center border-2 border-green-200">
              <div className="text-4xl font-bold text-secondary mb-1">{result.correct_count}개</div>
              <div className="text-sm text-gray-600">정답</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center border-2 border-blue-200">
              <div className="text-4xl font-bold text-primary mb-1">{percentage}%</div>
              <div className="text-sm text-gray-600">정답률</div>
            </div>
          </div>
        </div>

        {/* 문제별 결과 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">문제별 상세 결과</h2>
        <div className="space-y-4">
          {result.questions.map((question, index) => {
            const studentAnswer = result.answers.find(a => a.question_number === question.question_number)
            const isCorrect = studentAnswer?.selected_answer === question.answer

            return (
              <div key={question.question_number} className={`card border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">문제 {question.question_number}</h3>
                  <span className={`px-4 py-1 rounded-full text-white font-medium ${isCorrect ? 'bg-secondary' : 'bg-accent'}`}>
                    {isCorrect ? '✓ 정답' : '✗ 오답'}
                  </span>
                </div>

                {question.image_url && (
                  <div className="mb-4">
                    <img src={question.image_url} alt={`문제 ${question.question_number}`} className="max-w-full h-auto rounded-lg" />
                  </div>
                )}

                <div className="space-y-2">
                  {question.choices.map((choice, choiceIndex) => {
                    const isSelected = studentAnswer?.selected_answer === choiceIndex + 1
                    const isAnswer = question.answer === choiceIndex + 1

                    return (
                      <div
                        key={choiceIndex}
                        className={`p-3 rounded-lg border-2 ${
                          isAnswer && isSelected ? 'border-green-500 bg-green-100' :
                          isAnswer ? 'border-green-500 bg-green-100' :
                          isSelected ? 'border-red-500 bg-red-100' :
                          'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                            isAnswer ? 'bg-secondary text-white' :
                            isSelected ? 'bg-accent text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {choiceIndex + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-gray-800">{choice}</span>
                            {isSelected && !isAnswer && (
                              <span className="ml-2 text-sm text-red-600 font-medium">← 학생 선택</span>
                            )}
                            {isAnswer && (
                              <span className="ml-2 text-sm text-green-600 font-medium">← 정답</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 text-center">
          <Link to="/admin/results" className="btn-primary inline-block">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
