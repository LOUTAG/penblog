import axios from "axios";
import store from "../store";
import { refreshAccessTokenAction } from "../actions";

const axiosJWTRequest = async (type, url, payload = false, token, contentType='application/json') => {
  //grab user state
  const state = store.getState();
  const user = state.user;

  //define the request type
  let instance;
  switch (type) {
    case "get":
      instance = axios.get;
      break;
    case "post":
      instance = axios.post;
      break;
    case "put":
      instance = axios.put;
      break;
    case "delete":
      instance = axios.delete;
      break;
    default:
      throw new Error('The request type is missing');
  }
  //config and send the request
  try {
    const response = payload
      ? await instance(url, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': contentType,
          },
        })
      : await instance(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    return response.data;
  } catch (error) {
    console.log(error);
    if (error?.response?.data?.name === "TokenExpiredError") {
      //accessToken expired : we're going to refresh it
      try {
        const response = await axios.get("/api/refresh-token", {
          headers: {
            Authorization: `Bearer ${user.refreshToken}`,
          },
        });
        const refreshAccessToken = response.data.refreshAccessToken;
        //request to refresh accessToken

        store.dispatch(refreshAccessTokenAction(refreshAccessToken));
        // update the store

        const userUpdated = { ...user, accessToken: refreshAccessToken };
        localStorage.setItem("user", JSON.stringify(userUpdated));
        //update the localStorage

        return axiosJWTRequest(type, url, payload, refreshAccessToken);
        //Resend original request with accessToken refreshed
      } catch (error) {
        console.log(error);
        if (
          error?.response?.data?.name === "InvalidUser" ||
          error?.response?.data?.name === "TokenExpiredError"
        ) {           
          throw error.response.data.name;
        }
        //wrong token, user doesn't exist..
        const message = error?.response?.data?.message;
        if (message) throw message;
        throw "Something went wrong, please try later";
      }
    } else {
        if(error?.response?.data?.name === "InvalidUser") throw error.response.data.name;
        const message = error?.response?.data?.message;
        if (message) throw message;
      throw "Something went wrong, please try later";
    }
  }
};
export default axiosJWTRequest;
