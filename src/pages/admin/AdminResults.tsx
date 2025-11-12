import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface TestResult {
  id: number
  student_name: string
  student_phone: string
  grade: number
  semester: number
  test_paper_id: number
  taken_at: string
  score: number
  correct_count: number
}

export default function AdminResults() {
  const navigate = useNavigate()
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      navigate('/admin/login')
      return
    }

    fetchResults()
  }, [navigate, search, gradeFilter, semesterFilter])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (gradeFilter) params.append('grade', gradeFilter)
      if (semesterFilter) params.append('semester', semesterFilter)

      const response = await fetch(`/api/admin/results?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">학생 결과 조회</h1>
            <Link to="/admin" className="text-gray-500 hover:text-gray-700">
              ← 관리자 홈으로
            </Link>
          </div>

          {/* 검색 및 필터 */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <input
                type="text"
                className="input-field"
                placeholder="이름 또는 전화번호 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="input-field"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
              >
                <option value="">전체 학년</option>
                {[1, 2, 3, 4, 5, 6].map(grade => (
                  <option key={grade} value={grade}>초등 {grade}학년</option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="input-field"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="">전체 학기</option>
                <option value="1">1학기</option>
                <option value="2">2학기</option>
              </select>
            </div>
          </div>
        </div>

        {/* 결과 테이블 */}
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">이름</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">전화번호</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">학년/학기</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">응시일시</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">점수</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">정답수</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">상세보기</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{result.student_name}</td>
                    <td className="py-3 px-4">{result.student_phone}</td>
                    <td className="py-3 px-4">초{result.grade}-{result.semester}학기</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(result.taken_at)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        result.score >= 90 ? 'text-green-600' :
                        result.score >= 70 ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {result.score}점
                      </span>
                    </td>
                    <td className="py-3 px-4">{result.correct_count}/25</td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/admin/results/${result.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
