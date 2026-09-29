import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../api/AxApi"
import { useState } from "react"
import { Link } from "react-router-dom"
import {X} from "lucide-react"
import { toast } from "sonner"





type allProductsType = {
    id: number,
    productname: string,
    productprice: number,
    productstock: number,
    image_links: string,
    description: string
}







type ProductsInShoppingCartType = {
    products_user_cart: allProductsType[],
    totalPrice: number
}





export function Products() {

    const queryClient = useQueryClient()



    const [translate, setTransLate] = useState(0)


    const [search, setSearch] = useState("")


    const [showProduct, setShowProduct] = useState<number>(0)

    const [showImage, setShowImage] = useState<string>("")



    const {
        data: products = []
    } = useQuery<allProductsType[]>({
        queryKey: ["products"],
        queryFn: async() => {
            const response = await api.get("/getAllProducts")
            return response.data?.products
        }
    })

    const {
        data: amazingproductss = [],
    } = useQuery<allProductsType[]>({
        queryKey: ["amazingproducts"],
        queryFn: async() => {
            const response = await api.get("/amazingproducts")
            return response.data?.amazingproducts
        }
    })

    const {
        data: ProductsInCart = {products_user_cart: []}
    } = useQuery<ProductsInShoppingCartType>({
        queryKey: ["ShopForUserCart"],
        queryFn: async() => {
            const response = await api.get("/getProductCart")
            return response.data
        },
        staleTime: Infinity
    })


    const addProductToCart = (data: {
        productid: number,
        productname?: string,
        productAvailible: number,
        productprice?: number,
        productstock: number
    }) => {
        if (ProductsInCart?.products_user_cart.length > 20) {
            return toast.error("Your shopping cart is full")
        }
        queryClient.setQueryData(["ShopForUserCart"], (old: ProductsInShoppingCartType) => {
            const productExistsInCart = old.products_user_cart.find((item) => item.id === data.productid)?.id
            if (productExistsInCart) {
                return {
                    ...old,
                    products_user_cart: old.products_user_cart.map((item) => (
                        item.id === productExistsInCart
                        ? {
                            ...item,
                            productstock: data.productstock
                        }
                        : item
                    ))
                } 
            }    
            return {
                ...old,
                products_user_cart: [
                    ...old.products_user_cart,
                    {
                        id: data.productid,
                        productname: data.productname,
                        productprice: data.productprice,
                        productAvalible: data.productAvailible,
                        productstock: data.productstock
                    }
                ]
            }
        })
    }



    


    



    const filterProducts = products.filter((item) => 
        item.productname.toLowerCase().includes(search.toLowerCase())
    )

    const showProductWithId = products.find((item) => (
        item.id === showProduct
    ))


 
    return (
        <div className="total-products">
            <div className="search">
                <input type="text" placeholder="Search: " className="search-in" value={search} onChange={(e) => {
                    setSearch(e.target.value)
                }} />
                <div className={`search-filter ${filterProducts.length !== 0 ? "" : "none"} ${search === "" ? "none" : null}`}>
                    {
                        filterProducts.map((item) => (
                            <div className={`result-search`} onClick={() => {
                                setShowProduct(item.id)
                            }} key={item.id}>
                                <Link to={"/"} className="search-link"><h3>{item.productname}</h3></Link>
                            </div>
                        ))
                    }
                </div>
                
            </div>
            <div className="total-amazing-products">
                <div className="title-amazing-products">
                    <h3 className="amazing-products-main-title">Amazing products</h3>
                    <div className="translate-btns">
                        <button className="orientation-icon" onClick={() => {
                            if (translate > -200) {
                                return
                            }
                            setTransLate(translate + 220)
                        }}>
                            <ChevronLeft />
                        </button>
                        <button className="orientation-icon" onClick={() => {
                            if (translate < -3000) {
                                return
                            }
                            setTransLate(translate - 220)
                        }}>
                            <ChevronRight />
                        </button>
                    </div>
                </div>
                <div className="amazing-main-products">
                    <div className="translate-amazing-products" style={{
                                    transform: `translateX(${translate}px)`,
                                    transition: `all 0.8s ease`
                                }}>
                        {
                            amazingproductss.map((item) => (
                                <div key={item.id} className="amazing-product" onClick={() => {
                                    setShowProduct(item.id)
                                }}>
                                    <img src={item.image_links} className="amzing-product-img" />
                                    <p>Name: {item.productname}</p>
                                    <p>Price: {item.productprice}$</p>
                                    <p>Availible: {item.productstock}</p>
                                    <button className="amzing-product-btn" onClick={(e) => {
                                        e.stopPropagation()
                                        addProductToCart({productid: item.id, productname: item.productname, productprice: item.productprice, productAvailible: item.productstock, productstock: 1})
                                    }}>
                                        Add
                                    </button>
                                </div>
                            ))
                        }
                        
                    </div>
                </div>
            </div>
            {
                showProduct === 0
                ? null 
                : (
                    <div className="show-product-first"> 
                        <div className="show-product">
                            <div className="show-product-name-close">
                                <h3>{showProductWithId?.productname}</h3>
                                <button onClick={() => {
                                    setShowProduct(0)
                                }} className="closebtn-show">
                                    <X />
                                </button>
                            </div>
                            <h3>{showProductWithId?.productprice}$</h3>
                            <h3>{showProductWithId?.productstock} avalible</h3>
                            <p>{showProductWithId?.description}</p>
                            <button className="add-product" onClick={() => {
                                if (!showProductWithId) {
                                    return
                                }
                                addProductToCart({productid: showProductWithId?.id, productname: showProductWithId?.productname, productprice: showProductWithId?.productprice, productAvailible: showProductWithId?.productstock, productstock: 1})
                            }}>
                                <Plus />
                            </button>
                        </div>
                    </div>
                )
            }

            <div className="allProducts">
                <div className="explains2">
                    <h3 className="explain2">You can find any product in this section</h3>
                </div>
                <div className="products-complex">
                    {
                        products.map((item) => (
                            <div key={item.id} className="product-complex">
                                <div className="nameandimage">
                                    <h3>Name: {item.productname}</h3>
                                    <img src={item.image_links} className="product-complex-image" onClick={() => {
                                        setShowImage(item.image_links)
                                    }}/>
                                </div>
                                <h4>Price: {item.productprice}</h4>
                                <p>Avalible: {item.productstock}</p>
                                <p className="description-margin">Description: {item.description}</p>
                                <div className="addbtn-div">
                                    <button className="addbtn-btn" onClick={() => {
                                        addProductToCart({productid: item.id, productname: item.productname, productprice: item.productprice, productAvailible: item.productstock, productstock: 1})
                                    }}>
                                        <Plus size={15}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className={`showimageselectedfirst ${showImage === "" ? "none" : ""}`} onClick={() => {
                    setShowImage("")
                }}>
                    {
                        showImage !== "" && (
                            <div>
                                <img src={showImage} className="showimageselected" onClick={(e) => {
                                    e.stopPropagation()
                                }} />
                            </div>
                        )
                    }
                </div>




            </div>





        </div>



    )


}



