import { useEffect, useRef } from 'react'
import './VoiceWave.css'

export default function VoiceWave({ isActive, status }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      timeRef.current += 0.02
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      if (isActive) {
        // Active wave animation
        for (let i = 0; i < 3; i++) {
          const radius = 50 + i * 30 + Math.sin(timeRef.current + i) * 20
          const opacity = 0.3 - i * 0.1
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
        
        // Central pulse
        const pulseRadius = 20 + Math.sin(timeRef.current * 2) * 10
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fill()
      } else {
        // Idle state - subtle breathing effect
        const breathRadius = 15 + Math.sin(timeRef.current * 0.5) * 5
        ctx.beginPath()
        ctx.arc(centerX, centerY, breathRadius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fill()
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  const getStatusText = () => {
    switch (status) {
      case 'initializing': return 'Initializing...'
      case 'securing': return 'Securing connection...'
      case 'connecting': return 'Connecting...'
      case 'requesting_mic': return 'Requesting microphone...'
      case 'mic_denied': return 'Microphone access denied'
      case 'establishing': return 'Establishing connection...'
      case 'active': return 'Listening...'
      case 'ready': return 'Ready'
      case 'error': return 'Connection error'
      default: return 'Ready'
    }
  }

  return (
    <div className="voice-wave-container">
      <canvas ref={canvasRef} className="wave-canvas" />
      {status !== 'active' && status !== 'ready' && (
        <div className="status-overlay">
          <div className="status-text">{getStatusText()}</div>
        </div>
      )}
    </div>
  )
}