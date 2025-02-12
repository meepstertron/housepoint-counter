import { useState, useEffect } from 'react'
import LeaderboardCard from '@/components/leaderboard-card'
import { getTopTeachers, getTopStudents, LeaderboardEntry } from '@/lib/api'
import useToken from '@/components/useToken'
import { Skeleton } from '@/components/ui/skeleton'

export default function Leaderboards_Page() {
  const { token } = useToken();
  const [topTeachers, setTopTeachers] = useState<LeaderboardEntry[]>([])
  const [topStudents, setTopStudents] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboards() {
      if (token) {
        setLoading(true)
        const [teachers, students] = await Promise.all([
          getTopTeachers(token),
          getTopStudents(token)
        ])
        setTopTeachers(teachers)
        setTopStudents(students)
        setLoading(false)
      }
    }
    fetchLeaderboards()
  }, [token])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboards</h1>
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <LeaderboardCard 
            title="Top Teachers"
            data={topTeachers}
            valueLabel="Housepoints Given"
          />
          <LeaderboardCard 
            title="Top Students"
            data={topStudents}
            valueLabel="Housepoints Earned"
          />
        </div>
      )}
    </div>
  )
}
