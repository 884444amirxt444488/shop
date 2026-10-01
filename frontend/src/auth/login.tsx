import { useMutation } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api/AxApi"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import Loading from "../Loading2"


type ErrorResponse = {
    message: string
}


export default function Login() {

    const navigate = useNavigate()

    const usernameRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        usernameRef.current?.focus()
    }, [])


    const login = useMutation({
        mutationFn: (data: {
            username: string,
            password: string
        }) => {
            const response = api.post("/login", data)
            return response
        },
        onSuccess: (response) => {
            localStorage.setItem("accessToken", response.data?.accessToken)
            toast.success(response.data?.message)
            setTimeout(() => {
                navigate("/profile")
            }, 2000)
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown Error")
        }
    })




    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("") 



    return (
        <div className="total-login">
            <div className="explains">
                <h2>Login Function</h2>

                <p>
                    This function authenticates an existing user and creates authentication tokens.
                </p>

                <ol>
                    <li>Validates the username and password with Zod.</li>
                    <li>Finds the user in the database.</li>
                    <li>Compares the password using bcrypt.</li>
                    <li>Generates an access token and a refresh token.</li>
                    <li>Stores the refresh token in the database.</li>
                    <li>Sends the refresh token as an HTTP-only cookie.</li>
                    <li>Returns the access token and user information.</li>
                    <li>Uses rollback if an error occurs.</li>
                    <li>Releases the database client in the finally block.</li>
                </ol>
            </div>
            <div className="login-form">
                <h3>Username</h3>
                <input type="text" placeholder="username: " value={username} onChange={(e) => setUsername(e.target.value)} maxLength={16} minLength={4} className="in2" ref={usernameRef} />
                <h3>Password</h3>
                <input type="password" placeholder="password: " value={password} onChange={(e) => setPassword(e.target.value)} maxLength={20} minLength={8} className="in2" />
                <div className="login-colection">
                    <button className="login-btn" onClick={() => {
                        login.mutate({
                            username,
                            password
                        })
                    }}>
                        {
                            login.isPending ? 
                            <Loading />
                            : "Login"
                        } 
                    </button>
                    <Link to={"/signup"} className="signup-link">Signup</Link>
                </div>
                <h5 className="forgpass">If you forgott your password click here: <Link to={"/forgottenPass"} className="signup-link">Forgott pass</Link> </h5>
            </div>
        </div>

    )




}





















