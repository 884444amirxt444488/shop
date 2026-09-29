import { pool } from "../Pool/pool.js"
import { addProductValidation, editProductValidation } from "../validations/productValidation.js"



export async function addProduct(req, res) {
    const result = addProductValidation.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({message: result.error.issues[0].message})
    }
    const {productname, productprice, productstock} = result.data

    try {
        const productExists = await pool.query(
            "SELECT * FROM products WHERE productname = $1", [productname]
        )
        if (productExists.rows.length > 0) {
            return res.status(409).json({message: "This product already exists"})
        }
        const addProduct = await pool.query(
            "INSERT INTO products(productname, productprice, productstock) VALUES($1, $2, $3) RETURNING *", [productname, productprice, productstock]
        )
        if (addProduct.rows.length === 0) {
            return res.status(401).json({message: "Somthing went wrong. try again"})
        }
        res.status(200).json({message: "Product created successfully", product: addProduct.rows[0]})
    }
    catch (err) {
        console.error(`Error to add product: `, err)
        res.status(500).json({message: "Error from server. please check terminal"})
    }
}

export async function getAllProducts(req, res) {
    try {
        const allProducts = await pool.query(
            "SELECT * FROM products ORDER BY id ASC"
        )
        if (allProducts.rows.length === 0) {
            return res.status(404).json({message: "Products are not found"})
        }
        res.status(200).json({products: allProducts.rows})
    }
    catch (err) {
        console.error(`Error to get all products: `, err)
        res.status(500).json({message: "Error from server. please check terminal"})
    }
}

export async function getOneProduct(req, res) {
    const {id} = req.params
    const numberedId = Number(id)
    if (!id || !Number.isFinite(numberedId) || numberedId <= 0) {
        return res.status(400).json({message: "Invalid id"})
    }
    try {
        const product = await pool.query(
            "SELECT * FROM products WHERE id = $1", [numberedId] 
        )
        if (product.rows.length === 0) {
            return res.status(404).json({message: "This product is not found"})
        }
        res.status(200).json({product: product.rows[0]})
    }
    catch (err) {
        console.error(`Error to get product: `, err)
        res.status(500).json({message: "Error from server. please check terminal"})
    }
}

export async function getAmazingProducts(req, res) {
    try {
        const amazingProducts = await pool.query(
            "SELECT * FROM products WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14) ORDER BY id ASC"
        )
        if (amazingProducts.rows.length === 0) {
            return res.status(404).json({message: "Not found"})
        }
        res.status(200).json({amazingproducts: amazingProducts.rows})
    }
    catch (err) {
        console.error(`Error to get amazing products: `, err)
        res.status(500).json({message: "Error from server. please check terminal"})
    }
    
}

export async function deleteProduct(req, res) {
    const{id} = req.params
    const numberedId = Number(id)
    if (!id || !Number.isFinite(numberedId) || numberedId <= 0) {
        return res.status(400).json({message: "Invalid id"})
    }
    try {
        const deleteProduct = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *", [numberedId]
        )
        if (deleteProduct.rows.length === 0) {
            return res.status(404).json({message: "This product is not found"})
        }
        res.status(200).json({message: "Product deleted successfully", deletedProduct: deleteProduct.rows[0]})
    }
    catch (err) {
        console.error(`Error to delete product: `, err)
        res.status(500).json({message: "Error from server. please check terminal"})
    }
}

export async function editProducts(req, res) {
    const {id} = req.params
    const numberedId = Number(id)
    if (!id || !Number.isFinite(id) || numberedId <= 0) {
        return res.status(400).json({message: "Invalid id"})
    }
    const result = editProductValidation.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({message: "Invalid reqs"})
    }
    const {productname, productprice, productstock} = result.data

    const fields = []
    const values = []

    if (productname !== "") {
        fields.push(`productname = $${values.length + 1}`)
        values.push(productname)
    }
    if (productprice !== "") {
        fields.push(`productprice = $${values.length + 1}`)
        values.push(productprice)
    }
    if (productstock !== "") {
        fields.push(`productstock = $${values.length + 1}`)
        values.push(productstock)
    }

    if (fields.length === 0) {
        return res.status(400).json({message: "Nothing send"})
    }

    values.push(id)

    try {
        const productExists = await pool.query(
            "SELECT * FROM products WHERE id = $1", [numberedId] 
        )
        if (productExists.rows.length > 0) {
            return res.status(404).json({message: "This product is not found for edit"})
        }
        const updateProduct = await pool.query(
            `UPDATE products SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`, values
        )
        if (updateProduct.rows.length === 0) {
            return res.status(401).json({message: "Somthing went wrong. try again"})
        }
        res.status(200).json({message: "Product updated successfully", updateProduct: updateProduct.rows[0]})
    }
    catch (err) {
        console.error(`Error to update product: `, err)
        res.status(500).json({message: "Error from server. please check terminal"})
    }

}






