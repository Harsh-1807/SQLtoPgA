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




