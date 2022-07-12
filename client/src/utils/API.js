/*** axios interceptor ***/
import axios from "axios";
import store from "../store";
import { refreshAccessTokenAction } from "../actions";

//grab user state
const state = store.getState();
const user = state?.user;
console.log(user);
const accessToken = user?.accessToken;
const refreshToken = user?.refreshToken;

const instance = axios.create({
  baseURL: "/api",
});
instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`; //by default attach accessToken
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log(error);
    const originalRequest = error.config; //on récupère la requête de base
    if (
      error?.response?.data?.name === "TokenExpiredError" &&
      error.config.url !== "/refresh-token" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; //our next request is a retry
      instance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${refreshToken}`; //attach refreshToken
      await instance
        .get("/refresh-token")
        .then((response) => {
          const refreshAccessToken = response.data.refreshAccessToken;
          //request to refresh accessToken

          store.dispatch(refreshAccessTokenAction(refreshAccessToken));
          // update the store

          const userUpdated = { ...user, accessToken: refreshAccessToken };
          localStorage.setItem("user", JSON.stringify(userUpdated));
          //update the localStorage

          instance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${refreshAccessToken}`;
          //attach the new accessToken for the next time
          originalRequest.headers["Authorization"] = `Bearer ${refreshAccessToken}`;
          //quand nous allons executer une nouvelle fois la requete avec le token mis à jours
        })
        .catch((error) => {
          if (
            error?.response?.data?.name === "InvalidUser" ||
            error?.response?.data?.name === "TokenExpiredError"
          ) {
            throw error.response.data.name;
          }
          //wrong token, user doesn't exist..
          const message = error?.response?.data?.message;
          if (message) throw message;
          throw new Error("Something went wrong, please try later");
        });
        return instance(originalRequest);
          //Resend original request with accessToken refreshed
    } else {
      if (error?.response?.data?.name === "InvalidUser")
        throw error.response.data.name;
      const message = error?.response?.data?.message;
      if (message) throw message;
      throw new Error("Something went wrong, please try later");
    }
  }
);
export default instance;
