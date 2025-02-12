import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BigNumberCardProps {
  label: string
  value: number
  description?: string
}

export default function BigNumberCard({ label, value, description }: BigNumberCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-6xl font-bold tracking-tighter">{value.toLocaleString()}</div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

