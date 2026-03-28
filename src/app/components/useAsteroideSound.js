'use client'

import { useEffect, useRef } from 'react'
import { useScroll, useVelocity } from 'framer-motion'

export function useAsteroidImpactSound(src) {
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)

  const ctxRef = useRef(null)
  const bufferRef = useRef(null)
  const gainRef = useRef(null)
  const filterRef = useRef(null)
  const sourceRef = useRef(null)
  const isPlayingRef = useRef(false)

  // Init Audio Context
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContext()
    ctxRef.current = ctx

    const gain = ctx.createGain()
    gain.gain.value = 0

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600

    filter.connect(gain)
    gain.connect(ctx.destination)

    gainRef.current = gain
    filterRef.current = filter

    fetch(src)
      .then(res => res.arrayBuffer())
      .then(data => ctx.decodeAudioData(data))
      .then(buffer => {
        bufferRef.current = buffer
      })

    const unlock = () => {
      if (ctx.state === 'suspended') ctx.resume()
      window.removeEventListener('click', unlock)
    }

    window.addEventListener('click', unlock)

    return () => ctx.close()
  }, [src])

  // Gestion dynamique du scroll
  useEffect(() => {
    const unsubscribe = velocity.on('change', (v) => {
      if (!ctxRef.current || !bufferRef.current) return

      const speed = Math.abs(v)
      const threshold = 5 // seuil pour considérer qu'on scroll

      if (speed > threshold && !isPlayingRef.current) {
        // START
        const source = ctxRef.current.createBufferSource()
        source.buffer = bufferRef.current
        source.loop = true

        source.connect(filterRef.current)
        source.start()

        sourceRef.current = source
        isPlayingRef.current = true
      }

      if (speed <= threshold && isPlayingRef.current) {
        // STOP avec fade
        const now = ctxRef.current.currentTime

        gainRef.current.gain.cancelScheduledValues(now)
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now)
        gainRef.current.gain.linearRampToValueAtTime(0, now + 0.05)

        setTimeout(() => {
          sourceRef.current?.stop()
          sourceRef.current = null
          isPlayingRef.current = false
        }, 60)
      }

      if (isPlayingRef.current) {
        const normalized = Math.min(speed, 2000) / 2000

        gainRef.current.gain.value = normalized * 0.5
        filterRef.current.frequency.value = 500 + normalized * 3000
        sourceRef.current.playbackRate.value = 0.9 + normalized * 0.4
      }
    })

    return () => unsubscribe()
  }, [velocity])
}