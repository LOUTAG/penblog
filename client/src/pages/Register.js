import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { AiOutlineUser, AiOutlineMail, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; 
import { useNavigate, Link } from "react-router-dom";

const Register = ({user}) => {
  //states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inputError, setInputError] = useState("");
  const [showPassword, setShowPassword]= useState(false);
  const [loading, setLoading]= useState(false);

  //navigate
  const navigate= useNavigate();

  //useEffect
  useEffect(()=>{
    if(user) navigate('/profile'); 
  },[])

  //error handling
  const borderError = "border-solid border-2 border-red-500";


  //helpers
  const onFormSubmit = async(event) => {
    event.preventDefault();
    const emailRegex = /^[a-z0-9.-]+@+[a-z-]+[.]+[a-z]{2,6}$/;
    const passwordRegex= /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+=.<>()_~]).{8,32}$/;
    //input Checking
    if (firstName === "") return setInputError("firstName");
    if (lastName === "") return setInputError("lastName");
    if (!emailRegex.test(email)) return setInputError("email");
    if (!passwordRegex.test(password)) return setInputError("password");
    setInputError("");
    try{
      setLoading(true);
      const payload= {firstName, lastName, email, password};
      const response = await axios.post('/api/users/register', payload);
      setLoading(false);
      navigate('/login');
      toast.success(response.data);
    }catch(error){
      setLoading(false);
      const message = error.response.data.message;
      if(message) return toast.error(message);
      console.log(error.message);
      toast.error('Something went wrong, please try later');
    }
  };
  return (
    <section className="relative py-8 bg-primary overflow-hidden min-h-screen flex justify-center items-center">
      {loading&&<Spinner />}
      <div className="relative container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full lg:w-1/2 px-4 mb-4 sm:mb-16 lg:mb-0 font-Recoleta">
              <div className="max-w-md">
                <span className="text-xl text-secondary font-bold">
                  Register Form
                </span>
                <h2 className="mt-8 mb-12 text-5xl font-bold font-heading text-myblack">
                  Create an account and start pending down your ideas
                </h2>
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-4 font-Recoleta">
              <div className="px-6 lg:px-20 py-12 lg:py-24 bg-secondary rounded-lg">
                <form onSubmit={(event) => onFormSubmit(event)} className="mb-2">
                  <h3 className="mb-10 text-2xl text-white font-bold font-heading">
                    Register Account
                  </h3>
                  {/* First name */}
                  <div
                    className={`flex items-center pl-6 mb-3 bg-white rounded-full ${
                      inputError === "firstName" && borderError
                    }`}
                  >
                    <span className="inline-block pr-3 py-2 border-r border-gray-50">
                      <AiOutlineUser size={21} className="text-myblack"/>
                    </span>
                    <input
                      className="w-full pl-4 pr-6 py-4 font-bold placeholder-gray-300 rounded-r-full focus:outline-none"
                      type="text"
                      onChange={(event) => setFirstName(event.target.value)}
                      value={firstName}
                      placeholder="First Name"
                    />
                  </div>
                  {/* Err msg*/}
                  <div
                    className={`text-red-400 mb-2 ${
                      inputError !== "firstName" && "hidden"
                    }`}
                  >
                    First name is required
                  </div>
                  {/* Last name */}
                  <div
                    className={`flex items-center pl-6 mb-3 bg-white rounded-full ${
                      inputError === "lastName" && borderError
                    }`}
                  >
                    <span className="inline-block pr-3 py-2 border-r border-gray-50">
                    <AiOutlineUser size={21} className="text-myblack"/>
                    </span>
                    <input
                      className="w-full pl-4 pr-6 py-4 font-bold placeholder-gray-300 rounded-r-full focus:outline-none"
                      type="text"
                      onChange={(event) => setLastName(event.target.value)}
                      value={lastName}
                      placeholder="Last Name"
                    />
                  </div>
                  {/* Err msg*/}
                  <div
                    className={`text-red-400 mb-2 ${
                      inputError !== "lastName" && "hidden"
                    }`}
                  >
                    Last name is required
                  </div>
                  {/* Email */}
                  <div className={`flex items-center pl-6 mb-3 bg-white rounded-full ${inputError==='email'&&borderError}`}>
                    <span className="inline-block pr-3 py-2 border-r border-gray-50">
                      <AiOutlineMail size={21} className="text-myblack"/>
                    </span>
                    <input
                      className="w-full pl-4 pr-6 py-4 font-bold placeholder-gray-300 rounded-r-full focus:outline-none"
                      type="email"
                      onChange={(event) => setEmail(event.target.value)}
                      value={email}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  {/* Err msg*/}
                  <div className={`text-red-400 mb-2 ${inputError!=='email'&& 'hidden'}`}>
                    email not valid
                  </div>
                  <div className={`flex items-center pl-6 mb-3 bg-white rounded-full ${inputError==='password'&& borderError}`}>
                    <span className="inline-block pr-3 py-2 border-r border-gray-50 cursor-pointer" onClick={()=>setShowPassword(!showPassword)}>
                      {showPassword?
                      <AiOutlineEyeInvisible size={21} className="text-myblack"/>:
                      <AiOutlineEye size={21} className="text-myblack"/>
                    }
                    </span>
                    <input
                      className="w-full pl-4 pr-6 py-4 font-bold placeholder-gray-300 rounded-r-full focus:outline-none"
                      type={showPassword?"text":"password"}
                      onChange={(event) => setPassword(event.target.value)}
                      value={password}
                      placeholder="Password"
                    />
                  </div>
                  {/* Err msg*/}
                  <div className={`text-red-400 mb-2 ${inputError!=='password'&&'hidden'}`}>
                    <ul>Invalid password format :
                      <li>- at least one digit</li>
                      <li>- at least one lowercase and one uppercase</li>
                      <li>- at least one special character among #?!@$%^&amp;*-+=.,&lt;&gt;_~</li>
                      <li>- at least 8 characters long, no more than 32</li>
                    </ul>
                  </div>

                  <div className="inline-flex mb-10"></div>

                  <button
                    type="submit"
                    className="mt-4 py-4 w-full text-xl bg-myblack hover:bg-black text-white font-bold rounded-full transition duration-200"
                  >
                    Register
                  </button>
                </form>
                 {/* already account */}
                 <div className="text-white block text-left">
                  <Link to="/login" className="hover:underline">
                    Already have an account ? Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const mapStateToProps= (state)=>{
  return {
    user: state.user
  };
};
export default connect(mapStateToProps)(Register);
