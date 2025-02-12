'use client'

import { useState, useEffect } from 'react'

export function StarryBackground() {
  const [stars, setStars] = useState<{ x: number; y: number; opacity: number; size: number }[]>([])

  useEffect(() => {
    const newStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random(),
      size: Math.random() * 2 + 1
    }))
    setStars(newStars)
  }, [])

  return (
    <>
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${Math.random() * 5 + 3}s infinite`
          }}
        />
      ))}
    </>
  )
}

