import React, { useState, useEffect } from "react";
import axios from "axios";
import { connect } from "react-redux";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";
import Category from "../components/Category";
import { toast } from "react-toastify";

const Categories = () => {
  //states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  //useEffect
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/categories/all");
        setLoading(false);
        setCategories(response.data);
      } catch (error) {
        setLoading(false);
        toast.error("An error is appeared, please try later");
      }
    };
    fetchCategories();
  }, []);

  const renderCategories = () => {
    return categories.map((category, index) => {
      let key = Date.now() + "-" + Math.round(Math.random() * 20) + "-" + index;
      return (
        <Category
          key={key}
          id={category._id}
          createdAt={category.createdAt}
          title={category.title}
          setCategories={setCategories}
          categories={categories}
        />
      );
    });
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="w-full lg:w-1/2 px-4 font-Recoleta mx-auto self-center my-4">
        <h2 className="text-2xl font-bold text-center mb-8">Categories</h2>
        <ul className="list-none">
          <li className="uppercase tracking-wide bg-myblue rounded px-8 py-6 hidden sm:flex font-semibold mb-6 shadow-lg">
            <div className="w-1/3 text-center">Title</div>
            <div className="w-1/3 text-center">Create at</div>
            <div className="w-1/3 text-center">Actions</div>
          </li>
          {renderCategories()}
        </ul>
      </div>
    </Layout>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps)(Categories);
