import React, {useCallback} from "react";
import { FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import { connect } from "react-redux";
import axiosJWTRequest from "../utils/axiosJWTRequest";
import { userAuthAction } from "../actions";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FollowUnfollow = ({ userProfile, setUserProfile, user, userAuthAction }) => {
  //navigate
  const navigate = useNavigate();
  //helpers
  const logout = useCallback(() => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  }, []);

  const onFollowClick = async() => {
    try {
      const response = await axiosJWTRequest(
        "put",
        "/api/users/follow",
        {id: userProfile.id},
        user.accessToken
      );
        setUserProfile({...userProfile, followers: response.followers});
      toast.success(response);
    } catch (error) {
      console.log(error);
      if (error === "InvalidUser" || error === "TokenExpiredError") {
        //either the account is deleted, either token expired
        toast.error("Session expired, please login again");
        logout();
      } else {
        toast.error("Something went wrong, please try later");
      };
    };
  };

  const onUnfollowClick = async() => {
    try {
      const response = await axiosJWTRequest(
        "put",
        "/api/users/unfollow",
        {id: userProfile.id},
        user.accessToken
      );
      const followersUpdated = userProfile.followers.filter(item=>item.id!==user.id&&item);
        setUserProfile({...userProfile, followers: followersUpdated});
      toast.success(response);
    } catch (error) {
      console.log(error);
      if (error === "InvalidUser" || error === "TokenExpiredError") {
        //either the account is deleted, either token expired
        toast.error("Session expired, please login again");
        logout();
      } else {
        toast.error("Something went wrong, please try later");
      };
    };
  };

  return userProfile?.followers?.filter(item=>item.id===user.id).length>0 ? (
    <button className="py-1 px-2 text-lg bg-tertiary text-myred font-semibold rounded flex items-center" onClick={()=>onUnfollowClick()}>
      <span className="mr-1">Unfollow</span>
      <FiMinusSquare className="inline-block" />
    </button>
  ) : (
    <button className="py-1 px-2 text-lg bg-myblue font-semibold rounded flex items-center" onClick={()=>onFollowClick()}>
      <span className="mr-1">Follow</span>
      <FiPlusSquare className="inline-block" />
    </button>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, {userAuthAction})(FollowUnfollow);
