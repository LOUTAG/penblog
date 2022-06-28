import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { toast } from "react-toastify";
import axiosJWTRequest from "../utils/axiosJWTRequest";
import { userAuthAction } from "../actions";

const Users = ({ user, userAuthAction, display, setDisplay }) => {
  const [followings, setFollowings] = useState([]);
  const [inputvalue, setInputValue] = useState("");
  const [term, setTerm] = useState("");
  const [isMount, setIsMount] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAllFollowings = async () => {
      try {
        const response = await axiosJWTRequest(
          "get",
          "/api/users/followings",
          false,
          user.accessToken
        );
        setFollowings(response.following);
      } catch (error) {
        console.log(error);
        if (error === "InvalidUser" || error === "TokenExpiredError") {
          toast.error("Session expired, please login again");
          logout();
        }
      }
    };
    fetchAllFollowings();
    setIsMount(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMount) setTerm(inputvalue.toLowerCase());
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [inputvalue]);

  //helpers
  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };

  const userRender = () => {
    const filterFollowings =
      term !== ""
        ? followings.filter(
            (item) =>
              item.firstName.toLowerCase().includes(term) ||
              (item.lastName.toLowerCase().includes(term) && item)
          )
        : followings;
    return filterFollowings.map((item, index) => {
      let key = Date.now() + "-" + index;
      return (
        <li key={key}>
          <Link
            className="text-xl rounded-lg font-semibold px-2 py-3 mr-1 capitalize cursor-pointer hover:bg-dark-primary flex items-center hover:shadow"
            to={`/profile/${item._id}`}
          >
            <div className="mr-2 w-8 shrink-0">
              <div className="rounded-full">
                <img
                  className="h-8 w-8 rounded-full"
                  src={item.profilePhoto}
                  alt={item.lastName}
                />
              </div>
            </div>
            <span>
              {item.firstName} {item.lastName}
            </span>
          </Link>
        </li>
      );
    });
  };
  return (
    <div
      className={`${
        !display.users ? "w-0" : "w-60 bg-primary z-20 shadow animate-widthGrow"
      } xl:w-60 2xl:w-[360px] font-Recoleta p-2 h-[calc(100vh-4rem)] 2xl:h-[calc(100vh-5rem)] flex flex-col fixed items-start right-0`}
    >
      <h2 className="text-2xl font-bold uppercase mb-2 p-2">Users</h2>
      <div className="overflow-y-hidden overflow-x-hidden hover:overflow-y-scroll scrollbar w-full">
        <form className="bg-dark-primary w-[calc(100%-0.25rem)] rounded-2xl flex items-center px-3 mb-2">
          <HiOutlineSearch size={24} className="mr-2 text-black-primary" />
          <input
            type="text"
            className="focus:outline-none capitalize bg-dark-primary font-semibold rounded-2xl py-2 placeholder:text-black-primary"
            placeholder="Search..."
            value={inputvalue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </form>
        {followings.length > 0 ? (
          <ul className="list-none">{userRender(term)}</ul>
        ) : (
          <div>You are not following anyone at the moment</div>
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
export default connect(mapStateToProps, { userAuthAction })(Users);
