import { Link } from 'react-router-dom'

export default function StudentWelcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full card text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">사이수학 입학테스트</h1>
          <div className="text-6xl mb-6">📝</div>
        </div>

        <div className="space-y-4 mb-8 text-left bg-blue-50 p-6 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-primary text-xl">✓</span>
            <p className="text-lg text-gray-700">총 <strong>25문제</strong>가 출제됩니다</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-primary text-xl">✓</span>
            <p className="text-lg text-gray-700">각 문제당 <strong>4점</strong>씩 배점됩니다</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-primary text-xl">✓</span>
            <p className="text-lg text-gray-700">시험 시간 제한은 <strong>없습니다</strong></p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-primary text-xl">✓</span>
            <p className="text-lg text-gray-700">문제를 순서대로 풀어주세요 (뒤로가기 불가)</p>
          </div>
        </div>

        <Link
          to="/student/info"
          className="btn-primary inline-block w-full max-w-sm"
        >
          시작하기
        </Link>

        <div className="mt-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
