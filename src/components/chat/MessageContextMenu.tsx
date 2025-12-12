"use client"

import React from "react"
import { Copy } from "lucide-react"
import type { ContextMenuPosition, Message } from "@/types/chat"

interface MessageContextMenuProps {
  position: ContextMenuPosition
  message: Message
  onClose: () => void
  onCopy: (content: string) => void
}

export default function MessageContextMenu({
  position,
  message,
  onClose,
  onCopy,
}: MessageContextMenuProps) {
  React.useEffect(() => {
    const handleClick = () => onClose()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 180),
    y: Math.min(position.y, window.innerHeight - 100),
  }

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-100"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(10px)",
        minWidth: "160px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onCopy(message.content)
          onClose()
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rounded-lg"
      >
        <Copy className="h-4 w-4" />
        <span>Kopieren</span>
      </button>
    </div>
  )
}
