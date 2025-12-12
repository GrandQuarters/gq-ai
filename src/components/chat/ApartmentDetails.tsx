"use client"

import React from "react"
import { X, MapPin, Calendar, Euro } from "lucide-react"

interface ApartmentDetailsProps {
  apartmentName: string
  address: string
  checkIn: Date
  checkOut: Date
  pricePerNight: number
  onClose: () => void
}

export default function ApartmentDetails({
  apartmentName,
  address,
  checkIn,
  checkOut,
  pricePerNight,
  onClose,
}: ApartmentDetailsProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
  }

  const calculateProgress = () => {
    const now = new Date()
    const total = checkOut.getTime() - checkIn.getTime()
    const elapsed = now.getTime() - checkIn.getTime()
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  const calculateNights = () => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const progress = calculateProgress()
  const nights = calculateNights()
  const totalPrice = nights * pricePerNight

  return (
    <div 
      className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Apartment Details</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Apartment Name */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Apartment</p>
          <p className="font-semibold text-gray-900">{apartmentName}</p>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Adresse</p>
            <p className="text-sm text-gray-700">{address}</p>
          </div>
        </div>

        {/* Stay Duration */}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Aufenthalt</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{formatDate(checkIn)}</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-700">{formatDate(checkOut)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Fortschritt</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(135deg, #D4A574, #8B6635)",
              }}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pro Nacht</span>
                <span className="text-sm font-medium text-gray-700">€{pricePerNight}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-gray-900">Gesamtpreis ({nights} Nächte)</span>
            <span 
              className="text-lg font-bold"
              style={{ 
                background: "linear-gradient(135deg, #D4A574, #8B6635)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              €{totalPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}



