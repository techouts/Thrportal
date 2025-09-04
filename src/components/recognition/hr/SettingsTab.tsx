import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Plus } from 'lucide-react'

export const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Recognition Settings
          </CardTitle>
          <CardDescription>Configure recognition categories, budgets, and approval workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Recognition Categories</Label>
            <div className="mt-2 space-y-2">
              {['Customer Delight', 'Innovation Impact', 'Teamwork & Collaboration'].map((category) => (
                <div key={category} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1">{category}</span>
                  <Input className="w-20" defaultValue="15" />
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
              ))}
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Department Budgets</Label>
            <div className="mt-2 space-y-2">
              {['Engineering', 'Product', 'Marketing'].map((dept) => (
                <div key={dept} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1">{dept}</span>
                  <Input className="w-32" defaultValue="5000" />
                  <span className="text-sm text-muted-foreground">$/month</span>
                </div>
              ))}
            </div>
          </div>

          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}