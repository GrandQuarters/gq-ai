"use client"

import React from "react"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  onContextMenu: (e: React.MouseEvent, message: Message) => void
  onImageClick?: (url: string) => void
}

export default function MessageBubble({
  message,
  onContextMenu,
  onImageClick,
}: MessageBubbleProps) {
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
        <p className="text-xs font-semibold mb-1" style={{ color: "#D4A574" }}>
          {message.senderName || 'Guest'}
        </p>
        
        {renderAttachments()}

        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
