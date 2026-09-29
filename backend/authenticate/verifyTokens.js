import jwt from "jsonwebtoken"


export const verifyAccessToken = (req , res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(400).json({message: "Invalid header"})
    }
    const [type, accessToken] = authHeader.split(" ")
    if (type !== "Bearer" || !accessToken) {
        return res.status(400).json({message: "Incorrect header"})
    }
    jwt.verify(accessToken, process.env.ACCESSTOKEN, (err, userInfo) => {
        if (err) {
            return res.status(401).json({message: "Invalid login. login again"})
        }
        else {
            req.user = userInfo
            next()
        }
    })
}

export const verifyRefreshToken = (req , res , next) => {
    const {refreshToken} = req.cookies
    if (!refreshToken) {
        return res.status(401).json({message: "Incorrect cookie"})
    }
    jwt.verify(refreshToken, process.env.REFRESHTOKEN, (err, userInfo) => {
        if (err) {
            return res.status(401).json({message: "Invalid login. login again"})
        }
        else {
            req.user = userInfo
            next()
        }
    })


}









