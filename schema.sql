-- 1. إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE store_db;

-- 2. جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    governorate VARCHAR(100),
    total_price DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول عناصر الطلب (ربط المنتجات والخيارات بالطلبات)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    size VARCHAR(100),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 5. إدراج منتجات نومارا الأولية مع المخزون الابتدائي
INSERT INTO products (product_key, name, price, description, image_url, stock)
VALUES 
('sheet', 'ملاية استيك استرايب قطن', 430.00, 'خامة قطن مريحة، ثبات ممتاز على المرتبة، وشكل استرايب ساتان شيك يناسب كل الأذواق', 'images/nomara_img_09.jpg', 50),
('duvet', 'لحاف فرو بابلز', 2350.00, 'لحاف فرو ناعم بتصميم بابلز فاخر، دفء حقيقي وفخامة هادئة يناسب غرفة نومك', 'images/nomara_img_23.jpg', 30)
ON DUPLICATE KEY UPDATE stock=VALUES(stock);
