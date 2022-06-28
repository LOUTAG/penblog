import React, { useState, useEffect } from "react";

//components
import Layout from "../components/Layout";
import Posts from "../components/Posts";
import Users from "../components/Users";
import Categories from "../components/Categories";
import Spinner from "../components/Spinner";

//store
import { connect } from 'react-redux';

//axios
import axios from "axios";

//toastify
import { toast } from "react-toastify";

const Home = ({cat}) => {
  //state
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState({ categories: false, users: false });
  //useEffect
  useEffect(() => {
    const fetchCategories = async () => {
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
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      if(!cat) {
        try{
          const response = await axios.get("/api/posts");
          setPosts(response.data);
        }catch(error){
          console.log(error);
        toast.error("Something went wrong, please try later");
        }
      }else{
        try{
          const response = await axios.get(`/api/posts/cat/${cat.id}`);
          setPosts(response.data);
        }catch(error){
          console.log(error);
        toast.error("Something went wrong, please try later");
        }
      }
      setLoading(false);
    };
    fetchPosts();
  }, [cat]);

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="flex flex-row flex-wrap w-full relative items-start justify-between overflow-y-hidden">
        {/* widget */}
        <div className="w-full flex justify-center">
          <div
            className={`flex w-[744px] px-2 md:px-8 items-center justify-center font-Recoleta ${
              (display.categories || display.users) && "invisible"
            } xl:hidden`}
          >
            <button
              className="py-1 px-2 w-1/2 bg-dark-primary rounded mr-1 font-semibold uppercase hover:bg-[#90816b] hover:text-white"
              onClick={() =>
                !display.categories &&
                setDisplay({ categories: true, users: false })
              }
            >
              Categories
            </button>
            <button
              className="py-1 px-2 w-1/2 bg-dark-primary ml-1 rounded font-semibold uppercase hover:bg-[#90816b] hover:text-white"
              onClick={() =>
                !display.users && setDisplay({ categories: false, users: true })
              }
            >
              Users
            </button>
          </div>
        </div>
        {/* categories */}
        <Categories
          categories={categories}
          display={display}
          setDisplay={setDisplay}
        />
        {/* feed */}
        <div className={`${display.categories&&"animate-horizontal translate-x-60"} ${display.users&&"animate-reverseHorizontal -translate-x-60"} w-[744px] font-Recoleta py-2 md:px-8 h-full overflow-y-hidden flex flex-col mx-auto`} onClick={()=>(display.users || display.categories) && setDisplay({categories: false, users: false}) }>
          <h2 className="text-2xl font-bold uppercase mb-2 p-2 w-full text-center">
            {cat?`Post Category : ${cat.title}`:"Latest Posts"}
          </h2>
          <Posts
          posts={posts}
          setPosts={setPosts}
        />
        </div>
        {/* users */}
        <Users display={display} setDisplay={setDisplay} />
      </div>
    </Layout>
  );
};
const mapStateToProps=(state)=>{
  return {
    cat: state.cat
  };
};
export default connect(mapStateToProps)(Home);
