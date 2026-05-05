import React, { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

// --- ICONS ---
const SunIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);
const CalendarIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const TrashIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const SaveIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);
const SearchIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const CheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
const PencilIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
    </svg>
);
const XIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const MenuIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


const KeyboardSearchableSelect = forwardRef(({ options, value, onChange, placeholder, nextRef }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const wrapperRef = useRef(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options, searchTerm]);

    useEffect(() => {

        const selected = options.find(o => String(o.value) === String(value));
        if (selected) {
            setSearchTerm(selected.label);
        } else if (!value) {
            setSearchTerm('');
        }
    }, [value, options]);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } });
        setSearchTerm(option.label);
        setIsOpen(false);
        if (nextRef?.current) nextRef.current.focus();
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
            if (isOpen && filteredOptions.length > 0) {
                handleSelect(filteredOptions[highlightedIndex]);
            } else {
                if (value && nextRef?.current) nextRef.current.focus();
                else setIsOpen(true);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon />
                </div>
                <input
                    ref={ref}
                    type="text"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-sm transition-all ${!value && searchTerm
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                        }`}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        setHighlightedIndex(0);
                        if (value) onChange({ target: { value: '' } });
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.value}
                            onMouseDown={() => handleSelect(option)}
                            className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${index === highlightedIndex
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});
KeyboardSearchableSelect.displayName = 'KeyboardSearchableSelect';


const MetricField = ({ label, inputRef, name, value, onChange, onKeyDown, placeholder, prefix, highlight }) => (
    <div className={`bg-slate-50 border rounded-lg px-3 py-2 transition-all focus-within:bg-white focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 ${highlight ? 'border-green-200' : 'border-slate-200'}`}>
        <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="relative">
            {prefix && <span className="text-slate-400 text-sm mr-0.5">{prefix}</span>}
            <input
                ref={inputRef}
                type="number"
                step="any"
                name={name}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`w-full bg-transparent border-none outline-none text-sm font-semibold p-0 ${highlight ? 'text-green-700' : 'text-slate-800'}`}
            />
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const MilkRecords = () => {
    const [records, setRecords] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewShift, setViewShift] = useState('');

    const [currentRecord, setCurrentRecord] = useState(null);
    const [formData, setFormData] = useState({
        supplierId: '', quantity: '', fat: '', clr: '', snf: '', rate: '',
        shift: 'MORNING', date: new Date().toISOString().split('T')[0]
    });

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkData, setBulkData] = useState({ date: '', shift: '', rate: '' });
    const [activeChip, setActiveChip] = useState(null);
    const bulkDateRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [lastSelectedId, setLastSelectedId] = useState(null);
    const longPressTimer = useRef(null);
    const isLongPressAction = useRef(false);

    const supplierInputRef = useRef(null);
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
        fetchSuppliers();

        const handleKeyDown = (e) => { if (e.key === 'Escape') resetForm(); };
        window.addEventListener('keydown', handleKeyDown);

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('touchend', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchend', handleGlobalMouseUp);
        };
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

    // --- API ---
    const fetchSuppliers = async () => {
        try { const res = await api.get('/milk-suppliers/all'); setSuppliers(res.data); }
        catch (e) { console.error(e); }
    };
    const fetchRecords = async () => {
        try { const res = await api.get('/milk-records/all', { params: { shift: viewShift, startDate: viewDate, endDate: viewDate } }); setRecords(res.data); }
        catch (e) { console.error(e); }
    };

    // --- FORM HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierChange = (e) => {
        const supplierId = e.target.value;
        const supplier = suppliers.find(s => s.id === supplierId);
        setFormData(prev => ({
            ...prev,
            supplierId,
            rate: supplier?.rate ?? prev.rate,
        }));
    };

    const handleEnterKey = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef?.current) nextRef.current.focus();
            else handleSubmit(e);
        }
        if (e.ctrlKey && e.key === 'Enter') handleSubmit(e);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.supplierId) {
            alert('⚠️ Please select a supplier from the list.');
            supplierInputRef.current?.focus();
            return;
        }
        if (!formData.quantity) {
            alert('Please enter weight.');
            quantityRef.current?.focus();
            return;
        }

        try {
            const payload = { ...formData };
            if (currentRecord) await api.put(`/milk-records/update/${currentRecord.id}`, payload);
            else await api.post('/milk-records/add', payload);
            await fetchRecords();
            resetForm();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save record. Check console.');
        }
    };

    const resetForm = () => {
        setCurrentRecord(null);
        setFormData({
            supplierId: '', quantity: '', fat: '', clr: '', snf: '', rate: '',
            shift: viewShift, date: viewDate
        });
        setTimeout(() => supplierInputRef.current?.focus(), 50);
    };

    const handleEditClick = (record) => {
        setCurrentRecord(record);
        setFormData({
            // Force string for precise matching and fallback correctly
            supplierId: String(record.supplierId || record.supplier?.id || ''),
            quantity: record.quantity || '',
            fat: record.fat || '',
            clr: record.clr || '',
            snf: record.snf || '',
            rate: record.rate || '',
            shift: record.shift,
            // Split natively to avoid "Invalid Date" errors with ISO strings
            date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setTimeout(() => quantityRef.current?.focus(), 50);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this record?')) {
            try {
                await api.delete(`/milk-records/delete/${id}`);
                fetchRecords();
                if (currentRecord?.id === id) resetForm();
            } catch (e) { console.error(e); }
        }
    };


    const toggleSelectRow = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleRowMouseDown = (id) => {
        isLongPressAction.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPressAction.current = true;
            setIsDragging(true);
            setSelectedIds(prev => new Set([...prev, id]));
            setLastSelectedId(id);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleRowMouseEnter = (id) => {
        if (isDragging) setSelectedIds(prev => new Set([...prev, id]));
    };

    const handleRowClick = (e, record) => {
        if (isLongPressAction.current) return;
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }

        if (e.shiftKey && lastSelectedId && selectedIds.size > 0) {
            const start = records.findIndex(r => r.id === lastSelectedId);
            const end = records.findIndex(r => r.id === record.id);
            if (start === -1 || end === -1) return;
            const [lower, upper] = start < end ? [start, end] : [end, start];
            const newSet = new Set(selectedIds);
            for (let i = lower; i <= upper; i++) newSet.add(records[i].id);
            setSelectedIds(newSet);
            return;
        }

        if (selectedIds.size > 0) {
            toggleSelectRow(record.id);
            setLastSelectedId(record.id);
        } else {
            handleEditClick(record);
        }
    };


    const toggleSelectAll = () => {
        if (selectedIds.size === records.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(records.map(r => r.id)));
    };

    const toggleChip = (chip) => {
        const closing = activeChip === chip;
        setActiveChip(closing ? null : chip);
        if (closing) setBulkData(prev => ({ ...prev, [chip]: '' }));
        if (chip === 'date' && !closing) {
            setTimeout(() => bulkDateRef.current?.showPicker?.(), 80);
        }
    };

    const handleBulkUpdate = async () => {
        const updates = {};
        if (bulkData.date) updates.date = bulkData.date;
        if (bulkData.shift) updates.shift = bulkData.shift;
        if (bulkData.rate) updates.rate = bulkData.rate;
        if (Object.keys(updates).length === 0) return alert('Activate at least one chip and set a value.');
        if (!window.confirm(`Update ${selectedIds.size} records?`)) return;
        try {
            await api.put('/milk-records/bulk-update', { ids: Array.from(selectedIds), updates });
            await fetchRecords();
            setSelectedIds(new Set());
            setBulkData({ date: '', shift: '', rate: '' });
            setActiveChip(null);
        } catch (e) { console.error(e); alert('Update failed.'); }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`⚠️ Permanently DELETE ${selectedIds.size} records?`)) return;
        try {
            await api.delete('/milk-records/bulk-delete', { data: { ids: Array.from(selectedIds) } });
            await fetchRecords();
            setSelectedIds(new Set());
            setBulkData({ date: '', shift: '', rate: '' });
            setActiveChip(null);
        } catch (e) { console.error(e); alert('Deletion failed.'); }
    };

    const openViewDatePicker = () => {
        if (viewDateInputRef.current?.showPicker) viewDateInputRef.current.showPicker();
        else viewDateInputRef.current?.focus();
    };

    // --- CALCULATIONS ---
    const totalMilk = records.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const displayDate = new Date(viewDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-900 select-none">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b border-slate-200 lg:hidden flex-none">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <MenuIcon />
                        </button>
                        <h1 className="text-base font-semibold text-slate-800">Milk Records</h1>
                        <div className="w-8" />
                    </div>
                </header>

                <main className="flex-1 overflow-hidden p-3 lg:p-4">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-3">

                        {/* ===== LEFT PANEL: FORM ===== */}
                        <div className="lg:w-[360px] flex-none flex flex-col h-full">
                            <div className={`bg-white rounded-xl border overflow-hidden flex flex-col h-full transition-all ${currentRecord ? 'border-amber-300 shadow-amber-100 shadow-md' : 'border-slate-200 shadow-sm'}`}>

                                {/* Form Header */}
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${currentRecord ? 'bg-amber-400' : 'bg-blue-500'}`} />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {currentRecord ? 'Editing record' : 'New entry'}
                                        </span>
                                    </div>
                                    {currentRecord && (
                                        <button onClick={resetForm} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition-all">
                                            <XIcon /> Cancel
                                        </button>
                                    )}
                                </div>

                                <div className="p-4 flex-1 overflow-y-auto">
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                                        {/* Supplier */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Supplier</label>
                                            <KeyboardSearchableSelect
                                                ref={supplierInputRef}
                                                options={suppliers.map(s => ({ value: String(s.id), label: `${s.name} (${s.mobile || '—'})` }))}
                                                value={formData.supplierId}
                                                onChange={handleSupplierChange}
                                                placeholder="Search by name or number…"
                                                nextRef={quantityRef}
                                            />
                                        </div>

                                        {/* Date + Shift */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Shift</label>
                                                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, shift: 'MORNING' }))}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${formData.shift === 'MORNING' ? 'bg-white text-amber-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        <SunIcon /> AM
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, shift: 'EVENING' }))}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${formData.shift === 'EVENING' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        <MoonIcon /> PM
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weight */}
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                                            <div className="relative">
                                                <input
                                                    ref={quantityRef}
                                                    type="number"
                                                    step="0.01"
                                                    name="quantity"
                                                    required
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    onKeyDown={(e) => handleEnterKey(e, fatRef)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:bg-white text-2xl font-bold text-slate-800 text-center tracking-wide transition-all"
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">kg</span>
                                            </div>
                                        </div>

                                        {/* Fat / CLR / SNF / Rate */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <MetricField
                                                label="Fat %"
                                                inputRef={fatRef}
                                                name="fat"
                                                value={formData.fat}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => handleEnterKey(e, clrRef)}
                                                placeholder="0.0"
                                            />
                                            <MetricField
                                                label="CLR"
                                                inputRef={clrRef}
                                                name="clr"
                                                value={formData.clr}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => handleEnterKey(e, snfRef)}
                                                placeholder="0"
                                            />
                                            <MetricField
                                                label="SNF"
                                                inputRef={snfRef}
                                                name="snf"
                                                value={formData.snf}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => handleEnterKey(e, rateRef)}
                                                placeholder="auto"
                                            />
                                            <MetricField
                                                label="Rate (₹)"
                                                inputRef={rateRef}
                                                name="rate"
                                                value={formData.rate}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => handleEnterKey(e, null)}
                                                placeholder="0.00"
                                                highlight
                                            />
                                        </div>

                                        {/* Live amount preview */}
                                        {(() => {
                                            const qty = parseFloat(formData.quantity) || 0;
                                            const fat = parseFloat(formData.fat) || 0;
                                            const clr = parseFloat(formData.clr) || 0;
                                            const rate = parseFloat(formData.rate) || 0;

                                            if (!qty || !fat || !rate) return null;

                                            let amount = 0;

                                            if (clr > 0) {
                                                const snfVal = Math.floor((clr * 25) + 14 + fat + fat);
                                                const rawFat = qty * fat;
                                                const rawSnf = (qty * snfVal) / 10;
                                                const gheeRate = (rate * 6) / 65;
                                                const snfRate = (rate * 4) / 85;

                                                const gheeAmount = Math.floor(Math.floor(rawFat * gheeRate) / 1000);
                                                const snfAmount = Math.floor(Math.floor(rawSnf * snfRate) / 1000);
                                                amount = gheeAmount + snfAmount;
                                            } else {
                                                amount = Math.floor(qty * (fat / 10) * rate);
                                            }

                                            return (
                                                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2.5 flex items-center justify-between">
                                                    <span className="text-xs text-green-700 font-medium">Estimated amount</span>
                                                    <span className="text-lg font-bold text-green-700">₹{amount}</span>
                                                </div>
                                            );
                                        })()}

                                        <button
                                            type="submit"
                                            className={`w-full py-3 rounded-lg font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 ${currentRecord
                                                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
                                                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                                }`}
                                        >
                                            <SaveIcon />
                                            {currentRecord ? 'Update record' : 'Save  (Enter)'}
                                        </button>

                                        {currentRecord && (
                                            <p className="text-center text-xs text-slate-400">Press Esc to cancel editing</p>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* ===== RIGHT PANEL: TABLE ===== */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm relative">

                            {/* ── Bulk action bar ── */}
                            {selectedIds.size > 0 && (
                                <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200 shadow-sm">
                                    <span className="flex-shrink-0 text-xs font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-full">
                                        {selectedIds.size} selected
                                    </span>
                                    <div className="h-4 w-px bg-slate-200 flex-shrink-0" />

                                    {/* CHIP: Shift */}
                                    <button
                                        onClick={() => toggleChip('shift')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex-shrink-0 ${activeChip === 'shift'
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : bulkData.shift
                                                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                            }`}
                                    >
                                        <SunIcon />
                                        <span>Shift</span>
                                        {bulkData.shift && (
                                            <span className="font-semibold text-blue-600">
                                                {bulkData.shift === 'MORNING' ? 'AM' : 'PM'}
                                            </span>
                                        )}
                                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeChip === 'shift' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    </button>

                                    {activeChip === 'shift' && (
                                        <div className="flex bg-slate-100 rounded-lg border border-slate-200 p-0.5 gap-0.5 flex-shrink-0">
                                            <button
                                                onClick={() => setBulkData(prev => ({ ...prev, shift: 'MORNING' }))}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${bulkData.shift === 'MORNING' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <SunIcon /> AM
                                            </button>
                                            <button
                                                onClick={() => setBulkData(prev => ({ ...prev, shift: 'EVENING' }))}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${bulkData.shift === 'EVENING' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <MoonIcon /> PM
                                            </button>
                                        </div>
                                    )}

                                    {/* CHIP: Date */}
                                    <button
                                        onClick={() => toggleChip('date')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex-shrink-0 ${activeChip === 'date'
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : bulkData.date
                                                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                            }`}
                                    >
                                        <CalendarIcon />
                                        <span>Date</span>
                                        {bulkData.date && (
                                            <span className="font-semibold text-blue-600">
                                                {new Date(bulkData.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeChip === 'date' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    </button>

                                    {activeChip === 'date' && (
                                        <div className="relative flex-shrink-0">
                                            <input
                                                ref={bulkDateRef}
                                                type="date"
                                                value={bulkData.date}
                                                onChange={(e) => setBulkData(prev => ({ ...prev, date: e.target.value }))}
                                                className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            />
                                        </div>
                                    )}

                                    {/* CHIP: Rate */}
                                    <button
                                        onClick={() => toggleChip('rate')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex-shrink-0 ${activeChip === 'rate'
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : bulkData.rate
                                                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                            }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Rate</span>
                                        {bulkData.rate && (
                                            <span className="font-semibold text-green-700">₹{bulkData.rate}</span>
                                        )}
                                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeChip === 'rate' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    </button>

                                    {activeChip === 'rate' && (
                                        <div className="relative flex items-center flex-shrink-0">
                                            <span className="absolute left-2.5 text-xs text-slate-400 font-medium pointer-events-none">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                autoFocus
                                                value={bulkData.rate}
                                                onChange={(e) => setBulkData(prev => ({ ...prev, rate: e.target.value }))}
                                                className="pl-6 pr-2.5 py-1.5 w-24 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1" />

                                    {/* Apply */}
                                    <button
                                        onClick={handleBulkUpdate}
                                        className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        <CheckIcon /> Apply
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        <TrashIcon /> Delete
                                    </button>

                                    {/* Dismiss */}
                                    <button
                                        onClick={() => { setSelectedIds(new Set()); setActiveChip(null); setBulkData({ date: '', shift: '', rate: '' }); }}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <XIcon />
                                    </button>
                                </div>
                            )}

                            {/* Table Toolbar */}
                            <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 gap-0.5">
                                    <button
                                        onClick={() => setViewShift('MORNING')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewShift === 'MORNING' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <SunIcon /> Morning
                                    </button>
                                    <button
                                        onClick={() => setViewShift('EVENING')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewShift === 'EVENING' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <MoonIcon /> Evening
                                    </button>
                                </div>

                                <div
                                    onClick={openViewDatePicker}
                                    className="relative flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium text-slate-700"
                                >
                                    <CalendarIcon />
                                    <span>{displayDate}</span>
                                    <input
                                        ref={viewDateInputRef}
                                        type="date"
                                        value={viewDate}
                                        onChange={(e) => setViewDate(e.target.value)}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto">
                                <table className="w-full table-fixed border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 px-3 py-3 border-b border-slate-100">
                                                <input
                                                    type="checkbox"
                                                    checked={records.length > 0 && selectedIds.size === records.length}
                                                    onChange={toggleSelectAll}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="w-[28%] px-3 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">Supplier</th>
                                            <th className="w-[14%] px-3 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">Milk (kg)</th>
                                            <th className="w-[18%] px-3 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">Fat / SNF</th>
                                            <th className="w-[14%] px-3 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rate</th>
                                            <th className="w-[18%] px-3 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">Amount</th>
                                            <th className="w-10 border-b border-slate-100" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((record) => {
                                            const isSelected = selectedIds.has(record.id);
                                            const isEditing = currentRecord?.id === record.id;
                                            return (
                                                <tr
                                                    key={record.id}
                                                    onMouseDown={() => handleRowMouseDown(record.id)}
                                                    onTouchStart={() => handleRowMouseDown(record.id)}
                                                    onMouseEnter={() => handleRowMouseEnter(record.id)}
                                                    onClick={(e) => handleRowClick(e, record)}
                                                    className={`group transition-colors cursor-pointer border-b border-slate-50
                                                        ${isSelected ? 'bg-blue-50' : ''}
                                                        ${isEditing && !isSelected ? 'bg-amber-50' : ''}
                                                        ${!isSelected && !isEditing ? 'hover:bg-slate-50' : ''}
                                                    `}
                                                >
                                                    <td className="px-3 py-3" onClick={(e) => { e.stopPropagation(); toggleSelectRow(record.id); }}>
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                            {isSelected && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="font-medium text-sm text-slate-800 truncate">{record.supplier.name}</div>
                                                        {record.supplier.mobile && (
                                                            <div className="text-xs text-slate-400 mt-0.5">{record.supplier.mobile}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-mono text-sm text-slate-700 font-medium">
                                                        {parseFloat(record.quantity).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="text-sm font-semibold text-slate-700">{parseFloat(record.fat).toFixed(1)}</span>
                                                        <span className="text-slate-300 mx-1">/</span>
                                                        <span className="text-xs text-slate-500">{parseFloat(record.snf).toFixed(1)}</span>
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-xs text-slate-400 font-medium">
                                                        ₹{parseFloat(record.rate).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-semibold text-green-700 text-sm">
                                                        ₹{parseFloat(record.amount).toFixed(0)}
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        {selectedIds.size === 0 && (
                                                            <button
                                                                onClick={(e) => handleDelete(e, record.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-all"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {records.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="py-16 text-center">
                                                    <div className="text-slate-300 text-3xl mb-2">—</div>
                                                    <div className="text-slate-400 text-sm">No records for this shift and date</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer totals */}
                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-500">
                                        {records.length} record{records.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Total milk: <span className="font-semibold text-slate-700">{totalMilk.toFixed(2)} kg</span>
                                    </span>
                                </div>
                                <div className="text-base font-bold text-green-700">₹{totalAmount.toFixed(0)}</div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default MilkRecords;