import './App.css'
import Footer from './footer'
import Header from './header'
import { Routes, Route  } from 'react-router-dom'
import Profile from './profile/profile'
import Signup from './auth/signup'
import Login from './auth/login'
import { Toaster } from 'sonner'
import { ProutecredRoutes } from './protected/Protecred'
import { AboutUs } from './aboutus/AboutUs'
import { ChangePassword } from './changePassword/changePass'
import { ForgottenPassword } from './ForgottenPassword/ForgottenPass'
import { Products } from './products/Products'
import ProductCart from './productcart/ProductCart'
import Payment from './payment/Payment'



function App() {

  return (
    <>
    <Toaster position='top-center' toastOptions={{
      classNames: {
        success: "success-message",
        error: "error-message",
      },
    }} />
    <Header />

    <Routes>
      <Route path={"/"} element={<Products />} />
      <Route path={"/signup"} element={<Signup />} />
      <Route path={"/auth"} element={<Login />} />
      <Route path={"/aboutus"} element={<AboutUs />} />
      <Route element={<ProutecredRoutes />}>
        <Route path={"/profile"} element={<Profile />} />
        <Route path={"/changePassword"} element={<ChangePassword />} />
        <Route path={"/forgottenPass"} element={<ForgottenPassword />} />
        <Route path={"/ShoppingCart"} element={<ProductCart />} />
        <Route path={"/PayMentSection"} element={<Payment />} />
      </Route>
    </Routes>


    <Footer />

    

    </>
  )
}

export default App
