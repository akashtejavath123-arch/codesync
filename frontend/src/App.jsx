import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Project from './pages/Project'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Activity from './pages/Activity'
import Collaboration from './pages/Collaboration'
import { AuthData } from './context/Authcontext'
import Login from './pages/Login'
import ProjectDetails from './pages/ProjectDetails'


const App = () => {

  const { isAuth, loading } = AuthData();

  if (loading) return (
    <div className='flex justify-center items-center h-screen bg-[#1c1e29]'>
      <div className="w-16 h-16 border-4 border-[#4aed88] border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className='bg-[#1c1e29] min-h-screen text-white pt-[70px]'>

      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/login' element={isAuth ? <Navigate to="/" /> : <Login />} />

        <Route path='/activity' element={isAuth ? <Activity /> : <Navigate to="/login" />} />

        <Route path='/collaboration' element={isAuth ? <Collaboration /> : <Navigate to="/login" />} />

        <Route path='/project/:roomId' element={isAuth ? <Project /> : <Navigate to="/login" />} />

        <Route path='/project/:roomId/details' element={isAuth ? <ProjectDetails /> : <Navigate to="/login" />} />

        <Route path='/projectdetails/:roomId' element={isAuth ? <ProjectDetails /> : <Navigate to="/login" />} />
        
      </Routes>
      
    </div>

  )
}

export default App