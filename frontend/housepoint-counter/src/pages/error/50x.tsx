'use client'

import { useEffect, useState } from 'react'
import { StarryBackground } from '@/components/StarryBackground'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    console.error(error)
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [error])

  useEffect(() => {
    if (countdown === 0) reset()
  }, [countdown, reset])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden relative">
      <StarryBackground />
      <div className="text-center z-10">
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <p className="text-2xl text-yellow-300 mb-8">Space Anomaly Detected!</p>
        <p className="text-lg text-gray-300 mb-8">Our systems have encountered an unexpected cosmic disturbance.</p>
        <p className="text-white mb-4">Automatic system recalibration in: {countdown}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Manual Override
        </button>
      </div>
    </div>
  )
}

