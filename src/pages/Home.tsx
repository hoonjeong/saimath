import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">사이수학 입학테스트</h1>
          <p className="text-xl text-gray-600">초등학생을 위한 온라인 수학 테스트 시스템</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 학생 카드 */}
          <Link
            to="/student"
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍🎓</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">학생</h2>
              <p className="text-gray-600 mb-4">입학 테스트 응시하기</p>
              <div className="text-primary font-medium">시작하기 →</div>
            </div>
          </Link>

          {/* 관리자 카드 */}
          <Link
            to="/admin/login"
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">관리자</h2>
              <p className="text-gray-600 mb-4">시험지 관리 및 결과 조회</p>
              <div className="text-primary font-medium">로그인 →</div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>문의사항이 있으시면 관리자에게 연락해주세요</p>
        </div>
      </div>
    </div>
  )
}
