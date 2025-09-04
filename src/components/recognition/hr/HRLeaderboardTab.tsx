import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'

export const HRLeaderboardTab = () => {
  const topEmployees = [
    { rank: 1, name: 'Emily Davis', department: 'Product', points: 385, recognitions: 23 },
    { rank: 2, name: 'Alex Rodriguez', department: 'Marketing', points: 352, recognitions: 21 },
    { rank: 3, name: 'Sarah Johnson', department: 'Engineering', points: 341, recognitions: 19 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Organization Leaderboard
        </CardTitle>
        <CardDescription>Top performers across the entire organization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topEmployees.map((employee) => (
          <Card key={employee.rank}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">#{employee.rank}</div>
                  <Avatar>
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold">{employee.points}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    {employee.recognitions}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}