const initialState = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "USER_AUTH":
      return action.payload;
    case "REFRESH_ACCESS_TOKEN":
      return {...state, accessToken: action.payload}
    case "UPDATE_PROFILE_PHOTO":
      return {...state, profilePhoto: action.payload.profilePhoto, profilePhotoId: action.payload.profilePhotoId}
    default:
      return state;
  }
};
export default authReducer;
