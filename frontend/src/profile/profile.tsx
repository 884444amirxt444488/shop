import { useEffect, useState } from "react"

import { Pencil, X, LogOut  } from "lucide-react"
import { api } from "../api/AxApi"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import CircularWaveLoader from "../Loading"





export default function Profile() {

    const navigate = useNavigate()



    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")


    const [deleteNumber, setDeleteNumber] = useState(0)


    const [editTrue, setEditTrue] = useState(false)

    useEffect(() => {
        const getProfile = async() => {
            try {
                const response = await api.get("/profile")
                setUsername(response.data?.username)
                setEmail(response.data?.email)
            }
            catch (err) {
                return false
            }
        }
        getProfile()
    }, [])

    const deleteProfile = useMutation({
        mutationFn: async() => {
            const response = await api.delete("/deleteProfile")
            return response
        },
        onSuccess: () => {
            toast.success("Account deleted successfully")
            localStorage.removeItem("accessToken")
            setTimeout(() => {
                navigate("/signup")
            }, 2000)
        },
        onError: (error: AxiosError<{message: string}>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown Error")
        }
    })

    const editProfile = useMutation({
        mutationFn: async(data: {
            username?: string,
            email?: string
        }) => {
            const response = await api.patch("/editProfile", data)
            return response
        },
        onSuccess: (response) => {
            toast.success(response.data?.message)
            setUsername(response.data?.username)
            setEmail(response.data?.email)
            setEditTrue(false)
        },
        onError: (error: AxiosError<{message: string}>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown Error")
        }
    })

    const logOut = useMutation({
        mutationFn: async() => {
            const response = await api.post("/logout")
            return response
        },
        onSuccess: (response) => {
            toast.success(response.data?.message)
            setTimeout(() => {
                localStorage.removeItem("accessToken")
                navigate("/login")
            }, 2000)
        },
        onError: (error: AxiosError<{message: string}>) => {
            toast.error(error.response?.data?.message || error?.message || "Unknown Error")
        }
    })




    return (
        <div className="not-main-profile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 0 1800 320">
                <path fill="#1c213a" fillOpacity="1" d="M0,288L36.9,160L73.8,32L110.8,64L147.7,96L184.6,224L221.5,64L258.5,64L295.4,128L332.3,32L369.2,96L406.2,96L443.1,256L480,64L516.9,160L553.8,288L590.8,160L627.7,256L664.6,96L701.5,32L738.5,192L775.4,160L812.3,288L849.2,128L886.2,192L923.1,160L960,224L996.9,160L1033.8,128L1070.8,256L1107.7,160L1144.6,256L1181.5,32L1218.5,288L1255.4,320L1292.3,96L1329.2,192L1366.2,288L1403.1,64L1440,0L1440,0L1403.1,0L1366.2,0L1329.2,0L1292.3,0L1255.4,0L1218.5,0L1181.5,0L1144.6,0L1107.7,0L1070.8,0L1033.8,0L996.9,0L960,0L923.1,0L886.2,0L849.2,0L812.3,0L775.4,0L738.5,0L701.5,0L664.6,0L627.7,0L590.8,0L553.8,0L516.9,0L480,0L443.1,0L406.2,0L369.2,0L332.3,0L295.4,0L258.5,0L221.5,0L184.6,0L147.7,0L110.8,0L73.8,0L36.9,0L0,0Z"></path>
            </svg>
            <div className="main-profile">
                <h3 className="subject">Profile</h3>
                <button className="logoutbtn" onClick={() => {
                    logOut.mutate()
                }}>
                    <LogOut size={15} />
                </button>
                <div className="profile-datas">
                    <h3 className="profile-h3">Username: </h3>
                    {
                        editTrue 
                        ? <input type="text" placeholder="Username: " className="in" value={username} onChange={(e) => setUsername(e.target.value)} /> 
                        : <span className="profile-data">{username} </span>
                    }
                </div>
                <div className="profile-datas"> 
                    <h3 className="profile-h3">Email: </h3>
                    {
                        editTrue 
                        ? <input type="text" placeholder="Email: " className="in" value={email} onChange={(e) => setEmail(e.target.value)} /> 
                        : <span className="profile-data">{email} </span>
                    }
                </div>
                <div className="profile-btns">
                    <button onClick={() => {
                        setDeleteNumber(0)
                        editTrue
                        ? editProfile.mutate({
                            username,
                            email
                        })
                        : setEditTrue(true)
                    }} className="profile-btn-edit">
                        {
                            editTrue
                            ? <Pencil size={15} />
                            : "Edit"
                        }
                    </button>
                    <button className="profile-btn-delete" onClick={() => {
                        if (editTrue) {
                            setEditTrue(false)
                        }
                        else if (deleteNumber < 2) {
                            setDeleteNumber(deleteNumber + 1)
                        }
                        else {
                            deleteProfile.mutate()
                        }
                        
                    }}>
                        {
                            editTrue
                            ? <X size={15}/>
                            : `Delete ${
                                deleteNumber === 0
                                ? ""
                                : `${deleteNumber}`
                            }`
                        }
                    </button>
                </div>
                <p className="change-pass-link">If you wanna edit your pass click herer: <Link to={"/changePassword"} className="login-link">Edit pass</Link></p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 0 1700 320">
                <path fill="#111111" fillOpacity="1" d="M0,224L36.9,32L73.8,128L110.8,256L147.7,160L184.6,96L221.5,320L258.5,224L295.4,96L332.3,224L369.2,288L406.2,96L443.1,128L480,128L516.9,192L553.8,224L590.8,320L627.7,192L664.6,32L701.5,320L738.5,32L775.4,320L812.3,160L849.2,224L886.2,96L923.1,192L960,288L996.9,96L1033.8,128L1070.8,0L1107.7,160L1144.6,96L1181.5,64L1218.5,64L1255.4,320L1292.3,160L1329.2,288L1366.2,288L1403.1,224L1440,288L1440,320L1403.1,320L1366.2,320L1329.2,320L1292.3,320L1255.4,320L1218.5,320L1181.5,320L1144.6,320L1107.7,320L1070.8,320L1033.8,320L996.9,320L960,320L923.1,320L886.2,320L849.2,320L812.3,320L775.4,320L738.5,320L701.5,320L664.6,320L627.7,320L590.8,320L553.8,320L516.9,320L480,320L443.1,320L406.2,320L369.2,320L332.3,320L295.4,320L258.5,320L221.5,320L184.6,320L147.7,320L110.8,320L73.8,320L36.9,320L0,320Z"></path>
            </svg>
            {
                (editProfile.isPending || deleteProfile.isPending) && (
                    <CircularWaveLoader />
                )
            }
        </div>
        


    )




}







