import { lazy, Suspense, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import logoBig from './assets/logo_big.svg'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

const LoadingScreen = ({ message = 'Loading QuickChat...' }) => (
  <div className="min-h-screen bg-black bg-[url('/bgImage.svg')] bg-cover bg-center flex items-center justify-center text-white">
    <div className="flex flex-col items-center gap-4">
      <img src={logoBig} alt="QuickChat" className="w-52" />
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-500" />
      </div>
      <p className="text-sm text-white/70">{message}</p>
    </div>
  </div>
)

const App = () => {
  const { authUser, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return <LoadingScreen message="Checking your session..." />;
  }

  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain bg-no-repeat bg-cover">
      <Toaster />
      <Suspense fallback={<LoadingScreen />}>
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
