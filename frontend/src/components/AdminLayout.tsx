import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import { LayoutDashboard, Users, LogOut, Home, Wrench, Briefcase } from 'lucide-react'

export default function AdminLayout() {
    const { user, logout } = useAuth()
    // const { theme, toggleTheme } = useTheme()
    const location = useLocation()

    const navigation = [
        { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Equipment Config', href: '/admin/equipment', icon: Wrench },
        { name: 'Maintenance Teams', href: '/admin/teams', icon: Briefcase },
    ]

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#1a2942] dark:to-[#2d405f] font-sans text-gray-900 dark:text-white transition-colors duration-300">
            {/* Admin Sidebar */}
            <div className="w-64 bg-white dark:bg-[#070b28]/80 backdrop-blur-md border-r border-gray-200 dark:border-white/10 flex flex-col flex-shrink-0 shadow-2xl z-20 transition-colors duration-300">
                <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight border-b border-gray-200 dark:border-white/10 bg-transparent">
                    <span className="text-blue-600 dark:text-blue-500 mr-2">Admin</span><span className="text-gray-900 dark:text-white">Panel</span>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
                    <div className="mb-4 px-2">
                        <div className="text-xs uppercase text-gray-500 dark:text-gray-500 font-semibold mb-2">User</div>
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3 border border-blue-200 dark:border-blue-500/30">
                                {user?.username?.[0].toUpperCase()}
                            </div>
                            <div className="truncate">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.full_name || user?.username}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Admin'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link
                            to="/"
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Home className="mr-3 h-4 w-4" />
                            Back to App
                        </Link>



                        <button
                            onClick={logout}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 bg-white/80 dark:bg-[#070b28]/50 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-8 shadow-sm z-10 transition-colors duration-300">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Admin Area'}
                    </h2>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
