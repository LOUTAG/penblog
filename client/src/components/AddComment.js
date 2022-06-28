import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

import axiosJWTRequest from "../utils/axiosJWTRequest";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { userAuthAction } from "../actions";

const AddComment = ({
  postId,
  comments,
  setComments,
  count,
  setCount,
  user,
  userAuthAction,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  const navigate=useNavigate();
  useEffect(() => {
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [inputValue]);
  //helpers

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };

  const onResetClick = () => {
    setInputValue("");
  };

  const onFormSubmit = async (event) => {
    event.preventDefault();
    if (inputValue === "") return;
    try {
        setLoading(true);
      const response = await axiosJWTRequest(
        "post",
        "/api/comment",
        { postId: postId, content: inputValue },
        user.accessToken
      );
      setLoading(false);
      setInputValue("");
      setComments([response, ...comments]);
      setCount(count+1);
    } catch (error) {
      setLoading(false);
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

  return (
    <div className="flex">
      <div className="relative mr-2 w-8">
        <div className="rounded-full">
          <img
            className="h-8 w-8 rounded-full"
            src={user.profilePhoto}
            alt={user.lastName + " profile"}
          />
        </div>
      </div>
      <form
        className="w-[calc(100%-4rem)]"
        onSubmit={(event) => onFormSubmit(event)}
      >
        <textarea
          ref={ref}
          className="bg-primary overflow-auto resize-none w-full focus:outline-none rounded-2xl py-2 px-3 placeholder:text-gray-500"
          placeholder="Write a comment..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        ></textarea>
        <div className="flex justify-end mr-2">
          <button
            type="submit"
            className="text-sm font-semibold py-1 px-2 mr-2 rounded bg-secondary hover:opacity-90 text-white"
          >
            Validate
          </button>
          <button
            type="reset"
            onClick={() => onResetClick()}
            className="text-sm font-semibold py-1 px-2 rounded bg-gray-500 hover:opacity-90 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, { userAuthAction })(AddComment);
