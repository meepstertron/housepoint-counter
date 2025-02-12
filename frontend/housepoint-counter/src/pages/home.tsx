import { useState, useEffect } from 'react'
import BigNumberCard from "@/components/big-number-card"
import LeaderboardCard from '@/components/leaderboard-card'
import { getAllHouses, House as OriginalHouse, getHousePoints, getTopTeachers, getTopStudents, LeaderboardEntry } from '@/lib/api'

type House = OriginalHouse & { points: number }
import useToken from '@/components/useToken'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home_Page() {
    const { token } = useToken();
    const [houses, setHouses] = useState<House[]>([])
    const [topTeachers, setTopTeachers] = useState<LeaderboardEntry[]>([])
    const [topStudents, setTopStudents] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (token) {
                setLoading(true)
                const houses = await getAllHouses(token)
                
                const housesWithPoints = await Promise.all(houses.map(async (house) => {
                    const points = await getHousePoints(house.id, token)
                    return { ...house, points }
                }))
                housesWithPoints.sort((a, b) => b.points - a.points) // Sort houses by points
                const [teachers, students] = await Promise.all([
                    getTopTeachers(token),
                    getTopStudents(token)
                ])
                setHouses(housesWithPoints)
                setTopTeachers(teachers)
                setTopStudents(students)
                setLoading(false)
            }
        }
        fetchData()
    }, [token])

    return (
        <div className="p-4 md:p-8 lg:p-12">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-32 w-full" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 w-full">
                    {houses.map(house => (
                        <BigNumberCard 
                            key={house.id}
                            label={house.name} 
                            value={house.points} 
                            
                        />
                    ))}
                    <div className="lg:col-span-2 xl:col-span-2">
                        <LeaderboardCard 
                            title="Top Teachers"
                            data={topTeachers}
                            valueLabel="Housepoints Given"
                        />
                    </div>
                    <div className="lg:col-span-2 xl:col-span-2">
                        <LeaderboardCard 
                            title="Top Students"
                            data={topStudents}
                            valueLabel="Housepoints Earned"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
