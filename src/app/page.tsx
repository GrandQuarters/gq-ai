"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ChatSidebar from "@/components/chat/ChatSidebar"
import ChatHeader from "@/components/chat/ChatHeader"
import MessageBubble from "@/components/chat/MessageBubble"
import MessageInput from "@/components/chat/MessageInput"
import MessageContextMenu from "@/components/chat/MessageContextMenu"
import ToastNotification from "@/components/chat/ToastNotification"
import ImageViewer from "@/components/chat/ImageViewer"
import ApartmentDetails from "@/components/chat/ApartmentDetails"
import type { Conversation, Message, ContextMenuPosition, ToastNotification as ToastType } from "@/types/chat"
import { mockConversations, mockMessages, generateId } from "@/data/mockData"
import { apiService } from "@/services/api.service"

export default function AdminChatPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [contextMenu, setContextMenu] = useState<{ position: ContextMenuPosition; message: Message } | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [toasts, setToasts] = useState<ToastType[]>([])
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [isAISuggestionVisible, setIsAISuggestionVisible] = useState(true)
  const [showApartmentDetails, setShowApartmentDetails] = useState(false)
  const [actionRequiredIds, setActionRequiredIds] = useState<string[]>([])
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [currentAISuggestion, setCurrentAISuggestion] = useState<string | null>(null)
  const [rawEmailData, setRawEmailData] = useState<Record<string, any> | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
      } else {
        setAuthReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation, messages])

  // Load conversations from backend on mount
  useEffect(() => {
    if (!authReady) return
    async function loadConversations() {
      try {
        const backendConversations = await apiService.getConversations()
        if (Array.isArray(backendConversations)) {
          setConversations(backendConversations as Conversation[])
        }
        
        const actionIds = await apiService.getActionRequiredIds()
        if (Array.isArray(actionIds)) {
          setActionRequiredIds(actionIds)
        }
        
        console.log('✅ Loaded conversations from backend:', backendConversations.length)
      } catch (error) {
        console.error('❌ Backend unavailable, starting with empty state:', error)
        setConversations([])
        setActionRequiredIds([])
      }
    }

    loadConversations()

    // Set up WebSocket for real-time updates
    const ws = apiService.connectWebSocket((data) => {
      if (data.type === 'new_message') {
        console.log('📨 New message via WebSocket:', data)
        
        // Add or update conversation
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === data.conversation.id)
          
          const updatedConv = {
            id: data.conversation.id,
            name: data.contact?.name || 'Unknown Guest',
            avatar: data.contact?.avatar || '/Logos/Download.png',
            isGroup: false,
            participants: [],
            lastMessage: data.message.content || '',
            lastMessageTime: new Date(data.message.timestamp),
            unreadCount: 1,
            pinned: false,
            online: false,
            readOnly: false,
          }
          
          if (exists) {
            return prev.map((c) =>
              c.id === data.conversation.id ? { ...c, ...updatedConv } : c
            )
          } else {
            return [updatedConv, ...prev]
          }
        })

        // Add message to messages
        setMessages((prev) => {
          const newMessage = {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
            reactions: [],
            attachments: [],
          }
          
          return {
            ...prev,
            [data.conversation.id]: [
              ...(prev[data.conversation.id] || []),
              newMessage,
            ],
          }
        })

        // Set AI suggestion
        if (data.aiSuggestion) {
          setCurrentAISuggestion(data.aiSuggestion)
          setIsAISuggestionVisible(true)
        }

        // Update action required
        if (data.conversation.action_required) {
          setActionRequiredIds((prev) => [...new Set([...prev, data.conversation.id])])
        }
        
        // Auto-scroll to new message
        setTimeout(() => scrollToBottom(), 100)
      }
    })

    return () => {
      apiService.disconnectWebSocket()
    }
  }, [authReady])

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
    )
    setEditingMessage(null)
    setShowMobileChat(true)

    // Load messages from backend and mark as read
    try {
      const backendMessages = await apiService.getMessages(conversation.id)
      setMessages((prev) => ({
        ...prev,
        [conversation.id]: backendMessages as Message[],
      }))
      console.log('✅ Loaded messages:', backendMessages.length)
      await apiService.markConversationRead(conversation.id)

      // Load pending AI suggestion if available
      const pendingSuggestion = await apiService.getPendingAiSuggestion(conversation.id)
      if (pendingSuggestion) {
        setCurrentAISuggestion(pendingSuggestion)
        setIsAISuggestionVisible(true)
      } else {
        setCurrentAISuggestion(null)
        setIsAISuggestionVisible(false)
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      // Send via backend API
      await apiService.sendMessage(selectedConversation.id, content)
      setCurrentAISuggestion(null)
      setIsAISuggestionVisible(false)

      // Optimistically add to UI
      const newMessage: Message = {
        id: generateId(),
        content,
        senderId: "current",
        senderName: "Admin",
        senderAvatar: "/Logos/Download.png",
        timestamp: new Date(),
        isOwn: true,
        reactions: [],
        attachments: [],
      }

      setMessages((prev) => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage],
      }))

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: content, lastMessageTime: new Date() }
            : c
        )
      )

      // Remove from action required list when responding
      setActionRequiredIds((prev) => prev.filter((id) => id !== selectedConversation.id))
      
      // Clear AI suggestion
      setCurrentAISuggestion(null)

      console.log('✅ Message sent via backend')
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      alert('Failed to send message. Check backend connection.')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault()
    setContextMenu({ position: { x: e.clientX, y: e.clientY }, message })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleShowRawEmail = async (messageId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/messages/${messageId}/raw`)
      const data = await res.json()
      if (data.hasRawData === false) {
        setRawEmailData({ noData: true })
      } else {
        setRawEmailData(data)
      }
    } catch {
      setRawEmailData({ error: true })
    }
  }

  const handleAttachImage = (file: File) => {
    if (!selectedConversation) return
    const url = URL.createObjectURL(file)
    
    const newMessage: Message = {
      id: generateId(),
      content: "",
      senderId: "current",
      senderName: "Admin",
      senderAvatar: "/Logos/Download.png",
      timestamp: new Date(),
      isOwn: true,
      reactions: [],
      attachments: [{ id: generateId(), type: "image", url, name: file.name }],
    }

    setMessages((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: "📷 Foto", lastMessageTime: new Date() }
          : c
      )
    )
  }


  const handlePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    )
  }

  const handleMarkUnread = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: c.unreadCount + 1 } : c))
    )
  }

  const handleClearChat = (id: string) => {
    setMessages((prev) => ({ ...prev, [id]: [] }))
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lastMessage: undefined } : c))
    )
  }

  const handleToastClose = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const handleToastReply = (conversationId: string, message: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (!conversation) return

    const newMessage: Message = {
      id: generateId(),
      content: message,
      senderId: "current",
      senderName: "Admin",
      senderAvatar: "/Logos/Download.png",
      timestamp: new Date(),
      isOwn: true,
      reactions: [],
      attachments: [],
    }

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, lastMessageTime: new Date() }
          : c
      )
    )
  }

  const handleToastClick = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      handleSelectConversation(conversation)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const currentMessages = selectedConversation
    ? messages[selectedConversation.id] || []
    : []

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-white relative">

      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`${showMobileChat ? 'hidden md:block' : 'block'} w-full md:w-80`}>
        <ChatSidebar
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          onPin={handlePinConversation}
          onMarkUnread={handleMarkUnread}
          onClearChat={handleClearChat}
          onNewChat={() => {}}
          actionRequiredIds={actionRequiredIds}
        />
      </div>

      {/* Main Chat Area - Full screen on mobile when open */}
      <div className={`${showMobileChat ? 'block' : 'hidden md:flex'} flex-1 flex flex-col relative`}>
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              onInfoClick={() => setShowApartmentDetails(!showApartmentDetails)}
              onBackClick={() => setShowMobileChat(false)}
              onLogout={handleLogout}
              onGenerateAI={async () => {
                try {
                  const suggestion = await apiService.generateAiResponse(selectedConversation.id)
                  if (suggestion) {
                    setCurrentAISuggestion(suggestion)
                    setIsAISuggestionVisible(true)
                  }
                } catch (error) {
                  console.error('❌ Failed to generate AI response:', error)
                }
              }}
            />

            {/* Apartment Details Dropdown */}
            {showApartmentDetails && (
              <ApartmentDetails
                apartmentName="Grand Quarters Deluxe"
                address="Radetzkystraße 14/22, 1030 Wien"
                checkIn={new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)}
                checkOut={new Date(Date.now() + 1000 * 60 * 60 * 24 * 4)}
                pricePerNight={160}
                onClose={() => setShowApartmentDetails(false)}
              />
            )}

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 no-scrollbar"
              style={{ paddingBottom: isAISuggestionVisible ? "140px" : "96px" }}
            >
              {currentMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onContextMenu={handleContextMenu}
                  onImageClick={setViewingImage}
                  onRetryTranslation={(msgId) => apiService.retryTranslation(msgId)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {!selectedConversation.readOnly && (
              <MessageInput
                onSend={handleSendMessage}
                onAttachImage={handleAttachImage}
                aiSuggestion={!actionRequiredIds.includes(selectedConversation.id) ? currentAISuggestion : null}
                actionRequired={actionRequiredIds.includes(selectedConversation.id) ? "Handlung erforderlich - Bitte antworten" : null}
                onAISuggestionVisibilityChange={setIsAISuggestionVisible}
              />
            )}

            {selectedConversation.readOnly && (
              <div className="absolute bottom-4 left-4 right-4 z-50 text-center py-3 bg-gray-100 rounded-full text-gray-500 text-sm">
                Dieser Chat ist schreibgeschützt
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center relative">
              {/* Blurred Ellipse - Extra large */}
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-48 rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(212, 165, 116, 0.3), rgba(139, 102, 53, 0.3))",
                  filter: "blur(40px)",
                  zIndex: 0,
                }}
              />
              
              {/* Icon */}
              <div className="relative z-10 mb-6">
                <svg
                  className="w-24 h-24 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#8B6635" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Willkommen bei GQ-AI
              </h2>
              <p className="text-base text-gray-500">
                Wähle einen Chat aus, um die Konversation zu starten
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          position={contextMenu.position}
          message={contextMenu.message}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
          onShowRawEmail={handleShowRawEmail}
        />
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={() => handleToastClose(toast.id)}
          onReply={handleToastReply}
          onClick={handleToastClick}
        />
      ))}

      {/* Image Viewer */}
      {viewingImage && (
        <ImageViewer
          imageUrl={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}

      {/* Raw Email Modal */}
      {rawEmailData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setRawEmailData(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Original E-Mail Daten</h3>
              <button
                onClick={() => setRawEmailData(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-3 text-sm">
              {rawEmailData.noData ? (
                <p className="text-gray-500 italic">Keine E-Mail-Daten verfügbar (manuell gesendet oder WhatsApp).</p>
              ) : rawEmailData.error ? (
                <p className="text-red-500">Fehler beim Laden der E-Mail-Daten.</p>
              ) : (
                <>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                    {[
                      ['Platform', rawEmailData.platform],
                      ['Von', rawEmailData.from],
                      ['An', rawEmailData.to],
                      ['Reply-To', rawEmailData.replyTo],
                      ['Betreff', rawEmailData.subject],
                      ['Hash', rawEmailData.platformHash],
                      ['Reply Email', rawEmailData.replyToEmail],
                      ['Property', rawEmailData.propertyName],
                      ['Ext. Name', rawEmailData.extractedName],
                      ['Gmail ID', rawEmailData.gmailId],
                      ['Thread ID', rawEmailData.threadId],
                    ].map(([label, value]) => value ? (
                      <React.Fragment key={label}>
                        <span className="text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap pt-0.5">{label}</span>
                        <span className="text-gray-700 break-all font-mono text-xs">{value}</span>
                      </React.Fragment>
                    ) : null)}
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-gray-400 font-medium text-xs uppercase tracking-wide mb-2">E-Mail Body</p>
                    <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 whitespace-pre-wrap break-words max-h-60 overflow-y-auto font-mono border border-gray-100">
                      {rawEmailData.body}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
