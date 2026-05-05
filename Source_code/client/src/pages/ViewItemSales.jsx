import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- Icons ---
const CalendarIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const DownloadIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const FilterIcon = () => (<svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const TagIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>);
const Spinner = () => (<svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

const ViewItemSales = () => {
    // --- State ---
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [totals, setTotals] = useState({ quantity: 0, amount: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        purchaserName: '',
        productId: '',
    });

    // --- Effects ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products'); 
                setProducts(response.data);
            } catch (error) { console.error('Error fetching products:', error); }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchSales(); }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    // --- Logic ---
    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/item-sales', { params: filters });
            setSales(response.data.sales);
            setTotals(response.data.totals);
        } catch (error) { console.error('Error fetching sales:', error); } 
        finally { setIsLoading(false); }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get('/item-sales/download-pdf', { params: filters, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            let fileName = 'Sales-Report';
            if (filters.purchaserName) fileName += `-${filters.purchaserName}`;
            if (filters.productId) {
                const selectedProd = products.find(p => p.id === filters.productId);
                if (selectedProd) fileName += `-${selectedProd.name}`;
            }
            fileName += `-${filters.startDate}.pdf`;
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click(); link.remove();
        } catch (error) { alert("Failed to download report."); } 
        finally { setIsDownloading(false); }
    };

    const handleDelete = async (id, productName) => {
        if (!window.confirm(`Delete sale record for ${productName}?`)) return;
        setDeleteLoading(id);
        try {
            await api.delete(`/item-sales/${id}`);
            await fetchSales();
        } catch (error) { alert("Failed to delete record."); } 
        finally { setDeleteLoading(null); }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden flex-none z-20">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-slate-700 p-2 rounded-md hover:bg-slate-100">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-lg font-bold text-slate-800">DairyManager</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-4 h-full">
                        
                        {/* Top Bar: Title & Stats */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-none">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Product Sales</h1>
                                    <p className="text-xs text-slate-500">History & Report</p>
                                </div>
                                <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
                                {/* Summary Stats */}
                                <div className="hidden sm:flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Qty</span>
                                        <span className="text-sm font-bold text-blue-600">{totals.quantity.toFixed(1)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                                        <span className="text-sm font-bold text-green-600">₹{totals.amount.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleDownloadPdf} 
                                disabled={isDownloading || sales.length === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm ${isDownloading || sales.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {isDownloading ? <Spinner /> : <DownloadIcon />} 
                                {isDownloading ? 'Exporting...' : 'Download PDF'}
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between flex-none">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 md:w-56">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><SearchIcon /></div>
                                    <input 
                                        type="text" 
                                        name="purchaserName"
                                        placeholder="Search Purchaser..." 
                                        value={filters.purchaserName} 
                                        onChange={handleFilterChange} 
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                {/* Product Select */}
                                <div className="relative flex-1 md:w-48">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><TagIcon /></div>
                                    <select 
                                        name="productId" 
                                        value={filters.productId} 
                                        onChange={handleFilterChange} 
                                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="">All Products</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Date Range */}
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400"><CalendarIcon /></div>
                                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500" />
                                </div>
                                <span className="text-slate-300 text-xs font-medium">to</span>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400"><CalendarIcon /></div>
                                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col min-h-[300px]">
                            
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 text-blue-600">
                                        <div className="w-8 h-8"><Spinner /></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full table-fixed border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Date</th>
                                            <th className="w-[20%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Product</th>
                                            <th className="w-[25%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Purchaser</th>
                                            <th className="w-[10%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Qty</th>
                                            <th className="w-[10%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Rate</th>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Amount</th>
                                            <th className="w-[5%] px-4 py-3 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sales.length > 0 ? sales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">
                                                    {new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-slate-700 truncate">
                                                    {sale.product?.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 truncate">
                                                    {sale.purchaserName}
                                                    {sale.customer && sale.paymentStatus === 'PENDING' && (
                                                        <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Due</span>
                                                    )}
                                                    {sale.customer && sale.paymentStatus === 'PAID' && (
                                                        <span className="ml-2 text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Paid</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600 text-sm">{parseFloat(sale.quantity).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-500 text-xs">₹{parseFloat(sale.rate).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-green-600 text-sm">₹{parseFloat(sale.amount).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => handleDelete(sale.id, sale.product?.name)} 
                                                        disabled={deleteLoading === sale.id}
                                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Record"
                                                    >
                                                        {deleteLoading === sale.id ? <Spinner /> : <TrashIcon />}
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            !isLoading && (
                                                <tr>
                                                    <td colSpan="7" className="py-20 text-center text-slate-400 text-sm italic">
                                                        No sales records found matching the filters.
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                    {/* Footer Summary Row */}
                                    {sales.length > 0 && (
                                        <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total</td>
                                                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-800 bg-blue-50/50">{totals.quantity.toFixed(2)}</td>
                                                <td className="px-4 py-3"></td>
                                                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-green-700 bg-green-50/50 border-l border-green-100">₹{totals.amount.toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default ViewItemSales;