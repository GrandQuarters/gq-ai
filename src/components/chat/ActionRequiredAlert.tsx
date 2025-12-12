"use client"

import React from "react"
import { AlertTriangle } from "lucide-react"

interface ActionRequiredAlertProps {
  message: string
}

export default function ActionRequiredAlert({
  message,
}: ActionRequiredAlertProps) {
  return (
    <div 
      className="mb-3 mx-4 rounded-2xl border-2 flex items-center gap-3 px-4 py-3 backdrop-blur-sm transition-all duration-300"
      style={{
        borderColor: "rgba(220, 38, 38, 0.6)",
        backgroundColor: "rgba(254, 226, 226, 0.15)",
      }}
    >
      {/* Alert Icon */}
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(220, 38, 38, 0.2))",
          border: "1.5px solid rgba(220, 38, 38, 0.4)",
        }}
      >
        <AlertTriangle className="h-4 w-4" style={{ color: "#dc2626" }} />
      </div>

      {/* Alert Text */}
      <div className="flex-1 min-w-0">
        <p 
          className="text-sm font-semibold"
          style={{ color: "#991b1b" }}
        >
          Handlung erforderlich
        </p>
        <p 
          className="text-xs mt-0.5"
          style={{ color: "#b91c1c" }}
        >
          {message}
        </p>
      </div>
    </div>
  )
}



