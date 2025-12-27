import { useNavigate } from 'react-router-dom'
import { Users, ArrowRight, Wrench, Briefcase } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()

    const stats = [
        { name: 'User Management', value: 'Manage Users', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20', href: '/admin/users', description: 'Add, remove, and manage system users and roles' },
        { name: 'Equipment Config', value: 'Manage Equipment', icon: Wrench, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20', href: '/admin/equipment', description: 'Create, assign, and scrap equipment records' },
        { name: 'Maintenance Teams', value: 'Manage Teams', icon: Briefcase, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/20', href: '/admin/teams', description: 'Organize technicians into specialized teams' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome to the centralized administration panel.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => item.href !== '#' && navigate(item.href)}
                        className={`bg-white dark:bg-white/5 backdrop-blur-sm overflow-hidden rounded-xl shadow-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer group`}
                    >
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-lg p-3 ${item.bg}`}>
                                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</dt>
                                        <dd className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-black/20 px-6 py-3 border-t border-gray-200 dark:border-white/5">
                            <div className="text-sm">
                                <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 group-hover:underline flex items-center transition-colors">
                                    {item.description}
                                    {item.href !== '#' && <ArrowRight className="ml-1 h-3 w-3" />}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="inline-flex items-center px-4 py-2 border border-blue-500/50 text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/80 dark:hover:bg-blue-600 transition-all focus:outline-none backdrop-blur-sm"
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Add New User
                    </button>
                    {/* Future actions */}
                </div>
            </div>
        </div>
    )
}
