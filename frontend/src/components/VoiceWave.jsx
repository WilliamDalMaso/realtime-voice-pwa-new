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
      timeRef.current += 0.03
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const width = window.innerWidth
      const height = window.innerHeight
      const padding = 20
      
      if (isActive) {
        // Apple Intelligence-style border wave
        const segments = 200
        const waveHeight = 8
        const speed = timeRef.current * 2
        
        // Create gradient for the wave
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        gradient.addColorStop(0.25, 'rgba(100, 200, 255, 0.8)')
        gradient.addColorStop(0.5, 'rgba(255, 100, 200, 0.8)')
        gradient.addColorStop(0.75, 'rgba(200, 255, 100, 0.8)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Calculate perimeter path
        const perimeter = 2 * (width - 2 * padding) + 2 * (height - 2 * padding)
        
        ctx.beginPath()
        
        for (let i = 0; i <= segments; i++) {
          const progress = i / segments
          const distance = progress * perimeter
          
          let x, y
          
          // Top edge
          if (distance <= width - 2 * padding) {
            x = padding + distance
            y = padding + Math.sin(speed + progress * 8) * waveHeight
          }
          // Right edge
          else if (distance <= width - 2 * padding + height - 2 * padding) {
            x = width - padding + Math.sin(speed + progress * 8) * waveHeight
            y = padding + (distance - (width - 2 * padding))
          }
          // Bottom edge
          else if (distance <= 2 * (width - 2 * padding) + height - 2 * padding) {
            x = width - padding - (distance - (width - 2 * padding + height - 2 * padding))
            y = height - padding + Math.sin(speed + progress * 8) * waveHeight
          }
          // Left edge
          else {
            x = padding + Math.sin(speed + progress * 8) * waveHeight
            y = height - padding - (distance - (2 * (width - 2 * padding) + height - 2 * padding))
          }
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.closePath()
        ctx.stroke()
        
        // Add flowing particles along the border
        for (let i = 0; i < 6; i++) {
          const particleProgress = (timeRef.current * 0.5 + i * 0.3) % 1
          const particleDistance = particleProgress * perimeter
          
          let px, py
          
          if (particleDistance <= width - 2 * padding) {
            px = padding + particleDistance
            py = padding + Math.sin(speed + particleProgress * 8) * waveHeight
          }
          else if (particleDistance <= width - 2 * padding + height - 2 * padding) {
            px = width - padding + Math.sin(speed + particleProgress * 8) * waveHeight
            py = padding + (particleDistance - (width - 2 * padding))
          }
          else if (particleDistance <= 2 * (width - 2 * padding) + height - 2 * padding) {
            px = width - padding - (particleDistance - (width - 2 * padding + height - 2 * padding))
            py = height - padding + Math.sin(speed + particleProgress * 8) * waveHeight
          }
          else {
            px = padding + Math.sin(speed + particleProgress * 8) * waveHeight
            py = height - padding - (particleDistance - (2 * (width - 2 * padding) + height - 2 * padding))
          }
          
          // Draw glowing particle
          const particleGradient = ctx.createRadialGradient(px, py, 0, px, py, 12)
          particleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
          particleGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.6)')
          particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          
          ctx.fillStyle = particleGradient
          ctx.beginPath()
          ctx.arc(px, py, 8, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Central pulse indicator
        const centerX = width / 2
        const centerY = height / 2
        const pulseRadius = 6 + Math.sin(timeRef.current * 3) * 3
        
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius * 2)
        centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        centerGradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.4)')
        centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = centerGradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
        ctx.fill()
        
      } else {
        // Idle state - subtle border glow
        const centerX = width / 2
        const centerY = height / 2
        
        // Subtle breathing border
        const breathIntensity = 0.3 + Math.sin(timeRef.current * 0.8) * 0.2
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${breathIntensity})`
        ctx.lineWidth = 1
        ctx.setLineDash([5, 10])
        ctx.lineDashOffset = -timeRef.current * 20
        
        ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding)
        
        // Central indicator
        const breathRadius = 4 + Math.sin(timeRef.current * 0.5) * 2
        ctx.fillStyle = `rgba(255, 255, 255, ${breathIntensity})`
        ctx.beginPath()
        ctx.arc(centerX, centerY, breathRadius, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.setLineDash([])
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