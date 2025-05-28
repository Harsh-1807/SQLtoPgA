-- Demo SQL File for SQL File Executor
-- This file creates a sample database schema for a bookstore

-- Create tables
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE,
    bio TEXT
);

CREATE TABLE publishers (
    publisher_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    founded_year INTEGER,
    website VARCHAR(100)
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author_id INTEGER REFERENCES authors(author_id),
    publisher_id INTEGER REFERENCES publishers(publisher_id),
    publication_year INTEGER,
    isbn VARCHAR(20) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    registration_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    book_id INTEGER REFERENCES books(book_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Insert sample data
INSERT INTO authors (first_name, last_name, birth_date, bio) VALUES
('Jane', 'Austen', '1775-12-16', 'English novelist known primarily for her six major novels'),
('George', 'Orwell', '1903-06-25', 'English novelist, essayist, journalist and critic'),
('J.K.', 'Rowling', '1965-07-31', 'British author and philanthropist'),
('Harper', 'Lee', '1926-04-28', 'American novelist widely known for To Kill a Mockingbird'),
('F. Scott', 'Fitzgerald', '1896-09-24', 'American novelist, essayist, and short story writer');

INSERT INTO publishers (name, founded_year, website) VALUES
('Penguin Books', 1935, 'www.penguin.com'),
('HarperCollins', 1989, 'www.harpercollins.com'),
('Bloomsbury', 1986, 'www.bloomsbury.com'),
('Scholastic', 1920, 'www.scholastic.com'),
('Random House', 1927, 'www.randomhouse.com');

INSERT INTO books (title, author_id, publisher_id, publication_year, isbn, price, stock) VALUES
('Pride and Prejudice', 1, 1, 1813, '978-0141439518', 9.99, 50),
('1984', 2, 1, 1949, '978-0451524935', 12.99, 30),
('Harry Potter and the Philosopher''s Stone', 3, 3, 1997, '978-0747532699', 15.99, 100),
('To Kill a Mockingbird', 4, 2, 1960, '978-0060935467', 10.99, 25),
('The Great Gatsby', 5, 5, 1925, '978-0743273565', 11.99, 40),
('Animal Farm', 2, 1, 1945, '978-0451526342', 8.99, 20),
('Harry Potter and the Chamber of Secrets', 3, 3, 1998, '978-0747538486', 15.99, 90),
('Sense and Sensibility', 1, 1, 1811, '978-0141439662', 9.99, 15);

INSERT INTO customers (first_name, last_name, email, registration_date) VALUES
('John', 'Smith', 'john.smith@example.com', '2023-01-15'),
('Emma', 'Johnson', 'emma.johnson@example.com', '2023-02-20'),
('Michael', 'Williams', 'michael.williams@example.com', '2023-03-10'),
('Sarah', 'Brown', 'sarah.brown@example.com', '2023-04-05'),
('David', 'Jones', 'david.jones@example.com', '2023-05-12');

INSERT INTO orders (customer_id, order_date, total_amount) VALUES
(1, '2023-06-01 10:30:00', 32.97),
(2, '2023-06-05 14:45:00', 15.99),
(3, '2023-06-10 09:15:00', 24.98),
(4, '2023-06-15 16:20:00', 26.98),
(1, '2023-06-20 11:05:00', 41.97);

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
(1, 1, 1, 9.99),
(1, 2, 1, 12.99),
(1, 6, 1, 8.99),
(2, 3, 1, 15.99),
(3, 4, 1, 10.99),
(3, 5, 1, 11.99),
(4, 7, 1, 15.99),
(4, 6, 1, 8.99),
(5, 3, 1, 15.99),
(5, 4, 1, 10.99),
(5, 5, 1, 11.99);

-- Sample SELECT queries
-- Top selling books
SELECT 
    b.title,
    a.first_name || ' ' || a.last_name AS author_name,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM 
    books b
JOIN 
    authors a ON b.author_id = a.author_id
JOIN 
    order_items oi ON b.book_id = oi.book_id
GROUP BY 
    b.title, author_name
ORDER BY 
    total_sold DESC;

-- Customer purchase history
SELECT 
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    COUNT(DISTINCT o.order_id) AS order_count,
    SUM(o.total_amount) AS total_spent
FROM 
    customers c
JOIN 
    orders o ON c.customer_id = o.customer_id
GROUP BY 
    customer_name, c.email
ORDER BY 
    total_spent DESC;

-- Book inventory summary
SELECT 
    p.name AS publisher,
    COUNT(b.book_id) AS book_count,
    SUM(b.stock) AS total_stock,
    AVG(b.price) AS average_price
FROM 
    books b
JOIN 
    publishers p ON b.publisher_id = p.publisher_id
GROUP BY 
    p.name
ORDER BY 
    book_count DESC;
