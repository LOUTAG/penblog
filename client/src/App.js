import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//components
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AccountVerification from "./pages/AccountVerification";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import AddCategory from "./pages/AddCategory";
import Categories from "./pages/Categories";
import Home from "./pages/Home";

//helpers
const ProtectedRoute=({children})=>{
  if(localStorage.getItem('user')){
    return children;
    //children here refers to the route
  }else{
    return <Navigate to="/" />
  }
}

//Our App
const App=()=>{
  return (
    <div className='App'>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path='/' exact element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-account/:token" element={<AccountVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<PasswordReset />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePost/></ProtectedRoute>} />
          <Route path="/add-category" element={<ProtectedRoute><AddCategory/></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App;
