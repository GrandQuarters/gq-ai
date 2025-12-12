"use client"

import React, { useState, useRef, useEffect } from "react"
import { X, RotateCw, Crop, Pen, Eraser, Download } from "lucide-react"

interface ImageViewerProps {
  imageUrl: string
  onClose: () => void
}

type Tool = "none" | "draw" | "erase"

export default function ImageViewer({ imageUrl, onClose }: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [tool, setTool] = useState<Tool>("none")
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushColor, setBrushColor] = useState("#D4A574")
  const [brushSize, setBrushSize] = useState(4)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      drawImage()
    }
  }, [imageUrl])

  useEffect(() => {
    if (imageLoaded) {
      drawImage()
    }
  }, [rotation, scale, imageLoaded])

  const drawImage = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate dimensions
    const maxWidth = window.innerWidth * 0.8
    const maxHeight = window.innerHeight * 0.8

    let width = img.width * scale
    let height = img.height * scale

    if (width > maxWidth) {
      const ratio = maxWidth / width
      width = maxWidth
      height = height * ratio
    }
    if (height > maxHeight) {
      const ratio = maxHeight / height
      height = maxHeight
      width = width * ratio
    }

    canvas.width = rotation % 180 === 0 ? width : height
    canvas.height = rotation % 180 === 0 ? height : width

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(img, -width / 2, -height / 2, width, height)
    ctx.restore()
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "none") return
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.beginPath()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "none") return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineWidth = tool === "erase" ? brushSize * 3 : brushSize
    ctx.lineCap = "round"
    ctx.strokeStyle = tool === "erase" ? "#ffffff" : brushColor
    ctx.globalCompositeOperation = tool === "erase" ? "destination-out" : "source-over"

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "edited-image.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const COLORS = ["#D4A574", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6", "#000000", "#FFFFFF"]

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-full">
        <button
          onClick={handleRotate}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Drehen"
        >
          <RotateCw className="h-5 w-5 text-white" />
        </button>
        <div className="w-px h-6 bg-white/30" />
        <button
          onClick={() => setTool(tool === "draw" ? "none" : "draw")}
          className={`p-2 rounded-full transition-colors ${
            tool === "draw" ? "bg-opacity-100" : "hover:bg-white/20"
          }`}
          style={{ background: tool === "draw" ? "linear-gradient(135deg, #D4A574, #8B6635)" : "transparent" }}
          title="Zeichnen"
        >
          <Pen className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => setTool(tool === "erase" ? "none" : "erase")}
          className={`p-2 rounded-full transition-colors ${
            tool === "erase" ? "bg-opacity-100" : "hover:bg-white/20"
          }`}
          style={{ background: tool === "erase" ? "linear-gradient(135deg, #D4A574, #8B6635)" : "transparent" }}
          title="Radieren"
        >
          <Eraser className="h-5 w-5 text-white" />
        </button>
        <div className="w-px h-6 bg-white/30" />
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Herunterladen"
        >
          <Download className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Color Picker */}
      {tool === "draw" && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-full">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setBrushColor(color)}
              className={`w-6 h-6 rounded-full border-2 ${
                brushColor === color ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="w-px h-6 bg-white/30 mx-1" />
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-opacity-100"
            style={{ accentColor: "#D4A574" }}
          />
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        className={`max-w-[80vw] max-h-[80vh] rounded-lg ${
          tool !== "none" ? "cursor-crosshair" : ""
        }`}
      />
    </div>
  )
}

