import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- ICONS ---
const SearchIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const PlusIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const UserIcon = () => (<svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const DownloadIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const ChevronRight = () => (<svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>);
const WalletIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const RefreshIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
const Spinner = () => (<svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const CheckCircleIcon = () => (<svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ExclamationCircleIcon = () => (<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const XMarkIcon = () => (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const PencilIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const PhoneIcon = () => (<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);

// --- Custom Toast ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-top-5 duration-300 ${type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'}`}>
            <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                {type === 'success' ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
            </div>
            <div>
                <h4 className={`text-sm font-bold ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{type === 'success' ? 'Success' : 'Error'}</h4>
                <p className="text-xs text-slate-500 font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 pl-2"><XMarkIcon className="w-4 h-4" /></button>
        </div>
    );
};

const Customers = () => {
    // --- UI State ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('HISTORY');
    const [toast, setToast] = useState(null);

    // --- Data State ---
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null); // NULL = Add Mode
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // --- Forms ---
    const [customerForm, setCustomerForm] = useState({ name: '', mobile: '', address: '' });
    // Payment Form & Edit
    const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    const [editingPaymentId, setEditingPaymentId] = useState(null);

    // Filters
    const [historyFilter, setHistoryFilter] = useState({ 
        types: ['PENDING', 'PAYMENT', 'PAID'], 
        startDate: '', 
        endDate: '' 
    });

    const showToast = (message, type = 'success') => setToast({ message, type });

    // --- Effects ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => { fetchCustomers(searchQuery); }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        if (selectedCustomer) {
            setHistory([]);
            fetchHistory(selectedCustomer.id);
            setCustomerForm({ 
                name: selectedCustomer.name, 
                mobile: selectedCustomer.mobile || '', 
                address: selectedCustomer.address || '' 
            });
            resetPaymentForm();
            setActiveTab('HISTORY');
        } else {
            setCustomerForm({ name: '', mobile: '', address: '' });
        }
    }, [selectedCustomer]);

    // --- API Calls ---
    const fetchCustomers = async (query = '') => {
        try {
            const res = await api.get('/customers');
            let data = res.data || [];
            if (query) {
                const lower = query.toLowerCase();
                data = data.filter(c => c.name.toLowerCase().includes(lower) || (c.mobile && c.mobile.includes(lower)));
            }
            setCustomers(data);
        } catch (e) { console.error(e); }
    };

    const fetchHistory = async (id) => {
        setHistoryLoading(true);
        try {
            const res = await api.get(`/customers/${id}/history`);
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); setHistory([]); }
        finally { setHistoryLoading(false); }
    };

    // --- Handlers: Customer CRUD ---
    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCustomer) {
                // --- FIX: USE PUT FOR UPDATING CUSTOMER ---
                await api.put(`/customers/update/${selectedCustomer.id}`, customerForm);
                
                // Update Local State immediately
                setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...customerForm } : c));
                setSelectedCustomer(prev => ({ ...prev, ...customerForm }));
                
                showToast("Customer Profile Updated");
            } else {
                // --- ADD NEW CUSTOMER ---
                const res = await api.post('/customers/add', customerForm);
                fetchCustomers(searchQuery);
                // Optionally select the new customer
                // setSelectedCustomer(res.data); 
                showToast("Customer Added");
            }
        } catch (e) { showToast("Failed to save", 'error'); }
    };

    const handleDeleteCustomer = async () => {
        if (!window.confirm(`Delete customer ${selectedCustomer.name}?`)) return;
        try {
             await api.delete(`/customers/delete/${selectedCustomer.id}`); 
             fetchCustomers();
             setSelectedCustomer(null);
             showToast("Customer Deleted");
        } catch (e) { 
            console.error(e); 
            showToast("Error deleting customer", 'error');
        }
    };

    // --- Handlers: Payments ---
    const resetPaymentForm = () => {
        setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
        setEditingPaymentId(null);
    };

    const handleInitEditPayment = (payment) => {
        setPaymentForm({
            amount: parseFloat(payment.amount),
            date: new Date(payment.date).toISOString().split('T')[0],
            description: payment.description || ''
        });
        setEditingPaymentId(payment.id);
        document.querySelector('.control-panel-scroll-anchor')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!paymentForm.amount) return;
        try {
            if (editingPaymentId) {
                // --- UPDATE EXISTING PAYMENT ---
                await api.put(`/customers/payment/${editingPaymentId}`, { 
                    customerId: selectedCustomer.id, 
                    ...paymentForm 
                });
                showToast("Payment Updated");
            } else {
                // --- ADD NEW PAYMENT ---
                await api.post('/customers/payment', { 
                    customerId: selectedCustomer.id, 
                    ...paymentForm 
                });
                showToast("Payment Recorded");
            }

            // Refresh Logic
            fetchHistory(selectedCustomer.id);
            fetchCustomers(searchQuery); // Update balance in list
            
            // Calculate new balance locally (Approximation for instant UI feedback)
            // (Note: Fetching from API above is the source of truth, but this helps UI responsiveness)
            const currentAmount = parseFloat(paymentForm.amount);
            
            // If editing, we need to revert old amount and apply new amount. 
            // Since we re-fetch immediately, we can skip complex local calc or do a simple adjustment.
            // For now, let's rely on re-fetch to keep logic simple and bug-free.
            
            resetPaymentForm();
        } catch (e) { showToast("Payment failed", 'error'); }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm("Delete this payment?")) return;
        try {
            await api.delete(`/customers/payment/delete/${id}`);
            fetchHistory(selectedCustomer.id);
            fetchCustomers(searchQuery);
            showToast("Payment Deleted");
        } catch (e) { showToast("Error deleting payment", 'error'); }
    };

    const handleDownloadPdf = async () => {
        try {
            const filteredHistory = getFilteredHistory();
            const res = await api.post(`/customers/${selectedCustomer.id}/generate-report`, { 
                history: filteredHistory, 
                dateRange: { startDate: historyFilter.startDate, endDate: historyFilter.endDate }
            }, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${selectedCustomer.name}.pdf`);
            document.body.appendChild(link); link.click(); link.remove();
        } catch (e) { showToast("PDF Error", 'error'); }
    };

    // --- Filters ---
    const handleFilterTypeChange = (type) => {
        setHistoryFilter(prev => {
            const types = prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type];
            return { ...prev, types };
        });
    };

    const getFilteredHistory = () => {
        if (!history || !Array.isArray(history)) return [];
        return history.filter(record => {
            const d = new Date(record.date);
            if (historyFilter.startDate && d < new Date(historyFilter.startDate).setHours(0,0,0,0)) return false;
            if (historyFilter.endDate && d > new Date(historyFilter.endDate).setHours(23,59,59,999)) return false;
            if (record.type === 'PAYMENT') return historyFilter.types.includes('PAYMENT');
            return historyFilter.types.includes(record.paymentStatus);
        });
    };

    const filteredList = getFilteredHistory();
    // Calculations
    const totalSales = filteredList.filter(r => r.type !== 'PAYMENT').reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const totalReceived = filteredList.filter(r => r.type === 'PAYMENT').reduce((s, r) => s + parseFloat(r.amount || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 lg:hidden flex-none p-3 flex justify-between items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <span className="font-bold text-slate-800">Customers</span>
                    <div className="w-6"></div>
                </header>

                <main className="flex-1 overflow-hidden p-3 lg:p-4">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-4">
                        
                        {/* === LEFT PANEL: CUSTOMER LIST === */}
                        <div className="lg:w-[380px] flex-none flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Customers</h2>
                                    <button onClick={() => setSelectedCustomer(null)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><PlusIcon /> New</button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><SearchIcon /></div>
                                    <input type="text" placeholder="Search customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {customers.map(customer => (
                                    <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className={`group p-3 rounded-xl cursor-pointer border transition-all ${selectedCustomer?.id === customer.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className={`font-bold text-sm ${selectedCustomer?.id === customer.id ? 'text-blue-800' : 'text-slate-700'}`}>{customer.name}</h3>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                                                    <PhoneIcon /> {customer.mobile || 'No Mobile'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {parseFloat(customer.totalDue) > 0 ? (
                                                    <span className="block text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Due: ₹{parseFloat(customer.totalDue).toFixed(0)}</span>
                                                ) : (
                                                    <span className="block text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Settled</span>
                                                )}
                                                <ChevronRight />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {customers.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No customers found</div>}
                            </div>
                        </div>

                        {/* === RIGHT PANEL === */}
                        <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {!selectedCustomer ? (
                                /* ADD CUSTOMER MODE */
                                <div className="flex flex-col h-full">
                                    <div className="p-6 border-b border-slate-100"><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><PlusIcon /></div>Add New Customer</h2></div>
                                    <div className="p-8 max-w-lg">
                                        <form onSubmit={handleCustomerSubmit} className="space-y-6">
                                            <div><label className="block text-sm font-bold text-slate-600 mb-2">Full Name</label><input type="text" required value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="e.g. Rahul Kumar" /></div>
                                            <div><label className="block text-sm font-bold text-slate-600 mb-2">Mobile</label><input type="text" value={customerForm.mobile} onChange={e => setCustomerForm({...customerForm, mobile: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Optional" /></div>
                                            <div><label className="block text-sm font-bold text-slate-600 mb-2">Address</label><textarea rows="3" value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Optional address..." /></div>
                                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">Create Customer</button>
                                        </form>
                                    </div>
                                    <div className="flex-1 bg-slate-50/50 flex items-center justify-center text-slate-300"><UserIcon /></div>
                                </div>
                            ) : (
                                /* CUSTOMER DETAILS MODE */
                                <div className="flex flex-col h-full">
                                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
                                        <div><h1 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h1><p className="text-xs text-slate-500 mt-1">{selectedCustomer.address || 'No Address Provided'}</p></div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Total Due</p>
                                            <p className={`text-2xl font-black ${parseFloat(selectedCustomer.totalDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>₹{Math.abs(selectedCustomer.totalDue || 0).toFixed(2)}<span className="text-xs font-medium text-slate-400 ml-1">{parseFloat(selectedCustomer.totalDue || 0) > 0 ? 'Due' : 'Credit'}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex border-b border-slate-100 px-6 gap-6">
                                        <button onClick={() => setActiveTab('HISTORY')} className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>History & Payments</button>
                                        <button onClick={() => setActiveTab('SETTINGS')} className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'SETTINGS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Settings</button>
                                    </div>

                                    <div className="flex-1 overflow-hidden bg-slate-50 p-4 sm:p-6 flex flex-col">
                                        {activeTab === 'HISTORY' && (
                                            <div className="flex flex-col h-full gap-4">
                                                
                                                {/* --- CONTROL PANEL (Merged Payment & Filters) --- */}
                                                <div className={`control-panel-scroll-anchor bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden shrink-0 transition-colors ${editingPaymentId ? 'ring-2 ring-green-400 bg-green-50/30' : ''}`}>
                                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                            {editingPaymentId ? <span className="text-green-600">✏️ Updating Payment...</span> : <><WalletIcon /> Transactions</>}
                                                        </h3>
                                                        <div className="flex gap-3 text-xs">
                                                            <span className="bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">Purchased: <b className="text-slate-800">₹{totalSales.toFixed(0)}</b></span>
                                                            <span className="bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">Received: <b className="text-green-600">₹{totalReceived.toFixed(0)}</b></span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 flex flex-col xl:flex-row gap-6">
                                                        {/* Inline Payment Form */}
                                                        <form onSubmit={handlePaymentSubmit} className="flex-1 flex flex-wrap gap-3 items-end">
                                                            <div className="w-32 sm:w-40">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                                                                <div className="relative mt-1">
                                                                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-lg">₹</span>
                                                                    <input type="number" step="0.01" className="w-full pl-7 pr-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-lg font-bold text-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-green-300/50" placeholder="0.00" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                                                                </div>
                                                            </div>
                                                            <div className="w-32">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                                                                <input type="date" className="w-full mt-1 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
                                                            </div>
                                                            <div className="flex-1 min-w-[120px]">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Note</label>
                                                                <input type="text" className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" placeholder="e.g. Cash, UPI..." value={paymentForm.description} onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {editingPaymentId && (
                                                                    <button type="button" onClick={resetPaymentForm} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-bold text-xs h-[34px] mt-1 transition-colors">✕</button>
                                                                )}
                                                                <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shadow-sm h-[34px] mt-1 transition-colors">
                                                                    {editingPaymentId ? 'Update' : 'Receive'}
                                                                </button>
                                                            </div>
                                                        </form>
                                                        
                                                        <div className="w-px bg-slate-100 hidden xl:block"></div>

                                                        {/* Filters & Actions */}
                                                        <div className="flex items-end gap-2 xl:pl-0">
                                                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Start</label><input type="date" className="mt-1 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs w-28" value={historyFilter.startDate} onChange={e => setHistoryFilter({...historyFilter, startDate: e.target.value})} /></div>
                                                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">End</label><input type="date" className="mt-1 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs w-28" value={historyFilter.endDate} onChange={e => setHistoryFilter({...historyFilter, endDate: e.target.value})} /></div>
                                                            <button onClick={handleDownloadPdf} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 mt-1 h-[34px] w-[34px] flex items-center justify-center" title="Download PDF"><DownloadIcon /></button>
                                                            <button onClick={() => fetchHistory(selectedCustomer.id)} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 mt-1 h-[34px] w-[34px] flex items-center justify-center" title="Refresh"><RefreshIcon /></button>
                                                        </div>
                                                    </div>
                                                    {/* Filter Chips */}
                                                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto">
                                                        {['PENDING', 'PAYMENT', 'PAID'].map(type => (
                                                            <button key={type} onClick={() => handleFilterTypeChange(type)} className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${historyFilter.types.includes(type) ? 'bg-white border-blue-300 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}>
                                                                {type === 'PENDING' ? 'Unpaid Sales' : type === 'PAYMENT' ? 'Payments' : 'Paid Sales'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* --- HISTORY LIST --- */}
                                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                                                    {historyLoading ? (
                                                        <div className="flex justify-center py-10"><Spinner /></div>
                                                    ) : filteredList.length > 0 ? (
                                                        filteredList.map(record => (
                                                            <div key={`${record.type}-${record.id}`} className={`flex items-center justify-between p-3 rounded-xl border ${record.type === 'PAYMENT' ? 'bg-green-50/50 border-green-100' : 'bg-white border-slate-200 hover:border-blue-200'} transition-all ${editingPaymentId === record.id ? 'ring-2 ring-green-400 bg-white' : ''}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${record.type === 'PAYMENT' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                        {new Date(record.date).getDate()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-bold text-slate-700">{record.type === 'PAYMENT' ? 'Payment Received' : (record.type === 'MILK' ? 'Milk Sale' : 'Item Sale')}</span>
                                                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">{new Date(record.date).toLocaleDateString('en-IN', {month:'short'})}</span>
                                                                        </div>
                                                                        <p className="text-xs text-slate-500">{record.description || (record.type === 'MILK' ? `${record.quantity}L @ ₹${record.rate}` : 'Item purchase')}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex items-center gap-4">
                                                                    {record.type !== 'PAYMENT' ? (
                                                                        // SALE
                                                                        <div>
                                                                            <span className="font-bold text-slate-800">₹{parseFloat(record.amount || 0).toFixed(2)}</span>
                                                                            <div className="text-[9px] font-bold text-right">
                                                                                {record.paymentStatus === 'PENDING' ? <span className="text-red-500">UNPAID</span> : <span className="text-green-500">PAID</span>}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        // PAYMENT
                                                                        <span className="font-bold text-green-600">-₹{parseFloat(record.amount || 0).toFixed(2)}</span>
                                                                    )}
                                                                    
                                                                    {/* EDIT ACTIONS FOR PAYMENT ONLY */}
                                                                    {record.type === 'PAYMENT' && (
                                                                        <div className="flex gap-1">
                                                                            <button onClick={() => handleInitEditPayment(record)} className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded" title="Edit"><PencilIcon /></button>
                                                                            <button onClick={() => handleDeletePayment(record.id)} className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded" title="Delete"><TrashIcon /></button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-12 text-slate-400 text-sm italic">No transactions found in this period.</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* --- SETTINGS TAB --- */}
                                        {activeTab === 'SETTINGS' && (
                                            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto w-full">
                                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full space-y-6">
                                                    <h3 className="text-lg font-bold text-slate-800">Edit Customer Profile</h3>
                                                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} /></div>
                                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile</label><input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={customerForm.mobile} onChange={e => setCustomerForm({...customerForm, mobile: e.target.value})} /></div>
                                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label><textarea rows="2" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} /></div>
                                                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md">Update Profile</button>
                                                    </form>
                                                    <div className="pt-6 border-t border-slate-100">
                                                        <h4 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h4>
                                                        <button onClick={handleDeleteCustomer} className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"><TrashIcon /> Delete Customer</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Customers;