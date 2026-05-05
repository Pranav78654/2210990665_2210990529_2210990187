const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');



const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const milkRecordRoutes = require('./routes/milkRecordRoutes');
const milkSupplierRoutes = require('./routes/milkSupplierRoutes');
const milkSaleRoutes = require('./routes/milkSaleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

const itemSaleRoutes = require('./routes/itemSaleRoutes');
const productRoutes = require('./routes/productRoutes');
const productController = require('./controllers/productController');
const customerRoutes = require('./routes/customerRoutes');

productController.seedProducts().catch(err => console.error('Product seed failed', err));
console.log("DATABASE_URL =", process.env.DATABASE_URL);

app.use('/api/auth', authRoutes);
app.use('/api/milk-records', milkRecordRoutes);
app.use('/api/milk-suppliers', milkSupplierRoutes);
app.use('/api/milk-sales', milkSaleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/item-sales', itemSaleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
    res.send('Dairy Business System API is running');
});



app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
