"use client"

import React, { useState, useEffect } from "react"
import { X, Send } from "lucide-react"
import type { ToastNotification as ToastType } from "@/types/chat"

interface ToastNotificationProps {
  toast: ToastType
  onClose: () => void
  onReply: (conversationId: string, message: string) => void
  onClick: (conversationId: string) => void
}

export default function ToastNotification({
  toast,
  onClose,
  onReply,
  onClick,
}: ToastNotificationProps) {
  const [replyMessage, setReplyMessage] = useState("")
  const [showReplyInput, setShowReplyInput] = useState(false)

  // Auto-dismiss after 5 seconds if not interacting
  useEffect(() => {
    if (!showReplyInput) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showReplyInput, onClose])

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (replyMessage.trim()) {
      onReply(toast.conversationId, replyMessage.trim())
      setReplyMessage("")
      onClose()
    }
  }

  return (
    <div
      className="admin-toast-card fixed top-4 right-4 z-[9999] w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden cursor-pointer"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        backdropFilter: "blur(10px)",
      }}
      onClick={() => {
        if (!showReplyInput) {
          onClick(toast.conversationId)
          onClose()
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          {toast.conversationAvatar ? (
            <img
              src={toast.conversationAvatar}
              alt={toast.conversationName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-medium">
              {toast.conversationName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate" style={{ color: "#D4A574" }}>
            {toast.conversationName}
          </p>
          <p className="text-xs text-gray-500">{toast.senderName}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Message */}
      <div className="p-3">
        <p className="text-sm text-gray-700 line-clamp-2">{toast.message}</p>
      </div>

      {/* Reply Section */}
      {showReplyInput ? (
        <form
          onSubmit={handleReply}
          onClick={(e) => e.stopPropagation()}
          className="p-3 pt-0"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Antworten..."
              autoFocus
              className="flex-1 px-3 py-2 text-sm rounded-full bg-gray-100 outline-none"
            />
            <button
              type="submit"
              disabled={!replyMessage.trim()}
              className="h-8 w-8 rounded-full flex items-center justify-center disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </form>
      ) : (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowReplyInput(true)
            }}
            className="text-sm hover:text-opacity-80 font-medium"
            style={{ color: "#D4A574" }}
          >
            Antworten
          </button>
        </div>
      )}
    </div>
  )
}

