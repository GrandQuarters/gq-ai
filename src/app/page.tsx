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
import ApartmentDetails, { type BookingData } from "@/components/chat/ApartmentDetails"
import AdminPanel from "@/components/chat/AdminPanel"
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
  const [pendingAiIds, setPendingAiIds] = useState<string[]>([])
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [aiSuggestionsByConversation, setAiSuggestionsByConversation] = useState<Record<string, string | null>>({})
  const [aiLoadingByConversation, setAiLoadingByConversation] = useState<Record<string, boolean>>({})
  const [rawEmailData, setRawEmailData] = useState<Record<string, any> | null>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState("")
  const [currentUserName, setCurrentUserName] = useState("")
  const [showPmsSync, setShowPmsSync] = useState(false)
  const [pmsSyncResults, setPmsSyncResults] = useState<any>(null)
  const [pmsSyncing, setPmsSyncing] = useState(false)
  const [trainingCleanResults, setTrainingCleanResults] = useState<any>(null)
  const [trainingCleaning, setTrainingCleaning] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
      } else {
        setAuthReady(true)
        setCurrentUserEmail(session.user?.email || "")
        setCurrentUserName(session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || "Moe")
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login")
      } else {
        setCurrentUserName(session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || "Moe")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation, messages])

  // Shift+J+K shortcut for PMS sync
  useEffect(() => {
    const pressed = new Set<string>()
    const onDown = (e: KeyboardEvent) => {
      pressed.add(e.key.toLowerCase())
      if (e.shiftKey && pressed.has('j') && pressed.has('k')) {
        setShowPmsSync(true)
        setPmsSyncResults(null)
      }
    }
    const onUp = (e: KeyboardEvent) => pressed.delete(e.key.toLowerCase())
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

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

        const aiIds = await apiService.getPendingAiIds()
        setPendingAiIds(aiIds)
        
        console.log('✅ Loaded conversations from backend:', backendConversations.length)
      } catch (error) {
        console.error('❌ Backend unavailable, starting with empty state:', error)
        setConversations([])
        setActionRequiredIds([])
      }
    }

    loadConversations()

    // Poll conversations + pending AI IDs every 15 seconds for silent background refresh
    const pollInterval = setInterval(async () => {
      try {
        const [backendConversations, aiIds] = await Promise.all([
          apiService.getConversations(),
          apiService.getPendingAiIds(),
        ])
        if (Array.isArray(backendConversations)) {
          setConversations(backendConversations as Conversation[])
        }
        setPendingAiIds(aiIds)
      } catch {
        // silently ignore poll errors
      }
    }, 15000)

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

        // Set AI suggestion for the specific conversation only
        if (data.aiSuggestion) {
          setAiSuggestionsByConversation((prev) => ({
            ...prev,
            [data.conversation.id]: data.aiSuggestion,
          }))
          setIsAISuggestionVisible(true)
          setPendingAiIds((prev) => [...new Set([...prev, data.conversation.id])])
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
      clearInterval(pollInterval)
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
      setAiLoadingByConversation((prev) => ({ ...prev, [conversation.id]: true }))
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
        setAiSuggestionsByConversation((prev) => ({
          ...prev,
          [conversation.id]: pendingSuggestion,
        }))
        setIsAISuggestionVisible(true)
        setPendingAiIds((prev) => [...new Set([...prev, conversation.id])])
      } else {
        setAiSuggestionsByConversation((prev) => ({
          ...prev,
          [conversation.id]: null,
        }))
        setIsAISuggestionVisible(false)
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error)
    } finally {
      setAiLoadingByConversation((prev) => ({ ...prev, [conversation.id]: false }))
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      // Send via backend API
      await apiService.sendMessage(selectedConversation.id, content, currentUserName)
      setAiSuggestionsByConversation((prev) => ({
        ...prev,
        [selectedConversation.id]: null,
      }))
      setIsAISuggestionVisible(false)
      setPendingAiIds((prev) => prev.filter((id) => id !== selectedConversation.id))

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
      
      // Clear AI suggestion for current conversation only
      setAiSuggestionsByConversation((prev) => ({
        ...prev,
        [selectedConversation.id]: null,
      }))

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

  const handlePmsSync = async () => {
    setPmsSyncing(true)
    setPmsSyncResults(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/pms/sync-all`, { method: 'POST' })
      const data = await res.json()
      setPmsSyncResults(data)
      if (data.results?.some((r: any) => r.status === 'synced')) {
        const updated = await apiService.getConversations()
        setConversations(updated as Conversation[])
      }
    } catch (err) {
      setPmsSyncResults({ error: String(err) })
    }
    setPmsSyncing(false)
  }

  const handleTrainingCleanup = async () => {
    setTrainingCleaning(true)
    setTrainingCleanResults(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/training/clean-guest-messages`, { method: 'POST' })
      const data = await res.json()
      setTrainingCleanResults(data)
    } catch (err) {
      setTrainingCleanResults({ error: String(err) })
    }
    setTrainingCleaning(false)
  }

  const handleReparse = async (messageId: string) => {
    try {
      const result = await apiService.reparseMessage(messageId)
      if (selectedConversation) {
        setMessages((prev) => ({
          ...prev,
          [selectedConversation.id]: (prev[selectedConversation.id] || []).map((msg) =>
            msg.id === messageId
              ? { ...msg, content: result.content, originalContent: result.originalContent }
              : msg
          ),
        }))
        // Refresh conversations to pick up updated contact name / booking info
        const convData = await apiService.getConversations()
        setConversations(convData)
        const updated = convData.find((c: any) => c.id === selectedConversation.id)
        if (updated) setSelectedConversation(updated)
      }
    } catch (error) {
      console.error('❌ Failed to reparse message:', error)
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
  const selectedAiSuggestion = selectedConversation
    ? aiSuggestionsByConversation[selectedConversation.id] ?? null
    : null
  const selectedAiLoading = selectedConversation
    ? !!aiLoadingByConversation[selectedConversation.id]
    : false

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
      </div>
    )
  }

  return (
    <div className="h-dvh flex bg-white relative overflow-hidden">

      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`${showMobileChat ? 'hidden md:block' : 'block'} w-full md:w-80`}>
        <ChatSidebar
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          onPin={handlePinConversation}
          onMarkUnread={handleMarkUnread}
          onClearChat={handleClearChat}
          onNewChat={() => setShowAdminPanel(true)}
          actionRequiredIds={actionRequiredIds}
          pendingAiIds={pendingAiIds}
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
              isMergedStream={(() => {
                const convMessages = messages[selectedConversation.id] || []
                const guestSenderIds = new Set(convMessages.filter(m => !m.isOwn).map(m => m.senderId))
                return guestSenderIds.size > 1
              })()}
              onGenerateAI={async () => {
                if (!selectedConversation) return
                setAiLoadingByConversation((prev) => ({ ...prev, [selectedConversation.id]: true }))
                try {
                  const suggestion = await apiService.generateAiResponse(selectedConversation.id)
                  if (suggestion) {
                    setAiSuggestionsByConversation((prev) => ({
                      ...prev,
                      [selectedConversation.id]: suggestion,
                    }))
                    setIsAISuggestionVisible(true)
                  } else {
                    setAiSuggestionsByConversation((prev) => ({
                      ...prev,
                      [selectedConversation.id]: null,
                    }))
                  }
                } catch (error) {
                  console.error('❌ Failed to generate AI response:', error)
                } finally {
                  setAiLoadingByConversation((prev) => ({ ...prev, [selectedConversation.id]: false }))
                }
              }}
            />

            {/* Apartment Details Dropdown */}
            {showApartmentDetails && (() => {
              const convMessages = messages[selectedConversation.id] || []
              const bookingData: BookingData = {}
              for (const msg of convMessages) {
                const match = msg.content?.match(/\[BOOKING_INFO\](.*?)\[\/BOOKING_INFO\]/)
                if (match) {
                  try {
                    const parsed = JSON.parse(match[1]) as Record<string, string>
                    Object.entries(parsed).forEach(([k, v]) => {
                      if (v && !(bookingData as any)[k]) {
                        (bookingData as any)[k] = v
                      }
                    })
                  } catch { /* skip malformed */ }
                }
              }

              const conv = selectedConversation as any
              if (conv.propertyName) bookingData.property = conv.propertyName
              if (conv.objectNameInternal) bookingData.objectNameInternal = conv.objectNameInternal
              if (conv.bookingNumber) bookingData.reservation = conv.bookingNumber
              if (conv.checkinDate && conv.checkoutDate) bookingData.dates = `${conv.checkinDate} – ${conv.checkoutDate}`
              if (conv.checkinTime) bookingData.checkinTime = conv.checkinTime
              if (conv.checkoutTime) bookingData.checkoutTime = conv.checkoutTime
              if (conv.keyboxCode) bookingData.keyboxCode = conv.keyboxCode
              if (conv.guestPhone) bookingData.guestPhone = conv.guestPhone
              if (conv.adults) bookingData.adults = conv.adults
              if (conv.children !== null && conv.children !== undefined) bookingData.children = conv.children

              return (
                <ApartmentDetails
                  bookingData={bookingData}
                  conversationName={selectedConversation.name}
                  onClose={() => setShowApartmentDetails(false)}
                />
              )
            })()}

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 no-scrollbar"
            >
              {(() => {
                const firstBookingMsgId = currentMessages.find(m => m.content?.includes('[BOOKING_INFO]'))?.id
                const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
                const getDateLabel = (date: Date | string) => {
                  const d = typeof date === 'string' ? new Date(date) : date
                  const now = new Date()
                  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                  const msgMid = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                  const diff = Math.round((todayMid.getTime() - msgMid.getTime()) / (1000 * 60 * 60 * 24))
                  if (diff === 0) return 'Heute'
                  if (diff === 1) return 'Gestern'
                  return `${dayNames[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
                }
                const getDateKey = (date: Date | string) => {
                  const d = typeof date === 'string' ? new Date(date) : date
                  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
                }

                let lastDateKey = ''
                return currentMessages.map((message) => {
                  const msgDateKey = getDateKey(message.timestamp)
                  const showSeparator = msgDateKey !== lastDateKey
                  lastDateKey = msgDateKey
                  return (
                    <React.Fragment key={message.id}>
                      {showSeparator && (
                        <div className="flex items-center justify-center my-3">
                          <span className="px-3 py-1 rounded-lg text-xs text-gray-500 font-medium"
                            style={{ backgroundColor: "rgba(0,0,0,0.04)", fontSize: "0.7rem" }}>
                            {getDateLabel(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <MessageBubble
                        message={message}
                        onContextMenu={handleContextMenu}
                        onImageClick={setViewingImage}
                        onRetryTranslation={(msgId) => apiService.retryTranslation(msgId)}
                        hideBookingInfo={!!firstBookingMsgId && message.id !== firstBookingMsgId}
                      />
                    </React.Fragment>
                  )
                })
              })()}
              <div style={{ height: "100px" }} />
              <div ref={messagesEndRef} />
              <div style={{ height: "80vh" }} />
            </div>

            {/* Message Input */}
            {!selectedConversation.readOnly && (
              <MessageInput
                onSend={handleSendMessage}
                onAttachImage={handleAttachImage}
                aiSuggestion={!actionRequiredIds.includes(selectedConversation.id) ? selectedAiSuggestion : null}
                aiSuggestionLoading={!actionRequiredIds.includes(selectedConversation.id) ? selectedAiLoading : false}
                actionRequired={actionRequiredIds.includes(selectedConversation.id) ? "Handlung erforderlich - Bitte antworten" : null}
                onAISuggestionVisibilityChange={setIsAISuggestionVisible}
                senderFirstName={currentUserName.split(' ')[0]}
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
          onReparse={handleReparse}
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

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          currentUserEmail={currentUserEmail}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* PMS Sync Modal (Shift+J+K) */}
      {showPmsSync && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center" onClick={() => setShowPmsSync(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">PMS Sync – Booking.com</h3>
              <button onClick={() => setShowPmsSync(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4">
                Queries the my-bookings.cc API for all Booking.com conversations and updates booking details (check-in/out times, keybox, phone, etc.)
              </p>
              <button
                onClick={handlePmsSync}
                disabled={pmsSyncing}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: pmsSyncing ? '#aaa' : 'linear-gradient(135deg, #D4A574, #8B6635)' }}
              >
                {pmsSyncing ? 'Syncing...' : 'Sync All Booking.com Guests'}
              </button>
              <div className="h-px bg-gray-100 my-4" />
              <p className="text-xs text-gray-500 mb-3">
                Clean old AI training guest messages by removing BOOKING_INFO JSON blocks. Rows are never deleted.
              </p>
              <button
                onClick={handleTrainingCleanup}
                disabled={trainingCleaning}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: trainingCleaning ? '#aaa' : 'linear-gradient(135deg, #64748b, #334155)' }}
              >
                {trainingCleaning ? 'Cleaning...' : 'Clean Old AI Training Messages'}
              </button>
              {pmsSyncResults && !pmsSyncResults.error && (
                <div className="mt-4 space-y-1.5 max-h-[40vh] overflow-y-auto">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    {pmsSyncResults.results?.filter((r: any) => r.status === 'synced').length}/{pmsSyncResults.total} synced
                  </p>
                  {pmsSyncResults.results?.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-gray-50">
                      <span className="text-gray-700 truncate mr-2">{r.name}</span>
                      <span className={`flex-shrink-0 ${r.status === 'synced' ? 'text-green-600' : r.status === 'not_found' ? 'text-orange-500' : 'text-gray-400'}`}>
                        {r.status === 'synced' ? `✓ ${r.fields} fields` : r.status === 'not_found' ? 'not in PMS' : 'no booking ID'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {pmsSyncResults?.error && (
                <p className="mt-3 text-xs text-red-500">{pmsSyncResults.error}</p>
              )}
              {trainingCleanResults && !trainingCleanResults.error && (
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded px-2 py-2">
                  cleaned: {trainingCleanResults.updated} / {trainingCleanResults.total}
                  <span className="mx-2">|</span>
                  unchanged: {trainingCleanResults.unchanged}
                  <span className="mx-2">|</span>
                  empty-skip: {trainingCleanResults.empty_after_clean}
                </div>
              )}
              {trainingCleanResults?.error && (
                <p className="mt-3 text-xs text-red-500">{trainingCleanResults.error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
