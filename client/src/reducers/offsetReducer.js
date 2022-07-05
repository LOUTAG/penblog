const initialState = 0 
const offsetReducer = (state=initialState, action)=>{
    switch(action.type){
        case 'POST_OFFSET':
            return action.payload;
        default :
            return state;
    }
}
export default offsetReducer;