
import { Link } from "react-router-dom"
import { Sparkles, Orbit, Component, Scan } from "lucide-react"

export default function Footer() {

    return (
        <div className="footer">
            <h3>XT SHOP</h3>
            <p>The best shop in the world. even better than Amazon or dgkala</p>
            <h4>I realy apreciate that you come and visite to our site. thats why i gonna send a code to you that send in every product cart and get an off <Link className="footer_links" to={"/getCode"}>Click here</Link></h4>
            <h3>My mind is It is the best ui/ux in the world</h3>
            <div className="footer_icons">
                <Sparkles className="footer_icon" />
                <Orbit className="footer_icon" />
                <Component className="footer_icon" />
                <Scan className="footer_icon" />
            </div>
        </div>
    )

    



}











