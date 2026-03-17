"use client"

import React, { useState } from "react"
import { FileText, Languages, Calendar, Users, Home, Hash, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/chat"

function hasNonLatinChars(text: string): boolean {
  const alpha = text.match(/\p{L}/gu) || []
  if (alpha.length === 0) return false
  const latin = alpha.filter((ch) => /[\p{Script=Latin}]/u.test(ch))
  return 1 - latin.length / alpha.length > 0.3
}

interface MessageBubbleProps {
  message: Message
  onContextMenu: (e: React.MouseEvent, message: Message) => void
  onImageClick?: (url: string) => void
  onRetryTranslation?: (messageId: string) => Promise<{ content: string; originalContent: string | null }>
}

export default function MessageBubble({
  message,
  onContextMenu,
  onImageClick,
  onRetryTranslation,
}: MessageBubbleProps) {
  const [showAlternate, setShowAlternate] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [localContent, setLocalContent] = useState<string | null>(null)
  const [localOriginal, setLocalOriginal] = useState<string | null | undefined>(undefined)

  const content = localContent ?? message.content
  const originalContent = localOriginal !== undefined ? localOriginal : (message.originalContent ?? null)

  const hasTranslation = !!originalContent
  const needsTranslation = !message.isOwn && !hasTranslation && hasNonLatinChars(content)

  const defaultContent = content
  const alternateContent = originalContent

  const displayContent = showAlternate && alternateContent
    ? alternateContent
    : defaultContent

  const handleRetryTranslation = async () => {
    if (!onRetryTranslation || translating) return
    setTranslating(true)
    try {
      const result = await onRetryTranslation(message.id)
      setLocalContent(result.content)
      setLocalOriginal(result.originalContent)
    } catch {
      // leave as-is on failure
    } finally {
      setTranslating(false)
    }
  }

  // Parse booking info from message content
  const bookingMatch = displayContent?.match(/\[BOOKING_INFO\](.*?)\[\/BOOKING_INFO\]\n?([\s\S]*)/)
  const bookingDetails = bookingMatch ? (() => {
    try { return JSON.parse(bookingMatch[1]) as Record<string, string> } catch { return null }
  })() : null
  const messageText = bookingMatch ? bookingMatch[2]?.trim() : displayContent

  const bookingFieldLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    property: { label: 'Objekt', icon: <Home className="h-3 w-3" /> },
    unit: { label: 'Einheit', icon: <Hash className="h-3 w-3" /> },
    reservation: { label: 'Reservierung', icon: <Hash className="h-3 w-3" /> },
    dates: { label: 'Zeitraum', icon: <Calendar className="h-3 w-3" /> },
    guests: { label: 'Gäste', icon: <Users className="h-3 w-3" /> },
    rooms: { label: 'Zimmer', icon: <Home className="h-3 w-3" /> },
    source: { label: 'Plattform', icon: <Home className="h-3 w-3" /> },
    payment: { label: 'Zahlung', icon: <CreditCard className="h-3 w-3" /> },
  }

  const formatTimestamp = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  }

  const renderAttachments = () => {
    if (!message.attachments.length) return null

    return (
      <div className="space-y-2 mb-2 mt-0">
        {message.attachments.map((attachment) => {
          if (attachment.type === "image") {
            return (
              <div
                key={attachment.id}
                className="rounded-lg overflow-hidden cursor-pointer w-full"
                onClick={() => onImageClick?.(attachment.url)}
              >
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-full h-auto object-cover rounded-lg"
                  style={{ maxHeight: "280px" }}
                />
              </div>
            )
          }

          if (attachment.type === "pdf") {
            return (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg",
                  message.isOwn
                    ? "bg-white/20 hover:bg-white/30"
                    : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                <FileText className={cn("h-5 w-5", message.isOwn ? "text-white" : "text-red-500")} />
                <span className={cn("text-sm truncate", message.isOwn ? "text-white" : "text-gray-700")}>
                  {attachment.name}
                </span>
              </a>
            )
          }

          return null
        })}
      </div>
    )
  }

  if (message.isOwn) {
    return (
      <div className="flex justify-end mb-3 animate-slide-from-right">
        <div
          className="relative max-w-xs lg:max-w-md rounded-lg text-white"
          style={{
            background: "linear-gradient(135deg, #D4A574, #8B6635)",
            boxShadow: "0 2px 6px rgba(139, 102, 53, 0.6)",
            padding: "16px",
          }}
          onContextMenu={(e) => onContextMenu(e, message)}
        >
          {renderAttachments()}
          
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            {message.edited && (
              <span className="text-[0.5rem] opacity-70" style={{ color: "rgba(255, 255, 255, 0.9)" }}>bearbeitet</span>
            )}
            <p className="text-right" style={{ fontSize: "0.5775rem", color: "rgba(255, 255, 255, 0.9)" }}>
              {formatTimestamp(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-3 animate-slide-from-left">
      {/* Avatar */}
      <div 
        className="w-8 h-8 rounded-full flex-shrink-0 mr-2 overflow-hidden flex items-center justify-center"
        style={
          message.senderAvatar?.includes('expedia')
            ? { backgroundColor: '#ffffff', border: 'none' }
            : { backgroundColor: '#d1d5db' }
        }
      >
        {message.senderAvatar ? (
          <img
            src={message.senderAvatar}
            alt={message.senderName}
            style={
              message.senderAvatar.includes('expedia') 
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
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
            {message.senderName?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div
        className="relative max-w-xs lg:max-w-md rounded-lg bg-white text-gray-800 border border-gray-200"
        style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.12)", padding: "16px" }}
        onContextMenu={(e) => onContextMenu(e, message)}
      >
        {/* Translation toggle or retry icon */}
        {hasTranslation && (
          <button
            onClick={() => setShowAlternate(!showAlternate)}
            className={cn(
              "absolute top-2 right-2 p-0.5 rounded transition-opacity cursor-pointer",
              showAlternate ? "opacity-60" : "opacity-25 hover:opacity-50"
            )}
            title={showAlternate ? "Übersetzung anzeigen" : "Original anzeigen"}
          >
            <Languages className="h-3.5 w-3.5 text-gray-500" />
          </button>
        )}
        {needsTranslation && (
          <button
            onClick={handleRetryTranslation}
            disabled={translating}
            className="absolute top-2 right-2 p-0.5 rounded opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
            title="Übersetzen"
          >
            {translating
              ? <Loader2 className="h-3.5 w-3.5 text-amber-600 animate-spin" />
              : <Languages className="h-3.5 w-3.5 text-amber-600" />
            }
          </button>
        )}

        <p className="text-xs font-semibold mb-1" style={{ color: "#D4A574" }}>
          {message.senderName || 'Guest'}
        </p>
        
        {renderAttachments()}

        {bookingDetails && (
          <div className="mb-2 rounded-md border border-amber-200 bg-amber-50/60 p-2.5">
            <p className="text-[0.65rem] font-semibold text-amber-800 uppercase tracking-wide mb-1.5">
              Buchungsdetails
            </p>
            <div className="grid gap-1">
              {Object.entries(bookingDetails).map(([key, value]) => {
                const field = bookingFieldLabels[key]
                if (!field) return null
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="text-amber-600 flex-shrink-0">{field.icon}</span>
                    <span className="text-[0.7rem] text-gray-500">{field.label}:</span>
                    <span className="text-[0.7rem] font-medium text-gray-800">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {messageText ? (
          <p className="text-sm whitespace-pre-wrap break-words">{messageText}</p>
        ) : bookingDetails ? (
          <p className="text-xs text-gray-400 italic">Keine Nachricht vom Gast.</p>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
        )}
        <div className="flex items-center justify-start gap-1 mt-1">
          <p className="text-gray-500" style={{ fontSize: "0.5775rem" }}>
            {formatTimestamp(message.timestamp)}
          </p>
          {message.edited && (
            <span className="text-[0.5rem] text-gray-400">bearbeitet</span>
          )}
        </div>
      </div>
    </div>
  )
}
