import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import searchByCatReducer from "./reducers/searchByCatReducer";
import offsetReducer from "./reducers/offsetReducer";

const store= configureStore({
    reducer: {
        user: authReducer,
        cat: searchByCatReducer,
        offset: offsetReducer
    }
});
export default store;