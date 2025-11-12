import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // 간단한 세션 관리 (localStorage)
        localStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('admin_username', formData.username)
        navigate('/admin')
      } else {
        setError(data.message)
        setLoading(false)
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full card">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">관리자 로그인</h1>
          <p className="text-gray-600">시험지 관리 및 결과 조회</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">아이디</label>
            <input
              type="text"
              className="input-field"
              placeholder="admin"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">비밀번호</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← 홈으로 돌아가기
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            기본 계정: admin / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
