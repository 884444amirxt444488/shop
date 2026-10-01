import {pool} from "../Pool/pool.js"

class AppError extends Error {
    constructor(message, statusCode) {
        super(message),
        this.statusCode = statusCode
    }
}


export async function add_product_to_cart(req, res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login. login please"})
    }
    const {products} = req.body
    if (!products || !Array.isArray(products) || products.length === 0 || products.length > 20) {
        return res.status(400).json({message: "Invalid req"})
    }
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        let totalPrice = 0
        for (const item of products) {
            const {productid, productstock} = item
            if (!productid || !Number.isInteger(productid) || productid <= 0 || !productstock || !Number.isInteger(productstock) || productstock <= 0) {
                throw new AppError("Invalid reqs", 400)
            } 
            const productExists = await client.query("SELECT * FROM products WHERE id = $1", [productid])
            if (productExists.rows.length === 0) {
                throw new AppError("Products not found", 404)
            }
            let userOrderdCart = await client.query("SELECT * FROM orders WHERE userid = $1 AND productid = $2", [id, productid])
            if (userOrderdCart.rows.length === 0) {
                userOrderdCart = await client.query("INSERT INTO orders(userid, productid, productname, productstock, productprice) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, productid, productExists.rows[0].productname, productstock, productExists.rows[0].productprice])
                if (userOrderdCart.rows.length === 0) {
                    throw new AppError("Somthing went wrong. please try again", 500)
                }
                totalPrice += productExists.rows[0].productprice * userOrderdCart.rows[0].productstock
            }
            else {
                userOrderdCart = await client.query("UPDATE orders SET productstock = $1, productprice = $2 WHERE userid = $3 AND productid = $4 RETURNING *", [productstock, productExists.rows[0].productprice, id, productid])
                if (userOrderdCart.rows.length === 0) {
                    throw new AppError("Somthing went wrong. please try again", 500)
                }
                totalPrice += productExists.rows[0].productprice * userOrderdCart.rows[0].productstock
            }
        }
        const userPayment = await client.query("SELECT * FROM payment WHERE userid = $1", [id])
        if (userPayment.rows.length === 0) {
            const SetPayment = await client.query("INSERT INTO payment(userid, totalprice) VALUES($1, $2) RETURNING *", [id, totalPrice])
            if (SetPayment.rows.length === 0) {
                throw new AppError("Somthing went wrong. please try again", 500)
            }
        }
        else {
            const updateUserPayment = await client.query("UPDATE payment SET totalprice = $1 WHERE userid = $2 RETURNING *", [totalPrice, id])
            if (updateUserPayment.rows.length === 0) {
                throw new AppError("Somthing went wrong. please try again", 500)
            }
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Products saved successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({message: err.message})
        }
        console.error(`Error to add product to user cart: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        client.release()
    }   
}

export async function get_products_cart(req, res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login. login first"})
    }
    try {
        const allUserProductsCart = await pool.query(
            "SELECT * FROM orders WHERE userid = $1", [id]
        )
        if (allUserProductsCart.rows.length === 0) {
            return res.status(200).json({products_user_cart: allUserProductsCart.rows})
        }
        let totalPrice = 0
        for (let i=0; i<allUserProductsCart.rows.length; i++) {
            let OneProductTotalPrice = allUserProductsCart.rows[i].productprice * allUserProductsCart.rows[i].productstock;
            totalPrice += OneProductTotalPrice
        }
        res.status(200).json({products_user_cart: allUserProductsCart.rows, totalPrice})
    }
    catch (err) {
        console.error(`AppError to get product cart: `, err)
        res.status(500).json({message: "AppError from server. try again please"})
    }
}

export async function delete_one_product(req, res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login. login first"})
    }
    const {productid} = req.body
    if (!productid || !Number.isInteger(productid) || productid <= 0) {
        return res.status(400).json({message: "Invalid req"})
    }

    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const productExists = await client.query("SELECT * FROM products WHERE id = $1", [productid])
        if (productExists.rows.length === 0) {
            throw new AppError("Not found", 404)
        }
        const deleteFromUserCart = await client.query("DELETE FROM orders WHERE userid = $1 AND productid = $2 RETURNING *", [id, productid])
        if (deleteFromUserCart.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(200).json({message: "Deleted successfully"})
        }
        const mainPrice = deleteFromUserCart.rows[0].productstock * deleteFromUserCart.rows[0].productprice
        const updateUserPayment = await client.query("UPDATE payment SET totalprice = totalprice - $1 WHERE userid = $2 RETURNING *", [mainPrice, id])
        if (updateUserPayment.rows.length === 0) {
            throw new AppError("Somthing went wrong. please try again", 500)
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Deleted successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({message: err.message})
        }
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        client.release()
    }
}
export async function delete_all_products(req, res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login. login please"})
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        const allProductsInUserCart = await client.query("SELECT * FROM orders WHERE userid = $1", [id])
        if (allProductsInUserCart.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(200).json({message: "Your shopping cart is empty"})
        } 
        const deleteProductFromUserCart = await client.query("DELETE FROM orders WHERE userid = $1 RETURNING *", [id])
        if (deleteProductFromUserCart.rows.length === 0) {
            throw new AppError("Somthing went wrong. please try again", 500)
        }
        const deletePayment = await client.query("DELETE FROM payment WHERE userid = $1 RETURNING *", [id])
        if (deletePayment.rows.length === 0) {
            throw new AppError("Somthing went wrong.please try again", 500)
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Your shopping cart is empty"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({message: err.message})
        }
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        client.release()
    }



    
}


/*
export async function add_product_to_cart(req , res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login"})
    }
    const {productid, productstock} = req.body
    if (!productid || productid <= 0 || !Number.isInteger(productid) || productstock <= 0 || !Number.isInteger(productstock)) {
        return res.status(400).json({message: "Invalid req"})
    }
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const productExists = await client.query(
            "SELECT * FROM products WHERE id = $1 FOR UPDATE", [productid]
        )
        if (productExists.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "This product is not found"})
        }
        const productname = productExists.rows[0].productname
        const productprice = productExists.rows[0].productprice
        if (productExists.rows[0].productstock < productstock) {
            await client.query("ROLLBACK")
            return res.status(409).json({message: `Sorry! avalible is ${productExists.rows[0].productstock}`})
        }
        const realStock = productExists.rows[0].productstock - productstock
        const update_products_table = await client.query(
            "UPDATE products SET productstock = $1 WHERE id = $2 RETURNING *", [realStock, productid]
        )
        if (update_products_table.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(409).json({message: "Shomthing went wrong. try again"})
        }
        let saveCart = await client.query(
            "SELECT * FROM products_cart WHERE userid = $1 AND productid = $2", [id, productid]
        )
        if (saveCart.rows.length === 0) {
            saveCart = await client.query(
                "INSERT INTO products_cart(userid, productid, productname, productstock, productprice) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, productid, productname, productstock, productprice]
            )
            if (saveCart.rows.length === 0) {
                await client.query("ROLLBACK")
                return res.status(409).json({message: "Somthing went wrong. try again"})
            }
        }
        else {
            const realProductStock2 = saveCart.rows[0].productstock + productstock
            saveCart = await client.query(
                "UPDATE products_cart SET productstock = $1, productprice = $2 WHERE userid = $3 AND productid = $4 RETURNING *", [realProductStock2, productprice, id, productid]
            )
            if (saveCart.rows.length === 0) {
                await client.query("ROLLBACK")
                return res.status(409).json({message: "Somthing went wrong. try again"})
            }
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Product added successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.AppError(`AppError to add product: `, err)
        res.status(500).json({message: "AppError from server. please try later"})
    }
    finally {
        client.release()
    }
}
*/

/*
export async function edit_product_stock(req, res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login. login first"})
    }
    const {productid, productstock} = req.body
    if (!productid || productid <= 0 || !Number.isInteger(productid) || productstock <= 0 || !Number.isInteger(productstock)) {
        return res.status(400).json({message: "Invalid properties"})
    }
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const productExists = await client.query(
            "SELECT * FROM products WHERE id = $1 FOR UPDATE", [productid]
        )
        if (productExists.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(400).json({message: "Product not found."})
        }
        const usersCart = await client.query(
            "SELECT * FROM products_cart WHERE userid = $1 AND productid = $2", [id, productid]
        )
        if (usersCart.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(400).json({message: "User do not have cart"})
        }
        const productstockBefor = usersCart.rows[0].productstock

        const mainStockOrdered = productstock - productstockBefor

        if (productExists.rows[0].productstock < mainStockOrdered) {
            await client.query("ROLLBACK")
            return res.status(400).json({message: `Sorry! Avalible is: ${productExists.rows[0].productstock}`})
        }
        const newValueOfProducts = productExists.rows[0].productstock - mainStockOrdered
        const editProducts = await client.query(
            "UPDATE products SET productstock = $1 WHERE id = $2 RETURNING *", [newValueOfProducts, productid]
        )
        if (editProducts.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(400).json({message: "Somthing went wrong. please try again1"})
        }
        const newValueOfUserCart = productstock
        const editUserCart = await client.query(
            "UPDATE products_cart SET productstock = $1 WHERE userid = $2 AND productid = $3 RETURNING *", [newValueOfUserCart, id, productid]
        )
        if (editUserCart.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(400).json({message: "Somthing went wrong. please try again"})
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Cart updated successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.AppError(`AppError to edit product stock: `, err)
        res.status(500).json({message: "AppError from server. pelase try later"})
    }
    finally {
        client.release()
    }
}

*/







