import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import searchByCatReducer from "./reducers/searchByCatReducer"

const store= configureStore({
    reducer: {
        user: authReducer,
        cat: searchByCatReducer,
    }
});
export default store;