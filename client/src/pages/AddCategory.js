import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { userAuthAction } from "../actions/index";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import Layout from "../components/Layout";

import axiosJWTRequest from "../utils/axiosJWTRequest";

const AddCategory = ({ user, userAuthAction }) => {
  const [title, setTitle] = useState("");
  const [inputError, setInputError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) return navigate("/profile");
    // eslint-disable-next-line
  }, [user]);

  //helpers

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };

  const onFormSubmit = async (event) => {
    event.preventDefault();
    if (title === "") return setInputError(true);
    setInputError(false);
    try {
      setLoading(true);
      const response = await axiosJWTRequest(
        "post",
        "/api/categories/create",
        { title },
        user.accessToken
      );
      setLoading(false);
      setTitle("");
      toast.success(response);
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error === "InvalidUser" || error === "TokenExpiredError") {
        toast.error("Session expired, please login again");
        logout();
      } else {
        toast.error(error);
      }
    }
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="w-full lg:w-1/2 px-4 font-Recoleta mx-auto self-center my-4">
        <div className="px-6 lg:px-20 py-12 lg:py-24 bg-myblue rounded-lg">
          <form className="mb-2" onSubmit={(event) => onFormSubmit(event)}>
            <h3 className="mb-2 text-2xl font-bold font-heading text-center">
              Add New Category
            </h3>
            <p className="mb-4 text-center">
              These are the categories users will select when creating a post
            </p>
            <input
              className={`w-full pl-4 pr-6 py-4 font-bold placeholder-gray-300 rounded focus:outline-none ${
                inputError && "border-solid border-2 border-red-500"
              }`}
              type="text"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
              placeholder="category name"
            />
            {/* Err msg*/}
            <div
              className={`text-red-500 mb-2 font-semibold ${
                !inputError && "hidden"
              }`}
            >
              Title required
            </div>
            <div className="inline-flex mb-10"></div>

            <button
              type="submit"
              className="mt-4 py-4 w-full text-xl bg-myblack hover:bg-black text-white font-bold rounded-full transition duration-200"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, { userAuthAction })(AddCategory);
