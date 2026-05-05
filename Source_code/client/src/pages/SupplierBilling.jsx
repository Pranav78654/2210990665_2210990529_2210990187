import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';


const CalendarIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const DownloadIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const CalculatorIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const Spinner = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

const SupplierBilling = () => {
   
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [deductAdvances, setDeductAdvances] = useState(true);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeCycle, setActiveCycle] = useState('current');

    
    const [supplierName, setSupplierName] = useState('');
    const [shift, setShift] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    
    useEffect(() => {
        setCycle('current');
        fetchSuppliers(); 

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

   
    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/milk-suppliers/all');
            setSuppliers(response.data);
        } catch (error) { console.error('Error fetching suppliers:', error); }
    };

    const setCycle = (type) => {
        setActiveCycle(type);
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        let start, end;

        if (type === '1-10') {
            start = new Date(year, month, 1);
            end = new Date(year, month, 10);
        } else if (type === '11-20') {
            start = new Date(year, month, 11);
            end = new Date(year, month, 20);
        } else if (type === '21-end') {
            start = new Date(year, month, 21);
            end = new Date(year, month + 1, 0);
        } else if (type === 'current') {
            if (day <= 10) { start = new Date(year, month, 1); end = new Date(year, month, 10); }
            else if (day <= 20) { start = new Date(year, month, 11); end = new Date(year, month, 20); }
            else { start = new Date(year, month, 21); end = new Date(year, month + 1, 0); }
        } else if (type === 'prev-month') {
            start = new Date(year, month - 1, 1);
            end = new Date(year, month, 0);
        }

        if (start && end) {
            const offset = start.getTimezoneOffset();
            const toLocalISO = (date) => {
                const d = new Date(date);
                d.setMinutes(d.getMinutes() - offset);
                return d.toISOString().split('T')[0];
            };
            setDateRange({ startDate: toLocalISO(start), endDate: toLocalISO(end) });
        }
    };

    const fetchBills = async () => {
        if (!dateRange.startDate || !dateRange.endDate) return;
        setLoading(true);
        try {
            const response = await api.post('/milk-suppliers/period-bills', {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                deductAdvances,
                supplierName, 
                shift        
            });
            setBills(response.data);
        } catch (error) { console.error('Error fetching bills:', error); } 
        finally { setLoading(false); }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await api.post('/milk-suppliers/generate-bill-pdf', {
                bills, dateRange, filters: { supplierName, shift }
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bill-Sheet-${dateRange.startDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) { console.error('Error downloading PDF:', error); }
    };

    const calculateTotals = () => {
        return bills.reduce((acc, bill) => ({
            quantity: acc.quantity + parseFloat(bill.totalQuantity),
            amount: acc.amount + parseFloat(bill.totalMilkAmount),
            net: acc.net + parseFloat(bill.netPayable)
        }), { quantity: 0, amount: 0, net: 0 });
    };

    const totals = calculateTotals();
    const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(supplierName.toLowerCase()));

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
                
                
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden flex-none z-20">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 p-2"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                        <h1 className="text-lg font-bold text-slate-800">DairyManager</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden flex flex-col md:flex-row w-full h-full">
                    
                  
                    <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col h-auto md:h-full z-10 shadow-lg md:shadow-none overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CalculatorIcon /> Generate Bill
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Calculate payment cycles</p>
                        </div>

                        <div className="p-6 space-y-6 flex-1">
                            {/* Cycle Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Billing Cycle</label>
                                <div className="flex flex-wrap gap-2">
                                    {['1-10', '11-20', '21-end', 'prev-month'].map(cycle => (
                                        <button
                                            key={cycle}
                                            onClick={() => setCycle(cycle)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                activeCycle === cycle 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {cycle === '21-end' ? '21-End' : cycle === 'prev-month' ? 'Last Month' : cycle}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">From</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><CalendarIcon /></div>
                                        <input type="date" value={dateRange.startDate} onChange={(e) => { setDateRange({ ...dateRange, startDate: e.target.value }); setActiveCycle('custom'); }} className="w-full pl-9 pr-2 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">To</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><CalendarIcon /></div>
                                        <input type="date" value={dateRange.endDate} onChange={(e) => { setDateRange({ ...dateRange, endDate: e.target.value }); setActiveCycle('custom'); }} className="w-full pl-9 pr-2 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold" />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Shift</label>
                                    <select value={shift} onChange={(e) => setShift(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm">
                                        <option value="">All Shifts</option>
                                        <option value="MORNING">Morning</option>
                                        <option value="EVENING">Evening</option>
                                    </select>
                                </div>

                                <div className="relative" ref={dropdownRef}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Filter Supplier</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><SearchIcon /></div>
                                        <input type="text" placeholder="All Suppliers" value={supplierName} onChange={(e) => { setSupplierName(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                                    </div>
                                    {isDropdownOpen && filteredSuppliers.length > 0 && supplierName && (
                                        <div className="absolute z-20 mt-1 w-full bg-white shadow-xl max-h-40 rounded-xl border border-slate-100 overflow-auto">
                                            {filteredSuppliers.map((s) => (
                                                <div key={s.id} className="cursor-pointer px-4 py-2 hover:bg-blue-50 text-sm text-slate-700" onClick={() => { setSupplierName(s.name); setIsDropdownOpen(false); }}>{s.name}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Advance Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <input type="checkbox" id="deduct" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={deductAdvances} onChange={(e) => setDeductAdvances(e.target.checked)} />
                                <label htmlFor="deduct" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">Deduct Advance Payments</label>
                            </div>

                            <button onClick={fetchBills} disabled={!dateRange.startDate || !dateRange.endDate || loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? <Spinner /> : <CalculatorIcon />} Calculate Bill
                            </button>
                        </div>
                    </div>

                    {/*RIGHT PANEL: RESULTS  */}
                    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center shadow-sm z-10 flex-none">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Billing Results</h1>
                                <p className="text-xs text-slate-500">
                                    {bills.length > 0 ? `${bills.length} Records Found` : 'Select parameters to generate bill'}
                                </p>
                            </div>
                            <button onClick={handleDownloadPdf} disabled={bills.length === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm ${bills.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                <DownloadIcon /> Download PDF
                            </button>
                        </div>

                        {/* Summary Stats */}
                        {bills.length > 0 && (
                            <div className="px-8 pt-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4 flex-none">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Milk</p>
                                    <p className="text-xl font-bold text-slate-800">{totals.quantity.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Kg</span></p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Amount</p>
                                    <p className="text-xl font-bold text-slate-800">₹{totals.amount.toFixed(0)}</p>
                                </div>
                                <div className="bg-green-600 p-4 rounded-xl shadow-md shadow-green-200 border border-green-500 text-white">
                                    <p className="text-[10px] font-bold text-green-100 uppercase">Net Payable</p>
                                    <p className="text-xl font-bold">₹{totals.net.toFixed(0)}</p>
                                </div>
                            </div>
                        )}

                        {/* Results Table */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-blue-600"><div className="w-8 h-8"><Spinner /></div><p className="mt-2 text-sm font-medium text-slate-500">Calculating...</p></div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse table-auto">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Supplier</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Milk</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Fat Kg</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">SNF Kg</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Gross</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Adv.</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Net Pay</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {bills.length > 0 ? bills.map((bill) => (
                                                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-3.5 font-bold text-slate-800 text-sm">{bill.name}</td>
                                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600 text-sm">{parseFloat(bill.totalQuantity).toFixed(2)}</td>
                                                        <td className="px-6 py-3.5 text-right font-mono text-slate-500 text-xs">{parseFloat(bill.totalFatKg).toFixed(2)}</td>
                                                        <td className="px-6 py-3.5 text-right font-mono text-slate-500 text-xs">{parseFloat(bill.totalSnfKg).toFixed(2)}</td>
                                                        <td className="px-6 py-3.5 text-right font-mono font-medium text-slate-800 text-sm">₹{parseFloat(bill.totalMilkAmount).toFixed(0)}</td>
                                                        <td className="px-6 py-3.5 text-right font-mono font-medium text-red-500 text-sm">
                                                            {parseFloat(bill.totalAdvance) > 0 ? `-${parseFloat(bill.totalAdvance).toFixed(0)}` : '-'}
                                                        </td>
                                                        <td className="px-6 py-3.5 text-right">
                                                            <span className="inline-block px-2.5 py-0.5 rounded bg-green-50 text-green-700 font-bold text-sm border border-green-100">
                                                                ₹{parseFloat(bill.netPayable).toFixed(0)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="7" className="py-20 text-center text-slate-400 text-sm">
                                                            <div className="flex flex-col items-center">
                                                                <CalculatorIcon />
                                                                <p className="mt-2">No bills generated yet.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default SupplierBilling;