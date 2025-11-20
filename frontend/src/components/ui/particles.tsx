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
  targetOpacity: number
  age: number
}

export function Particles({ quantity = 50 }: { quantity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0, radius: 75 })

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
      const targetOpacity = Math.random() * 0.3 + 0.2
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 5 + 2.5, // 2.5-7.5px (2.5x bigger)
        speedX: (Math.random() - 0.5) * 0.05, // Even slower horizontal drift
        speedY: -(Math.random() * 0.05 + 0.03), // Even slower upward movement
        opacity: 0, // Start invisible for fade-in
        targetOpacity,
        age: 0,
      }
    })

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Increment age for fade-in effect
        particle.age += 1

        // Gradual fade-in over first 60 frames (~1 second at 60fps)
        if (particle.age < 60) {
          particle.opacity = (particle.age / 60) * particle.targetOpacity
        } else {
          particle.opacity = particle.targetOpacity
        }

        // Update base position with drift
        particle.baseX += particle.speedX
        particle.baseY += particle.speedY

        // Wrap around edges - update both base and actual positions to prevent "flying"
        if (particle.baseX < 0) {
          particle.baseX = canvas.width
          particle.x = canvas.width
        }
        if (particle.baseX > canvas.width) {
          particle.baseX = 0
          particle.x = 0
        }
        if (particle.baseY < 0) {
          // Respawn at bottom with random x position and reset for fade-in
          particle.baseY = canvas.height
          particle.baseX = Math.random() * canvas.width
          particle.x = particle.baseX
          particle.y = particle.baseY
          particle.age = 0
          particle.opacity = 0
          particle.targetOpacity = Math.random() * 0.3 + 0.2
        }
        if (particle.baseY > canvas.height) {
          particle.baseY = 0
          particle.y = 0
        }

        // Mouse interaction
        const dx = mouseRef.current.x - particle.baseX
        const dy = mouseRef.current.y - particle.baseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance

        // Calculate repulsion force and glow
        const maxDistance = mouseRef.current.radius
        const force = (maxDistance - distance) / maxDistance

        let glowIntensity = 0

        if (distance < mouseRef.current.radius) {
          // Very gentle repel particles away from mouse
          const repelX = forceDirectionX * force * 5
          const repelY = forceDirectionY * force * 5
          particle.x = particle.baseX - repelX
          particle.y = particle.baseY - repelY

          // Calculate subtle glow intensity based on proximity
          glowIntensity = (1 - distance / maxDistance) * 6
        } else {
          // Smoothly return to base position
          particle.x += (particle.baseX - particle.x) * 0.08
          particle.y += (particle.baseY - particle.y) * 0.08
        }

        // Draw particle with glow
        ctx.beginPath()

        // Add glow effect when mouse is near
        if (glowIntensity > 0) {
          ctx.shadowBlur = glowIntensity
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)'
        } else {
          ctx.shadowBlur = 0
        }

        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${particle.opacity})` // Red color
        ctx.fill()

        // Reset shadow for next particle
        ctx.shadowBlur = 0
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
