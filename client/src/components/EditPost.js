import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { userAuthAction } from "../actions";
import {useNavigate} from "react-router-dom";
import Dropzone from "react-dropzone";
import { toast } from "react-toastify";
import { AiFillCloseSquare } from "react-icons/ai";
import axiosJWTRequest from "../utils/axiosJWTRequest";
import Spinner from "./Spinner";

const EditPost = ({ user, post, posts, setPosts, setEdit, userAuthAction }) => {
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log(image);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [description]);

  //helpers
  const onFormSubmit = async (event) => {
    event.preventDefault();
    if (title === "") return toast.error("Title cannot be empty");
    if (description === "") return toast.error("Description cannot be empty");
    try {
      setLoading(true);
      //Create FormData Object
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image) formData.append("image", image);

      //prepare & config the request
      const response = await axiosJWTRequest(
        "put",
        `/api/posts/${post._id}`,
        formData,
        user.accessToken,
        "multipart/form-data"
      );
      setLoading(false);
      console.log(response);
      setPosts(posts.map(item=>item._id===post._id?response:item));
      setEdit(false);
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
  };

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("user");
    userAuthAction(null);
  };

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

  const onFileAccepted = (acceptedFile) => {
    setImage(acceptedFile);
    setPreview(URL.createObjectURL(acceptedFile));
  };

  const onDeleteClick = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <form className="flex flex-col my-2">
      {loading && <Spinner />}
      <div className="px-4">
        <input
          className="font-bold text-xl placeholder:text-gray-500"
          placeholder="Edit your title..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          placeholder="Edit your description..."
          ref={ref}
          className="overflow-auto resize-none w-full rounded placeholder:text-gray-500"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        ></textarea>
        <div className="flex flex-col items-center border-2 rounded border-dashed bg-white text-gray-500">
          <Dropzone
            onDropAccepted={(acceptedFiles) => onFileAccepted(acceptedFiles[0])}
            onDropRejected={(rejectedFiles) =>
              dropzoneError(rejectedFiles[0].errors[0].code)
            }
            accept={{ "image/*": [".png", ".jpeg", ".jpg", ".gif", ".webp"] }}
            maxFiles={1}
            maxSize={1000000}
          >
            {({ getRootProps, getInputProps }) => {
              return (
                <section className="w-full">
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p className="text-xl font-semibold cursor-pointer p-5 text-center">
                      Drag 'n' drop some files here, or click to select files
                    </p>
                  </div>
                </section>
              );
            }}
          </Dropzone>
        </div>
        {image && (
          <div className="mt-2">
            Accepted file : {image.name} |{" "}
            {Math.round(image.size * 0.000001 * 100) / 100} MB{" "}
            <AiFillCloseSquare
              className="inline-block align-sub cursor-pointer"
              size={20}
              onClick={() => onDeleteClick()}
            />
          </div>
        )}
      </div>
      {preview ? (
        <div className="my-2">
          <img className="max-w-full h-auto mx-auto max-h-[650px]" src={preview} alt="preview" />
        </div>
      ) : (
        post?.image && (
          <div className="my-2">
            <img className="max-w-full h-auto mx-auto" src={post.image} alt={post.title} />
          </div>
        )
      )}
      <div className="flex items-center justify-center my-2 px-4">
        <button
          type="submit"
          className="text-lg font-semibold py-1 px-2 w-20 rounded bg-secondary hover:opacity-90 text-white mr-4"
          onClick={(event) => onFormSubmit(event)}
        >
          Edit
        </button>
        <button
          type="reset"
          className="text-lg font-semibold py-1 px-2 w-20 rounded bg-gray-500 hover:opacity-90 text-white"
          onClick={() => setEdit(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, {userAuthAction})(EditPost);
