CREATE TABLE "user"(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255)
);

CREATE TABLE token(
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    refresh_token TEXT
);

CREATE TABLE address(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    city VARCHAR(255),
    street VARCHAR(255),
    index VARCHAR(255),
    phone VARCHAR(255)
);

CREATE TABLE category(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE product(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    description VARCHAR(255),
    photo VARCHAR(255),
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES category(id),
    status VARCHAR(255),
    remaining INTEGER
);

CREATE TABLE review(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    product_id INTEGER,
    FOREIGN KEY (product_id) REFERENCES product(id),
    rating INTEGER,
    comment VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order"(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(255),
    amount INTEGER
);

CREATE TABLE order_item(
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    FOREIGN KEY (order_id) REFERENCES "order"(id),
    product_id INTEGER,
    FOREIGN KEY (product_id) REFERENCES product(id),
    quantity INTEGER,
    price DECIMAL(10, 2),
    payment_status VARCHAR(255)
);

CREATE TABLE payment(
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    FOREIGN KEY (order_id) REFERENCES "order"(id),
    payment_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(255),
    status VARCHAR(255)
);