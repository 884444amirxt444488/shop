import {  useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Minus, Trash2, PackageX } from "lucide-react"
import { toast } from "sonner"
import { api } from "../api/AxApi"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import Loading from "../Loading2"
import CircularWaveLoader from "../Loading"



type TotalProductsInCartType = {
    id: number,
    productname: string,
    productAvalible: number,
    productprice: number,
    productstock: number
}

type ProductsInShoppingCartType = {
    products_user_cart: TotalProductsInCartType[],
    totalPrice: number
}

type SaveCart = {
    productid: number,
    productname: string,
    productstock: number
}

type mainSaveCart = {
    products: SaveCart[]
}


export default function ProductCart() {
    const queryClient = useQueryClient()

    const navigate = useNavigate()

    const {
        data: AllProductsInCartBeforSave
    } = useQuery<ProductsInShoppingCartType>({
        queryKey: ["ShopForUserCart"],
        queryFn: async() => {
            const response = await api.get("/getProductCart")
            return response.data
        },
        enabled: false
    })


    const totalPrice =  AllProductsInCartBeforSave?.products_user_cart?.reduce(
        (total, item) => 
            total + item.productprice * item.productstock,
        0
    ) ?? 0


    const decressProductStock = (id: number) => {
        queryClient.setQueryData(["ShopForUserCart"], (old: ProductsInShoppingCartType) => {
            return {
                ...old,
                products_user_cart: old.products_user_cart.map((item) => {
                    return item.id === id
                        ? {
                            ...item,
                            productstock: item.productstock - 1
                        }
                        : item
                })}
            }
        )
    }

    const increaseProductStock = (id: number) => {
        queryClient.setQueryData(["ShopForUserCart"], (old: ProductsInShoppingCartType) => {
            return {
                ...old,
                products_user_cart: old.products_user_cart.map((item) => {
                    return item.id === id 
                        ? {
                            ...item,
                            productstock: item.productstock + 1
                        }
                        : item
                })
            }
        })
    }

    const deleteProductStock = useMutation({
        mutationFn: async(data: {
            productid: number
        }) => {
            const response = await api.delete("/deleteProductCart", {data})
            return response.data
        },
        onMutate: async (data) => {
            await queryClient.cancelQueries({
                queryKey: ["ShopForUserCart"]
            })
            const beforeCart = queryClient.getQueryData(["ShopForUserCart"])
            queryClient.setQueryData(["ShopForUserCart"], (old: ProductsInShoppingCartType) => {
                return {
                    ...old,
                    products_user_cart: old.products_user_cart.filter((item) => 
                        item.id !== data.productid    
                    )
                }
            })

            return {beforeCart}
        },
        onSuccess: (data) => {
            toast.success(data.message)
        },
        onError: (err: AxiosError<{message: string}>, context) => {
            toast.error(err.response?.data?.message || err?.message || "Unknown Error")
            queryClient.setQueryData(["ShopForUserCart"], context)
        }
    })

    const emptyFields = () => {
        if (AllProductsInCartBeforSave?.products_user_cart?.length === 0) {
            return "Empty cart"
        }
    }


    const deleteAllProductFromCart = useMutation({
        mutationFn: async () => {
            const response = await api.delete("/deleteAllProducts")
            return response.data
        },
        onMutate: async() => {
            await queryClient.cancelQueries({
                queryKey: ["ShopForUserCart"]
            })
            const beforeData = queryClient.getQueryData(["ShopForUserCart"])

            queryClient.setQueryData(["ShopForUserCart"],
                {
                    products_user_cart: [],
                    totalPrice: 0
                }
            )

            return beforeData
        },
        onSuccess: (data) => {
            toast.success(data.message)
        },
        onError: (err: AxiosError<{message: string}>, context) => {
            toast.error(err.response?.data?.message || err?.message || "Unknown Error")
            queryClient.setQueryData(["ShopForUserCart"], context)
        }
    })

    const getUUId = useMutation({
        mutationFn: async() => {
            const response = await api.post("/getUUid")
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data.message)
            localStorage.setItem("uuid", data.sessionId)
            localStorage.setItem("totalprice", data.totalPrice)
            setTimeout(() => {
                navigate("/PayMentSection")
            }, 2000)
        },
        onError: (err: AxiosError<{message: string}>) => {
            toast.error(err.response?.data?.message || err?.message || "Unknown Error")
        }
    })

    const saveProductsCart = useMutation({
        mutationFn: async(data: mainSaveCart) => {
            const response = await api.post("/addProductToCart", data)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data?.message)
            getUUId.mutate()
        },
        onError: (err: AxiosError<{message: string}>) => {
            toast.error(err.response?.data?.message || err?.message || "Unknown Error")
        }
    })

    const saveProductsCart2 = useMutation({
        mutationFn: async(data: mainSaveCart) => {
            const response = await api.post("/addProductToCart", data)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data?.message)
        },
        onError: (err: AxiosError<{message: string}>) => {
            toast.error(err.response?.data?.message || err?.message || "Unknown Error")
        }
    })
    




    return (
        <div className="mainUserCart1">
            <div className="mainUserCart2">
                <h3>{emptyFields()}</h3>
                {
                    AllProductsInCartBeforSave?.products_user_cart?.map((item) => (
                        <div className="TotalCarts" key={item.id}>
                            <button className="deleteFromProductCart" onClick={() => {
                                    deleteProductStock.mutate({productid: item.id})
                                }}>
                                    <Trash2 size={15} />
                            </button>
                            <h5>Name: {item.productname}</h5>
                            <p>Price: {item.productprice}$</p>
                            <p>Avalible: {item.productAvalible}</p>
                            <div className="stocks">
                                <p>Stock: {item.productstock}</p>
                                <div className="stocksBtn">
                                    <button className="stockBTNMin stockBTN" onClick={() => {
                                        if (item.productstock <= 1) {
                                            toast.error("orderd can not be a negative number")
                                            return
                                        }
                                        decressProductStock(item.id)
                                    }}>
                                        <Minus size={10} />
                                    </button>
                                    <button className="stockBTNMax stockBTN" onClick={() => {
                                        if (item.productstock >= item.productAvalible) {
                                            toast.error(`Sorry! avalible is: ${item.productAvalible}`)
                                            return
                                        }
                                        increaseProductStock(item.id)
                                    }}>
                                        <Plus size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="totalPriceAndSaveBtn">
                <p className="totalPriceClass">Total price: {totalPrice === 0 ? "0" : totalPrice}$</p>
                <button disabled={saveProductsCart2.isPending} onClick={() => {
                    saveProductsCart2.mutate({
                        products: AllProductsInCartBeforSave?.products_user_cart.map((item) => ({
                            productid: item.id,
                            productname: item.productname,
                            productstock: item.productstock
                        })) ?? []
                    })
                }} className="saveBtn">
                    {
                        saveProductsCart2.isPending ? 
                        <Loading />
                        : "Save"
                    }
                </button>
            </div>
            <div className="totalPriceAndSaveBtn">
                <button className="PayBtn" disabled={saveProductsCart.isPending || getUUId.isPending} onClick={() => {
                    saveProductsCart.mutate({
                        products: AllProductsInCartBeforSave?.products_user_cart.map((item) => ({
                            productid: item.id,
                            productname: item.productname,
                            productstock: item.productstock
                        })) ?? []
                    })
                }}>
                    pay
                </button>
                <button className="deleteAllBtn" onClick={() => {
                    deleteAllProductFromCart.mutate()
                }}
                ><PackageX /></button>
            </div>
            {
                saveProductsCart.isPending && (
                    <CircularWaveLoader />
                )
            }
        </div>


    )




}









