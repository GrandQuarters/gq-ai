"use client"

import React from "react"
import { X, MapPin, Calendar, Euro, Users, Home, Hash, User } from "lucide-react"

export interface BookingData {
  guest?: string
  property?: string
  dates?: string
  guests?: string
  reservation?: string
  rooms?: string
  source?: string
  payment?: string
}

interface ApartmentDetailsProps {
  bookingData: BookingData
  conversationName?: string
  onClose: () => void
}

function parseBookingDates(datesStr: string): { checkIn: Date | null; checkOut: Date | null } {
  const germanMonths: Record<string, number> = {
    'januar': 0, 'jänner': 0, 'februar': 1, 'märz': 2, 'april': 3,
    'mai': 4, 'juni': 5, 'juli': 6, 'august': 7, 'september': 8,
    'oktober': 9, 'november': 10, 'dezember': 11,
    'jan': 0, 'feb': 1, 'mär': 2, 'apr': 3,
    'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dez': 11,
  }

  const englishMonths: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7, 'september': 8,
    'october': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
    'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
  }

  const allMonths = { ...germanMonths, ...englishMonths }

  function parseSingleDate(str: string): Date | null {
    const cleaned = str.trim().replace(/,/g, '')

    // "26. März 2026" or "26. März 2026 15:00"
    const deMatch = cleaned.match(/(\d{1,2})\.?\s+([A-Za-zÄÖÜäöüß]+)\.?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
    if (deMatch) {
      const day = parseInt(deMatch[1])
      const monthStr = deMatch[2].toLowerCase().replace(/\.$/, '')
      const year = parseInt(deMatch[3])
      const hours = deMatch[4] ? parseInt(deMatch[4]) : 0
      const minutes = deMatch[5] ? parseInt(deMatch[5]) : 0
      const month = allMonths[monthStr]
      if (month !== undefined) {
        return new Date(year, month, day, hours, minutes)
      }
    }

    // "2026-03-26" ISO format
    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2}))?/)
    if (isoMatch) {
      return new Date(
        parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]),
        isoMatch[4] ? parseInt(isoMatch[4]) : 0,
        isoMatch[5] ? parseInt(isoMatch[5]) : 0
      )
    }

    // "26.03.2026" dot format
    const dotMatch = cleaned.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
    if (dotMatch) {
      return new Date(
        parseInt(dotMatch[3]), parseInt(dotMatch[2]) - 1, parseInt(dotMatch[1]),
        dotMatch[4] ? parseInt(dotMatch[4]) : 0,
        dotMatch[5] ? parseInt(dotMatch[5]) : 0
      )
    }

    // "March 26, 2026" English format
    const enMatch = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
    if (enMatch) {
      const month = allMonths[enMatch[1].toLowerCase()]
      if (month !== undefined) {
        return new Date(
          parseInt(enMatch[3]), month, parseInt(enMatch[2]),
          enMatch[4] ? parseInt(enMatch[4]) : 0,
          enMatch[5] ? parseInt(enMatch[5]) : 0
        )
      }
    }

    return null
  }

  // Split by "–" or "-" (em-dash or regular dash with spaces)
  const parts = datesStr.split(/\s*[–—-]\s*/)
  const checkIn = parts[0] ? parseSingleDate(parts[0]) : null
  const checkOut = parts[1] ? parseSingleDate(parts[1]) : null

  return { checkIn, checkOut }
}

export default function ApartmentDetails({
  bookingData,
  conversationName,
  onClose,
}: ApartmentDetailsProps) {
  const { checkIn, checkOut } = bookingData.dates
    ? parseBookingDates(bookingData.dates)
    : { checkIn: null, checkOut: null }

  const hasData = Object.values(bookingData).some(v => v !== undefined && v !== '')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
  }

  const formatTime = (date: Date) => {
    const h = date.getHours()
    const m = date.getMinutes()
    if (h === 0 && m === 0) return null
    return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  }

  const calculateProgress = () => {
    if (!checkIn || !checkOut) return null
    const now = new Date()
    const total = checkOut.getTime() - checkIn.getTime()
    if (total <= 0) return null
    const elapsed = now.getTime() - checkIn.getTime()
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return null
    const diffTime = checkOut.getTime() - checkIn.getTime()
    if (diffTime <= 0) return null
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const progress = calculateProgress()
  const nights = calculateNights()
  const guestName = bookingData.guest || conversationName || null

  return (
    <div
      className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Buchungsdetails</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {!hasData && (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Keine Buchungsdaten verfügbar
          </p>
        )}

        {/* Guest */}
        <DetailRow icon={<User className="h-4 w-4" />} label="Gast" value={guestName} />

        {/* Property */}
        <DetailRow icon={<Home className="h-4 w-4" />} label="Objekt" value={bookingData.property} />

        {/* Reservation */}
        {bookingData.reservation && (
          <DetailRow icon={<Hash className="h-4 w-4" />} label="Buchungsnr." value={bookingData.reservation} />
        )}

        {/* Stay Duration */}
        {(checkIn || checkOut) ? (
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">Aufenthalt</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                  {checkIn ? (
                    <>
                      <p className="font-medium text-gray-800">{formatDate(checkIn)}</p>
                      {formatTime(checkIn) && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatTime(checkIn)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-300">—</p>
                  )}
                </div>
                <span className="text-gray-300 text-lg">→</span>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                  {checkOut ? (
                    <>
                      <p className="font-medium text-gray-800">{formatDate(checkOut)}</p>
                      {formatTime(checkOut) && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatTime(checkOut)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-300">—</p>
                  )}
                </div>
              </div>
              {nights !== null && (
                <p className="text-xs text-gray-400 mt-2 text-center">{nights} {nights === 1 ? 'Nacht' : 'Nächte'}</p>
              )}
            </div>
          </div>
        ) : (
          <DetailRow icon={<Calendar className="h-4 w-4" />} label="Aufenthalt" value={bookingData.dates || null} />
        )}

        {/* Progress Bar */}
        {progress !== null && (
          <div className="ml-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Fortschritt</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(135deg, #D4A574, #8B6635)",
                }}
              />
            </div>
          </div>
        )}

        {/* Guests */}
        {bookingData.guests && (
          <DetailRow icon={<Users className="h-4 w-4" />} label="Gäste" value={bookingData.guests} />
        )}

        {/* Rooms */}
        {bookingData.rooms && (
          <DetailRow icon={<Home className="h-4 w-4" />} label="Zimmer" value={bookingData.rooms} />
        )}

        {/* Source */}
        {bookingData.source && (
          <DetailRow icon={<MapPin className="h-4 w-4" />} label="Plattform" value={bookingData.source} />
        )}
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {value ? (
          <p className="text-sm text-gray-700">{value}</p>
        ) : (
          <p className="text-sm text-gray-300 italic">—</p>
        )}
      </div>
    </div>
  )
}
