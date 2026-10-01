import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/AxApi"
import { toast } from "sonner"
import type { AxiosError } from "axios"




export default function Payment() {


    const queryClient = useQueryClient()

    const navigate = useNavigate()

    const [uuid, setUuid] = useState<string | null>("")
    const [totalprice, setTotalPrice] = useState<string | null>("")
    


    const FinishPayment = useMutation({
        mutationFn: async(data: {
            uuid: string
        }) => {
            const response = await api.post("/FinallyPayment", data)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data.message)
            queryClient.setQueryData(["ShopForUserCart"], {
                products_user_cart: [],
                totalPrice: 0
            })
            localStorage.removeItem("uuid")
            localStorage.removeItem("totalprice")
            navigate("/")
        },
        onError: (err: AxiosError<{message: string}>) => {
            toast.error(err.response?.data?.message || err?.message || "Unknown Error")
            navigate("/")
        }
    })


    useEffect(() => {
        const uuid2 = localStorage.getItem("uuid")
        setUuid(localStorage.getItem("uuid"))
        setTotalPrice(localStorage.getItem("totalprice"))
        if (!localStorage.getItem("uuid") || !localStorage.getItem("totalprice") || !uuid2) {
            navigate("/")
            return
        }
        const timer = setTimeout(() => {
            FinishPayment.mutate({uuid: uuid2})
        }, 2000)
        return () => {
            clearTimeout(timer)
        }
    }, [])





    return (
        <div className="totalPay">
            <div>
                Payment ID: 
                <input type="text" placeholder="Id" className={`in3`} value={uuid ? uuid : "INVALID_REQ"} disabled={true} />
            </div>
            <div>
                How much?: 
                <input type="text" placeholder="How" className={`in3`} value={totalprice ? totalprice : "INVALID_REQ"} disabled={true} />
            </div>
            <div className="paYBtn">
                <button className="PaymentBtn">
                    Finish
                </button>
            </div>
        </div>
    )
}





