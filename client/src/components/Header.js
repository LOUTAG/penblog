import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut, FiPlus } from "react-icons/fi";
import SearchUSer from "./SearchUser";

const Header = ({ user, userAuthAction }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const ref = useRef();
  useEffect(() => {
    const onBodyClick = (event) => {
      //if click event outside the ref div, turn to false.
      //useEffect is call again but just clean because showOptions is false
      if (!ref.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    //if showing create an event listener
    if (showOptions) document.body.addEventListener("click", onBodyClick);

    //clean up function
    return () => {
      document.body.removeEventListener("click", onBodyClick);
    };
  }, [showOptions]);

  const publicMenuItems = [
    {
      name: "Search",
      path: "/"
    }
  ];

  const adminMenuItems = [
    {
      name: "Search",
      path: null
    },
    {
      name: "Add Category",
      path: "/add-category",
    },
    {
      name: "Categories",
      path: "/categories",
    },
  ];
  //helpers
  const renderMenuItems = () => {
    if (user?.isAdmin) {
      return adminMenuItems.map((item, index) => {
        let key =
          Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
        return (
          <li
            key={key}
            className={`px-1 lg:px-2 xl:px-3 text-xl xl:text-2xl 2xl:text-3xl font-semibold ${(showMobileMenu && item.name==='Search')&&'mb-2'}`}
          >
            {item.name==='Search'?<SearchUSer />:<Link
              className={`py-1 px-2 block ${
                window.location.pathname === item.path
                  ? "bg-secondary text-primary rounded"
                  : "hover:underline"
              }`}
              to={item.path}
            >
              {item.name}
            </Link>}
          </li>
        );
      });
    } else {
      return publicMenuItems.map((item, index) => {
        let key =
          Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
        return (
          <li
            key={key}
            className={`px-4 lg:px-6 xl:px-8 text-xl xl:text-2xl 2xl:text-3xl font-semibold ${(showMobileMenu && item.name==='Search')&&'mb-2'}`}
          >
            {item.name==='Search'?<SearchUSer />:<Link
              className={`py-1 px-2 block ${
                window.location.pathname === item.path
                  ? "bg-secondary text-primary rounded"
                  : "hover:underline"
              }`}
              to={item.path}
            >
              {item.name}
            </Link>}
          </li>
        );
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    userAuthAction(null);
    navigate("/");
  };

  return (
    <div className="font-Recoleta bg-primary p-2 fixed z-50 top-0 left-0 right-0 min-h-[4rem] 2xl:min-h-[5rem]">
      <div className="flex flex-wrap justify-between items-center">
        {/* left-navbar */}
        <div className="left-navbar flex justify-between items-center">
          <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-secondary">
            <Link to="/home">PenBlog</Link>
          </h1>
          <div className="mobileIcon block lg:hidden px-2 sm:px-4 md:px-6">
            <FiMenu
              size={36}
              className="text-secondary cursor-pointer"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            />
          </div>
          <div className="menu px-4 hidden lg:block">
            <ul className="list-none flex">{renderMenuItems()}</ul>
          </div>
        </div>
        {/* right-navbar */}
        <div className="right-navbar flex items-center text-xl xl:text-2xl 2xl:text-3xl font-semibold ">
          <div className="px-1 sm:px-2 md:px-3 lg:px-4 cursor-pointer">
            <Link
              to="/create"
              className="py-1 px-2 flex items-center bg-myblue text-black rounded"
            >
              <FiPlus size={20} className="mobile-L:mr-1" />
              <span className="hidden mobile-L:block">New Post</span>
            </Link>
          </div>
          <div className="pl-1 sm:pl-2 xl:pl-4">
            <div className="relative">
              <div
                ref={ref}
                className="cursor-pointer rounded-full"
                onClick={() => setShowOptions(!showOptions)}
              >
                <img
                  className={`h-10 w-10 2xl:h-11 2xl:w-11 rounded-full ${
                    showOptions && "border-2 border-myblack"
                  }`}
                  src={user?.profilePhoto}
                  alt="my profile"
                />
              </div>
              <div
                className={`${
                  !showOptions && "hidden"
                } absolute origin-top-right right-0 bg-white rounded-md mt-2 shadow-lg animate-appear`}
              >
                <ul className="list-none w-48 py-1">
                  <li className="block px-4 py-2 hover:bg-myblack hover:text-white">
                    <Link to={`/profile/${user.id}`}>My Profile</Link>
                  </li>
                  <li className="block px-4 py-2 hover:bg-myblack hover:text-white">
                    <Link to="/change-password">Change my password</Link>
                  </li>
                  <li
                    className="block px-4 py-2 cursor-pointer hover:bg-myblack hover:text-white"
                    onClick={logout}
                  >
                    Logout <FiLogOut size={20} className="ml-1 inline-block" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* mobile-menu */}
        {showMobileMenu && (
          <div className="w-full block lg:hidden">
            <ul className="list-none w-full flex flex-col shadow-lg rounded mt-2">
              {renderMenuItems()}
            </ul>
          </div>
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
export default connect(mapStateToProps, { userAuthAction })(Header);
