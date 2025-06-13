// frontend/src/App.jsx
import { useState, useRef } from 'react'

export default function App() {
  const audioRef = useRef(null)
  const [status, setStatus] = useState('Olá! Toque para começar…')
  const [listening, setListening] = useState(false)

  const startListening = async () => {
    setListening(true)
    setStatus('🔒 Obtendo chave segura…')

    // 1. fetch ephemeral token
    let data
    try {
      const res = await fetch('https://wxyz5678.ngrok.io/session')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data = await res.json()
    } catch (err) {
      setStatus(`❌ Erro token: ${err.message}`)
      return
    }
    setStatus('✅ Chave obtida! Conectando…')

    // 2. setup WebRTC
    const pc = new RTCPeerConnection()
    const audio = audioRef.current
    audio.autoplay = true
    pc.ontrack = (e) => (audio.srcObject = e.streams[0])

    // 3. ask for mic
    setStatus('🎙️ Pedindo permissão ao microfone…')
    let micStream
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      setStatus(`❌ Permissão negada`)
      return
    }
    pc.addTrack(micStream.getTracks()[0])

    // 4. data channel for events
    const dc = pc.createDataChannel('oai-events')
    dc.onmessage = (e) => {
      const ev = JSON.parse(e.data)
      if (ev.type === 'response.done') {
        const out = ev.response.output?.[0]?.content?.[0]?.text
        setStatus(out || '🤖 Pronto!')
      }
    }

    // 5. SDP offer/answer
    setStatus('🔗 Iniciando WebRTC…')
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

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

    // 6. finally listening
    setStatus('🎤 Assistente ouvindo…')
  }

  return (
    <main
      onClick={!listening ? startListening : undefined}
      style={{
        background: 'black',
        color: 'white',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        cursor: !listening ? 'pointer' : 'default',
      }}
    >
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
        {status}
      </h1>
      <audio ref={audioRef} />
      {!listening && (
        <button
          onClick={startListening}
          style={{
            background: 'white',
            color: 'black',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '999px',
            fontSize: '1rem',
          }}
        >
          Tap to Talk
        </button>
      )}
    </main>
  )
}