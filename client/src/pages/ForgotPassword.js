import React, {useState} from "react";
import Spinner from "../components/Spinner";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword=()=>{
    const [loading, setLoading]=useState(false);
    const [inputError, setInputError]=useState(false);
    const [email, setEmail]=useState('');
    const onFormSubmit=async(event)=>{
        event.preventDefault();
        const emailRegex = /^[a-z0-9.-]+@+[a-z-]+[.]+[a-z]{2,6}$/;
        if (!emailRegex.test(email)) return setInputError(true);
        try{
            setLoading(true);
            const response = await axios.post('/api/users/forget-password-token', {email});
            toast.success(response.data);
            setLoading(false);
        }catch(error){
            console.log(error);
            toast.error('Something went wrong');
            setLoading(false);
        }

    }
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
              <div className="px-6 lg:px-20 py-12 lg:py-24 bg-dark-primary rounded-lg shadow w-full">
                <form className="mb-2" onSubmit={(event) => onFormSubmit(event)}>
                  <h2 className="mb-4 text-2xl font-bold font-heading text-center capitalize">
                  Forgot your password?
                  </h2>
                  <input
                    className={`w-full pl-4 pr-6 py-4 mb-2 font-bold shadow placeholder-gray-300 rounded focus:outline-none ${
                      inputError &&
                      "border-solid border-2 border-red-500"
                    }`}
                    type="email"
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                    placeholder="Enter your email address"
                  />
                  {/* Err msg*/}
                  <div
                    className={`text-red-500 mb-2 font-semibold ${
                      !inputError && "hidden"
                    }`}
                  >
                    incorrect email format
                  </div>
                  <button
                    type="submit"
                    className="mt-4 py-4 w-full shadow text-xl bg-myblack hover:bg-black text-white font-bold rounded-full transition duration-200"
                  >
                    Generate New Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      );
}
export default ForgotPassword;