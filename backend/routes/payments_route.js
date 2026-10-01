import e from "express"
import { FinalPay, GetUUid } from "../controllers/payment.js"
import { verifyAccessToken } from "../authenticate/verifyTokens.js"


const router = e.Router()


router.post("/getUUid", verifyAccessToken, GetUUid)
router.post("/FinallyPayment", verifyAccessToken, FinalPay)



export default router













