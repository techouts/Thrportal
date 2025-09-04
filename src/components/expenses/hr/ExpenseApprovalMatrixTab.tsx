import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export function ExpenseApprovalMatrixTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Approval Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>L2 Approval Threshold (₹)</Label>
              <Input type="number" defaultValue="25000" />
            </div>
            <div className="space-y-2">
              <Label>Escalation Hours</Label>
              <Input type="number" defaultValue="168" />
            </div>
          </div>
          <Button><Save className="h-4 w-4 mr-2" />Save Rules</Button>
        </CardContent>
      </Card>
    </div>
  )
}