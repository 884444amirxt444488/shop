import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/AxApi";
import { toast } from "sonner";
import type { AxiosError } from "axios";





export function ChangePassword() {

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")


    const SelectInput = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        SelectInput.current?.focus()
    }, [])

    const editPassword = useMutation({
        mutationFn: async(data: {
            oldPassword: string,
            newPassword: string,
            confirmPassword: string
        }) => {
            const response = await api.patch("/editPassword", data)
            return response
        },
        onSuccess: (response) => {
            toast.success(response.data?.message)
            setTimeout(() => {
                navigate("/auth")
            }, 2000)
        },
        onError: (error: AxiosError<{message: string}>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown Error")
        }
    })



    return (
        <div className="total-change-password">
            <h3 className="main-title">Forgotten pass</h3>
            <div className="edit-password-form">
                <h3>Old password</h3>
                <input type="text" placeholder="Old password" className="edit-pass-in" value={oldPassword} onChange={(e) => {
                    setOldPassword(e.target.value)
                }} ref={SelectInput} />
                <h3>New password</h3>
                <input type="text" placeholder="New password" className="edit-pass-in" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <h3>Confirm password</h3>
                <input type="password" placeholder="Confirm password" className="edit-pass-in" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="edit-pass-btns">
                <button className="edit-pass-btn" onClick={() => {
                    editPassword.mutate({
                        oldPassword,
                        newPassword,
                        confirmPassword
                    })
                }}>
                    Edit pass 
                </button>
                <Link to={"/profile"} className="login-link">Profile</Link>
            </div>

        </div>
    )




}








