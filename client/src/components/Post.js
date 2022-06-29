import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMessageSquare, FiChevronDown } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoHeart, IoHeartDislike } from "react-icons/io5";
import Spinner from "./Spinner";
import Comment from "./Comment";
import AddComment from "./AddComment";
import LikeDislike from "./LikeDislike";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import elapsedTime from "../utils/elapsedTime";
import EditPost from "./EditPost";
import { toast } from "react-toastify";
import axiosJWTRequest from "../utils/axiosJWTRequest";

const Post = ({ post, posts, setPosts, user, userAuthAction }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [edit, setEdit] = useState(false);
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfLikes, setNumberOfLikes] = useState(post.likes.length);
  const [numberOfDislikes, setNumberOfDislikes] = useState(
    post.dislikes.length
  );
  const navigate = useNavigate();
  const ref = useRef();
  useEffect(() => {
    const onBodyClick = (event) => {
      if (!ref.current.contains(event.target)) setShowOptions(false);
    };
    if (showOptions) document.body.addEventListener("click", onBodyClick);

    return () => {
      document.body.removeEventListener("click", onBodyClick);
    };
  }, [showOptions]);
  useEffect(() => {
    const countComments = async () => {
      try {
        const response = await axios.get(`/api/comments/count/${post._id}`);
        setCount(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    countComments();
  }, []);

  //helpers
  const onDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete "${post.title}" ?`)) {
      try {
        setShowOptions(false);
        setLoading(true);
        const response = await axiosJWTRequest(
          "delete",
          `/api/posts/${post._id}`,
          false,
          user.accessToken
        );
        setLoading(false);
        setPosts(posts.filter((item) => item._id !== post._id && item));
        toast.success(response.data);
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
    }
  };

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };

  const onClickEdit = () => {
    setEdit(true);
    setShowOptions(false);
  };

  const onClickComments = async () => {
    if (!showComments) {
      setShowComments(true);
      if (count > 0) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/comments/${post._id}`);
          setComments(response.data);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      }
    }
  };

  const renderComments = () => {
    return comments.map((comment, index) => {
      let key = Date.now() + "-" + index;
      return (
        <Comment
          key={key}
          comment={comment}
          comments={comments}
          setComments={setComments}
          count={count}
          setCount={setCount}
        />
      );
    });
  };
  return (
    <div className="mb-6 flex flex-col rounded-xl bg-white shadow-lg py-3">
      {loading && <Spinner />}
      <div className="mb-3 flex flex-row justify-between px-4">
        <div className="flex flex-row">
          <div className="relative mr-2">
            <div className="cursor-pointer rounded-full">
              <Link
                to={`/profile/${post.author._id}`}
              >
                <img
                  className="h-12 w-12 rounded-full"
                  src={post.author.profilePhoto}
                  alt={post.author.lastName + " profile picture"}
                />
              </Link>
            </div>
          </div>
          <div className="flex flex-col">
            <Link
              className="text-lg font-bold"
              to={`${
                user._id === post.author._id
                  ? "/my-profile"
                  : `/profile/${post.author._id}`
              }`}
            >
              {post.author.firstName} {post.author.lastName}
            </Link>
            <span className="text-sm text-gray-500">
              {elapsedTime(post.createdAt)}
            </span>
          </div>
        </div>
        {!edit && post.author.id === user.id && (
          <div className="relative" ref={ref}>
            <HiOutlineDotsHorizontal
              size={28}
              className="cursor-pointer"
              onClick={() => setShowOptions(!showOptions)}
            />
            <div
              className={`${
                !showOptions && "hidden"
              } absolute origin-top-right right-0 bg-white rounded-md mt-2 shadow-lg`}
            >
              <ul className="list-none py-1 w-40 font-semibold">
                <li
                  className="block cursor-pointer px-4 py-2 hover:bg-myblack hover:text-white"
                  onClick={() => onClickEdit()}
                >
                  Edit
                </li>
                <li
                  className="block px-4 py-2 cursor-pointer hover:bg-myblack hover:text-white"
                  onClick={() => onDeleteClick()}
                >
                  Delete
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      {edit ? (
        <EditPost
          post={post}
          setEdit={setEdit}
          posts={posts}
          setPosts={setPosts}
        />
      ) : (
        <React.Fragment>
          <div className="my-2 px-4">
            <div className="font-bold text-xl">{post.title}</div>
            <div>{post.description}</div>
          </div>
          {post?.image && (
            <div className="my-2">
              <img
                className="max-w-full h-auto mx-auto"
                src={post.image}
                alt="post.title"
              />
            </div>
          )}
        </React.Fragment>
      )}
      <div className="my-2 px-4">
        <div className="flex justify-between text-gray-500">
          <div className="flex">
            {numberOfLikes > 0 && (
              <span className="flex items-center mr-2">
                {numberOfLikes}{" "}
                <IoHeart className="inline-block text-[#f44336]" />
              </span>
            )}
            {numberOfDislikes > 0 && (
              <span className="flex items-center">
                {numberOfDislikes}{" "}
                <IoHeartDislike className="inline-block text-black" />
              </span>
            )}
          </div>
          {count > 0 && (
            <div>
              {count} {count > 1 ? "comments" : "comment"}
            </div>
          )}
        </div>
      </div>
      <div
        className={` mx-4 py-2 border-t ${
          count > 0 && "my-2 border-b"
        } border-gray-300 flex items-center`}
      >
        <LikeDislike
          post={post}
          numberOfLikes={numberOfLikes}
          setNumberOfLikes={setNumberOfLikes}
          numberOfDislikes={numberOfDislikes}
          setNumberOfDislikes={setNumberOfDislikes}
        />
        <button
          className="flex-grow text-gray-500 text-lg"
          onClick={() => onClickComments()}
        >
          <FiMessageSquare size={20} className="inline mr-1" />
          <span className="align-middle">Comment</span>
        </button>
      </div>
      {showComments ? (
        <div className="my-2 px-4">
          <AddComment
            postId={post._id}
            comments={comments}
            setComments={setComments}
            count={count}
            setCount={setCount}
          />
          {count > 0 && <ul>{renderComments()}</ul>}
        </div>
      ) : (
        count > 0 && (
          <div className="my-2 px-4">
            <button
              className="text-gray-500 text-lg font-semibold"
              onClick={() => onClickComments()}
            >
              Display comments{" "}
              <FiChevronDown size={20} className="inline-block" />
            </button>
          </div>
        )
      )}
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, { userAuthAction })(Post);
