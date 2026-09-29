import e from "express"
import { addProduct, deleteProduct, editProducts, getAllProducts, getAmazingProducts, getOneProduct } from "../controllers/products.js"

const router2 = e.Router()


router2.post("/addProduct", addProduct)
router2.get("/getAllProducts", getAllProducts)
router2.get("/amazingproducts", getAmazingProducts)
router2.get("/getOneProduct/:id", getOneProduct)
router2.patch("/editProduct/:id", editProducts)
router2.delete("/deleteProduct/:id", deleteProduct)



export default router2





