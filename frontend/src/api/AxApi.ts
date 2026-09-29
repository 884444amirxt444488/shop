import axios from "axios"


export const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})


api.interceptors.request.use((config)=> {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})



api.interceptors.response.use(
    (response) => response,
    async(error) => {
        const mainConfig = error.response?.config
        if (mainConfig && error.response?.data?.message === "Invalid login. login again" && !mainConfig._retry) {
            mainConfig._retry = true
            try {
                const response = await fetch("http://localhost:3000/refreshToken", {
                    method: "POST",
                    credentials: "include"
                })
                const data = await response.json()
                if (response.status !== 200) {
                    return Promise.reject(error)
                }
                localStorage.setItem("accessToken", data.accessToken)
                mainConfig.headers.Authorization = `Bearer ${data.accessToken}`
                return api(mainConfig)
            }
            catch (err) {
                return Promise.reject(err)
            }
        }
        return Promise.reject(error)
    }
)







