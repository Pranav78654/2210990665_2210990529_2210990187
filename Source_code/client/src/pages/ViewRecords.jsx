import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- Icons ---
const CalendarIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const DownloadIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CheckIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>);
const EditIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const SunIcon = () => (<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);

const ViewRecords = () => {
    // --- State ---
    const [records, setRecords] = useState([]); 
    const [totals, setTotals] = useState({ quantity: 0, fatKg: 0, snfKg: 0, amount: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        shift: '',
        supplierName: '',
    });

    // --- Bulk Selection ---
    const [selectedIds, setSelectedIds] = useState([]); 
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState({ rate: '', date: '', shift: '' });

    // --- Edit Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [formData, setFormData] = useState({
        supplierId: '', quantity: '', fat: '', clr: '', snf: '', rate: '', shift: 'MORNING',
        date: new Date().toISOString().split('T')[0],
    });

    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        fetchSuppliers(); 
        fetchRecords();
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false); setIsModalDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { 
        fetchRecords(); 
        setSelectedIds([]); 
    }, [filters]);

    // --- API ---
    const fetchRecords = async () => {
        try {
            const response = await api.get('/milk-records/summary', { params: filters });
            setRecords(response.data.records || []);
            setTotals(response.data.totals || { quantity: 0, fatKg: 0, snfKg: 0, amount: 0 });
        } catch (error) { 
            console.error('Error:', error); 
            setRecords([]);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/milk-suppliers/all');
            setSuppliers(response.data || []);
        } catch (error) { console.error('Error:', error); }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await api.get('/milk-records/download-pdf', {
                params: filters, responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Milk-Records-${filters.startDate}.pdf`);
            document.body.appendChild(link);
            link.click(); link.remove();
        } catch (error) { console.error(error); }
    };

    // --- Selection Logic ---
    const handleSelectAll = (e) => {
        if (e.target.checked && records.length > 0) {
            setSelectedIds(records.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // --- Bulk Update Logic (Safe) ---
    const openBulkModal = () => {
        // Reset form so fields are empty by default
        setBulkFormData({ rate: '', date: '', shift: '' });
        setIsBulkModalOpen(true);
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();

        // 1. Construct updates object containing ONLY values the user actually filled in.
        //    If bulkFormData.date is empty string, it is NOT added to 'updates'.
        const updates = {};
        if (bulkFormData.rate) updates.rate = bulkFormData.rate;
        if (bulkFormData.date) updates.date = bulkFormData.date;
        if (bulkFormData.shift) updates.shift = bulkFormData.shift;

        if (Object.keys(updates).length === 0) {
            alert("No changes entered. Please fill at least one field or Cancel.");
            return;
        }

        if (!window.confirm(`Update ${selectedIds.length} records?\n\nNote: Only the fields you entered will be changed. Unchanged fields (Dates, Rates, etc.) will keep their original values for each record.`)) return;

        try {
            await api.put('/milk-records/bulk-update', {
                ids: selectedIds,
                updates: updates 
            });
            setIsBulkModalOpen(false); 
            setSelectedIds([]); 
            fetchRecords();
        } catch (error) { alert("Failed to update records."); }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`⚠️ Permanently DELETE ${selectedIds.length} records?`)) return;
        try {
            await api.delete('/milk-records/bulk-delete', { data: { ids: selectedIds } });
            fetchRecords();
            setSelectedIds([]);
            alert("Records deleted.");
        } catch (e) { console.error(e); alert("Deletion failed"); }
    };

    // --- Single Edit Logic ---
    const openModal = (record) => {
        setCurrentRecord(record);
        setFormData({
            supplierId: record.supplierId,
            quantity: record.quantity,
            fat: record.fat,
            clr: record.clr,
            snf: record.snf,
            rate: record.rate || record.supplier.rate,
            shift: record.shift,
            date: new Date(record.date).toISOString().split('T')[0],
        });
        setSearchTerm(record.supplier.name);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false); setCurrentRecord(null);
        setFormData({ supplierId: '', quantity: '', fat: '', clr: '', snf: '', rate: '', shift: 'MORNING', date: new Date().toISOString().split('T')[0] });
        setSearchTerm('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRecord) {
                await api.put(`/milk-records/update/${currentRecord.id}`, { ...formData });
                fetchRecords(); closeModal();
            }
        } catch (error) { console.error(error); }
    };

    const handleModalSupplierSelect = (supplier) => {
        setFormData({ ...formData, supplierId: supplier.id, rate: supplier.rate });
        setSearchTerm(supplier.name); setIsModalDropdownOpen(false);
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden flex-none z-20">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-slate-700 p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-lg font-bold text-slate-800">DairyManager</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden p-3 lg:p-4">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-4">

                        {/* Top Bar: Title & Stats */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-none">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">View Records</h1>
                                    <p className="text-xs text-slate-500">History & Reports</p>
                                </div>
                                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                                <div className="hidden sm:flex gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Milk</p>
                                        <p className="text-lg font-bold text-blue-600 leading-none">{totals.quantity.toFixed(1)} <span className="text-xs text-slate-400">L</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Fat</p>
                                        <p className="text-lg font-bold text-slate-700 leading-none">{totals.fatKg?.toFixed(2) || '0.00'} <span className="text-xs text-slate-400">Kg</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total SNF</p>
                                        <p className="text-lg font-bold text-slate-700 leading-none">{totals.snfKg?.toFixed(2) || '0.00'} <span className="text-xs text-slate-400">Kg</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
                                        <p className="text-lg font-bold text-green-600 leading-none">₹{totals.amount.toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm">
                                <DownloadIcon /> Download Report
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between flex-none">
                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Search Supplier..." 
                                    value={filters.supplierName} 
                                    onChange={handleFilterChange} 
                                    name="supplierName"
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><SearchIcon/></div>
                            </div>
                            
                            {/* Date & Shift */}
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500" />
                                <span className="text-slate-400 text-xs font-medium">to</span>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500" />
                                <select name="shift" value={filters.shift} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500">
                                    <option value="">All Shifts</option>
                                    <option value="MORNING">Morning</option>
                                    <option value="EVENING">Evening</option>
                                </select>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
                            
                            {/* Floating Bulk Actions Overlay */}
                            {selectedIds.length > 0 && (
                                <div className="absolute top-0 left-0 right-0 z-20 bg-slate-800 text-white p-2.5 flex items-center gap-4 shadow-lg animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 pl-2">
                                        <div className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{selectedIds.length}</div>
                                        <span className="text-sm font-medium text-slate-300 hidden sm:inline">Selected</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-600"></div>
                                    
                                    <div className="flex-1 flex justify-end gap-3">
                                        <button onClick={openBulkModal} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors">
                                            <EditIcon /> Bulk Edit
                                        </button>
                                        <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors">
                                            <TrashIcon /> Delete
                                        </button>
                                        <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs font-bold">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full table-fixed border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="w-[5%] px-3 py-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={records.length > 0 && selectedIds.length === records.length} 
                                                    onChange={handleSelectAll} 
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" 
                                                />
                                            </th>
                                            <th className="w-[12%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase">Date</th>
                                            <th className="w-[18%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-left">Supplier</th>
                                            <th className="w-[8%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Milk</th>
                                            <th className="w-[7%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Fat</th>
                                            <th className="w-[7%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">CLR</th>
                                            <th className="w-[7%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">SNF</th>
                                            <th className="w-[9%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Fat Kg</th>
                                            <th className="w-[9%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">SNF Kg</th>
                                            <th className="w-[8%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Rate</th>
                                            <th className="w-[10%] px-2 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {records.map((record) => (
                                            <tr key={record.id} className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedIds.includes(record.id) ? 'bg-blue-50/60' : ''}`} onClick={() => openModal(record)}>
                                                <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.includes(record.id)} 
                                                        onChange={() => handleSelectRow(record.id)} 
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" 
                                                    />
                                                </td>
                                                <td className="px-2 py-3 text-xs font-medium text-slate-600">
                                                    <div className="text-slate-800 font-semibold">{new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {record.shift === 'MORNING' ? <SunIcon className="text-amber-500" /> : <MoonIcon className="text-indigo-500" />}
                                                        <span className="text-[9px] uppercase tracking-wide opacity-70">{record.shift.slice(0,3)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 truncate text-sm font-bold text-slate-700">{record.supplier.name}</td>
                                                <td className="px-2 py-3 text-right font-mono text-slate-700 text-sm">{parseFloat(record.quantity).toFixed(2)}</td>
                                                <td className="px-2 py-3 text-right font-mono text-slate-600 text-xs">{parseFloat(record.fat).toFixed(1)}</td>
                                                <td className="px-2 py-3 text-right font-mono text-slate-600 text-xs">{parseFloat(record.clr || 0).toFixed(0)}</td>
                                                <td className="px-2 py-3 text-right font-mono text-slate-600 text-xs">{parseFloat(record.snf).toFixed(2)}</td>
                                                {/* <td className="px-2 py-3 text-right font-mono text-slate-500 text-xs">{((record.quantity * record.fat) / 1000).toFixed(2)}</td> */}
                                                                                                <td className="px-2 py-3 text-right font-mono text-slate-500 text-xs">{parseFloat(record.fatKg).toFixed(2)}</td>

                                                <td className="px-2 py-3 text-right font-mono text-slate-500 text-xs">{parseFloat(record.snfKg).toFixed(2)}</td>
                                                <td className="px-2 py-3 text-right font-mono text-slate-500 text-xs">{parseFloat(record.rate)}</td>
                                                <td className="px-2 py-3 text-right font-bold text-green-600 text-sm">₹{parseFloat(record.amount).toFixed(0)}</td>
                                            </tr>
                                        ))}
                                        {records.length === 0 && <tr><td colSpan="11" className="py-20 text-center text-slate-400 text-sm italic">No records found matching filters.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* --- Edit Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Edit Record</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Supplier Name</label>
                                <input type="text" placeholder="Search Supplier..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsModalDropdownOpen(true); }} onFocus={() => setIsModalDropdownOpen(true)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" />
                                {isModalDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-xl max-h-48 rounded-xl border border-slate-100 overflow-auto">
                                        {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((supplier) => (
                                            <div key={supplier.id} className="cursor-pointer px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-700 hover:text-blue-700 border-b border-slate-50 last:border-0" onClick={() => handleModalSupplierSelect(supplier)}>{supplier.name}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date</label><input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Shift</label><select name="shift" value={formData.shift} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="MORNING">Morning</option><option value="EVENING">Evening</option></select></div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Qty</label><input type="number" step="0.01" name="quantity" required value={formData.quantity} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fat%</label><input type="number" step="0.01" name="fat" required value={formData.fat} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CLR</label><input type="number" step="0.01" name="clr" value={formData.clr} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl" /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Rate</label><input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold" /></div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Bulk Update Modal --- */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsBulkModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 px-6 py-4 text-white">
                            <h3 className="text-lg font-bold">Bulk Update</h3>
                            <p className="text-indigo-100 text-xs">Modifying {selectedIds.length} records</p>
                        </div>
                        <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
                            <div className="p-3 bg-amber-50 text-amber-800 text-[10px] leading-relaxed rounded-lg border border-amber-100 uppercase font-bold">
                                ⚠️ Leave fields blank to keep existing values.
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Rate</label>
                                <input type="number" step="0.01" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Keep existing" value={bulkFormData.rate} onChange={e => setBulkFormData({ ...bulkFormData, rate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Date</label>
                                    <input type="date" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs" value={bulkFormData.date} onChange={e => setBulkFormData({ ...bulkFormData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Shift</label>
                                    <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs" value={bulkFormData.shift} onChange={e => setBulkFormData({ ...bulkFormData, shift: e.target.value })}>
                                        <option value="">Keep Existing</option>
                                        <option value="MORNING">Morning</option>
                                        <option value="EVENING">Evening</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200">Update All</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewRecords;