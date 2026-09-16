import { lazy, Suspense, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

const App = () => {
  const { authUser, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return null;
  }

  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain bg-no-repeat bg-cover">
      <Toaster />
      <Suspense fallback={null}>
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
