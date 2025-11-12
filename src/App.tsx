import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StudentWelcome from './pages/student/StudentWelcome'
import StudentInfo from './pages/student/StudentInfo'
import StudentTest from './pages/student/StudentTest'
import StudentResult from './pages/student/StudentResult'
import AdminLogin from './pages/admin/AdminLogin'
import AdminHome from './pages/admin/AdminHome'
import AdminCreateTest from './pages/admin/AdminCreateTest'
import AdminResults from './pages/admin/AdminResults'
import AdminResultDetail from './pages/admin/AdminResultDetail'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* 학생 페이지 */}
        <Route path="/student" element={<StudentWelcome />} />
        <Route path="/student/info" element={<StudentInfo />} />
        <Route path="/student/test" element={<StudentTest />} />
        <Route path="/student/result" element={<StudentResult />} />

        {/* 관리자 페이지 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/create-test" element={<AdminCreateTest />} />
        <Route path="/admin/results" element={<AdminResults />} />
        <Route path="/admin/results/:id" element={<AdminResultDetail />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
