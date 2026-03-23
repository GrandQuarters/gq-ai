"use client"

import React, { useState, useEffect } from "react"
import { X, MoreVertical, Trash2, UserPlus, Loader2, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react"
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

type SubView = null | { type: "changePassword"; user: AdminUser } | { type: "deleteConfirm"; user: AdminUser }

export default function AdminPanel({ currentUserEmail, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPw, setShowNewPw] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [subView, setSubView] = useState<SubView>(null)

  const [oldPw, setOldPw] = useState("")
  const [changePw, setChangePw] = useState("")
  const [changePwConfirm, setChangePwConfirm] = useState("")
  const [showOldPw, setShowOldPw] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [deletePw, setDeletePw] = useState("")
  const [showDeletePw, setShowDeletePw] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [])

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

  const openSubView = (view: SubView) => {
    setSubView(view)
    setMenuOpenId(null)
    setOldPw("")
    setChangePw("")
    setChangePwConfirm("")
    setPwError(null)
    setPwSuccess(false)
    setDeletePw("")
    setDeleteError(null)
    setShowOldPw(false)
    setShowChangePw(false)
    setShowDeletePw(false)
  }

  const handleChangePassword = async () => {
    if (!subView || subView.type !== "changePassword") return
    setPwError(null)
    if (changePw !== changePwConfirm) {
      setPwError("Passwörter stimmen nicht überein")
      return
    }
    if (changePw.length < 6) {
      setPwError("Passwort muss mindestens 6 Zeichen lang sein")
      return
    }
    try {
      setChangingPw(true)
      await apiService.changeAdminPassword(subView.user.id, subView.user.email, oldPw, changePw)
      setPwSuccess(true)
      setTimeout(() => setSubView(null), 1500)
    } catch (err: any) {
      setPwError(err.message)
    } finally {
      setChangingPw(false)
    }
  }

  const handleDeleteWithConfirm = async () => {
    if (!subView || subView.type !== "deleteConfirm") return
    setDeleteError(null)
    try {
      setDeleting(true)
      await apiService.deleteAdminUser(subView.user.id, deletePw, subView.user.email)
      setUsers((prev) => prev.filter((u) => u.id !== subView.user.id))
      setSubView(null)
    } catch (err: any) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Sub-view: Change Password
  if (subView?.type === "changePassword") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        onClick={onClose}>
        <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-[440px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <button onClick={() => setSubView(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h3 className="font-semibold text-gray-900">Passwort ändern</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}>
                {subView.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{subView.user.name}</p>
                <p className="text-xs text-gray-400">{subView.user.email}</p>
              </div>
            </div>

            {pwSuccess ? (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 text-center">
                Passwort erfolgreich geändert
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{pwError}</div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Aktuelles Passwort</label>
                  <div className="relative">
                    <input type={showOldPw ? "text" : "password"} value={oldPw} onChange={(e) => setOldPw(e.target.value)}
                      placeholder="Aktuelles Passwort eingeben"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
                    <button type="button" onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Neues Passwort</label>
                  <div className="relative">
                    <input type={showChangePw ? "text" : "password"} value={changePw} onChange={(e) => setChangePw(e.target.value)}
                      placeholder="Neues Passwort eingeben"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
                    <button type="button" onClick={() => setShowChangePw(!showChangePw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showChangePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Neues Passwort bestätigen</label>
                  <input type={showChangePw ? "text" : "password"} value={changePwConfirm} onChange={(e) => setChangePwConfirm(e.target.value)}
                    placeholder="Neues Passwort wiederholen"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
                </div>
                <button onClick={handleChangePassword}
                  disabled={changingPw || !oldPw || !changePw || !changePwConfirm}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}>
                  {changingPw && <Loader2 className="h-4 w-4 animate-spin" />}
                  Passwort ändern
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Sub-view: Delete Confirm
  if (subView?.type === "deleteConfirm") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        onClick={onClose}>
        <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-[440px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <button onClick={() => setSubView(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h3 className="font-semibold text-gray-900">Account löschen</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}>
                {subView.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{subView.user.name}</p>
                <p className="text-xs text-gray-400">{subView.user.email}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Um <span className="font-medium">{subView.user.name}</span> zu löschen, gib das Passwort dieses Accounts zur Bestätigung ein.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 mb-4">{deleteError}</div>
            )}

            <div className="relative mb-4">
              <input type={showDeletePw ? "text" : "password"} value={deletePw} onChange={(e) => setDeletePw(e.target.value)}
                placeholder="Passwort eingeben"
                className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
              <button type="button" onClick={() => setShowDeletePw(!showDeletePw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showDeletePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSubView(null)}
                className="flex-1 px-3 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Abbrechen
              </button>
              <button onClick={handleDeleteWithConfirm}
                disabled={deleting || !deletePw}
                className="flex-1 px-3 py-2.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main view: User list
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}>
      <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-[440px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 text-lg">Mitarbeiter</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
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
                      {isCurrentUser && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ color: "#8B6635", backgroundColor: "rgba(212, 165, 116, 0.15)" }}>
                          Angemeldet
                        </span>
                      )}
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
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 min-w-[180px]"
                            onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openSubView({ type: "changePassword", user })}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                            >
                              <KeyRound className="h-4 w-4" />
                              <span>Passwort ändern</span>
                            </button>
                            <hr className="border-gray-50" />
                            <button
                              onClick={() => openSubView({ type: "deleteConfirm", user })}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Löschen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-5 flex-shrink-0">
          {showCreateForm ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Neuen Mitarbeiter erstellen</p>
              <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
              <input type="email" placeholder="E-Mail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} placeholder="Passwort" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowCreateForm(false); setError(null) }}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Abbrechen
                </button>
                <button onClick={handleCreate} disabled={creating || !newEmail || !newPassword}
                  className="flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Erstellen
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCreateForm(true)}
              className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}>
              <UserPlus className="h-4 w-4" />
              Neuen Mitarbeiter erstellen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
