import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import { Wrench, Package, Users, BarChart3, LogOut, Shield } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  // const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Equipment', href: '/equipment', icon: Package },
    { name: 'Maintenance Requests', href: '/maintenance-requests', icon: Wrench },
    { name: 'Maintenance Teams', href: '/maintenance-teams', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ]

  if (user?.role === 'ADMIN') {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: Shield })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#1a2942] dark:to-[#2d405f] transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-[#070b28]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wider">GEAR<span className="text-blue-600 dark:text-blue-500">GUARD</span></h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-white/10 pr-4">
                {user?.full_name || user?.username} <span className="text-xs text-blue-600 dark:text-blue-400">({user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : ''})</span>
              </span>



              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-white/10 text-sm leading-4 font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

