const searchByCatReducer =(state=null, action)=>{
    switch(action.type){
        case 'SEARCH_BY_CAT':
            return action.payload;
        default:
            return state;
    };
};
export default searchByCatReducer;