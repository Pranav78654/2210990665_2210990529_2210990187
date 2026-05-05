import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const SunIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);
const MoneyIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        morningMilk: 0,
        eveningMilk: 0,
        totalSales: 0,
        itemSales: [],
        date: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Top Navigation */}
                <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            {/* Mobile Toggle & Brand */}
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsSidebarOpen(true)} 
                                    className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-xl font-bold text-slate-800 lg:hidden flex items-center gap-2">
                                    <span className="text-blue-600">🥛</span> DairyManager
                                </h1>
                            </div>

                            {/* User Profile & Logout */}
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-800">{user.username || 'User'}</p>
                                    <p className="text-xs text-slate-500 font-medium">{user.role || 'Administrator'}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                    {user.username ? user.username[0].toUpperCase() : 'U'}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Sign Out"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header Section */}
                        <header className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
                            <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm sm:text-base">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {stats.date || new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            
                            {/* Morning Milk Card */}
                            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="text-amber-500 transform scale-150"><SunIcon /></div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                        <SunIcon />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Morning Milk</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-slate-900">{parseFloat(stats.morningMilk).toFixed(2)}</p>
                                    <span className="text-sm font-medium text-slate-500">Kg</span>
                                </div>
                            </div>

                            {/* Evening Milk Card */}
                            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="text-indigo-500 transform scale-150"><MoonIcon /></div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <MoonIcon />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Evening Milk</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-slate-900">{parseFloat(stats.eveningMilk).toFixed(2)}</p>
                                    <span className="text-sm font-medium text-slate-500">Kg</span>
                                </div>
                            </div>

                            {/* Total Sales Card */}
                            <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="text-emerald-500 transform scale-150"><MoneyIcon /></div>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <MoneyIcon />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Sales</h3>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-medium text-slate-400">₹</span>
                                    <p className="text-3xl font-bold text-slate-900">{parseFloat(stats.totalSales).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Item Sales Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                                    <h3 className="text-lg font-bold text-slate-800">Today's Product Sales</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/item-sales')}
                                    className="group flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Manage Sales
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6 bg-slate-50/50">
                                {stats.itemSales && stats.itemSales.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {stats.itemSales.map((item, index) => (
                                            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Product</p>
                                                <p className="text-base font-semibold text-slate-800 truncate" title={item.name}>{item.name}</p>
                                                <div className="mt-3 flex items-end justify-between">
                                                    <p className="text-2xl font-bold text-blue-900">
                                                        {parseFloat(item.quantity).toFixed(1)}
                                                    </p>
                                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md mb-1">{item.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500 font-medium">No additional products sold today.</p>
                                        <p className="text-slate-400 text-sm mt-1">Sales records will appear here once added.</p>
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

export default Dashboard;