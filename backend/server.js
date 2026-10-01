import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import router from "./routes/auth_route.js"
import router2 from "./routes/product_route.js"
import router3 from "./routes/product_cart_route.js"
import router4 from "./routes/payments_route.js"


import dotenv from "dotenv"

dotenv.config()


const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())


app.use(router)
app.use(router2)
app.use(router3)
app.use(router4)


app.listen(3000, () => {
    console.log(`Server is runing on port 3000`)
})




