import React, { useState, useEffect } from "react";
import axios from "axios";
import { connect } from 'react-redux';
import { userAuthAction } from "../actions";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  AiOutlineMail,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { useNavigate, Link } from "react-router-dom";

const Login = ({user, userAuthAction}) => {
  //states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inputError, setInputError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  //navigate
  const navigate = useNavigate();

  //useEffect
  useEffect(()=>{
    if(user) navigate('/home'); 
  },[])

  //error handling
  const borderError = "border-solid border-2 border-red-500";

  //helpers
  const onFormSubmit = async (event) => {
    event.preventDefault();
    //input checking
    if (email === "") return setInputError("email");
    if (password === "") return setInputError("password");
    setInputError("");
    try {
      setLoading(true);
      const payload = { email, password };
      const response = await axios.post("/api/users/login", payload);
      setLoading(false);
      //save in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      //save in redux store
      userAuthAction(response.data);
      navigate("/home");
    } catch (error) {
      console.log(error);
      setLoading(false);
      const message = error?.response?.data?.message;
      if (message) return toast.error(message);
      toast.error("Something went wrong, please try later");
    }
  };

  return (
    <section className="relative py-8 bg-primary overflow-hidden min-h-screen flex justify-center items-center">
      {loading && <Spinner />}
      <div className="relative container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full lg:w-1/2 px-4 font-Recoleta">
              <div className="px-6 lg:px-20 py-12 lg:py-24 bg-secondary rounded-lg">
                <form className="mb-2" onSubmit={(event) => onFormSubmit(event)}>
                  <h3 className="mb-10 text-2xl text-white font-bold font-heading">
                    Login to your Account
                  </h3>
                  {/* Email */}
                  <div
                    className={`flex items-center pl-6 mb-3 bg-white rounded-full ${
                      inputError === "email" && borderError
                    }`}
                  >
                    <span className="inline-block pr-3 py-2 border-r border-gray-50">
                      <AiOutlineMail size={21} className="text-myblack" />
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
                  <div
                    className={`text-red-400 mb-2 ${
                      inputError !== "email" && "hidden"
                    }`}
                  >
                    Email required
                  </div>
                  <div
                    className={`flex items-center pl-6 mb-1 bg-white rounded-full ${
                      inputError === "password" && borderError
                    }`}
                  >
                    <span
                      className="inline-block pr-3 py-2 border-r border-gray-50 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible
                          size={21}
                          className="text-myblack"
                        />
                      ) : (
                        <AiOutlineEye size={21} className="text-myblack" />
                      )}
                    </span>
                    <input
                      className="w-full pl-4 pr-6 py-4 font-bold placeholder-gray-300 rounded-r-full focus:outline-none"
                      type={showPassword ? "text" : "password"}
                      onChange={(event) => setPassword(event.target.value)}
                      value={password}
                      placeholder="Password"
                    />
                  </div>

                  {/* Err msg*/}
                  <div
                    className={`text-red-400 mb-2 ${
                      inputError !== "password" && "hidden"
                    }`}
                  >
                    Password required
                  </div>
                  {/* Forgotten Password */}
                  <div className="text-white block text-right mb-3">
                    <Link to="/forgot-password" className="hover:underline">
                      Forgot Password ?
                    </Link>
                  </div>
                  <div className="inline-flex mb-10"></div>

                  <button
                    type="submit"
                    className="mt-4 py-4 w-full text-xl bg-myblack hover:bg-black text-white font-bold rounded-full transition duration-200"
                  >
                    Sign in
                  </button>
                </form>
                {/* no account */}
                <div className="text-white block text-center">
                  <Link to="/register" className="hover:underline">
                    Don't have an account ? Create one here.
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-4 mb-4 sm:mb-16 lg:mb-0 font-Recoleta">
              <div className="max-w-md">
                <span className="text-xl text-secondary font-bold">
                  Login Form
                </span>
                <h2 className="mt-8 mb-12 text-5xl font-bold font-heading text-myblack">
                  <span className="whitespace-pre-line">Ready to write ?</span>
                  <span>Login Now !</span>
                </h2>
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
export default connect(mapStateToProps, {userAuthAction} )(Login);
