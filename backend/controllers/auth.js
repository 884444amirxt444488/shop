import { pool } from "../Pool/pool.js";
import { changeForgottenPasswordValidation, editPasswordValidation, editValidation, loginValidation, signupValidation } from "../validations/validations.js";
import bcrypt from "bcrypt"
import  jwt from "jsonwebtoken"
import e from "express-rate-limit"
import nodemailer from "nodemailer"



export const rating = e({
    windowMs: 1000 * 360,
    max: 16,
    legacyHeaders: true,

    handler: (req , res) => {
        return res.status(429).json({message: "To many request. your acc banned"})
    }
})





export async function signup (req , res) {
    const result = signupValidation.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({message: result.error.issues[0].message})
    }

    const {username, email, password} = result.data

    const client = await pool.connect()


    try {
        await client.query("BEGIN")
        const userExists = await client.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]
        )
        if (userExists.rows.length > 0) {
            await client.query("ROLLBACK")
            return res.status(409).json({message: "This username or email already exists"})
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await client.query(
            "INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *", [username, email, hashPassword]
        )
        const payload = {
            id: newUser.rows[0].id 
        }
        const accessToken = jwt.sign(payload, process.env.ACCESSTOKEN, {expiresIn: "15m"})
        const refreshToken = jwt.sign(payload, process.env.REFRESHTOKEN, {expiresIn: "7d"})

        const updateUser = await client.query(
            "UPDATE users SET refreshtoken = $1 WHERE id = $2 RETURNING *", [refreshToken, newUser.rows[0].id]
        )
        if (updateUser.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "violent error. try again"})
        }

        await client.query("COMMIT")

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            samesite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).status(200).json({message: "Signup successfully", username: newUser.rows[0].username, email: newUser.rows[0].email, accessToken})
    }

    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to signup: `, err)
        res.status(500).json({message: "Inrenal error. try later"})
    }

    finally {
        await client.release()
    }


}

export async function login(req , res) {
    const result = loginValidation.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({message: result.error.issues[0].message})
    }

    const {username, password} = result.data

    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        const usernameExists = await client.query(
            "SELECT * FROM users WHERE username = $1", [username]
        )
        if (usernameExists.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Incorrect username or password"})
        }
        const matchPassword = await bcrypt.compare(password, usernameExists.rows[0].password)
        if (!matchPassword) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Incorrect username or password"})
        }

        const payload = {
            id: usernameExists.rows[0].id 
        }

        const accessToken = jwt.sign(payload, process.env.ACCESSTOKEN, {expiresIn: "15m"})
        const refreshToken = jwt.sign(payload, process.env.REFRESHTOKEN, {expiresIn: "7d"})

        const updateUser = await client.query(
            "UPDATE users SET refreshtoken = $1 WHERE id = $2 RETURNING *", [refreshToken, usernameExists.rows[0].id]
        )
        if (updateUser.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Violent error. try again"})
        };

        await client.query("COMMIT")

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).status(200).json({message: "Login successfully", username: usernameExists.rows[0].username, email: usernameExists.rows[0].email, accessToken})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to login: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }

    finally {
        await client.release()
    }
}


export async function profile(req , res) {
    const {id} = req.user 
    if (!id) {
        return res.status(400).json({message: "Invalid req"})
    }
    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE id = $1", [id]
        )
        if (user.rows.length === 0) {
            return res.status(404).json({message: "This user is not exists"})
        }
        res.status(200).json({message: "Welcom", username: user.rows[0].username, email: user.rows[0].email})
    }
    catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({message: "Login first"})
        }
        else {
            console.log(`Error to get profile: `, err)
            res.status(500).json({message: "Error from server. try later"})
        }
    }
}

export async function deleteProfile(req, res) {
    const {id} = req.user 
    if (!id) {
        return res.status(400).json({message: "Login first"})
    }
    try {
        const deleteUser = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *", [id]
        )
        if (deleteUser.rows.length === 0) {
            return res.status(404).json({message: "This user already not exists"})
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60
        }).status(200).json({message: "User deleted successfully"})
    }
    catch (err) {
        console.error(`Error to delete user: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
}

