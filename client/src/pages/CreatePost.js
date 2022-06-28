import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RiArrowDropDownLine } from "react-icons/ri";
import { AiFillCloseSquare } from "react-icons/ai";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import Dropzone from "react-dropzone";

import axiosJWTRequest from "../utils/axiosJWTRequest";

const CreatePost = ({ user, userAuthAction }) => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState({ id: null, title: null });
  const [image, setImage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  //useEffect
  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/categories/all");
        setCategories(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong, please try later");
      }
      setLoading(false);
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    const onBodyClick = (event) => {
      if (!ref.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    //if options are showing, create event listener
    if (showOptions) document.body.addEventListener("click", onBodyClick);

    //cleanup function
    return () => {
      document.body.removeEventListener("click", onBodyClick);
    };
  }, [showOptions]);

  //useRef
  const ref = useRef();

  //helpers
  const logout = () => {
    localStorage.removeItem("user");
    userAuthAction(null);
    navigate("/login");
  };

  const dropzoneError=(code)=>{
    switch(code){
      case "file-invalid-type":
        return toast.error('invalid file type, must be: .png, .jpg, .jpeg, .webp or gif');
      case "file-too-large":
        return toast.error('File is too large, must be lower than 1MB');
      case "too-many-files":
        return toast.error('Files rejected : only one is accepted');
      default:
        return toast.error('Invalid file');
    }
  }

  const onFormSubmit = async (event) => {
    event.preventDefault();
    //checking
    if (title === "") return setInputError("title");
    if (!category.id) return setInputError("category");
    if (description === "" || description.length > 280)
      return setInputError("description");
    setInputError(null);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category.id);
      formData.append('description', description);
      if(image) formData.append('image', image);

      //prepare and config the request
      const response = await axiosJWTRequest(
        "post",
        "/api/posts/create",
        formData,
        user.accessToken,
        "multipart/form-data"
      );
      setLoading(false);
      setTitle("");
      setDescription("");
      setCategory({ id: null, title: null });
      setImage(null);
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

  const onOptionsClick = (id, title) => {
    setCategory({ id, title });
    setShowOptions(false);
  };

  const renderCategoryOptions = () => {
    return categories.map((item, index) => {
      let key =
        Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
      if (item._id !== category.id)
        return (
          <div
            key={key}
            className="py-2 pl-4 pr-6 cursor-pointer hover:bg-gray-100 capitalize"
            value={item._id}
            onClick={() => onOptionsClick(item._id, item.title)}
          >
            {item.title}
          </div>
        );
      return null;
    });
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="w-full lg:w-1/2 px-4 font-Recoleta mx-auto self-center my-4">
        <div className="px-6 lg:px-20 py-12 lg:py-24 bg-myblue rounded-lg">
          <form className="mb-2" onSubmit={(event) => onFormSubmit(event)}>
            <h3 className="mb-2 text-2xl font-bold font-heading text-center">
              Create a Post
            </h3>
            <p className="mb-4 text-center">Share your ideas to the world !</p>
            <div className="mb-4">
              <label htmlFor="title" className="text-xl font-semibold">
                Title
              </label>
              <input
                className={`w-full pl-4 pr-6 py-4 font-bold rounded focus:outline-none ${
                  inputError === "title" &&
                  "border-solid border-2 border-red-500"
                }`}
                type="text"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
              {/* Err msg*/}
              <div
                className={`text-red-500 mb-2 font-semibold ${
                  inputError !== "title" && "hidden"
                }`}
              >
                Title required
              </div>
            </div>
            <div className="mb-4 relative" ref={ref}>
              <div>
                <label className="text-xl font-semibold">Categories</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowOptions(!showOptions);
                  }}
                  className={`w-full flex justify-between pl-4 pr-6 py-4 font-bold rounded bg-white ${
                    inputError === "category" &&
                    "border-solid border-2 border-red-500"
                  }`}
                >
                  <span className="capitalize">
                    {category.title
                      ? category.title
                      : "Please select an category"}
                  </span>
                  <RiArrowDropDownLine size={24} />
                </button>
              </div>

              <div
                className={`${
                  !showOptions && "hidden"
                } origin-top-right absolute right-0 mt-2 w-full rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5`}
              >
                <div className="py-2 font-bold">{renderCategoryOptions()}</div>
              </div>
              {/* Err msg*/}
              <div
                className={`text-red-500 mb-2 font-semibold ${
                  inputError !== "category" && "hidden"
                }`}
              >
                Category is required
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="text-xl font-semibold">
                Description
              </label>
              <textarea
                name="description"
                className={`w-full pl-4 pr-6 py-4 font-bold rounded focus:outline-none ${
                  inputError === "description" &&
                  "border-solid border-2 border-red-500"
                }`}
                rows="5"
                cols="10"
                maxLength="280"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              ></textarea>
              {/* Err msg*/}
              <div
                className={`text-red-500 mb-2 font-semibold ${
                  inputError !== "description" && "hidden"
                }`}
              >
                Description required
              </div>
            </div>
            <div className="mb-4">
              {/* Image component */}
              <label className="text-xl font-semibold">
                Image
              </label>
              <div className="flex flex-col items-center border-2 rounded border-dashed bg-white text-gray-500">
                <Dropzone onDropAccepted={(acceptedFiles) => setImage(acceptedFiles[0])} onDropRejected={(rejectedFiles)=>dropzoneError(rejectedFiles[0].errors[0].code)} accept={{'image/*': ['.png', '.jpeg', '.jpg', '.gif', '.webp']}} maxFiles={1} maxSize={1000000} >
                  {({ getRootProps, getInputProps}) => {
                    return(<section className="w-full">
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p className="text-xl font-semibold cursor-pointer p-5 text-center">
                          Drag 'n' drop some files here, or click to select files
                        </p>
                      </div>
                    </section>)
                  }}
                </Dropzone>
                </div>
                {image&& <div className="mt-2">Accepted file : {image.name} | {Math.round(image.size*0.000001*100)/100} MB <AiFillCloseSquare className="inline-block align-sub cursor-pointer" size={20} onClick={()=>setImage(null)} /></div> }
            </div>
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

export default connect(mapStateToProps, { userAuthAction })(CreatePost);
