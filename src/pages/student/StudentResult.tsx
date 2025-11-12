import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function StudentResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const { score, correct_count, total } = location.state as { score: number; correct_count: number; total: number } || {}

  useEffect(() => {
    if (!score && score !== 0) {
      navigate('/student/info')
    }
  }, [score, navigate])

  if (!score && score !== 0) {
    return null
  }

  const percentage = Math.round((correct_count / total) * 100)

  let message = ''
  let emoji = ''

  if (score >= 90) {
    message = '훌륭합니다! 매우 잘했어요!'
    emoji = '🎉'
  } else if (score >= 70) {
    message = '잘했습니다! 좋은 결과예요!'
    emoji = '👍'
  } else {
    message = '다음에 다시 도전해보세요!'
    emoji = '💪'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full card text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">{emoji}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{message}</h1>
        </div>

        {/* 점수 표시 */}
        <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-lg p-8 mb-8">
          <div className="text-6xl font-bold mb-2">{score}점</div>
          <div className="text-2xl opacity-90">/ 100점</div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-secondary text-4xl font-bold mb-2">{correct_count}개</div>
            <div className="text-gray-600">정답</div>
          </div>
          <div className="bg-red-50 rounded-lg p-6">
            <div className="text-accent text-4xl font-bold mb-2">{total - correct_count}개</div>
            <div className="text-gray-600">오답</div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="text-primary text-3xl font-bold mb-2">{percentage}%</div>
          <div className="text-gray-600">정답률</div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            결과는 관리자가 확인할 수 있습니다.<br />
            곧 연락드리겠습니다. 감사합니다!
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <Link to="/student" className="btn-primary inline-block w-full max-w-sm">
            다시 테스트 보기
          </Link>
          <div>
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
