import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- ICONS ---
const SunIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const CalendarIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const SaveIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>);
const SearchIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const CheckIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>);

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
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium text-sm transition-all"
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
const SaleRecords = () => {
    const navigate = useNavigate();

    // --- STATE: Data & View ---
    const [records, setRecords] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewShift, setViewShift] = useState('');
    
    // --- STATE: Edit / Form ---
    const [currentRecord, setCurrentRecord] = useState(null);
    const [saleType, setSaleType] = useState('CASH');
    const [formData, setFormData] = useState({
        purchaserName: 'Cash', customerId: '', paymentStatus: 'PAID',
        quantity: '', fat: '', clr: '', snf: '', rate: '10',
        shift: 'MORNING', date: new Date().toISOString().split('T')[0]
    });

    // --- STATE: Bulk Actions ---
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkData, setBulkData] = useState({ date: '', shift: '', rate: '' });

    // --- REFS ---
    const purchaserRef = useRef(null);
    const quantityRef = useRef(null);
    const fatRef = useRef(null);
    const clrRef = useRef(null);
    const snfRef = useRef(null);
    const rateRef = useRef(null);
    const viewDateInputRef = useRef(null);

    // --- EFFECTS ---
    useEffect(() => {
        const currentHour = new Date().getHours();
        const initialShift = currentHour < 16 ? 'MORNING' : 'EVENING';
        setViewShift(initialShift);
        setFormData(prev => ({ ...prev, shift: initialShift }));
        fetchCustomers();
        
        const handleKeyDown = (e) => { if (e.key === 'Escape') resetForm(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (viewShift) {
            fetchRecords();
            if (!currentRecord) {
                setFormData(prev => ({ ...prev, date: viewDate, shift: viewShift }));
            }
            setSelectedIds(new Set());
        }
    }, [viewDate, viewShift, currentRecord]);

    // --- API CALLS ---
    const fetchCustomers = async () => { try { const res = await api.get('/customers'); setCustomers(res.data); } catch (e) { console.error(e); } };
    const fetchRecords = async () => { try { const res = await api.get('/milk-sales/all', { params: { shift: viewShift, startDate: viewDate, endDate: viewDate } }); setRecords(res.data); } catch (e) { console.error(e); } };

    // --- FORM HANDLERS ---
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    
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
        if (!formData.quantity || !formData.rate) return alert("Please fill quantity and rate");

        try {
            const payload = {
                ...formData,
                purchaserName: saleType === 'CASH' ? (formData.purchaserName || 'Cash') : formData.purchaserName,
                customerId: saleType === 'CUSTOMER' ? formData.customerId : null,
                paymentStatus: saleType === 'CASH' ? 'PAID' : formData.paymentStatus
            };

            if (currentRecord) await api.put(`/milk-sales/update/${currentRecord.id}`, payload);
            else await api.post('/milk-sales/add', payload);
            
            await fetchRecords();
            resetForm();
        } catch (error) {
            console.error('Error saving:', error);
            alert("Failed to save record");
        }
    };

    const resetForm = () => {
        setCurrentRecord(null);
        setSaleType('CASH');
        setFormData(prev => ({
            purchaserName: 'Cash', customerId: '', paymentStatus: 'PAID',
            quantity: '', fat: '', clr: '', snf: '', rate: prev.rate,
            shift: viewShift, date: viewDate
        }));
        setTimeout(() => purchaserRef.current?.focus(), 50);
    };

    const handleEditClick = (record) => {
        setCurrentRecord(record);
        setSaleType(record.customerId ? 'CUSTOMER' : 'CASH');
        setFormData({
            purchaserName: record.purchaserName, customerId: record.customerId || '', paymentStatus: record.paymentStatus || 'PAID',
            quantity: record.quantity, fat: record.fat, clr: record.clr, snf: record.snf, rate: record.rate,
            shift: record.shift, date: new Date(record.date).toISOString().split('T')[0]
        });
        setTimeout(() => quantityRef.current?.focus(), 50);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this record?')) {
            try { await api.delete(`/milk-sales/delete/${id}`); fetchRecords(); if (currentRecord?.id === id) resetForm(); } catch (e) { console.error(e); }
        }
    };

    // --- BULK ACTION HANDLERS ---
    const toggleSelectAll = () => {
        if (selectedIds.size === records.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(records.map(r => r.id)));
    };

    const toggleSelectRow = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkUpdate = async () => {
        const updates = {};
        if (bulkData.date) updates.date = bulkData.date;
        if (bulkData.shift) updates.shift = bulkData.shift;
        if (bulkData.rate) updates.rate = bulkData.rate;

        if (Object.keys(updates).length === 0) return alert("Select a field to update (Date, Shift, or Rate)");
        if (!window.confirm(`Update ${selectedIds.size} records?`)) return;

        try {
            await api.put('/milk-sales/bulk-update', { ids: Array.from(selectedIds), updates });
            await fetchRecords();
            setSelectedIds(new Set());
            setBulkData({ date: '', shift: '', rate: '' });
            alert("Bulk update successful!");
        } catch (e) { console.error(e); alert("Update failed"); }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`⚠️ Are you sure you want to PERMANENTLY DELETE ${selectedIds.size} records?`)) return;
        try {
            // NOTE: Axios delete with body requires 'data' key
            await api.delete('/milk-sales/bulk-delete', { 
                data: { ids: Array.from(selectedIds) } 
            });
            await fetchRecords();
            setSelectedIds(new Set());
            alert("Records deleted successfully.");
        } catch (e) { console.error(e); alert("Deletion failed"); }
    };

    const openViewDatePicker = () => {
        if (viewDateInputRef.current?.showPicker) viewDateInputRef.current.showPicker();
        else viewDateInputRef.current?.focus();
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
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
                            <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full ${currentRecord ? 'ring-2 ring-blue-500' : ''}`}>
                                
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">{currentRecord ? '✏️ Edit Mode' : '⚡ New Entry'}</h2>
                                    {currentRecord && <button onClick={resetForm} className="text-xs font-bold text-slate-500 bg-white border px-3 py-1.5 rounded-lg">Cancel (Esc)</button>}
                                </div>
                                
                                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        
                                        {/* Sale Type Toggle */}
                                        <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
                                            {['CASH', 'CUSTOMER'].map(type => (
                                                <button key={type} type="button" onClick={() => { setSaleType(type); setFormData(prev => ({ ...prev, purchaserName: type === 'CASH' ? 'Cash' : '', customerId: '' })); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${saleType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type === 'CASH' ? 'Cash' : 'Customer'}</button>
                                            ))}
                                        </div>

                                        {/* Purchaser Selection */}
                                        {saleType === 'CASH' ? (
                                            <input ref={purchaserRef} type="text" name="purchaserName" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={formData.purchaserName} onChange={handleInputChange} onKeyDown={(e) => handleEnterKey(e, quantityRef)} placeholder="Purchaser Name" />
                                        ) : (
                                            <div className="space-y-2">
                                                <KeyboardSearchableSelect options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.mobile || '-'})` }))} value={formData.customerId} onChange={handleCustomerChange} placeholder="Search Customer..." nextRef={quantityRef} />
                                                <div className="flex gap-2">
                                                    <label className={`flex-1 cursor-pointer border rounded-lg p-2 text-center text-xs font-bold ${formData.paymentStatus === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 text-slate-400'}`}><input type="radio" name="paymentStatus" value="PAID" checked={formData.paymentStatus === 'PAID'} onChange={handleInputChange} className="hidden"/> Paid</label>
                                                    <label className={`flex-1 cursor-pointer border rounded-lg p-2 text-center text-xs font-bold ${formData.paymentStatus === 'PENDING' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 text-slate-400'}`}><input type="radio" name="paymentStatus" value="PENDING" checked={formData.paymentStatus === 'PENDING'} onChange={handleInputChange} className="hidden"/> Credit</label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Editable Date/Shift (Inside Form) */}
                                        <div className="flex gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Date</label>
                                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Shift</label>
                                                <select name="shift" value={formData.shift} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                                                    <option value="MORNING">Morning</option>
                                                    <option value="EVENING">Evening</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Data Entry Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                                                <input ref={quantityRef} type="number" step="0.1" name="quantity" required value={formData.quantity} onChange={handleInputChange} onKeyDown={(e) => handleEnterKey(e, fatRef)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-2xl font-bold text-slate-800" placeholder="0.0" />
                                            </div>
                                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fat</label><input ref={fatRef} type="number" step="0.1" name="fat" required value={formData.fat} onChange={handleInputChange} onKeyDown={(e) => handleEnterKey(e, clrRef)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold" placeholder="Fat"/></div>
                                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CLR</label><input ref={clrRef} type="number" step="0.01" name="clr" value={formData.clr} onChange={handleInputChange} onKeyDown={(e) => handleEnterKey(e, snfRef)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold" placeholder="CLR"/></div>
                                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SNF</label><input ref={snfRef} type="number" step="0.1" name="snf" value={formData.snf} onChange={handleInputChange} onKeyDown={(e) => handleEnterKey(e, rateRef)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold" placeholder="SNF"/></div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rate</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                                                    <input ref={rateRef} type="number" step="0.01" name="rate" required value={formData.rate} onChange={handleInputChange} onKeyDown={(e) => handleEnterKey(e, null)} className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-lg font-bold text-green-700" />
                                                </div>
                                            </div>
                                        </div>

                                        <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${currentRecord ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                            <SaveIcon /> {currentRecord ? 'Update Record' : 'Save (Enter)'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* === RIGHT PANEL: TABLE & BULK ACTIONS === */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 relative">
                            
                            {/* -- Bulk Update Bar -- */}
                            {selectedIds.size > 0 && (
                                <div className="absolute top-0 left-0 right-0 z-30 bg-blue-600 text-white p-3 flex items-center gap-4 shadow-md animate-slide-down">
                                    <div className="font-bold text-sm whitespace-nowrap">{selectedIds.size} Selected</div>
                                    <div className="h-6 w-px bg-blue-400"></div>
                                    <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                                        <select value={bulkData.shift} onChange={(e) => setBulkData(prev => ({...prev, shift: e.target.value}))} className="bg-blue-700 border-none text-white text-xs rounded px-2 py-1.5 focus:ring-1 focus:ring-white">
                                            <option value="">Change Shift...</option><option value="MORNING">Morning</option><option value="EVENING">Evening</option>
                                        </select>
                                        <input type="date" value={bulkData.date} onChange={(e) => setBulkData(prev => ({...prev, date: e.target.value}))} className="bg-blue-700 border-none text-white text-xs rounded px-2 py-1.5 focus:ring-1 focus:ring-white" />
                                        <input type="number" value={bulkData.rate} onChange={(e) => setBulkData(prev => ({...prev, rate: e.target.value}))} className="bg-blue-700 border-none text-white text-xs rounded px-2 py-1.5 w-24 focus:ring-1 focus:ring-white placeholder-blue-300" placeholder="New Rate" />
                                    </div>
                                    <button onClick={handleBulkUpdate} className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1"><CheckIcon /> Apply</button>
                                    
                                    {/* DELETE BUTTON */}
                                    <button onClick={handleBulkDelete} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1">
                                        <TrashIcon /> Delete
                                    </button>

                                    <button onClick={() => setSelectedIds(new Set())} className="text-blue-200 hover:text-white px-2">&times;</button>
                                </div>
                            )}

                            {/* -- Filter Bar -- */}
                            <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                                <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200">
                                    <button onClick={() => setViewShift('MORNING')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewShift === 'MORNING' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}><SunIcon /> Morning</button>
                                    <button onClick={() => setViewShift('EVENING')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewShift === 'EVENING' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><MoonIcon /> Evening</button>
                                </div>
                                <div onClick={openViewDatePicker} className="relative flex items-center gap-3 bg-white border border-slate-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 px-4 py-2.5 rounded-xl cursor-pointer transition-all group">
                                    <CalendarIcon className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">{new Date(viewDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    <input ref={viewDateInputRef} type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                </div>
                            </div>

                            {/* -- Table -- */}
                            <div className="flex-1 overflow-auto custom-scrollbar relative">
                                <table className="w-full table-fixed border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="w-[5%] px-3 py-3 text-center">
                                                <input type="checkbox" checked={records.length > 0 && selectedIds.size === records.length} onChange={toggleSelectAll} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            </th>
                                            <th className="w-[28%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Purchaser</th>
                                            <th className="w-[15%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Qty</th>
                                            <th className="w-[22%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-center">Fat | SNF</th>
                                            <th className="w-[20%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Amount</th>
                                            <th className="w-[10%] px-2 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {records.map((record) => (
                                            <tr key={record.id} className={`hover:bg-blue-50 transition-colors cursor-pointer ${currentRecord?.id === record.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : ''}`}>
                                                <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selectedIds.has(record.id)} onChange={() => toggleSelectRow(record.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                                </td>
                                                <td className="px-2 py-3 truncate" onClick={() => handleEditClick(record)}>
                                                    <div className="font-bold text-sm text-slate-800">{record.purchaserName}</div>
                                                    {record.paymentStatus === 'PENDING' && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Credit</span>}
                                                </td>
                                                <td className="px-2 py-3 text-right font-mono text-slate-700 font-medium" onClick={() => handleEditClick(record)}>{record.quantity}</td>
                                                <td className="px-2 py-3 text-center text-xs text-slate-500" onClick={() => handleEditClick(record)}>
                                                    <span className="font-semibold text-slate-700">{record.fat}</span><span className="mx-1 text-slate-300">/</span><span>{parseFloat(record.snf).toFixed(1)}</span>
                                                </td>
                                                <td className="px-2 py-3 text-right font-bold text-green-600" onClick={() => handleEditClick(record)}>₹{parseFloat(record.amount).toFixed(0)}</td>
                                                <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={(e) => handleDelete(e, record.id)} className="text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"><TrashIcon /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {records.length === 0 && <tr><td colSpan="6" className="py-20 text-center text-slate-400 text-sm">No sales recorded.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-sm">
                                <div className="font-medium text-slate-500">Total Qty: <span className="text-slate-900 font-bold">{records.reduce((acc, curr) => acc + parseFloat(curr.quantity || 0), 0).toFixed(1)} L</span></div>
                                <div className="font-medium text-slate-500">Total: <span className="text-green-600 font-bold text-lg">₹{records.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toFixed(0)}</span></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SaleRecords;