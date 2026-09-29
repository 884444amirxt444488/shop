import e from "express"
import { add_product_to_cart, delete_all_products, delete_one_product, get_products_cart } from "../controllers/product_cart.js"
import { verifyAccessToken } from "../authenticate/verifyTokens.js"


const router = e.Router()


router.post("/addProductToCart", verifyAccessToken, add_product_to_cart)
router.get("/getProductCart", verifyAccessToken, get_products_cart)
router.delete("/deleteProductCart", verifyAccessToken, delete_one_product)
router.delete("/deleteAllProducts", verifyAccessToken, delete_all_products)








export default router













