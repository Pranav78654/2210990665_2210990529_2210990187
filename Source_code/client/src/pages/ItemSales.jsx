import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- ICONS ---
const SearchIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const SaveIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>);
const CalendarIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const CheckIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>);

// --- COMPONENT: KEYBOARD SEARCHABLE SELECT ---
const KeyboardSearchableSelect = ({ options, value, onChange, placeholder, nextRef }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options, searchTerm]);

    useEffect(() => {
        const selected = options.find(o => o.value === value);
        if (selected) setSearchTerm(selected.label);
        else if (value === '') setSearchTerm('');
    }, [value, options]);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } });
        setSearchTerm(option.label);
        setIsOpen(false);
        if (nextRef && nextRef.current) nextRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
            setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (isOpen && filteredOptions.length > 0) handleSelect(filteredOptions[highlightedIndex]);
            else setIsOpen(true);
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium text-sm transition-all"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); setHighlightedIndex(0); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar">
                    {filteredOptions.map((option, index) => (
                        <li key={option.value} onClick={() => handleSelect(option)} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${index === highlightedIndex ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
const ItemSales = () => {
    // --- State ---
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // View State
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

    // Form State
    const [saleType, setSaleType] = useState('CASH'); // CASH or CUSTOMER
    const [formData, setFormData] = useState({
        productId: '', purchaserName: 'Cash', customerId: '', paymentStatus: 'PAID',
        quantity: '', rate: '', amount: '', date: new Date().toISOString().split('T')[0]
    });

    // Refs
    const purchaserRef = useRef(null);
    const quantityRef = useRef(null);
    const rateRef = useRef(null);
    const amountRef = useRef(null);
    const viewDateInputRef = useRef(null);

    // --- API & Init ---
    const fetchAllData = async () => {
        try {
            const [prodRes, custRes] = await Promise.all([api.get('/products'), api.get('/customers')]);
            setProducts(prodRes.data);
            setCustomers(custRes.data);
            // Default Product
            if (prodRes.data.length > 0 && !formData.productId) {
                setFormData(prev => ({ ...prev, productId: prodRes.data[0].id, rate: prodRes.data[0].defaultRate }));
            }
        } catch (e) { console.error(e); }
    };

    const fetchSales = async () => {
        try {
            const res = await api.get(`/item-sales?date=${viewDate}`);
            setSales(res.data.sales || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAllData(); }, []);
    
    // Sync View Date to Form Date & Fetch Data
    useEffect(() => { 
        fetchSales(); 
        setFormData(prev => ({ ...prev, date: viewDate }));
    }, [viewDate]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault(); setSaleType('CASH');
                setFormData(p => ({ ...p, purchaserName: 'Cash', customerId: '', paymentStatus: 'PAID' }));
                setTimeout(() => purchaserRef.current?.focus(), 50);
            }
            if (e.altKey && e.key.toLowerCase() === 'r') {
                e.preventDefault(); setSaleType('CUSTOMER');
                setFormData(p => ({ ...p, purchaserName: '', paymentStatus: 'PENDING' }));
                // Focus is handled by Select component logic mostly, or user tabs
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    // --- Handlers ---
    const handleProductSelect = (product) => {
        let newRate = product.defaultRate;
        let newAmount = formData.amount;
        if (formData.quantity && newRate) newAmount = (parseFloat(formData.quantity) * parseFloat(newRate)).toFixed(2);
        setFormData(prev => ({ ...prev, productId: product.id, rate: newRate, amount: newAmount }));
        // Auto focus quantity after product select
        setTimeout(() => quantityRef.current?.focus(), 50);
    };

    const handleQuantityChange = (val) => {
        let amt = formData.amount;
        if (val && formData.rate) amt = (parseFloat(val) * parseFloat(formData.rate)).toFixed(2);
        setFormData(prev => ({ ...prev, quantity: val, amount: amt }));
    };

    const handleRateChange = (val) => {
        let amt = formData.amount;
        if (formData.quantity && val) amt = (parseFloat(formData.quantity) * parseFloat(val)).toFixed(2);
        setFormData(prev => ({ ...prev, rate: val, amount: amt }));
    };

    const handleAmountChange = (val) => {
        let qty = formData.quantity;
        if (val && formData.rate && parseFloat(formData.rate) > 0) qty = (parseFloat(val) / parseFloat(formData.rate)).toFixed(2);
        setFormData(prev => ({ ...prev, amount: val, quantity: qty }));
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const customer = customers.find(c => c.id === customerId);
        setFormData(prev => ({ ...prev, customerId, purchaserName: customer ? customer.name : '' }));
    };

    const handleEnterKey = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) nextRef.current.focus();
            else handleSubmit(e);
        }
        if (e.ctrlKey && e.key === 'Enter') handleSubmit(e);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            const payload = {
                ...formData,
                date: viewDate, // Use View Context Date
                purchaserName: saleType === 'CASH' ? (formData.purchaserName || 'Cash') : formData.purchaserName,
                customerId: saleType === 'CUSTOMER' ? formData.customerId : null,
                paymentStatus: saleType === 'CASH' ? 'PAID' : formData.paymentStatus
            };
            await api.post('/item-sales/add', payload);
            fetchSales();
            
            // Smart Reset
            const currentProd = products.find(p => p.id === formData.productId);
            setFormData(prev => ({
                ...prev,
                purchaserName: saleType === 'CASH' ? 'Cash' : '',
                customerId: '',
                quantity: '',
                amount: '',
                rate: currentProd ? currentProd.defaultRate : '',
                // Keep type and view date
            }));
            
            // Refocus based on mode
            if (saleType === 'CASH') setTimeout(() => quantityRef.current?.focus(), 50);
            
        } catch (error) { alert('Failed to save'); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete entry?")) {
            await api.delete(`/item-sales/${id}`);
            fetchSales();
        }
    };

    const openViewDatePicker = () => {
        if (viewDateInputRef.current?.showPicker) viewDateInputRef.current.showPicker();
        else viewDateInputRef.current?.focus();
    };

    // --- Calculations ---
    const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 lg:hidden flex-none">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 p-2"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                        <h1 className="text-lg font-bold text-slate-800">DairyManager</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden p-3 lg:p-4">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-4">
                        
                        {/* === LEFT PANEL: ENTRY FORM === */}
                        <div className="lg:w-[420px] flex-none flex flex-col gap-4 h-full">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full ring-1 ring-slate-100">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">⚡ New Item Sale</h2>
                                        <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                                            <span>Alt+C: Cash</span> • <span>Alt+R: Credit</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        
                                        {/* 1. Mode Toggle */}
                                        <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
                                            {['CASH', 'CUSTOMER'].map(type => (
                                                <button key={type} type="button" onClick={() => { setSaleType(type); setFormData(p => ({ ...p, purchaserName: type === 'CASH' ? 'Cash' : '', customerId: '', paymentStatus: type === 'CASH' ? 'PAID' : 'PENDING' })); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${saleType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                    {type === 'CASH' ? 'Cash Sale' : 'Customer (Credit)'}
                                                </button>
                                            ))}
                                        </div>

                                        {/* 2. Product Selection (Grid) */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Product</label>
                                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                {products.map(p => (
                                                    <div key={p.id} onClick={() => handleProductSelect(p)} className={`cursor-pointer px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-between transition-all ${formData.productId === p.id ? 'bg-blue-500 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                                                        <span>{p.name}</span>
                                                        {formData.productId === p.id && <CheckIcon />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. Who? */}
                                        {saleType === 'CASH' ? (
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Purchaser Name</label>
                                                <input ref={purchaserRef} type="text" name="purchaserName" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={formData.purchaserName} onChange={e => setFormData({...formData, purchaserName: e.target.value})} onKeyDown={(e) => handleEnterKey(e, quantityRef)} placeholder="e.g. Cash" />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Customer</label>
                                                    <KeyboardSearchableSelect options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.mobile || '-'})` }))} value={formData.customerId} onChange={handleCustomerChange} placeholder="Search Customer..." nextRef={quantityRef} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <label className={`flex-1 cursor-pointer border rounded-lg p-2 text-center text-xs font-bold ${formData.paymentStatus === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 text-slate-400'}`}><input type="radio" name="paymentStatus" value="PAID" checked={formData.paymentStatus === 'PAID'} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} className="hidden"/> Paid</label>
                                                    <label className={`flex-1 cursor-pointer border rounded-lg p-2 text-center text-xs font-bold ${formData.paymentStatus === 'PENDING' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 text-slate-400'}`}><input type="radio" name="paymentStatus" value="PENDING" checked={formData.paymentStatus === 'PENDING'} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} className="hidden"/> Due</label>
                                                </div>
                                            </div>
                                        )}

                                        {/* 4. Numbers */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Qty</label>
                                                <input ref={quantityRef} type="number" step="0.01" value={formData.quantity} onChange={e => handleQuantityChange(e.target.value)} onKeyDown={(e) => handleEnterKey(e, rateRef)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase">Rate</label>
                                                <input ref={rateRef} type="number" step="0.01" value={formData.rate} onChange={e => handleRateChange(e.target.value)} onKeyDown={(e) => handleEnterKey(e, amountRef)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Total Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3 text-green-700 font-bold text-lg">₹</span>
                                                <input ref={amountRef} type="number" step="0.01" value={formData.amount} onChange={e => handleAmountChange(e.target.value)} onKeyDown={(e) => handleEnterKey(e, null)} className="w-full pl-8 pr-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-black text-2xl focus:ring-2 focus:ring-green-500 outline-none shadow-inner" placeholder="0.00" />
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2">
                                            <SaveIcon /> Save Sale (Ctrl+Enter)
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* === RIGHT PANEL: TABLE === */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200">
                            
                            {/* Filter Bar */}
                            <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                                <div>
                                    <h2 className="font-bold text-slate-800">Sales Log</h2>
                                    <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                                        <span>Items: <b>{sales.length}</b></span>
                                        <span>Total: <b className="text-green-600">₹{totalRevenue.toFixed(0)}</b></span>
                                    </div>
                                </div>
                                <div onClick={openViewDatePicker} className="relative flex items-center gap-3 bg-white border border-slate-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 px-4 py-2 rounded-xl cursor-pointer transition-all group shadow-sm">
                                    <CalendarIcon className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">{new Date(viewDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    <input ref={viewDateInputRef} type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full table-fixed border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="w-[20%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Product</th>
                                            <th className="w-[30%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Purchaser</th>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Qty</th>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Rate</th>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Amount</th>
                                            <th className="w-[5%] px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sales.length > 0 ? sales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-3 font-semibold text-slate-800 text-sm truncate">{sale.product?.name || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600 truncate">
                                                    {sale.purchaserName}
                                                    {sale.customer && sale.paymentStatus === 'PENDING' && <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Due</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-700 text-sm">{parseFloat(sale.quantity).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-500 text-xs">{parseFloat(sale.rate).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600 text-sm">₹{parseFloat(sale.amount).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => handleDelete(sale.id)} className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all"><TrashIcon /></button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" className="py-20 text-center text-slate-400 text-sm italic">No sales recorded for this date.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ItemSales;