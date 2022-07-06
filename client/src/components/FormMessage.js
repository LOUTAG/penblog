import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { userAuthAction} from "../actions";
import { RiCloseLine } from "react-icons/ri";
import { toast } from "react-toastify";
import instance from "../utils/API";

const FormMessage = ({ user, userTarget, setFormMessage, userAuthAction }) => {
  //state
  const [subject, setSubject] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  //navigate
  const navigate = useNavigate();

  //refs
  const ref = useRef();
  const frameRef = useRef();

  //useEffect
  useEffect(() => {
    const onBodyClick = (event) => {
      if (isMounted) {
        if (!frameRef.current.contains(event.target))
          return setFormMessage(false);
      }
    };
    document.body.addEventListener("click", onBodyClick);
    return () => {
      document.body.removeEventListener("click", onBodyClick);
    };
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = null;
    };
  }, []);

  useEffect(() => {
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [textMessage]);

  //helpers
  const onFormSubmit = async(event) => {
    event.preventDefault();
    if(subject==="") return toast.error("Please provide a subject");
    if (textMessage === "") return toast.error("Message cannot stay empty");
    const payload = {targetEmail: userTarget.email, subject: subject, message: textMessage}
    try{
        const response = await instance.post('/emails/send', {payload});
        console.log(response);
    }catch(error){
        console.log(error);
        if (error === "InvalidUser" || error === "TokenExpiredError") {
            //either the account is deleted, either token expired
            toast.error("Session expired, please login again");
            logout();
        } else {
            toast.error("Something went wrong, please try later");
        }
    }
  };
  const logout = useCallback(() => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  }, []);
  return (
    <div className="modal fixed z-50">
      <div className="fixed inset-0 bg-primary bg-opacity-90"></div>
      <div className="fixed inset-0 flex items-center justify-center min-h-full p-4 text-center sm:p-0 overflow-y-auto">
        <form
          className="space-y-6 p-8 rounded bg-dark-primary shadow sm:min-w-[360px] md:min-w-[640px] relative"
          onSubmit={(event) => onFormSubmit(event)}
          ref={frameRef}
        >
          <RiCloseLine
            className="absolute origin-top-right top-0 right-0 text-3xl sm:text-4xl mt-2 mr-2 cursor-pointer opacity-60 hover:opacity-90"
            onClick={() => setFormMessage(false)}
          />
          <h2 className="text-xl sm:text-3xl font-bold font-Recoleta capitalize">
            Message to {userTarget.firstName} {userTarget.lastName}
          </h2>
          <div className="rounded-md shadow-sm space-y-2">
            <div>
              <label htmlFor="email-subject" className="sr-only">
                Subject
              </label>
              <input
                id="email-subject"
                type="text"
                className="w-full focus:outline-none rounded py-2 px-3 placeholder:text-gray-500 text-sm sm:text-xl font-Recoleta"
                placeholder="Subject"
                maxLength="40"
                value={subject}
                onChange={(event)=>setSubject(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-text" className="sr-only">
                Email text
              </label>
              <textarea
                id="email-text"
                placeholder="Write your message..."
                ref={ref}
                maxLength="280"
                className="overflow-auto resize-none w-full focus:outline-none rounded py-2 px-3 placeholder:text-gray-500 text-sm sm:text-xl font-Recoleta"
                value={textMessage}
                onChange={(event) => setTextMessage(event.target.value)}
              ></textarea>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent sm:text-xl font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-Recoleta"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, {userAuthAction})(FormMessage);
