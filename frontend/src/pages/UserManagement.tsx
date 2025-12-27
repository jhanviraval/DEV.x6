import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, User, RegisterRequest } from '../api/auth'
import { Plus, Pencil, Trash2, X, Shield } from 'lucide-react'

export default function UserManagement() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<Partial<RegisterRequest>>({
        username: '',
        email: '',
        full_name: '',
        role: 'USER',
        password: '',
    })
    const [error, setError] = useState('')

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => authApi.listUsers(),
    })

    const createMutation = useMutation({
        mutationFn: authApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            closeModal()
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to create user')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => authApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            closeModal()
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to update user')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: authApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingUser) {
            const updateData: any = { ...formData }
            if (!updateData.password) delete updateData.password
            updateMutation.mutate({ id: editingUser.id, data: updateData })
        } else {
            if (!formData.username || !formData.password || !formData.email) {
                setError('Please fill in all required fields')
                return
            }
            createMutation.mutate(formData as RegisterRequest)
        }
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setFormData({
            username: user.username,
            email: user.email,
            full_name: user.full_name || '',
            role: user.role,
            password: '', // Don't populate password
        })
        setIsModalOpen(true)
        setError('')
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setFormData({
            username: '',
            email: '',
            full_name: '',
            role: 'USER',
            password: '',
        })
        setIsModalOpen(true)
        setError('')
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingUser(null)
        setError('')
    }

    if (isLoading) return <div className="p-8 text-center">Loading users...</div>

    return (
        <div className="space-y-6 px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="mt-2 text-sm text-gray-400">Manage system users and roles</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 border border-blue-500/50 bg-blue-600/80 text-white rounded-lg hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all backdrop-blur-sm"
                >
                    <Plus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/20 text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold border border-blue-500/10">
                                            {user.full_name?.[0] || user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.full_name || 'No Name'}</div>
                                            <div className="text-sm text-gray-400">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border-purple-500/20' :
                                            user.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-300 border-blue-500/20' :
                                                user.role === 'TECHNICIAN' ? 'bg-orange-500/20 text-orange-300 border-orange-500/20' :
                                                    'bg-gray-500/20 text-gray-300 border-gray-500/20'
                                        }`}>
                                        {user.role === 'ADMIN' && <Shield size={12} className="mr-1" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-md text-sm border border-transparent
                    ${user.is_active ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.5)]'}`}></span>
                                        <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                            title="Edit User"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this user?')) {
                                                    deleteMutation.mutate(user.id)
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                                >
                                    <option value="USER" className="bg-gray-900">User</option>
                                    <option value="TECHNICIAN" className="bg-gray-900">Technician</option>
                                    <option value="MANAGER" className="bg-gray-900">Manager</option>
                                    <option value="ADMIN" className="bg-gray-900">Admin</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">
                                    {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                                    placeholder={editingUser ? '••••••••' : ''}
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-lg shadow-blue-900/20"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    )}
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
