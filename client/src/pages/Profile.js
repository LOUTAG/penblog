import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { connect } from "react-redux";
import { userAuthAction, updateProfilePhotoAction } from "../actions";
import { useNavigate, useParams } from "react-router-dom";
import DateFormatter from "../utils/DateFormatter";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
import axiosJWTRequest from "../utils/axiosJWTRequest";
import { FiChevronDown, FiChevronUp, FiUpload } from "react-icons/fi";
import Following from "../components/Following";
import Follower from "../components/Follower";
import FollowUnfollow from "../components/FollowUnfollow";
import axios from "axios";
import Post from "../components/Post";

const Profile = ({ user, userAuthAction, updateProfilePhotoAction }) => {
  //params
  const {id} = useParams();
  //state
  const [userProfile, setUserProfile]=useState({});
  const [myProfile, setMyProfile]=useState(user.id===id?true:false);
  const [posts, setPosts] = useState(null);
  const [displayFollowers, setDisplayFollowers] = useState(false);
  const [displayFollowings, setDisplayFollowings] = useState(false);
  const [displayPosts, setDisplayPosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  //navigate
  const navigate = useNavigate();

  //effect
  useEffect(()=>{
    if(isMounted) {
    setMyProfile((user.id===id?true:false));
    setDisplayFollowers(false);
    setDisplayFollowings(false);
    setDisplayPosts(false);
    setPosts(null);
    }
  },[id])

  useEffect(() => {
    if(user.id===id){
      const getMoreData = async()=>{
        try{
          setLoading(true);
          const response = await axios.get(`/api/users/more-data/${id}`);
          const data ={id:user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.createdAt, profilePhoto: user.profilePhoto, followers: response.data.followers, following: response.data.following, postCount: response.data.postCount, isAccountVerified: user.isAccountVerified};
          setUserProfile(data);
          setLoading(false);
        }catch(error){
          setLoading(false);
          console.log(error);
          toast.error("Something went wrong, please try later");
        }
      }
      getMoreData();
    }else{
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/users/${id}`);
          setUserProfile(response.data);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.log(error);
          toast.error("Something went wrong, please try later");
        }
      };
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (!posts && displayPosts) {
      const fetchPostsByUser = async () => {
        try {
          //now we want post by user
          
          const response = await axios.get(`/api/posts/user/${id}`);
          setPosts(response.data);
        } catch (error) {
          console.log(error);
          toast.error("Something went wrong, please try later");
        }
      };
      fetchPostsByUser();
    }
  }, [displayPosts]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //helpers
  const logout = useCallback(() => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  }, []);

  
  const renderFollowings = () => {
    return userProfile.following.map((item, index) => {
      let key = Date.now() + "-" + index;
      return (
        <Following
          key={key}
          following={item}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      );
    });
  };

  const renderFollowers = () => {
    return userProfile.followers.map((item, index) => {
      let key = Date.now() + "-" + index;
      return <Follower key={key} follower={item} myProfile={myProfile} />;
    });
  };

  const renderPosts = () => {
    return posts.map((item, index) => {
      let key = Date.now() + "-" + index;
      return <Post key={key} post={item} posts={posts} setPosts={setPosts} />;
    });
  };
  const onVerifyClick=()=>{
    console.log('onVerifyClick');
  }
  const dropzoneError = (code) => {
    switch (code) {
      case "file-invalid-type":
        return toast.error(
          "invalid file type, must be: .png, .jpg, .jpeg, .webp or gif"
        );
      case "file-too-large":
        return toast.error("File is too large, must be lower than 1MB");
      case "too-many-files":
        return toast.error("Files rejected : only one is accepted");
      default:
        return toast.error("Invalid file");
    }
  };

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axiosJWTRequest(
        "put",
        "/api/users/profile-picture-upload",
        formData,
        user.accessToken,
        "multipart/form-data"
      );
      updateProfilePhotoAction(response.profilePhoto);
      const userUpdated = { ...user, profilePhoto: response.profilePhoto };
      localStorage.setItem("user", JSON.stringify(userUpdated));
      toast.success("profile picture has been updated");
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

  //render
  return (
    <Layout>
      {loading && <Spinner />}
      <div className="w-[744px] flex flex-col justify-center items-center mx-auto font-Recoleta px-2">
        <div className="w-full flex flex-col rounded-xl bg-white shadow-lg p-3 mb-8">
          <div className="mb-3 flex flex-row flex-wrap justify-between px-4 after:content-[''] after:h-[1px] after:bg-gray-300 after:w-[70%] after:mt-4 after:mx-auto">
            <div className="flex flex-row">
              <div className="relative mr-2">
                {myProfile?<Dropzone
                  onDropAccepted={(acceptedFiles) =>
                    updateProfilePicture(acceptedFiles[0])
                  }
                  onDropRejected={(rejectedFiles) =>
                    dropzoneError(rejectedFiles[0].errors[0].code)
                  }
                  accept={{
                    "image/*": [".png", ".jpeg", ".jpg", ".gif", ".webp"],
                  }}
                  maxFiles={1}
                  maxSize={1000000}
                >
                  {({ getRootProps, getInputProps }) => {
                    return (
                      <section className="w-full">
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <div className="cursor-pointer rounded-full">
                            <img
                              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full"
                              src={user.profilePhoto}
                              alt={user.lastName + " profile picture"}
                            />
                            <FiUpload
                              size={80}
                              className={`text-transparent p-5 hover:text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:drop-shadow`}
                            />
                          </div>
                        </div>
                      </section>
                    );
                  }}
                </Dropzone>:<div className="rounded-full">
                  <img
                    className="h-20 w-20 rounded-full"
                    src={userProfile.profilePhoto}
                    alt={userProfile.lastName + " profile picture"}
                  />
                </div>}
              </div>
              <div className="ml-8 flex flex-col justify-center">
                <div className="text-xl sm:text-3xl font-bold flex items-center justify-start">
                  <span className="mr-2">{userProfile.firstName} {userProfile.lastName}</span>
                  {!myProfile&&<FollowUnfollow userProfile={userProfile} setUserProfile={setUserProfile} />}
                </div>
                <span className="text-gray-500 text-sm">
                  registered since : {userProfile.createdAt&&DateFormatter(userProfile.createdAt)}
                </span>
              </div>
            </div>
            {!userProfile.isAccountVerified ? (
              <div className={`py-1 px-2 bg-myred font-semibold text-white h-fit rounded ${myProfile && 'cursor-pointer'}`} onClick={()=>myProfile && onVerifyClick()}>
                Unverified Account
              </div>
            ) : (
              <div className="py-1 px-2 bg-secondary font-semibold text-white h-fit rounded">
                Account Verified
              </div>
            )}
          </div>
          <div className="mb-3 px-4 flex flex-row items-center justify-start">
            <div className="w-24 sm:w-28 mr-2 sm:text-lg font-semibold">Email :</div>
            <div className="sm:text-lg font-semibold break-all">{userProfile.email}</div>
          </div>
          <div className="mb-3 px-4 flex flex-row items-center justify-start">
            <div className="w-24 sm:w-28 mr-2 sm:text-lg font-semibold">Followers :</div>
            <div className="sm:text-lg font-semibold">{userProfile.followers?.length}</div>
          </div>
          <div className="mb-3 px-4 flex flex-row items-center justify-start">
            <div className="w-24 sm:w-28 mr-2 sm:text-lg font-semibold">Followings :</div>
            <div className="sm:text-lg font-semibold">{userProfile.following?.length}</div>
          </div>
          <div className="mb-3 px-4 flex flex-row items-center justify-start">
            <div className="w-24 sm:w-28 mr-2 sm:text-lg font-semibold">Posts :</div>
            <div className="sm:text-lg font-semibold">{userProfile.postCount}</div>
          </div>
        </div>
        {userProfile.postCount > 0 && (
          <React.Fragment>
          <div className="w-full flex flex-col rounded-xl bg-white shadow-lg p-3 mb-8">
            <div className="flex justify-between px-4 mb-4 items-center">
              <div className="text-xl sm:text-3xl font-bold">Posts</div>
              {displayPosts ? (
                <FiChevronUp
                  size={36}
                  className="cursor-pointer"
                  onClick={() => setDisplayPosts(false)}
                />
              ) : (
                <FiChevronDown
                  size={36}
                  className="cursor-pointer"
                  onClick={() => setDisplayPosts(true)}
                />
              )}
            </div>
          </div>
          {displayPosts && posts &&(
              <ul className="animate-appear">{renderPosts()}</ul>
            )}
          </React.Fragment>
        )}
        {userProfile.following?.length > 0 && (
          <div className="w-full flex flex-col rounded-xl bg-white shadow-lg p-3 mb-8">
            <div className="flex justify-between px-4 mb-4 items-center">
              <div className="text-xl sm:text-3xl font-bold">Followings</div>
              {displayFollowings ? (
                <FiChevronUp
                  size={36}
                  className="cursor-pointer"
                  onClick={() => setDisplayFollowings(false)}
                />
              ) : (
                <FiChevronDown
                  size={36}
                  className="cursor-pointer"
                  onClick={() => setDisplayFollowings(true)}
                />
              )}
            </div>
            {displayFollowings && (
              <ul className="animate-appear">{renderFollowings()}</ul>
            )}
          </div>
        )}
        {userProfile.followers?.length > 0 && (
          <div className="w-full flex flex-col rounded-xl bg-white shadow-lg p-3 mb-8">
            <div className="flex justify-between px-4 mb-4 items-center">
              <div className="text-xl sm:text-3xl font-bold">Followers</div>
              {displayFollowers ? (
                <FiChevronUp
                  size={36}
                  className="cursor-pointer"
                  onClick={() => setDisplayFollowers(false)}
                />
              ) : (
                <FiChevronDown
                  size={36}
                  className="cursor-pointer"
                  onClick={() => setDisplayFollowers(true)}
                />
              )}
            </div>
            {displayFollowers && (
              <ul className="animate-appear">{renderFollowers()}</ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps, {
  userAuthAction,
  updateProfilePhotoAction
})(Profile);
