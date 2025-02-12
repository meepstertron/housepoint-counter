import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type LeaderboardEntry = {
  rank: number
  name: string
  value: number
}

interface LeaderboardCardProps {
  title: string
  data: LeaderboardEntry[]
  valueLabel: string
}

export default function LeaderboardCard({ title, data, valueLabel }: LeaderboardCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-semibold">Rank</th>
                <th className="py-2 px-4 text-left font-semibold">Name</th>
                <th className="py-2 px-4 text-right font-semibold">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.rank} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{entry.rank}</td>
                  <td className="py-2 px-4">{entry.name}</td>
                  <td className="py-2 px-4 text-right">
                    <span className="inline-block bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-semibold">
                      {entry.value}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

