import { z } from "zod"




export const signupValidation = z.object({
    username: z
    .string()
    .trim()
    .min(4, "Username must be 4 character.")
    .max(16, "Username can not be more than 16 character"),
    email: z
    .string()
    .trim()
    .email()
    .min(4, "Email must be 4 character at least")
    .max(32, "Email can not be more than 20 character"),
    password: z
    .string()
    .trim()
    .min(8, "Password must be 8 character at least")
    .max(32, "Password can not be more than 20 character") 
});



export const loginValidation = z.object({
    username: z
    .string()
    .trim()
    .min(4, "Username must be 4 character at least")
    .max(16, "Username must be 16 character at most"),
    password: z
    .string()
    .trim()
    .min(8, "password can not be less than 8 chaacter")
    .max(32, "Password must be 20 character at most")
})

export const editValidation = z.object({
    username: z 
    .string()
    .trim()
    .min(4, "Username must be 4 character")
    .max(8, "Username can not be more than 8 character")
    .optional()
    .or(z.literal("")),
    email: z
    .string()
    .trim()
    .email("Invalid email format")
    .max(32, "Email can not be more than 32 character")
    .optional()
    .or(z.literal("")),
})

export const editPasswordValidation = z.object({
    oldPassword: z
    .string()
    .trim()
    .min(8, "Password must be 8 character at least")
    .max(16, "Password can not be more than 16 character"),
    newPassword: z
    .string()
    .trim()
    .min(8, "New password must be 8 character")
    .max(16, "New password can not be more than 16 character"),
    confirmPassword: z
    .string()
    .trim()
})

export const changeForgottenPasswordValidation = z.object({
    email: z 
    .string()
    .trim()
    .email(),
    code: z 
    .string()
    .trim()
    .min(6, "Code must be 6 character")
    .max(6, "Code must be 6 character"),
    newPassword: z
    .string()
    .trim()
    .min(8, "New password must be 8 character")
    .max(16, "New password can not be more than 16 character"),
    confirmPassword: z
    .string()
    .trim()
})
