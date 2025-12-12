"use client"

import React from "react"
import { Phone, Video, Info, ArrowLeft } from "lucide-react"
import type { Conversation } from "@/types/chat"

interface ChatHeaderProps {
  conversation: Conversation
  onInfoClick: () => void
  onBackClick?: () => void
}

export default function ChatHeader({
  conversation,
  onInfoClick,
  onBackClick,
}: ChatHeaderProps) {
  const participantText = conversation.online ? "Online" : "Offline"

  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        {/* Back Button - Only visible on mobile */}
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
            title="Zurück"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
            style={
              conversation.avatar?.includes('expedia')
                ? { backgroundColor: '#ffffff' }
                : { backgroundColor: '#d1d5db' }
            }
          >
            {conversation.avatar ? (
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
            ) : (
              <span className="text-white font-medium">
                {conversation.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {conversation.online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: 'linear-gradient(135deg, #D4A574, #8B6635)' }} />
          )}
        </div>

        {/* Name & Status */}
        <div>
          <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
          <p className="text-xs text-gray-500">{participantText}</p>
        </div>
      </div>

      {/* Info Icon */}
      <button
        onClick={onInfoClick}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Info"
      >
        <Info className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  )
}