export async function editProfile(req , res) {
    const {id} = req.user 
    if (!id) {
        return res.status(400).json({message: "Login first"})
    }
    const data = req.body
    console.log(data)

    const result = editValidation.safeParse(data)
    if (!result.success) {
        return res.status(400).json({message: "Invalid datas"})
    }
    const {username, email} = result.data

    const dubField = []
    const dubValue = []


    const fields = []
    const values = []

    if (username) {
        dubField.push(`username = $${dubValue.length + 1}`)
        dubValue.push(username)
        fields.push(`username = $${values.length + 1}`)
        values.push(username)
    }
    if (email) {
        dubField.push(`email = $${dubValue.length + 1}`)
        dubValue.push(email)
        fields.push(`email = $${values.length + 1}`)
        values.push(email)
    }
    if (fields.length === 0) {
        return res.status(400).json({message: "Nothing send"})
    }
    dubValue.push(id)
    values.push(id)

    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        const user = await client.query(
            "SELECT * FROM users WHERE id = $1", [id]
        )
        if (user.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "This user is not exists"})
        }
        const userExists = await client.query(
            `SELECT * FROM users WHERE (${dubField.join(" OR ")}) AND id != $${dubValue.length}`, dubValue
        )
        if (userExists.rows.length > 0) {
            await client.query("ROLLBACK")
            return res.status(409).json({message: "This username or email already exists"})
        }
        const editUser = await client.query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`, values 
        )
        if (editUser.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "Somthing went wrong try again"})
        }   
        await client.query("COMMIT")
        res.status(200).json({message: "Profile updated successfully", username: editUser.rows[0].username, email: editUser.rows[0].email})
    }
    catch (err) {
        console.error(`Error to edit profile: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        await client.release()
    }
}

export async function logOut(req, res) {
    const {id} = req.user 
    if (!id) {
        return res.status(400).json({message: "You are logged out"})
    }
    try {
        const clearTokens = await pool.query(
            "UPDATE users SET refreshtoken = NULL WHERE id = $1 RETURNING *", [id]
        )
        if (clearTokens.rowCount === 0) {
            return res.status(404).json({message: "User not found"})
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60
        }).status(200).json({message: "Logged out successfully"})
    }
    catch (err) {
        console.error(`Error to log out: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
}
export async function refreshToken(req , res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Login please"})
    }
    const {refreshToken} = req.cookies
    if (!refreshToken) {
        return res.status(401).json({message: "Login please"})
    }
    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE id = $1", [id]
        )
        if (user.rows.length === 0) {
            return res.status(404).json({message: "User not found"})
        }

        if (user.rows[0].refreshtoken !== refreshToken) {
            return res.status(401).json({message: "Invalid cookie. login please"})
        }
        const payload = {
            id: user.rows[0].id 
        }
        const accessToken = jwt.sign(payload, process.env.ACCESSTOKEN, {expiresIn: "1m"})
        res.status(200).json({accessToken})
    }
    catch (err) {
        console.error(`Error to refresh token: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
}


export async function ChagePassword(req , res) {
    const {id} = req.user
    if (!id) {
        return res.status(400).json({message: "Login first"})
    }
    const result = editPasswordValidation.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({message: result.error.issues[0].message})
    }
    const {oldPassword, newPassword, confirmPassword} = result.data

    if (newPassword !== confirmPassword) {
        return res.status(400).json({message: "New password is not match"})
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        const user = await client.query(
            "SELECT * FROM users WHERE id = $1", [id] 
        )
        if (user.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "User not found"})
        }
        const matchPassword = await bcrypt.compare(oldPassword, user.rows[0].password)
        if (!matchPassword) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Incorrect password"})
        }
        const hashPassword = await bcrypt.hash(newPassword, 10)
        const updateUser = await client.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING *", [hashPassword, id]
        )
        if (updateUser.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Somthing went wrong. try again"})
        }
        await client.query("COMMIT")
        res.status(200).json({message: "Password updated successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to edit password: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        await client.release()
    }
}

