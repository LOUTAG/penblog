import React,{useState, useEffect, useRef} from "react";
import { Link } from 'react-router-dom';
import { HiOutlineSearch } from "react-icons/hi";
import axios from "axios";

const SearchUSer=()=>{
    const [term, setTerm]=useState('');
    const [users, setUsers]=useState([]);
    const [displayUsers, setDisplayUsers]=useState(false);
    const ref = useRef();

    useEffect(()=>{
        const onBodyClick=(event)=>{
            if(!ref.current.contains(event.target)) return setDisplayUsers(false);
        }
        if(displayUsers){
            document.body.addEventListener('click', onBodyClick);
        }
        return ()=>{
            document.body.removeEventListener('click', onBodyClick);
        }
    })

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(term !==''){
                const searchUsers=async()=>{
                    const response = await axios.post('/api/users/search', {term: term});
                    setUsers(response.data);
                };
                searchUsers();
            };
        }, 500);
        return ()=>{
            clearTimeout(timer);
        }
    },[term]);

    //helpers
    const renderUsers=()=>{
        if(term==="") return;
        if(users.length===0) return <li className="text-xl rounded-lg font-semibold px-2 py-3 capitalize ml-7">No user found</li>;
        return users.map((item, index) => {
            let key = Date.now() + "-" + index;
            return (
              <li key={key}>
                <Link
                  className="text-xl rounded-lg font-semibold px-2 py-3 capitalize cursor-pointer hover:bg-dark-primary flex items-center hover:shadow"
                  to={`/profile/${item._id}`}
                >
                  <div className="mr-2 w-8 shrink-0">
                    <div className="rounded-full">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={item.profilePhoto}
                        alt={item.lastName}
                      />
                    </div>
                  </div>
                  <span>
                    {item.firstName} {item.lastName}
                  </span>
                </Link>
              </li>
            );
          });
    }

    //render
    return(
        <React.Fragment>
        <form ref={ref} className="bg-dark-primary w-[calc(100%-0.25rem)] rounded-2xl flex items-center px-3 relative" onSubmit={(event)=>event.preventDefault()}>
          <HiOutlineSearch className="mr-2 text-black-primary text-xl xl:text-2xl 2xl:text-3xl" />
          <input
            type="text"
            className="focus:outline-none capitalize bg-dark-primary font-semibold rounded-2xl py-2 placeholder:text-black-primary text-xl xl:text-2xl 2xl:text-3xl"
            placeholder="Search..."
            value={term}
            onChange={(event) => setTerm(event.target.value.toLowerCase())}
            onClick={()=>setDisplayUsers(true)}
          />
          {displayUsers && <div className="absolute top-[100%] right-0 bg-white rounded-md shadow-lg animate-appear w-full"><ul>{renderUsers()}</ul></div>}
        </form>
        </React.Fragment>
     );
}
export default SearchUSer;