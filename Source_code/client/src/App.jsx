import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import MilkRecords from './pages/MilkRecords';
import ViewRecords from './pages/ViewRecords';
import SaleRecords from './pages/SaleRecords';
import ViewSaleRecords from './pages/ViewSaleRecords';
import ItemSales from './pages/ItemSales';
import ViewItemSales from './pages/ViewItemSales';
import ItemRates from './pages/ItemRates';
import Customers from './pages/Customers';
import SupplierBilling from './pages/SupplierBilling';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/milk-records" element={<MilkRecords />} />
        <Route path="/sale-records" element={<SaleRecords />} />
        <Route path="/item-sales" element={<ItemSales />} />
        <Route path="/view-records" element={<ViewRecords />} />
        <Route path="/view-sales" element={<ViewSaleRecords />} />
        <Route path="/view-item-sales" element={<ViewItemSales />} />
        <Route path="/item-rates" element={<ItemRates />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/supplier-billing" element={<SupplierBilling />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
