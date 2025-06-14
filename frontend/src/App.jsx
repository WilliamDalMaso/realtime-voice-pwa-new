import { useState, useRef, useEffect } from 'react'
import VoiceWave from './components/VoiceWave'
import MenuSide from './components/MenuSide'
import './App.css'

export default function App() {
  const audioRef = useRef(null)
  const [status, setStatus] = useState('initializing')
  const [listening, setListening] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const tapTimeoutRef = useRef(null)

  // Auto-start voice interaction on app launch
  useEffect(() => {
    const timer = setTimeout(() => {
      startListening()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Handle double-tap for card flip
  const handleTap = () => {
    setTapCount(prev => prev + 1)
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
    }

    tapTimeoutRef.current = setTimeout(() => {
      if (tapCount + 1 === 2) {
        // Double tap detected
        setIsFlipped(prev => !prev)
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
      setTapCount(0)
    }, 300)
  }

  const startListening = async () => {
    if (listening) return
    
    setListening(true)
    setStatus('securing')

    // 1. fetch ephemeral token
    let data
    try {
      const sessionUrl = import.meta.env.VITE_SESSION_URL || 'http://localhost:8000/session'
      const res = await fetch(sessionUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data = await res.json()
    } catch (err) {
      setStatus('error')
      setListening(false)
      return
    }
    setStatus('connecting')

    // 2. setup WebRTC
    const pc = new RTCPeerConnection()
    const audio = audioRef.current
    audio.autoplay = true
    
    pc.ontrack = (e) => {
      audio.srcObject = e.streams[0]
      audio.onplay = () => setIsAudioPlaying(true)
      audio.onpause = () => setIsAudioPlaying(false)
      audio.onended = () => setIsAudioPlaying(false)
    }

    // 3. ask for mic
    setStatus('requesting_mic')
    let micStream
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      setStatus('mic_denied')
      setListening(false)
      return
    }
    pc.addTrack(micStream.getTracks()[0])

    // 4. data channel for events
    const dc = pc.createDataChannel('oai-events')
    dc.onmessage = (e) => {
      const ev = JSON.parse(e.data)
      if (ev.type === 'response.done') {
        setStatus('ready')
      }
    }

    // 5. SDP offer/answer
    setStatus('establishing')
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    try {
      const sdpRes = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03',
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${data.client_secret.value}`,
            'Content-Type': 'application/sdp',
          },
        }
      )
      const answer = { type: 'answer', sdp: await sdpRes.text() }
      await pc.setRemoteDescription(answer)

      setStatus('active')
    } catch (err) {
      setStatus('error')
      setListening(false)
    }
  }

  return (
    <div className="app-container" onClick={handleTap}>
      <div className={`card ${isFlipped ? 'flipped' : ''}`}>
        {/* Side A - Main Interface */}
        <div className="card-side card-front">
          <VoiceWave 
            isActive={isAudioPlaying} 
            status={status}
          />
          <audio ref={audioRef} />
        </div>
        
        {/* Side B - Menu Interface */}
        <div className="card-side card-back">
          <MenuSide onFlip={() => setIsFlipped(false)} />
        </div>
      </div>
    </div>
  )
}