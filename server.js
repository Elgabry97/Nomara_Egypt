const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// الاتصال بقاعدة البيانات
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'store_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. جلب جميع المنتجات مع المخزون المتاح
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'حدث خطأ في جلب المنتجات: ' + err.message });
    }
});

// 2. إنشاء طلب جديد وتحديث المخزون تلقائياً بـ Database Transaction
app.post('/api/orders', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { customer_name, customer_phone, address, governorate, shipping_fee, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('السلة فارغة، يرجى إضافة منتجات قبل إتمام الطلب');
        }

        let calculated_total = 0;

        // التحقق من توفر المخزون وحساب الإجمالي
        for (const item of items) {
            // جلب المنتج بالـ productKey أو الـ id
            const [productRows] = await connection.query(
                'SELECT id, price, stock FROM products WHERE product_key = ? OR id = ?',
                [item.productKey || item.product_id, item.product_id || 0]
            );

            if (productRows.length > 0) {
                const prod = productRows[0];
                if (prod.stock < item.qty) {
                    throw new Error(`الكمية المتاحة من المنتج (${item.product}) غير كافية (المتبقي: ${prod.stock})`);
                }
                item.db_product_id = prod.id;
            } else {
                item.db_product_id = null;
            }

            calculated_total += item.unitPrice * item.qty;
        }

        const fee = Number(shipping_fee) || 0;
        const grand_total = calculated_total + fee;

        // إنشاء الطلب الرئيسي
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, customer_phone, address, governorate, total_price, shipping_fee) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_name, customer_phone, address, governorate || '', grand_total, fee]
        );
        const orderId = orderResult.insertId;

        // إدراج عناصر الطلب وتحديث المخزون
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, product_name, color, size, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [orderId, item.db_product_id, item.product, item.color || '', item.size || '', item.qty, item.unitPrice]
            );

            // خصم الكمية من جدول المنتجات إذا كان معرف المنتج موجوداً
            if (item.db_product_id) {
                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.qty, item.db_product_id]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, order_id: orderId, total_price: grand_total });
    } catch (err) {
        await connection.rollback();
        console.error('Error creating order:', err);
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 3. استقبال طلبات الاسترجاع والدعم
app.post('/api/returns', async (req, res) => {
    try {
        const { order_id, name, phone, reason, notes } = req.body;
        // يمكن تخزينها في جدول مخصص أو معالجتها
        res.json({ success: true, message: 'تم تسجيل طلب الإرجاع بنجاح' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 NOMARA Backend Server running on port ${PORT}`));
