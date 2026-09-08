import './App.css'
import GlassSignUpPage from './Login-SignUp/SignUp'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import GlassLoginPage from './Login-SignUp/Login'
import HomePage from './Home-Page/HomePage'
import ProfilePage from './Profile-Page/Profile'
import FriendsPage from './Chat-Page/chats'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
function App() {

  return (
    <>

      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage/>}></Route>
          <Route path='/login' element={<GlassLoginPage/>}></Route>
          <Route path='/signup' element={<GlassSignUpPage/>}></Route>
          <Route path='/profile' element={<ProfilePage/>}></Route>
          <Route path='/friends' element={<FriendsPage/>}></Route>
        </Routes>
      </BrowserRouter>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />



    </>
  )
}

export default App
