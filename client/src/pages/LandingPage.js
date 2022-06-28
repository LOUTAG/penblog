import React, {useEffect} from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = ({user}) => {
  const navigate=useNavigate();
  //redirect if already log
  useEffect(()=>{
    if(user) navigate('/home'); 
  },[])

  return (
    <section className="bg-primary min-h-screen flex justify-center items-center">
      <div className="relative container px-4 flex justify-center">
        <div className="flex flex-wrap items-center">
          <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
            <h2 className="max-w-2xl mt-12 mb-12 text-6xl 2xl:text-8xl text-myblack font-Recoleta font-bold font-heading">
              Pen down your ideas{" "}
              <span className="text-secondary">By creating a post</span>
            </h2>
            <div className="mb-12 lg:mb-16 2xl:mb-24 text-xl text-myblack font-semibold font-Recoleta">
                <p>Create posts to educate !</p>
                <p>Your post must be free from racism and unhealthy words</p>
            </div>
            <Link
              className="inline-block px-4 py-3 text-3xl text-myred font-bold font-Recoleta bg-tertiary hover:bg-myred hover:text-primary rounded-full transition duration-200"
              to="/login"
            >
              Login / Register
            </Link>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <lottie-player
              src="https://assets7.lottiefiles.com/packages/lf20_qi8dfrps.json"
              background="transparent"
              speed="1"
              loop
              autoplay
            ></lottie-player>
          </div>
        </div>
      </div>
    </section>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};
export default connect(mapStateToProps)(LandingPage);

