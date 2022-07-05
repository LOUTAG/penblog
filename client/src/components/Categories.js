import React,{useRef} from "react";
import { connect } from "react-redux";
import { searchByCategoryAction } from "../actions";

const Categories = ({
  categories,
  display,
  setDisplay,
  cat,
  searchByCategoryAction,
}) => {
  const categoryRef = useRef();
  //helpers
  const onScrollTouch = () => {
    categoryRef.current.style.overflowY==="scroll"?categoryRef.current.style.overflowY="hidden":categoryRef.current.style.overflowY="scroll";
  };

  const onCategoryClick = (id, title) => {
    if (id === null) return searchByCategoryAction(null);
    searchByCategoryAction({ id, title });
    if (display.categories) setDisplay({ ...display, categories: false });
  };
  const renderCategories = () => {
    return categories.map((category, index) => {
      let key =
        Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
      if (index === 0)
        return (
          <React.Fragment key={key}>
            <li
              className={`${
                cat === null && "bg-dark-primary"
              } text-xl rounded-lg font-semibold px-2 py-3 mr-1 capitalize cursor-pointer hover:bg-black-primary hover:shadow`}
              onClick={() => onCategoryClick(null, null)}
            >
              All
            </li>
            <li
              className={`${
                category._id === cat?.id && "bg-dark-primary"
              } text-xl rounded-lg font-semibold px-2 py-3 mr-1 capitalize cursor-pointer hover:bg-black-primary hover:shadow`}
              onClick={() => onCategoryClick(category._id, category.title)}
            >
              {category.title}
            </li>
          </React.Fragment>
        );
      return (
        <li
          key={key}
          className={`${
            category._id === cat?.id && "bg-dark-primary"
          } text-xl rounded-lg font-semibold px-2 py-3 mr-1 capitalize cursor-pointer hover:bg-black-primary hover:shadow`}
          onClick={() => onCategoryClick(category._id, category.title)}
        >
          {category.title}
        </li>
      );
    });
  };

  return (
    <div
      className={`${
        !display.categories
          ? "w-0"
          : "w-60 animate-widthGrow bg-primary z-20 shadow"
      } xl:w-60 2xl:w-[360px] font-Recoleta p-2 h-[calc(100vh-4rem)] 2xl:h-[calc(100vh-5rem)] flex flex-col fixed items-start left-0`}
    >
      <h2
        className={`${
          !display.categories ? "hidden" : "block"
        } text-2xl font-bold uppercase mb-2 p-2 xl:block`}
      >
        Categories
      </h2>
      <div
        ref={categoryRef}
        className="overflow-y-hidden overscroll-contain scroll-touch-effect hover:overflow-y-scroll scrollbar w-full"
        onTouchStart={() => onScrollTouch()}
        onTouchEnd={() => onScrollTouch()}
      >
        <ul>{renderCategories()}</ul>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    cat: state.cat,
  };
};
export default connect(mapStateToProps, { searchByCategoryAction })(Categories);
