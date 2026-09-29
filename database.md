# Database Documentation

## Users Table

The `users` table stores the authentication and account information of users.

### Table Structure

```sql
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(52) UNIQUE NOT NULL,
    email VARCHAR(52) UNIQUE NOT NULL,
    password VARCHAR(256) NOT NULL,
    refreshtoken VARCHAR(256),
    code VARCHAR(256) DEFAULT NULL,
    date TIMESTAMP DEFAULT NULL
);

## Products Table

The `products` table stores information about products available in the shop.

### Table Structure

```sql
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    productname VARCHAR(52) UNIQUE NOT NULL,
    productprice DECIMAL(16, 2) NOT NULL,
    productstock INT NOT NULL,
    created_at TIMESTAMP NOW(),
    image_links VARCHAR(256),
    DESCRIPTION TEXT DEFAULT 'NONE DESCRIPTION'
)