export async function getEmailPassword(req, res) {
    const {email} = req.body
    if (!email) {
        return res.status(400).json({message: "Email is required"})
    }
    function checkEmailFormat(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
    if (!checkEmailFormat(email)) {
        return res.status(400).json({message: "Invalid email format"})
    }
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const userExists = await client.query(
            "SELECT * FROM users WHERE email = $1", [email] 
        )
        if (userExists.rowCount === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "Icorrect email"})
        }
        const code = Math.floor(Math.random() * 1000000).toString()
        const dateNowe = Date.now() + 10 * 60 * 1000

        const hashCode = await bcrypt.hash(code, 10)

        const updateUser = await client.query(
            "UPDATE users SET code = $1, date = $2 WHERE id = $3 RETURNING *", [hashCode, dateNowe, userExists.rows[0].id]
        )
        if (updateUser.rowCount === 0) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Somthing went wrong. try again"})
        }
        const Emailer = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS 
            }
        })

        await Emailer.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "CHANGE YOUR PASSWORD CODE",
            html: `<div style="
                        background-color: rgb(244, 243, 243);
                        color: rgb(11, 11, 11);
                        padding: 20px;
                        width: 80%;
                        max-width: 400px;
                        min-width: 100px;
                        border-radius: 20px;
                        margin: 20px auto;
                        border: 2px solid blue;
                    ">
                        <div style="
                        padding: 5px;
                        border-top: 4px solid rgb(0, 0, 0);"
                        >
                            <h3>password change</h3>
                            <p>Do not share your code with no body</p>
                            <p>This code valid for 10 min. then you get code come back to site and get your new password</p>
                            <h3>Code: ${code}</h3>
                            <p>Thanks for using my site. <a href="http://localhost:3000/forgottenPassword" style="color: rgb(4, 25, 255);">Go to site</a></p>
                        </div>
                    </div>
                `
        })
        await client.query("COMMIT")
        res.status(200).json({message: "Code sended successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to send code: `, err)
        res.status(500).json({message: "Error from server. please try later"})
    }
    finally {
        await client.release()
    }
}

export async function changeForgottenPassword(req, res) {
    const result = changeForgottenPasswordValidation.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({message: result.error.issues[0].message})
    }
    const {email, code, newPassword, confirmPassword} = result.data

    if (newPassword !== confirmPassword) {
        return res.status(400).json({message: "New password is not match with confirm pass"})
    }

    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const user = await client.query(
            "SELECt * FROM users WHERE email = $1", [email] 
        )
        if (user.rowCount === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({message: "This user is not found"})
        }
        if (user.rows[0].date < Date.now()) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "This code is expired. try again"})
        }
        const matchCode = await bcrypt.compare(code, user.rows[0].code)
        if (!matchCode) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Incorrect code. try again"})
        }
        const hashNewPassword = await bcrypt.hash(newPassword, 10)
        
        const updateUser = await client.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING *", [hashNewPassword, user.rows[0].id]
        )
        if (updateUser.rowCount === 0) {
            await client.query("ROLLBACK")
            return res.status(401).json({message: "Somthing went wrong. try again"})
        }

        await client.query(
            "UPDATE users SET code = $1, date = $2 WHERE id = $3", [null, null, user.rows[0].id]
        )

 
        await client.query("COMMIT")
        res.status(200).json({message: "Your pass changed successfully"})
    }
    catch (err) {
        await client.query("ROLLBACK")
        console.error(`Error to change forgotten password: `, err)
        res.status(500).json({message: "Error from server. try later"})
    }
    finally {
        await client.release()
    }

    
}

