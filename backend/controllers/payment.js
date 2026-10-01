import { pool } from "../Pool/pool.js";
import crypto from "crypto"


export async function GetUUid(req , res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid req"})
    }
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const user = await client.query("SELECT * FROM users WHERE id = $1", [id])
        if (user.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "User not found"})
        }
        const totalPrice = await client.query("SELECT * FROM payment WHERE userid = $1", [id])
        if (totalPrice.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "Nothing to buy"})
        }
        const sessionId = crypto.randomUUID()
        const userHasDB = await client.query("SELECT * FROM pay_status WHERE userid = $1", [id])
        if (userHasDB.rows.length === 0) {
            const AddDB = await client.query("INSERT INTO pay_status(userid, uuid, amount) VALUES($1, $2, $3) RETURNING *", [id, sessionId, totalPrice.rows[0].totalprice])
            if (AddDB.rows.length === 0) {
                await client.query("ROLLBACK")
                return res.status(500).json({message: "Somthing went wrong. please try again"})
            }
        }
        else {
            const editDB = await client.query("UPDATE pay_status SET uuid = $1, amount = $2 WHERE userid = $3 RETURNING *", [sessionId, totalPrice.rows[0].totalprice, id])
            if (editDB.rows.length === 0) {
                await client.query("ROLLBACK")
                return res.status(500).json({message: "Somthing went wrong. please try again"})
            }
        }
        
        await client.query("COMMIT")
        res.status(200).json({message: "Code send successfully", sessionId, totalPrice: totalPrice.rows[0].totalprice})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to get sessionId: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        client.release()
    }
}

export async function FinalPay(req, res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Invalid login. login first"})
    }
    const {uuid} = req.body
    if (!uuid) {
        return res.status(400).json({message: "Invalid req"})
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        const paymentId = await client.query("DELETE FROM pay_status WHERE userid = $1 AND uuid = $2 RETURNING *", [id, uuid])
        console.log(paymentId.rows)
        if (paymentId.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "Icorrect uuid"})
        }
        const deletePayment = await client.query("DELETE FROM payment WHERE userid = $1 RETURNING *", [id])
        if (deletePayment.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(500).json({message: "Somthing went wrong. please try again"})
        }
        const deleteShoppingCart = await client.query("DELETE FROM orders WHERE userid = $1 RETURNING *", [id])
        if (deleteShoppingCart.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(500).json({message: "Sonthing went wrong. please try again"})
        }
        for (const item of deleteShoppingCart.rows) {
            const {productid, productstock} = item
            const productExists = await client.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [productid])
            if (productExists.rows.length === 0) {
                await client.query("ROLLBACK")
                return res.status(404).json({message: "Product not found"})
            }
            if (productExists.rows[0].productstock < productstock) {
                await client.query("ROLLBACK")
                return res.status(409).json({message: `Sorry! Avalible is ${productExists.rows[0].productstock}`})
            }
            const updateProducts = await client.query("UPDATE products SET productstock = productstock - $1 WHERE id = $2 RETURNING *", [productstock, productid])
            if (updateProducts.rows.length === 0) {
                await client.query("ROLLBACK")
                return res.status(500).json({message: "Somthing went wrong. please try again"})
            }
        }
        const addToHistory = await client.query("INSERT INTO history(userid, price) VALUES($1, $2) RETURNING *", [id, paymentId.rows[0].amount])
        if (addToHistory.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(500).json({message: "Somthing went wrong. please try again"})
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Completed successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to pay: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        client.release()
    }
}











