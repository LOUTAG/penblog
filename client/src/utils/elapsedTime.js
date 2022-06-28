import DateFormatter from "../utils/DateFormatter";

const elapsedTime=(time)=>{
    const timeConverted=Date.parse(time);
    //convert time into ms
    const elapsedSeconds = (Date.now()-timeConverted)/1000;
    //seconds
    if(elapsedSeconds<60) return "right now";
    
    //minutes
    if(elapsedSeconds<(60*60)){
        const minutes = parseInt(elapsedSeconds/(60));
        return minutes+" min";
    }

    //hours
    if (elapsedSeconds<(60*60*24)){
        const hours = parseInt(elapsedSeconds/(60*60));
        return hours+" h";
    };
    
    //days
    if(elapsedSeconds<(60*60*24*30)){
        const days = parseInt(elapsedSeconds/(60*60*24));
        return days+" d";
    };

    return DateFormatter(time);

    };
export default elapsedTime;