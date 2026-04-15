"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, Image, FileText, X, Sparkles, ChevronDown } from "lucide-react"
import AISuggestion from "./AISuggestion"
import ActionRequiredAlert from "./ActionRequiredAlert"
import type { Message } from "@/types/chat"

interface MessageInputProps {
  onSend: (content: string) => void
  onAttachImage: (file: File) => void
  disabled?: boolean
  placeholder?: string
  aiSuggestion?: string | null
  actionRequired?: string | null
  aiSuggestionLoading?: boolean
  onAISuggestionVisibilityChange?: (visible: boolean) => void
  senderFirstName?: string
}

const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😊", "😇", "🙂", "🙃",
  "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓",
  "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟",
  "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢",
  "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵",
  "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙",
  "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "🦾",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💬",
  "🔥", "✨", "🌟", "⭐", "💫", "🌈", "☀️", "🌙",
  "⚡", "☔", "❄️", "🌊", "🎉", "🎊", "🎈", "🎁",
]

export default function MessageInput({
  onSend,
  onAttachImage,
  disabled = false,
  placeholder = "Nachricht eingeben...",
  aiSuggestion = null,
  actionRequired = null,
  aiSuggestionLoading = false,
  onAISuggestionVisibilityChange,
  senderFirstName = "Moe",
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAISuggestion, setShowAISuggestion] = useState(true)
  const [showActionRequired, setShowActionRequired] = useState(true)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_TEXTAREA_HEIGHT = 240

  useEffect(() => {
    if (aiSuggestion) {
      setShowAISuggestion(true)
      onAISuggestionVisibilityChange?.(true)
    }
  }, [aiSuggestion])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)
    el.style.height = newHeight + 'px'
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage("")
      setShowAISuggestion(false)
      setShowActionRequired(false)
      onAISuggestionVisibilityChange?.(false)
    }
  }

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setMessage(aiSuggestion.replace(/\{Name\}/g, senderFirstName))
      setShowAISuggestion(false)
      onAISuggestionVisibilityChange?.(false)
    }
  }

  const handleDismissSuggestion = () => {
    setShowAISuggestion(false)
    onAISuggestionVisibilityChange?.(false)
  }

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAttachImage(file)
    }
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50">
      {/* Action Required Alert */}
      {actionRequired && showActionRequired && (
        <ActionRequiredAlert message={actionRequired} />
      )}

      {/* AI Suggestion */}
      {!actionRequired && showAISuggestion && (aiSuggestion || aiSuggestionLoading) && (
        <div
          style={{
            opacity: aiSuggestion ? 1 : 0.4,
            transition: "opacity 0.3s ease",
            pointerEvents: aiSuggestion ? "auto" : "none",
          }}
        >
          {aiSuggestion ? (
            <AISuggestion
              suggestion={aiSuggestion}
              onAccept={handleAcceptSuggestion}
              onDismiss={handleDismissSuggestion}
            />
          ) : (
            <div
              className="mb-3 mx-4 rounded-2xl border-2 flex items-center gap-3 px-4 py-3 backdrop-blur-sm"
              style={{
                borderColor: "rgba(217, 119, 6, 0.6)",
                backgroundColor: "rgba(254, 243, 199, 0.15)",
              }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))",
                  border: "1.5px solid rgba(217, 119, 6, 0.4)",
                }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "#d97706" }} />
              </div>
              <div className="flex-1 min-w-0" />
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #d97706)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          className="mb-2 p-3 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto no-scrollbar"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="text-2xl hover:scale-125 hover:bg-gray-100 transition-all p-1.5 rounded-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          enterKeyHint="enter"
          className="w-full pl-12 pr-24 py-3 rounded-2xl outline-none text-gray-900 placeholder:text-gray-500 placeholder:text-sm disabled:opacity-50 disabled:cursor-not-allowed no-scrollbar"
          style={{
            boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
            background: "#ffffff",
            opacity: 1,
            resize: "none",
            overflowY: "hidden",
            lineHeight: "1.5",
            scrollbarWidth: "none",
          }}
        />

        {/* Attachment Button */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="hover:scale-110 transition-transform"
          >
            <Paperclip className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800" />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {/* Emoji Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker)
              }}
            >
              <Smile className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-8 w-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </form>

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  )
}
