"use client"

import React, { useState, useEffect } from "react"
import { X, MoreVertical, Trash2, UserPlus, Loader2, Eye, EyeOff } from "lucide-react"
import { apiService } from "@/services/api.service"

interface AdminUser {
  id: string
  email: string
  name: string
  created_at: string
  last_sign_in_at: string | null
}

interface AdminPanelProps {
  currentUserEmail: string
  onClose: () => void
}

export default function AdminPanel({ currentUserEmail, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null)
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAdminUsers()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newEmail || !newPassword) return
    try {
      setCreating(true)
      setError(null)
      await apiService.createAdminUser(newEmail, newPassword, newName || newEmail.split("@")[0])
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setShowCreateForm(false)
      await loadUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      setError(null)
      await apiService.deleteAdminUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 md:bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-[440px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 text-lg">Mitarbeiter</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((user) => {
                const isCurrentUser = user.email === currentUserEmail
                return (
                  <div key={user.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {isCurrentUser ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ color: "#8B6635", backgroundColor: "rgba(212, 165, 116, 0.15)" }}>
                          Angemeldet
                        </span>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(menuOpenId === user.id ? null : user.id)
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                          {menuOpenId === user.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 min-w-[160px]"
                              onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  if (confirm(`${user.name} wirklich löschen?`)) {
                                    handleDelete(user.id)
                                  }
                                  setMenuOpenId(null)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Löschen</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create form / button */}
        <div className="border-t border-gray-100 p-5 flex-shrink-0">
          {showCreateForm ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Neuen Mitarbeiter erstellen</p>
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
              />
              <input
                type="email"
                placeholder="E-Mail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Passwort"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCreateForm(false); setError(null) }}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newEmail || !newPassword}
                  className="flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Erstellen
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}
            >
              <UserPlus className="h-4 w-4" />
              Neuen Mitarbeiter erstellen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
