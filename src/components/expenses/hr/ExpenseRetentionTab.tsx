import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Download, Save } from 'lucide-react'

export function ExpenseRetentionTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Retention Period (Years)</Label>
            <Input type="number" defaultValue="8" />
          </div>
          <Button><Save className="h-4 w-4 mr-2" />Save Settings</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Zoho CSV</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />GST Report</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Reimbursements</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}