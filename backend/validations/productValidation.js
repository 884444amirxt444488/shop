import z from "zod"




export const addProductValidation = z.object({
    productname: z 
    .string()
    .trim()
    .min(4, "Product must be more than 4 character")
    .max(52, "Product can not be more than 52 character"),
    productprice: z
    .number()
    .min(1, "Price can not be less than $1")
    .max(10000000000000, "Price can not be more than $10000000000000"),
    productstock: z
    .number()
    .min(0, "Stock can not be less than 0")
    .max(999999, "Stock can not be more than 999999 stocks")
})

export const editProductValidation = z.object({
    productname: z
    .string()
    .trim()
    .min(4, "Product must be more than 4 character")
    .max(52, "Product can not be more than 52 character")
    .optional()
    .or(z.literal("")),
    productprice: z
    .coerce.number()
    .min(1, "Price can not be less than $1")
    .max(10000000000000, "Price can not be more than $10000000000000")
    .optional()
    .or(z.literal("")),
    productstock: z
    .coerce.number()
    .min(0, "Stock can not be less than 0")
    .max(999999, "Stock can not be more than 999999 stocks")
    .optional()
    .or(z.literal(""))
})















