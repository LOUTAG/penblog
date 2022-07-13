import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const PasswordReset = ({ user }) => {
  //state
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [inputError, setInputError] = useState("");
  const [identity, setIdentity] = useState(undefined);
  const [loading, setLoading] = useState(false);

  //navigate
  const navigate = useNavigate();

  //params
  const { token } = useParams();

  //effect
  useEffect(() => {
    if (!token) return navigate("/login");
    if (user) return navigate("/home");

    const verifyPasswordToken = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/users/verify-password-token/${token}`
        );
        setIdentity(response.data.firstName);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        switch(error.response.data){
            case "invalidURL":
            case "invalidToken":
                toast.error("Invalid reset password link");
                break;
            case 'ExpiredToken':
                toast.error("Reset Password Link is expired, please generate a new one");
                break;
            default:
                toast.error("Something went wrong, please try later");  
        }
        return navigate("/login");
      }
    };
    verifyPasswordToken();
  }, []);
  //helpers
  const onFormSubmit = async(event) => {
    event.preventDefault();
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+=.<>()_~]).{8,32}$/;
    if (!passwordRegex.test(password)) return setInputError("password");
    if (password !== passwordConfirm) return setInputError("passwordConfirm");
    setInputError("");
    try{
        setLoading(true);
        const response = await axios.post('/api/users/reset-password', {password, token});
        setLoading(false);
        toast.success('Your password has been changed with success, you can now login');
        return navigate('/login');
    }catch(error){
        setLoading(false);
        console.log(error);
        switch(error.response.data){
            case "invalidURL":
            case "invalidToken":
                toast.error("Invalid reset password link");
                break;
            case 'ExpiredToken':
                toast.error("Reset Password Link is expired, please generate a new one");
                break;
            default:
                toast.error("Something went wrong, please try later");  
        }
        return navigate("/login");
    }
  };

  //render
  return (
    <>
      {loading && <Spinner />}
      <div className="bg-primary overflow-hidden min-h-screen flex justify-center items-center flex-wrap">
        <div className="font-Recoleta basis-full self-start">
          <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-secondary p-2">
            <a href="/home">PenBlog</a>
          </h1>
        </div>
        <div className="font-Recoleta basis-full sm:basis-3/4 max-w-[744px] self-start p-2">
          <div className="px-6 lg:px-20 py-12 lg:py-24 bg-dark-primary rounded-lg shadow">
            <form className="mb-2" onSubmit={(event) => onFormSubmit(event)}>
              {identity && (
                <h2 className="mb-2 text-2xl font-bold font-heading text-center capitalize">
                  Hi {identity},
                </h2>
              )}
              <h2 className="mb-4 text-2xl font-bold font-heading text-center capitalize">
                Reset your Password
              </h2>
              <input
                className={`w-full pl-4 pr-6 py-4 mb-2 font-bold shadow placeholder-gray-300 rounded focus:outline-none ${
                  inputError === "password" &&
                  "border-solid border-2 border-red-500"
                }`}
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
                placeholder="Enter a new password"
              />
              {/* Err msg*/}
              <div
                className={`text-red-500 mb-2 font-semibold ${
                  inputError !== "password" && "hidden"
                }`}
              >
                <ul>
                  Invalid password format :<li>- at least one digit</li>
                  <li>- at least one lowercase and one uppercase</li>
                  <li>
                    - at least one special character among
                    #?!@$%^&amp;*-+=.,&lt;&gt;_~
                  </li>
                  <li>- at least 8 characters long, no more than 32</li>
                </ul>
              </div>
              <input
                className={`w-full pl-4 pr-6 py-4 mb-2 font-bold shadow placeholder-gray-300 rounded focus:outline-none ${
                  inputError === "passwordConfirm" &&
                  "border-solid border-2 border-red-500"
                }`}
                type="password"
                onChange={(event) => setPasswordConfirm(event.target.value)}
                value={passwordConfirm}
                placeholder="Confirm your password"
              />
              <div
                className={`text-red-500 mb-2 font-semibold ${
                  inputError !== "passwordConfirm" && "hidden"
                }`}
              >
                Password confirmation must be the same
              </div>
              <button
                type="submit"
                className="mt-4 py-4 w-full shadow text-xl bg-myblack hover:bg-black text-white font-bold rounded-full transition duration-200"
              >
                Reset
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps)(PasswordReset);
