import Header from './Header';
import Footer from './Footer';

const Layout=({children})=>{
    return(
        <div className='layout bg-primary'>
            <Header />
            <div className="content flex flex-wrap pt-16 2xl:pt-20 overflow-x-hidden min-h-screen">
                {children}
            </div>
            {/* <Footer /> */}
        </div>
    )
}
export default Layout;