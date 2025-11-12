import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function StudentInfo() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    grade: '',
    semester: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
    if (errors.phone) setErrors({ ...errors, phone: '' })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요'
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'
    }

    if (!formData.grade) {
      newErrors.grade = '학년을 선택해주세요'
    }

    if (!formData.semester) {
      newErrors.semester = '학기를 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // 시험지 존재 확인
      const response = await fetch(`/api/test-papers/${formData.grade}/${formData.semester}`)
      const data = await response.json()

      if (!data.success) {
        alert(data.message)
        setLoading(false)
        return
      }

      // 테스트 페이지로 이동 (데이터 전달)
      navigate('/student/test', {
        state: {
          studentInfo: formData,
          testPaper: data.data
        }
      })
    } catch (error) {
      alert('시험지를 불러오는 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full card">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">학생 정보 입력</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이름 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={handlePhoneChange}
              maxLength={13}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* 학년 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              학년 <span className="text-red-500">*</span>
            </label>
            <select
              className={`input-field ${errors.grade ? 'border-red-500' : ''}`}
              value={formData.grade}
              onChange={(e) => {
                setFormData({ ...formData, grade: e.target.value })
                if (errors.grade) setErrors({ ...errors, grade: '' })
              }}
            >
              <option value="">선택해주세요</option>
              {[1, 2, 3, 4, 5, 6].map(grade => (
                <option key={grade} value={grade}>초등 {grade}학년</option>
              ))}
            </select>
            {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
          </div>

          {/* 학기 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              학기 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="semester"
                  value="1"
                  checked={formData.semester === '1'}
                  onChange={(e) => {
                    setFormData({ ...formData, semester: e.target.value })
                    if (errors.semester) setErrors({ ...errors, semester: '' })
                  }}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-gray-700">1학기</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="semester"
                  value="2"
                  checked={formData.semester === '2'}
                  onChange={(e) => {
                    setFormData({ ...formData, semester: e.target.value })
                    if (errors.semester) setErrors({ ...errors, semester: '' })
                  }}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-gray-700">2학기</span>
              </label>
            </div>
            {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? '시험지 불러오는 중...' : '시작하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/student" className="text-gray-500 hover:text-gray-700">
            ← 이전으로
          </Link>
        </div>
      </div>
    </div>
  )
}
