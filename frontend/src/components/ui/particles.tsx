'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  baseX: number
  baseY: number
}

export function Particles({ quantity = 50 }: { quantity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Mouse move handler (track on window for better coverage)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Initialize particles
    particlesRef.current = Array.from({ length: quantity }, () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      }
    })

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update base position with drift
        particle.baseX += particle.speedX
        particle.baseY += particle.speedY

        // Wrap around edges
        if (particle.baseX < 0) particle.baseX = canvas.width
        if (particle.baseX > canvas.width) particle.baseX = 0
        if (particle.baseY < 0) particle.baseY = canvas.height
        if (particle.baseY > canvas.height) particle.baseY = 0

        // Mouse interaction
        const dx = mouseRef.current.x - particle.baseX
        const dy = mouseRef.current.y - particle.baseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance

        // Calculate repulsion force
        const maxDistance = mouseRef.current.radius
        const force = (maxDistance - distance) / maxDistance

        if (distance < mouseRef.current.radius) {
          // Repel particles away from mouse
          const repelX = forceDirectionX * force * 20
          const repelY = forceDirectionY * force * 20
          particle.x = particle.baseX - repelX
          particle.y = particle.baseY - repelY
        } else {
          // Smoothly return to base position
          particle.x += (particle.baseX - particle.x) * 0.1
          particle.y += (particle.baseY - particle.y) * 0.1
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${particle.opacity})` // Red color
        ctx.fill()
      })

      // Draw connections
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.1 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [quantity])

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  )
}
