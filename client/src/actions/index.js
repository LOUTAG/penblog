export const userAuthAction = (data) => {
  return {
    type: 'USER_AUTH',
    payload: data
  }
};
export const refreshAccessTokenAction= (refreshAccessToken)=>{
  return{
    type: 'REFRESH_ACCESS_TOKEN',
    payload: refreshAccessToken
  }
};
export const updateProfilePhotoAction = (profilePhoto)=>{
  return{
    type: 'UPDATE_PROFILE_PHOTO',
    payload: profilePhoto
  }
}

export const searchByCategoryAction=(category)=>{
  return{
    type: 'SEARCH_BY_CAT',
    payload: category
  }
}