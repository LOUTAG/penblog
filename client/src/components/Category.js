import React, { useState, useEffect } from "react";
import DateFormatter from "../utils/DateFormatter";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

import axiosJWTRequest from "../utils/axiosJWTRequest";

const Category = ({
  id,
  createdAt,
  title,
  categories,
  setCategories,
  user,
  userAuthAction,
}) => {
  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(title);
  const [isMount, setIsMount] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      //check the field
      if (inputValue !== "" && isMount) {
        const payload = {
          title: inputValue,
          id: id,
        };
        //config and send the request
        try {
          setLoading(true);
          const response = await axiosJWTRequest(
            "put",
            "/api/categories/update",
            payload,
            user.accessToken
          );
          setLoading(false);
          //update state of parent component Categories
          setCategories(
            categories.map((item) =>
              item._id === id ? { ...item, title: inputValue } : item
            )
          );
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
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line
  }, [inputValue]);

  useEffect(() => {
    setIsMount(true);
  }, []);

  //helpers
  const logout = () => {
    localStorage.removeItem("user");
    userAuthAction(null);
    navigate("/login");
  };
  const deleteCategory = async () => {
    if (window.confirm(`Do you really want to delete ${title} category ?`)) {
      //config and send the request
      try {
        setLoading(true);
        const response = await axiosJWTRequest(
          "delete",
          `/api/categories/delete/${id}`,
          null,
          user.accessToken
        );
        setLoading(false);
        //update state of parent component Categories
        setCategories(categories.filter((item) => item._id !== id && item));
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
    <React.Fragment>
      {loading && <Spinner />}
      <li className="bg-white shadow-lg text-black rounded px-8 py-6 block sm:flex sm:items-center font-semibold mb-6">
        <div className="block text-left sm:flex sm:justify-center sm:w-1/3 py-1 capitalize before:content-['Title'] before:pr-3 before:text-gray-400 sm:before:hidden">
          {edit ? (
            <input
              className="pl-4 pr-6 py-2 font-semibold placeholder-gray-300 focus:outline-none rounded border-gray-400 border-2"
              placeholder="Title"
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
          ) : (
            title
          )}
        </div>
        <div className="block text-left sm:flex sm:justify-center sm:w-1/3 py-1 before:content-['Create_At'] before:pr-3 before:text-gray-400 sm:before:hidden">
          <DateFormatter date={createdAt} />
        </div>
        <div className="block text-left sm:flex sm:justify-center sm:w-1/3 py-1 before:content-['Actions'] before:pr-3 before:text-gray-400 sm:before:hidden">
          <button
            className="py-1 px-2 rounded bg-primary text-myblack mr-2 hover:opacity-80"
            onClick={() => setEdit(!edit)}
          >
            {edit ? "Close" : "Edit"}
          </button>
          <button
            className="py-1 px-2 rounded bg-myblack text-white hover:opacity-80"
            onClick={() => deleteCategory()}
          >
            Delete
          </button>
        </div>
      </li>
    </React.Fragment>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, {
  userAuthAction,
})(Category);
