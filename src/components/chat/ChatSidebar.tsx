"use client"

import React, { useState } from "react"
import { Search, SquarePen, Pin, MessageCircleX, Check } from "lucide-react"
import { cn, formatDate, truncateText } from "@/lib/utils"
import type { Conversation, ContextMenuPosition } from "@/types/chat"

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onPin: (id: string) => void
  onMarkUnread: (id: string) => void
  onClearChat: (id: string) => void
  onNewChat: () => void
  actionRequiredIds?: string[]
}

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  onPin,
  onMarkUnread,
  onClearChat,
  onNewChat,
  actionRequiredIds = [],
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [contextMenu, setContextMenu] = useState<{ position: ContextMenuPosition; conversationId: string } | null>(null)

  const filteredConversations = conversations.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortByTime = (a: Conversation, b: Conversation) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
    return timeB - timeA
  }

  const pinnedConversations = filteredConversations.filter((c) => c.pinned).sort(sortByTime)
  const unpinnedConversations = filteredConversations.filter((c) => !c.pinned).sort(sortByTime)

  const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault()
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      conversationId,
    })
  }

  const closeContextMenu = () => setContextMenu(null)

  React.useEffect(() => {
    const handleClick = () => closeContextMenu()
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const renderConversationItem = (conversation: Conversation) => {
    const needsAction = actionRequiredIds.includes(conversation.id)
    
    return (
    <div
      key={conversation.id}
      className={cn(
        "flex items-center p-3 m-2 cursor-pointer rounded-lg transition-colors",
        selectedId === conversation.id ? "bg-gray-200" : "hover:bg-gray-100"
      )}
      onClick={() => onSelect(conversation)}
      onContextMenu={(e) => handleContextMenu(e, conversation.id)}
    >
      <div className="relative">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden relative"
          style={
            needsAction 
              ? { backgroundColor: '#ef4444', boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)' }
              : conversation.avatar?.includes('expedia')
              ? { backgroundColor: '#ffffff', border: 'none' }
              : { backgroundColor: '#d1d5db' }
          }
        >
          {!needsAction && conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.name}
              style={
                conversation.avatar.includes('expedia') 
                  ? { 
                      width: '85%',
                      height: '85%',
                      objectFit: 'contain',
                    }
                  : {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }
              }
            />
          ) : needsAction ? (
            <div 
              className="w-full h-full flex items-center justify-center font-bold text-white text-2xl"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
              }}
            >
              !
            </div>
          ) : (
            <span className="text-white font-medium text-lg">
              {conversation.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {conversation.online && !needsAction && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: 'linear-gradient(135deg, #D4A574, #8B6635)' }} />
        )}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {conversation.pinned && (
              <Pin className="h-3 w-3 text-gray-400 flex-shrink-0" />
            )}
            <p className="text-sm font-medium text-gray-900 truncate">
              {conversation.name}
            </p>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {conversation.lastMessageTime && formatDate(conversation.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <p className="text-sm text-gray-600 truncate flex-1">
            {conversation.lastMessage && truncateText(conversation.lastMessage, 30)}
          </p>
          {conversation.unreadCount > 0 && (
            <span
              className="text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center ml-2"
              style={{ background: "linear-gradient(135deg, #D4A574, #8B6635)" }}
            >
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
  }

  return (
    <div 
      className="w-full md:w-80 h-full bg-white flex flex-col relative z-10" 
      style={{ 
        backgroundColor: '#FFFFFF',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SquarePen className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-900 placeholder:text-gray-500 outline-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {pinnedConversations.map(renderConversationItem)}
        {unpinnedConversations.map(renderConversationItem)}

        {filteredConversations.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            Keine Chats gefunden
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-100"
          style={{
            left: contextMenu.position.x,
            top: contextMenu.position.y,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
            minWidth: "160px",
          }}
        >
          <button
            onClick={() => {
              onPin(contextMenu.conversationId)
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rounded-t-lg"
          >
            <Pin className="h-4 w-4" />
            <span>
              {conversations.find((c) => c.id === contextMenu.conversationId)?.pinned
                ? "Lösen"
                : "Anheften"}
            </span>
          </button>
          <hr className="border-gray-100 opacity-50" />
          <button
            onClick={() => {
              onMarkUnread(contextMenu.conversationId)
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Als ungelesen markieren</span>
          </button>
          <hr className="border-gray-100 opacity-50" />
          <button
            onClick={() => {
              onClearChat(contextMenu.conversationId)
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-b-lg"
          >
            <MessageCircleX className="h-4 w-4" />
            <span>Chat leeren</span>
          </button>
        </div>
      )}
    </div>
  )
}

