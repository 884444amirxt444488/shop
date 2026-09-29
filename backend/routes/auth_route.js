import express from "express"
import { deleteProfile, editProfile, login, logOut, profile, rating, refreshToken, signup, ChagePassword, getEmailPassword, changeForgottenPassword } from "../controllers/auth.js"
import { verifyAccessToken, verifyRefreshToken } from "../authenticate/verifyTokens.js"


const router = express.Router()


router.post("/signup", rating ,signup)
router.post("/login", rating, login)
router.get("/profile", verifyAccessToken, profile)
router.patch("/editProfile", verifyAccessToken, editProfile)
router.delete("/deleteProfile", verifyAccessToken, deleteProfile)
router.post("/logout", verifyAccessToken, logOut)
router.post("/refreshToken", verifyRefreshToken, refreshToken)
router.patch("/editPassword", verifyAccessToken, ChagePassword)
router.post("/getEmailCode", getEmailPassword)
router.patch("/changeForgottenPassword", changeForgottenPassword)











export default router








