"use client"

import React, { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"

interface AISuggestionProps {
  suggestion: string
  onAccept: () => void
  onDismiss: () => void
}

export default function AISuggestion({
  suggestion,
  onAccept,
  onDismiss,
}: AISuggestionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className="mb-3 mx-4 rounded-2xl border-2 flex items-center gap-3 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:shadow-md cursor-pointer group"
      style={{
        borderColor: "rgba(217, 119, 6, 0.6)",
        backgroundColor: "rgba(254, 243, 199, 0.15)",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* AI Icon */}
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))",
          border: "1.5px solid rgba(217, 119, 6, 0.4)",
        }}
      >
        <Sparkles className="h-4 w-4" style={{ color: "#d97706" }} />
      </div>

      {/* Suggestion Text */}
      <div className="flex-1 min-w-0">
        <p 
          className={`text-sm font-medium ${isExpanded ? "" : "truncate"}`}
          style={{ color: "#b45309" }}
        >
          {suggestion}
        </p>
      </div>

      {/* Accept Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onAccept()
        }}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #fbbf24, #d97706)",
          boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)",
        }}
        title="Vorschlag verwenden"
      >
        <ChevronDown className="h-4 w-4 text-white" />
      </button>
    </div>
  )
}

