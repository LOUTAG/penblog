import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";

import Post from "../components/Post";
import Users from "../components/Users";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/posts");
        setPosts(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong, please try later");
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);
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

  //helpers
  const renderCategories = () => {
    return categories.map((category, index) => {
      let key =
        Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
      return (
        <li
          key={key}
          className="text-xl rounded-lg font-semibold px-2 py-3 mr-1 capitalize cursor-pointer hover:bg-dark-primary hover:shadow"
        >
          {category.title}
        </li>
      );
    });
  };
  const renderPosts = () => {
    return posts.map((post, index) => {
      let key =
        Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
      return <Post key={key} post={post} posts={posts} setPosts={setPosts} />;
    });
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="flex w-full relative items-start justify-between">
        {/* categories */}
        <div className="w-0 lg:w-[360px] font-Recoleta p-2 h-[calc(100vh-4rem)] 2xl:h-[calc(100vh-5rem)] flex flex-col fixed items-start left-0">
          <h2 className="text-2xl font-bold uppercase mb-2 p-2 hidden lg:block ">Categories</h2>
          <div className="overflow-y-hidden hover:overflow-y-scroll scrollbar w-full">
            <ul>{renderCategories()}</ul>
          </div>
        </div>
        <div className="w-[744px] font-Recoleta py-2 md:px-8 h-full overflow-y-hidden flex flex-col mx-auto">
          <h2 className="text-2xl font-bold uppercase mb-2 p-2 w-full text-center">
            Latest post
          </h2>
          <div className="feed">{renderPosts()}</div>
        </div>
        <div className="w-0 2xl:w-[360px] font-Recoleta p-2 h-[calc(100vh-4rem)] 2xl:h-[calc(100vh-5rem)] flex flex-col fixed items-start right-0">
          <h2 className="text-2xl font-bold uppercase mb-2 p-2">Users</h2>
          <div className="overflow-y-hidden hover:overflow-y-scroll scrollbar w-full">
            <Users />
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Posts;
