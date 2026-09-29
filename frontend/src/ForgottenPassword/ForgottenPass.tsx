import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/AxApi";
import { toast } from "sonner";
import type { AxiosError } from "axios";







export function ForgottenPassword() {
    const [sendedCode, setSendedCode] = useState(false)

    const [email, setEmail] = useState("")


    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")


    const navigate = useNavigate()

    const sendedCodeRef = useRef<HTMLInputElement>(null)

    const finalChangeRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        sendedCodeRef.current?.focus()
        finalChangeRef.current?.focus()
    }, [])



    const getCode = useMutation({
        mutationFn: async(data: {
            email: string
        }) => {
            const response = await api.post("/getEmailCode", data) 
            return response
        },
        onSuccess: (response) => {
            toast.success(response.data?.message)
            setTimeout(() => {
                setSendedCode(true)
            }, 1000)
        },
        onError: (error: AxiosError<{message: string}>)=> {
            toast.error(error.response?.data?.message || error?.message || "Unkown error")
        }
    })

    const finalChange = useMutation({
        mutationFn: async(data: {
            email: string,
            code: string,
            newPassword: string,
            confirmPassword: string
        }) => {
            const response = await api.patch("/changeForgottenPassword", data) 
            return response
        },
        onSuccess: (response) => {
            toast.success(response.data?.message)
            setTimeout(() => {
                setSendedCode(false)
                navigate("/auth")
            }, 2000)
        },
        onError: (error: AxiosError<{message: string}>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown error")
        }
    })


    return (
        <div className="total-forgotten-password">
            {
                sendedCode === false 
                ? (
                    <div className="send-code">
                        <h3 className="change-password-title">Get your code</h3>
                        <p className="cahnge-password-email">Email</p>
                        <input type="text" placeholder="Email: " value={email} onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                        className="change-password-in" ref={sendedCodeRef} />
                        <div className="change-password-collection">
                            <button onClick={() => {
                                getCode.mutate({
                                    email
                                })
                            }} className="change-password-btn">
                                Send code 
                            </button>
                            <Link to={"/auth"} className="login-link">Login</Link>
                        </div>
                    </div>
                )
                : (
                    <div className="send-code">
                        <h3 className="change-password-title">Change password</h3>
                        <p className="cahnge-password-email">Your Code</p>
                        <input type="text" placeholder="Code: " value={code} onChange={(e) => {
                            setCode(e.target.value)
                        }}
                        className="change-password-in" ref={finalChangeRef} />
                        <p className="cahnge-password-email">New password</p>
                        <input type="text" placeholder="New password: " value={newPassword} onChange={(e) => {
                            setNewPassword(e.target.value)
                        }}
                        className="change-password-in" />
                        <p className="cahnge-password-email">Confirm password</p>
                        <input type="text" placeholder="Confirm: " value={confirmPassword} onChange={(e) => {
                            setConfirmPassword(e.target.value)
                        }}
                        className="change-password-in" />
                        <button onClick={() => {
                            finalChange.mutate({
                                email,
                                code,
                                newPassword,
                                confirmPassword
                            })
                        }} className="change-password-btn">
                            Final change
                        </button>
                    </div>

                )
            }






        </div>




    )




}







