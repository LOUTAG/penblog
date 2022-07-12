import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";

const AccountVerification = (user) => {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [expired, setExpired] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const token = useParams().token;
  const navigate = useNavigate();

  //useEffect
  useEffect(() => {
    if (user?._id) navigate("/home");
    const verifyAccount = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/verify-account/${token}`);
        toast.success(response.data);
        console.log(response);
        setLoading(false);
        setValidated(true);
      } catch (error) {
        console.log(error);
        setLoading(false);
        if (error.response.data.message=== "alreadyVerified") {
          setAlreadyVerified(true);
        }else if (error.response.data.message=== "tokenExpired"){
            setExpired(true);
        }else{

        }
      }
    };
    verifyAccount();
  }, []);
  //helpers
  const renderContent = () => {
    if (validated) {
      return (
        <>
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold pb-2">
            Verify with success
          </h2>
          <p className="pb-4 text-xl xl:text-2xl 2xl:text-3xl">
            Your email address has been verify with success, you can now login
            and access to our website
          </p>
          <div className="text-right">
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-secondary text-white font-semibold text-xl xl:text-2xl 2xl:text-3xl"
            >
              Login
            </Link>
          </div>
        </>
      );
    } else if (alreadyVerified) {
      return (
        <>
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold pb-2">
            Account already verified
          </h2>
          <p className="pb-4 text-xl xl:text-2xl 2xl:text-3xl">
            Your email address has already been verify, you can login and access
            to our website
          </p>
          <div className="text-right">
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-secondary text-white font-semibold text-xl xl:text-2xl 2xl:text-3xl"
            >
              Login
            </Link>
          </div>
        </>
      );
    } else if (expired) {
      return (
        <>
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold pb-2">
            Link is expired...
          </h2>
          <p className="pb-4 text-xl xl:text-2xl 2xl:text-3xl">
            Your verification link is expired, please login to generate a new
            one. Link is expired after 15 minutes.
          </p>
          <div className="text-right">
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-secondary text-white font-semibold text-xl xl:text-2xl 2xl:text-3xl"
            >
              Login
            </Link>
          </div>
        </>
      );
    } else if (!isMounted) {
        <>
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold pb-2">
            Loading to verify your account
          </h2>
          <p className="pb-4 text-xl xl:text-2xl 2xl:text-3xl">
            It may take a few seconds...
          </p>
          <Link
              to="/login"
              className="inline-block py-2 px-4 bg-secondary text-white font-semibold text-xl xl:text-2xl 2xl:text-3xl"
            >
              Login
            </Link>
        </>
    } else {
        <>
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-semibold pb-2">
            An error is appeared
          </h2>
          <p className="pb-4 text-xl xl:text-2xl 2xl:text-3xl">
            Please try to login again to generate a new link
          </p>
        </>
    }
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="bg-primary overflow-hidden min-h-screen flex justify-center items-center flex-wrap">
        <div className="font-Recoleta basis-full self-start">
          <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-secondary p-2">
            <a href="/home">PenBlog</a>
          </h1>
        </div>
        <div className="font-Recoleta basis-3/4 max-w-fit self-start p-2">
          {renderContent()}
        </div>
      </div>
    </>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps)(AccountVerification);
