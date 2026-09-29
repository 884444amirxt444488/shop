import { useState } from "react";
import "./App.css";
import image from "./assets/images.jpg"
import { ShoppingCart, LogIn, Info, User, ShoppingBag, Menu, X } from "lucide-react";
import {Link} from "react-router-dom"


export default function Header() {

    const [mobile, setMobile] = useState(false)


    return (
        <header>
            <div className="header">

                <div className="header_logo">
                    <img src={image} alt="NONE" className="header_image" />
                    <p>HPXT</p>
                </div>


                <div className="burger">
                    <Menu onClick={() => setMobile(!mobile)} />
                </div>
                <div className="header_links">
                    <Link to={"/ShoppingCart"} className="header_link">Shop cart <span className="header_text"><ShoppingCart size={15} className="header_icon" /></span> </Link>
                    <Link to={"/"} className="header_link">Products <span className="header_text"><ShoppingBag size={15} className="header_icon" /></span> </Link>
                    <Link to={"/auth"} className="header_link">Auth <span className="header_text"><LogIn size={15} className="header_icon" /></span> </Link>
                    <Link to={"/aboutus"} className="header_link">About us <span className="header_text"><Info size={15} className="header_icon" /></span> </Link>
                </div>


                <div className="header_profile">
                    <Link to={"/profile"} className="prof_strage">
                        <User size={60} />
                        <p>Profile</p>
                    </Link>
                </div>




            </div>
            {
                mobile && (
                    <div className="header_mobile_link">
                        <button className="closeBtn" onClick={() => setMobile(false)}><X /> </button>
                        <Link to={"/ShoppingCart"} className="mobile_link">Shopping cart</Link>
                        <Link to={"/"} className="mobile_link">Products</Link>
                        <Link to={"/auth"} className="mobile_link">Auth</Link>
                        <Link to={"/aboutus"} className="mobile_link">About us</Link>
                        <Link to={"/profile"} className="mobile_link">Profile</Link>
                    </div>
                )
                    
            }
        </header>
        






    )



}








