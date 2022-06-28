import React, { useState, useEffect, useRef } from "react";
import elapsedTime from "../utils/elapsedTime";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import axiosJWTRequest from "../utils/axiosJWTRequest";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "./Spinner";
import { userAuthAction } from "../actions";

const Comment = ({ comment, comments, setComments, count, setCount, user, userAuthAction }) => {
  console.log(comments);
  //state
  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  //navigate
  const navigate = useNavigate();

  const ref = useRef();
  useEffect(() => {
    if (edit) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [edit, inputValue]);
  //helpers
  const onResetClick=()=>{
    setInputValue(comment.content);
    setEdit(false);
  }

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };
  const onFormSubmit = async(event)=>{
    event.preventDefault();
    if(inputValue==="") return;
    try {
      setLoading(true);
      const response = await axiosJWTRequest(
        "put",
        `/api/comment/update/${comment._id}`,
        {content: inputValue},
        user.accessToken
      );
      setLoading(false);
      //update state of parent Post component
      comment.content = inputValue;
      
      //display the success
      setEdit(false);
      toast.success(response);
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error === "InvalidUser" || error === "TokenExpiredError") {
        //either the account is deleted, either token expired
        toast.error("Session expired, please login again");
        logout();
      } else {
        toast.error(error);
      }
    }
  }

  const onDeleteClick = async () => {
    if (window.confirm("Are you sure to delete your comment ?")) {
      try {
        setLoading(true);
        const response = await axiosJWTRequest(
          "delete",
          `/api/comment/${comment._id}`,
          null,
          user.accessToken
        );
        setLoading(false);
        //update state of parent Post component
        setComments(
          comments.filter((item) => item._id !== comment._id && item)
        );
        setCount(count-1);
        //display the success
        toast.success(response);
      } catch (error) {
        setLoading(false);
        console.log(error);
        if (error === "InvalidUser" || error === "TokenExpiredError") {
          //either the account is deleted, either token expired
          toast.error("Session expired, please login again");
          logout();
        } else {
          toast.error(error);
        }
      }
    }
  };
  return (
    <li className="flex py-2">
      <div className="relative mr-2 w-8">
        {loading && <Spinner />}
        <Link className="rounded-full" to={`/profile/${comment.user.id}`}>
          <img
            className="h-8 w-8 rounded-full"
            src={comment.user.profilePhoto}
            alt={comment.user.lastName}
          />
        </Link>
      </div>
      <div className={`${edit && "w-[calc(100%-4rem)]"} max-w-[calc(100%-4rem)]`}>
        <div className="bg-primary rounded-2xl py-2 px-3">
          <Link className="font-semibold capitalize" to={`/profile/${comment.user.id}`}>
            {comment.user.firstName} {comment.user.lastName}
          </Link>
          {edit ? (
            <form onSubmit={(event)=>onFormSubmit(event)}>
              <textarea
                placeholder="Edit your comment..."
                ref={ref}
                className="overflow-auto resize-none w-full focus:outline-none bg-dark-primary rounded py-2 px-3 placeholder:text-gray-500"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              ></textarea>
              <button type="submit" className="text-sm font-semibold py-1 px-2 mr-2 rounded bg-secondary hover:opacity-90 text-white">Validate</button>
              <button type="reset" onClick={()=>onResetClick()} className="text-sm font-semibold py-1 px-2 rounded bg-gray-500 hover:opacity-90 text-white">Cancel</button>
            </form>
          ) : (
            <div>{comment.content}</div>
          )}
        </div>
        <div className="text-sm text-gray-500 text-right pt-1 mr-2">
          {comment.user.id === user.id && (
            <div className="inline-block">
              {!edit&&<span
                className="mr-2 hover:text-gray-800 cursor-pointer"
                onClick={() => {
                  setEdit(true);
                }}
              >
                Edit
              </span>}
              <span
                className="mr-2 hover:text-gray-800 cursor-pointer"
                onClick={() => onDeleteClick()}
              >
                Delete
              </span>
            </div>
          )}

          <span>{elapsedTime(comment.createdAt)}</span>
        </div>
      </div>
    </li>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, { userAuthAction })(Comment);
