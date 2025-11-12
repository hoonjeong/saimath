import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface Question {
  question_number: number
  image_url?: string
  choices: string[]
  answer: number
}

export default function AdminCreateTest() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'select' | 'create'>('select')
  const [grade, setGrade] = useState('')
  const [semester, setSemester] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 25 }, (_, i) => ({
      question_number: i + 1,
      choices: ['', '', '', ''],
      answer: 0
    }))
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      navigate('/admin/login')
    }

    // 임시 저장된 데이터 불러오기
    const savedData = localStorage.getItem('temp_test_paper')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (window.confirm('작성 중이던 시험지가 있습니다. 이어서 작성하시겠습니까?')) {
          setGrade(parsed.grade)
          setSemester(parsed.semester)
          setQuestions(parsed.questions)
          setCurrentQuestion(parsed.currentQuestion || 0)
          setStep('create')
        } else {
          localStorage.removeItem('temp_test_paper')
        }
      } catch (error) {
        console.error('임시 저장 데이터 불러오기 실패:', error)
        localStorage.removeItem('temp_test_paper')
      }
    }
  }, [navigate])

  const handleGradeSelect = (selectedGrade: string) => {
    setGrade(selectedGrade)
  }

  const handleSemesterSelect = (selectedSemester: string) => {
    setSemester(selectedSemester)
  }

  const handleStart = () => {
    if (!grade || !semester) {
      alert('학년과 학기를 선택해주세요')
      return
    }
    setStep('create')
  }

  const currentQ = questions[currentQuestion]

  const handleChoiceChange = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[currentQuestion].choices[index] = value
    setQuestions(newQuestions)
  }

  const handleAnswerChange = (answerIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[currentQuestion].answer = answerIndex + 1
    setQuestions(newQuestions)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 5MB를 초과할 수 없습니다')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const newQuestions = [...questions]
        newQuestions[currentQuestion].image_url = data.imageUrl
        setQuestions(newQuestions)
      } else {
        alert('이미지 업로드에 실패했습니다: ' + data.message)
      }
    } catch (error) {
      alert('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    const newQuestions = [...questions]
    delete newQuestions[currentQuestion].image_url
    setQuestions(newQuestions)
  }

  const isCurrentQuestionValid = () => {
    return (
      currentQ.choices.every(c => c.trim() !== '') &&
      currentQ.answer > 0
    )
  }

  const handleNext = () => {
    if (!isCurrentQuestionValid()) {
      alert('모든 선지를 입력하고 정답을 선택해주세요')
      return
    }

    if (currentQuestion < 24) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleTempSave = () => {
    const tempData = {
      grade,
      semester,
      questions,
      currentQuestion
    }
    localStorage.setItem('temp_test_paper', JSON.stringify(tempData))
    alert('임시 저장되었습니다. 다음에 이어서 작성할 수 있습니다.')
  }

  const handleSave = async () => {
    // 작성된 문제만 필터링
    const completedQuestions = questions.filter(q =>
      q.choices.every(c => c.trim() !== '') && q.answer > 0
    )

    // 최소 1문제 이상 작성 확인
    if (completedQuestions.length === 0) {
      alert('최소 1개 이상의 문제를 작성해주세요')
      return
    }

    if (!window.confirm(`${completedQuestions.length}개의 문제를 저장하시겠습니까?`)) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/admin/test-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: parseInt(grade),
          semester: parseInt(semester),
          questions: completedQuestions
        })
      })

      const data = await response.json()

      if (data.success) {
        // 임시 저장 데이터 삭제
        localStorage.removeItem('temp_test_paper')
        alert(data.message)
        navigate('/admin')
      } else {
        alert('저장에 실패했습니다: ' + data.message)
        setSaving(false)
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다')
      setSaving(false)
    }
  }

  const progress = ((currentQuestion + 1) / 25) * 100

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">시험지 만들기</h1>

            {/* 학년 선택 */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3 text-lg">학년 선택</label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <button
                    key={g}
                    onClick={() => handleGradeSelect(g.toString())}
                    className={`py-4 rounded-lg font-medium text-lg border-2 transition-colors ${
                      grade === g.toString()
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-primary'
                    }`}
                  >
                    초{g}
                  </button>
                ))}
              </div>
            </div>

            {/* 학기 선택 */}
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-3 text-lg">학기 선택</label>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => handleSemesterSelect(s.toString())}
                    className={`py-4 rounded-lg font-medium text-lg border-2 transition-colors ${
                      semester === s.toString()
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-primary'
                    }`}
                  >
                    {s}학기
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="btn-primary w-full"
              disabled={!grade || !semester}
            >
              다음
            </button>

            <div className="mt-6 text-center">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                ← 관리자 홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* 진행 표시 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-gray-700">
              문제 {currentQuestion + 1} / 25
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* 문제 작성 카드 */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">문제 {currentQ.question_number} 입력</h2>

          {/* 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">문제 이미지 (선택사항)</label>
            {currentQ.image_url ? (
              <div className="relative">
                <img
                  src={currentQ.image_url}
                  alt={`문제 ${currentQ.question_number}`}
                  className="w-full max-w-md rounded-lg border-2 border-gray-300"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <label className="block w-full max-w-md">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="text-gray-500">
                      {uploading ? (
                        <div>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                          <p>업로드 중...</p>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">클릭하여 이미지 업로드</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (최대 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* 선지 입력 */}
          <div className="space-y-4 mb-6">
            <label className="block text-gray-700 font-medium">선지 입력</label>
            {currentQ.choices.map((choice, index) => (
              <div key={index}>
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`${index + 1}번 선지`}
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 정답 선택 */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">정답 선택</label>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(index => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(index)}
                  className={`py-3 rounded-lg font-medium text-lg border-2 transition-colors ${
                    currentQ.answer === index + 1
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-secondary'
                  }`}
                >
                  {index + 1}번
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-3 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 이전
          </button>

          {currentQuestion < 24 && (
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionValid()}
              className="flex-1 btn-primary"
            >
              다음 →
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-secondary"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

        {/* 임시 저장 버튼 */}
        <div className="mb-6">
          <button
            onClick={handleTempSave}
            className="w-full px-6 py-3 border-2 border-yellow-500 bg-yellow-50 rounded-lg text-yellow-700 font-medium hover:bg-yellow-100 transition-colors"
          >
            💾 임시 저장하기 (나중에 이어서 작성)
          </button>
        </div>

        <div className="text-center">
          <Link to="/admin" className="text-gray-500 hover:text-gray-700">
            ← 관리자 홈으로
          </Link>
          <p className="text-xs text-gray-400 mt-2">
            ※ 임시 저장하지 않고 나가면 작업 내용이 사라집니다
          </p>
        </div>
      </div>
    </div>
  )
}
