import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export function ExpenseLimitsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Per-Diem Rates by City Tier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tier A1 (Weekday)</Label>
              <Input type="number" defaultValue="1200" />
            </div>
            <div className="space-y-2">
              <Label>Tier A1 (Weekend)</Label>
              <Input type="number" defaultValue="1500" />
            </div>
            <div className="space-y-2">
              <Label>Tier A (Weekday)</Label>
              <Input type="number" defaultValue="1000" />
            </div>
            <div className="space-y-2">
              <Label>Tier A (Weekend)</Label>
              <Input type="number" defaultValue="1200" />
            </div>
          </div>
          <Button><Save className="h-4 w-4 mr-2" />Save Rates</Button>
        </CardContent>
      </Card>
    </div>
  )
}