import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceTeamApi } from '../api/maintenanceTeam'
import { authApi } from '../api/auth'
import { Plus, Users, Trash2, X, UserPlus, UserMinus, Edit2, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function MaintenanceTeams() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [addingMemberTo, setAddingMemberTo] = useState<number | null>(null)
  const [editingMember, setEditingMember] = useState<{ teamId: number; userId: number; name: string } | null>(null)

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['maintenance-teams'],
    queryFn: () => maintenanceTeamApi.list(),
  })

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => authApi.listUsers('TECHNICIAN'),
    enabled: !!addingMemberTo,
  })

  const createMutation = useMutation({
    mutationFn: (teamName: string) => maintenanceTeamApi.create({ team_name: teamName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-teams'] })
      setIsModalOpen(false)
      setNewTeamName('')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Failed to create team'
      alert(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => maintenanceTeamApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-teams'] })
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      maintenanceTeamApi.addMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-teams'] })
      setAddingMemberTo(null)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Failed to add member'
      alert(msg)
    }
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      maintenanceTeamApi.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-teams'] })
    },
  })

  const updateMemberMutation = useMutation({
    mutationFn: ({ teamId, userId, displayName }: { teamId: number; userId: number; displayName: string }) =>
      maintenanceTeamApi.updateMember(teamId, userId, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-teams'] })
      setEditingMember(null)
    },
  })

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeamName.trim()) {
      // Check for duplicate name locally first for immediate feedback
      const isDuplicate = teams?.some((team: any) => team.team_name.toLowerCase() === newTeamName.trim().toLowerCase())
      if (isDuplicate) {
        alert('A team with this name already exists.')
        return
      }
      createMutation.mutate(newTeamName)
    }
  }

  const handleUpdateMemberName = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMember && editingMember.name.trim()) {
      updateMemberMutation.mutate({
        teamId: editingMember.teamId,
        userId: editingMember.userId,
        displayName: editingMember.name
      })
    }
  }

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Maintenance Teams</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage maintenance teams and technicians</p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-blue-500/50 text-sm font-medium rounded-md shadow-[0_0_15px_rgba(37,99,235,0.3)] text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/80 dark:hover:bg-blue-600 backdrop-blur-sm transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="text-center py-12 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
          <p className="text-red-600 dark:text-red-400">Failed to load maintenance teams. Please try again later.</p>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {teams?.map((team) => (
            <div key={team.id} className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-xl rounded-xl p-6 flex flex-col transition-all hover:shadow-2xl hover:border-gray-300 dark:hover:border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-200 dark:border-blue-500/20">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">{team.team_name}</h3>
                </div>
                {canManage && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this team?')) {
                        deleteMutation.mutate(team.id)
                      }
                    }}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-300">
                    Members ({team.team_members?.length || 0}/10)
                  </p>
                  {canManage && (
                    <button
                      onClick={() => {
                        if ((team.team_members?.length || 0) >= 10) {
                          alert('This team has reached the maximum limit of 10 members.')
                          return
                        }
                        setAddingMemberTo(team.id)
                      }}
                      className={`text-xs font-medium flex items-center transition-colors ${(team.team_members?.length || 0) >= 10
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-blue-400 hover:text-blue-300'
                        }`}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add Member
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {team.team_members && team.team_members.length > 0 ? (
                    team.team_members.map((member) => (
                      <div key={member.id} className="flex flex-col bg-black/20 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center overflow-hidden flex-grow mr-2">
                            <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0 border border-gray-600">
                              <span className="text-[10px] font-bold text-gray-300">
                                {(member.display_name || member.user.full_name || member.user.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {editingMember?.teamId === team.id && editingMember?.userId === member.user_id ? (
                              <form onSubmit={handleUpdateMemberName} className="flex-grow flex items-center">
                                <input
                                  type="text"
                                  className="w-full text-sm bg-gray-800 text-white border-gray-600 rounded px-1 py-0.5 focus:ring-blue-500 focus:border-blue-500"
                                  value={editingMember.name}
                                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                                  autoFocus
                                  onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                      // Optional: save on blur or just cancel
                                    }
                                  }}
                                />
                                <button type="submit" className="ml-1 text-green-400 hover:text-green-300">
                                  <Check className="h-3 w-3" />
                                </button>
                                <button type="button" onClick={() => setEditingMember(null)} className="ml-1 text-gray-500 hover:text-gray-300">
                                  <X className="h-3 w-3" />
                                </button>
                              </form>
                            ) : (
                              <p className="text-sm text-gray-300 truncate font-medium">
                                {member.display_name || member.user.full_name || member.user.username}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {canManage && !editingMember && (
                              <button
                                onClick={() => setEditingMember({
                                  teamId: team.id,
                                  userId: member.user_id,
                                  name: member.display_name || member.user.full_name || member.user.username
                                })}
                                className="text-gray-500 hover:text-blue-400 p-1"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            )}
                            {canManage && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${member.display_name || member.user.full_name || member.user.username} from this team?`)) {
                                    removeMemberMutation.mutate({ teamId: team.id, userId: member.user_id })
                                  }
                                }}
                                className="text-gray-500 hover:text-red-400 p-1"
                              >
                                <UserMinus className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic py-2">No members assigned</p>
                  )}
                </div>
              </div>

              {addingMemberTo === team.id && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in-down">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Technician</h4>
                    <button onClick={() => setAddingMemberTo(null)} className="text-gray-500 hover:text-gray-300">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {technicians
                      ?.filter(tech => !team.team_members?.some(m => m.user_id === tech.id))
                      .map(tech => (
                        <button
                          key={tech.id}
                          onClick={() => addMemberMutation.mutate({ teamId: team.id, userId: tech.id })}
                          className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-blue-500/10 hover:text-blue-300 rounded transition-colors flex items-center justify-between group border border-transparent hover:border-blue-500/20"
                        >
                          <span>{tech.full_name || tech.username}</span>
                          <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    {technicians?.filter(tech => !team.team_members?.some(m => m.user_id === tech.id)).length === 0 && (
                      <p className="text-[10px] text-gray-500 italic">No more technicians available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
      }

      {
        teams && teams.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-xl shadow-sm border-2 border-dashed border-white/10">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No maintenance teams found</p>
            <p className="text-gray-600 text-sm mt-1">Start by creating your first maintenance team</p>
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </button>
            )}
          </div>
        )
      }

      {/* Add Team Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-[#0f172a] border border-white/10 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-[#0f172a] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Create New Team</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateTeam}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
                          Team Name
                        </label>
                        <input
                          type="text"
                          name="teamName"
                          id="teamName"
                          className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-shadow sm:text-sm p-3 text-white placeholder-gray-500"
                          placeholder="e.g. Electrical Maintenance"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          required
                          autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Use a descriptive name that helps identify the team's specialty.
                        </p>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-all disabled:opacity-50"
                      >
                        {createMutation.isPending ? 'Creating...' : 'Create Team'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="inline-flex justify-center w-full rounded-lg border border-white/10 shadow-sm px-6 py-3 bg-white/5 text-base font-medium text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}
