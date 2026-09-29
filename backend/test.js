import {pool} from './Pool/pool.js'

try {
    const result = await pool.query(
        "INSERT INTO products(productname, productprice, productstock, image_links, description) VALUES('X', 4, 7788, '/productsimages/x.jpg', 'A detailed SpaceX rocket model inspired by modern space exploration, perfect for collectors, space enthusiasts, and anyone fascinated by rockets and the future of space travel.') RETURNING *"
    )
    if (result.rows.length === 0) {
        console.log("Not updated")
    }
    else {
        console.log("Updated successfully")
    }
}
catch (err) {
    console.error(`Error to add product: `, err)
}











