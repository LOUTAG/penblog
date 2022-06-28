import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import axiosJWTRequest from "../utils/axiosJWTRequest";
import { toast } from "react-toastify";

const Followings = ({ user, following, userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  }, []);

  const onUnfollowClick = async () => {
    try {
      const response = await axiosJWTRequest(
        "put",
        "/api/users/unfollow",
        { id: following._id },
        user.accessToken
      );
      setUserProfile({
        ...userProfile,
        following: userProfile.following.filter(
          (item) => item._id !== following._id && item
        ),
      });
      toast.success(response);
    } catch (error) {
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
    <div className="flex items-center my-4 justify-between">
      <div className="flex items-center">
        <div className="mr-2">
          <div className="cursor-pointer rounded-full">
            <img
              className="h-12 w-12 rounded-full"
              src={following.profilePhoto}
              alt={following.lastName + " profile picture"}
            />
          </div>
        </div>
        <Link className="text-lg font-bold" to={`/profile/${following.id}`}>
          {following.firstName} {following.lastName}
        </Link>
      </div>
      <div className="flex flex-wrap justify-center items-center w-2/5">
        {userProfile.id === user.id && (
          <React.Fragment>
            <button
              className="grow text-sm sm:text-base py-1 px-2 bg-myred text-white h-fit rounded font-semibold mr-2 mb-2 sm:mb-0"
              onClick={() => onUnfollowClick()}
            >
              Unfollow
            </button>
            <button className="grow text-sm sm:text-base py-1 px-2 bg-dark-primary h-fit rounded font-semibold mr-2 mb-2 sm:mr-0 sm:mb-0">
              <FiMail className="inline-block" /> Send Message
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, { userAuthAction })(Followings);
