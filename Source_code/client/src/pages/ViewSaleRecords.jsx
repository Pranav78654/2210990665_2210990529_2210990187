import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- Icons ---
const CalendarIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const DownloadIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const FilterIcon = () => (<svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CheckIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>);
const EditIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const Spinner = () => (<svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

const ViewSaleRecords = () => {
    // --- State ---
    const [records, setRecords] = useState([]);
    const [totals, setTotals] = useState({ quantity: 0, fatKg: 0, snfKg: 0, amount: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        shift: '',
        purchaserName: '',
    });

    // --- Bulk Selection State ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    // These fields are empty by default so we know to "Keep Existing"
    const [bulkFormData, setBulkFormData] = useState({ rate: '', date: '', shift: '' });

    // --- Single Edit State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [editFormData, setEditFormData] = useState({
        purchaserName: '', quantity: '', fat: '', clr: '', snf: '', rate: '', 
        shift: 'MORNING', date: '', paymentStatus: 'PAID'
    });

    // --- Effects ---
    useEffect(() => {
        fetchRecords();
    }, []); // Initial load

    useEffect(() => {
        const timer = setTimeout(() => { fetchRecords(); }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    // --- API Calls ---
    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/milk-sales/summary', { params: filters });
            setRecords(response.data.records || []);
            setTotals(response.data.totals || { quantity: 0, fatKg: 0, snfKg: 0, amount: 0 });
            setSelectedIds([]); // Clear selection on re-fetch
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get('/milk-sales/download-pdf', {
                params: filters, responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Milk-Sales-${filters.startDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert("Failed to download PDF.");
        } finally {
            setIsDownloading(false);
        }
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

    // --- Bulk Update Logic ---
    const openBulkModal = () => {
        setBulkFormData({ rate: '', date: '', shift: '' }); // Reset to empty
        setIsBulkModalOpen(true);
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        
        // Construct update object with ONLY filled fields
        const updates = {};
        if (bulkFormData.rate) updates.rate = bulkFormData.rate;
        if (bulkFormData.date) updates.date = bulkFormData.date;
        if (bulkFormData.shift) updates.shift = bulkFormData.shift;

        if (Object.keys(updates).length === 0) {
            alert("No changes entered. Please fill at least one field.");
            return;
        }

        if (!window.confirm(`Update ${selectedIds.length} records?\n\nNote: Fields left blank will retain their original values.`)) return;

        try {
            await api.put('/milk-sales/bulk-update', {
                ids: selectedIds,
                updates: updates
            });
            setIsBulkModalOpen(false);
            fetchRecords();
            alert("Records updated successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to update records.");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`⚠️ Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} records?`)) return;
        try {
            await api.delete('/milk-sales/bulk-delete', { data: { ids: selectedIds } });
            fetchRecords();
            alert("Records deleted.");
        } catch (error) {
            console.error(error);
            alert("Deletion failed.");
        }
    };

    // --- Single Edit Logic (Bonus) ---
    const openEditModal = (record) => {
        setCurrentRecord(record);
        setEditFormData({
            purchaserName: record.purchaserName,
            quantity: record.quantity,
            fat: record.fat,
            clr: record.clr,
            snf: record.snf,
            rate: record.rate,
            shift: record.shift,
            date: new Date(record.date).toISOString().split('T')[0],
            paymentStatus: record.paymentStatus || 'PAID'
        });
        setIsEditModalOpen(true);
    };

    const handleSingleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/milk-sales/update/${currentRecord.id}`, editFormData);
            setIsEditModalOpen(false);
            fetchRecords();
        } catch (error) {
            console.error(error);
            alert("Failed to update record.");
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Mobile Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden sticky top-0 z-20">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-lg font-bold text-slate-800">DairyManager</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-4">
                        
                        {/* Header & Stats */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-none">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Sale Records</h1>
                                    <p className="text-xs text-slate-500">Milk Sales History</p>
                                </div>
                                <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
                                <div className="hidden sm:flex gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Milk Kg</p>
                                        <p className="text-lg font-bold text-blue-600 leading-none">{totals.quantity.toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
                                        <p className="text-lg font-bold text-green-600 leading-none">₹{totals.amount.toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading || records.length === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm ${isDownloading || records.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {isDownloading ? <Spinner /> : <DownloadIcon />} 
                                <span>{isDownloading ? 'Exporting...' : 'Download PDF'}</span>
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between flex-none">
                            <div className="relative w-full md:w-64">
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
                            
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500" />
                                <span className="text-slate-400 text-xs">to</span>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500" />
                                <select name="shift" value={filters.shift} onChange={handleFilterChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500">
                                    <option value="">All Shifts</option>
                                    <option value="MORNING">Morning</option>
                                    <option value="EVENING">Evening</option>
                                </select>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col min-h-[400px]">
                            
                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <div className="text-blue-600"><Spinner /></div>
                                </div>
                            )}

                            {/* Floating Bulk Action Bar */}
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
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="w-[5%] px-4 py-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={records.length > 0 && selectedIds.length === records.length} 
                                                    onChange={handleSelectAll} 
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                                />
                                            </th>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Date</th>
                                            <th className="w-[20%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Purchaser</th>
                                            <th className="w-[10%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Milk</th>
                                            <th className="w-[10%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Fat</th>
                                            <th className="w-[10%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">SNF</th>
                                            <th className="w-[10%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Rate</th>
                                            <th className="w-[15%] px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">Amount</th>
                                            <th className="w-[5%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {records.length > 0 ? records.map((record) => (
                                            <tr key={record.id} className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.includes(record.id) ? 'bg-blue-50/60' : ''}`} onClick={() => openEditModal(record)}>
                                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.includes(record.id)} 
                                                        onChange={() => handleSelectRow(record.id)} 
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-xs font-medium text-slate-600">
                                                    <div className="text-slate-800 font-semibold">{new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                                    <span className={`text-[9px] uppercase tracking-wide opacity-70 font-bold ${record.shift === 'MORNING' ? 'text-amber-600' : 'text-indigo-600'}`}>{record.shift.slice(0,3)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-800 font-medium truncate">{record.purchaserName}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-700 text-sm">{parseFloat(record.quantity).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600 text-xs">{parseFloat(record.fat).toFixed(1)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600 text-xs">{parseFloat(record.snf).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-500 text-xs">{parseFloat(record.rate).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-green-600 text-sm">₹{parseFloat(record.amount).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={(e) => {e.stopPropagation(); openEditModal(record)}} className="text-slate-300 hover:text-blue-500 transition-colors"><EditIcon /></button>
                                                </td>
                                            </tr>
                                        )) : (
                                            !isLoading && <tr><td colSpan="9" className="py-20 text-center text-slate-400 text-sm italic">No records found.</td></tr>
                                        )}
                                    </tbody>
                                    {records.length > 0 && (
                                        <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total</td>
                                                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-800 bg-blue-50/50">{totals.quantity.toFixed(2)}</td>
                                                <td colSpan="2"></td>
                                                <td colSpan="2" className="px-4 py-3 text-right font-mono text-sm font-bold text-green-700 bg-green-50/50 border-l border-green-100">₹{totals.amount.toFixed(2)}</td>
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

            {/* --- Bulk Update Modal --- */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsBulkModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 px-6 py-4 text-white">
                            <h3 className="text-lg font-bold">Bulk Update Sales</h3>
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

            {/* --- Single Edit Modal --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Edit Sale Record</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSingleUpdate} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date</label><input type="date" required value={editFormData.date} onChange={e => setEditFormData({...editFormData, date: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Shift</label><select value={editFormData.shift} onChange={e => setEditFormData({...editFormData, shift: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="MORNING">Morning</option><option value="EVENING">Evening</option></select></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Purchaser</label>
                                <input type="text" value={editFormData.purchaserName} onChange={e => setEditFormData({...editFormData, purchaserName: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Qty</label><input type="number" step="0.01" value={editFormData.quantity} onChange={e => setEditFormData({...editFormData, quantity: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fat</label><input type="number" step="0.1" value={editFormData.fat} onChange={e => setEditFormData({...editFormData, fat: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">SNF</label><input type="number" step="0.1" value={editFormData.snf} onChange={e => setEditFormData({...editFormData, snf: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Rate</label>
                                <input type="number" step="0.01" value={editFormData.rate} onChange={e => setEditFormData({...editFormData, rate: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ViewSaleRecords;