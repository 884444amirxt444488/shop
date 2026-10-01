import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api/AxApi"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import CircularWaveLoader from "../Loading"


type Signup = {
    username: string,
    email: string,
    password: string
}

type ErrorResponse = {
    message: string
}

export default function Signup() {

    const navigate = useNavigate()

    const usernameRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        usernameRef.current?.focus()
    }, [])



    const signup = useMutation({
        mutationFn: (data: {
            username: string,
            email: string,
            password: string
        }) => {
            const response = api.post("/signup", data)
            return response
        },
        onSuccess: (response) => {
            localStorage.setItem("accessToken", response.data?.accessToken)
            toast.success(response?.data?.message)
            setTimeout(() => {
                navigate("/profile")
            }, 2000)
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown Error")
        }

    })




    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("") 
    const [password, setPassword] = useState("") 



    return (
        <div className="total-signup">
            <div className="explains">
                <h2>Signup Function</h2>
                <p>
                    This function creates a new user account and handles authentication.
                </p>

                <ol>
                    <li>Validates user input with Zod.</li>
                    <li>Checks if the username or email already exists.</li>
                    <li>Hashes the password using bcrypt.</li>
                    <li>Creates the user inside a PostgreSQL transaction.</li>
                    <li>Generates an access token and a refresh token.</li>
                    <li>Saves the refresh token in the database.</li>
                    <li>Sends the refresh token as an HTTP-only cookie.</li>
                    <li>Returns the access token and user information.</li>
                    <li>Uses rollback if an error occurs.</li>
                    <li>Releases the database client in the finally block.</li>
                </ol>
            </div>
            <div className="signuo-form">
                <h3>Email</h3>
                <input type="email" placeholder="email: " value={email} onChange={(e) => setEmail(e.target.value)} className="in" maxLength={20} ref={usernameRef} />
                <h3>Username</h3>
                <input type="text" placeholder="username: " value={username} onChange={(e) => setUsername(e.target.value)} maxLength={16} minLength={4} className="in" />
                <h3>Password</h3>
                <input type="password" placeholder="password: " value={password} onChange={(e) => setPassword(e.target.value)} maxLength={20} minLength={8} className="in" />
                <div className="signup-colection">
                    <button className="signup-btn" onClick={() => {
                        signup.mutate({
                            username,
                            email,
                            password
                        })
                    }}>
                        Signup 
                    </button>
                    <Link to={"/auth"} className="login-link">Login</Link>
                </div>
            </div>
            {
                signup.isPending && (
                    <CircularWaveLoader />
                )
            }
        </div>

            
    )




}











