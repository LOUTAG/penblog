import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import {
  IoHeart,
  IoHeartDislike,
  IoHeartOutline,
  IoHeartDislikeOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosJWTRequest from "../utils/axiosJWTRequest";

const LikeDislike = ({
  post,
  user,
  userAuthAction,
  numberOfLikes,
  setNumberOfLikes,
  numberOfDislikes,
  setNumberOfDislikes,
}) => {
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    post.likes.map((item) => {
      if (item.id === user.id) return setLike(true);
    });
    if (like) return;
    post.dislikes.map((item) => {
      if (item.id === user.id) return setDislike(true);
    });
  }, []);

  //helpers
  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };

  const OnLikeClick = async () => {
    if (dislike) {
      setDislike(false);
      setNumberOfDislikes(numberOfDislikes - 1);
    }
    like
      ? setNumberOfLikes(numberOfLikes - 1)
      : setNumberOfLikes(numberOfLikes + 1);
    setLike(!like);
    try {
      await axiosJWTRequest(
        "put",
        `/api/posts/like/${post._id}`,
        {},
        user.accessToken
      );
    } catch (error) {
      console.log(error);
      if (error === "InvalidUser" || error === "TokenExpiredError") {
        toast.error("Session expired, please login again");
        logout();
      } else {
        toast.error(error);
      }
    }
  };
  const OnDislikeClick = async () => {
    if (like) {
      setLike(false);
      setNumberOfLikes(numberOfLikes - 1);
    }
    dislike
      ? setNumberOfDislikes(numberOfDislikes - 1)
      : setNumberOfDislikes(numberOfDislikes + 1);
    setDislike(!dislike);
    try {
      await axiosJWTRequest(
        "put",
        `/api/posts/dislike/${post._id}`,
        {},
        user.accessToken
      );
    } catch (error) {
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
    <React.Fragment>
      <button
        className="flex-grow text-gray-500 text-xl"
        onClick={() => OnLikeClick()}
      >
        {like ? (
          <IoHeart size={20} className="inline mr-1 text-[#f44336]" />
        ) : (
          <IoHeartOutline size={20} className="inline mr-1" />
        )}
        <span className="align-middle">Like</span>
      </button>
      <button
        className="flex-grow text-gray-500 text-lg"
        onClick={() => OnDislikeClick()}
      >
        {dislike ? (
          <IoHeartDislike size={20} className="inline mr-1 text-black" />
        ) : (
          <IoHeartDislikeOutline size={20} className="inline mr-1" />
        )}
        <span className="align-middle">Dislike</span>
      </button>
    </React.Fragment>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, { userAuthAction })(LikeDislike);
