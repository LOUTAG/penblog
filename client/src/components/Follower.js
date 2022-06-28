import React from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";

const Follower = ({ follower, myProfile}) => {
  return (
    <div className="flex items-center my-4 justify-between">
      <div className="flex items-center">
      <div className="mr-2">
        <Link className="rounded-full" to={`/profile/${follower.id}`} >
          <img
            className="h-12 w-12 rounded-full"
            src={follower.profilePhoto}
            alt={follower.lastName + " profile picture"}
          />
        </Link>
      </div>
      <Link className="text-lg font-bold" to={`/profile/${follower.id}`}>
        {follower.firstName} {follower.lastName}
      </Link>
      </div>
      <div className="w-[40%] flex justify-end">
        {myProfile&&<button className="text-sm sm:text-base py-1 px-2 bg-dark-primary h-fit rounded font-semibold mr-2 sm:mr-0">
        <FiMail className="inline-block" /> Send Message
      </button>}
      </div>
    </div>
  );
};
export default Follower;
