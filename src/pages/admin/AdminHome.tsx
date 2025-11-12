import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminHome() {
  const navigate = useNavigate()

  useEffect(() => {
    // 로그인 확인
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      navigate('/admin/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_username')
    navigate('/admin/login')
  }

  const username = localStorage.getItem('admin_username') || 'Admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">관리자 페이지</h1>
            <p className="text-gray-600">{username}님, 환영합니다</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            로그아웃
          </button>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 시험지 만들기 */}
          <Link
            to="/admin/create-test"
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">시험지 만들기</h2>
              <p className="text-gray-600 mb-4">새로운 시험지를 생성하거나 기존 시험지를 수정합니다</p>
              <div className="text-primary font-medium">시작하기 →</div>
            </div>
          </Link>

          {/* 결과 보기 */}
          <Link
            to="/admin/results"
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">결과 보기</h2>
              <p className="text-gray-600 mb-4">학생들의 응시 결과를 조회하고 분석합니다</p>
              <div className="text-primary font-medium">조회하기 →</div>
            </div>
          </Link>
        </div>

        {/* 홈으로 */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
