import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { Plus, Edit, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { expensesService } from '@/services/expensesService'
import { PolicyCategory } from '@/types/expenses'

export function ExpenseCategoriesTab() {
  const [categories, setCategories] = useState<PolicyCategory[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await expensesService.getPolicyCategories()
      setCategories(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { id: 'name', header: 'Category Name', accessor: 'name' as keyof PolicyCategory },
    { id: 'glCode', header: 'GL Code', accessor: 'glCode' as keyof PolicyCategory },
    { id: 'isActive', header: 'Status', accessor: 'isActive' as keyof PolicyCategory,
      cell: (item: PolicyCategory) => item.isActive ? 'Active' : 'Inactive' },
    { id: 'receiptThreshold', header: 'Receipt Threshold', accessor: 'receiptThreshold' as keyof PolicyCategory,
      cell: (item: PolicyCategory) => `₹${item.receiptThreshold}` },
    { id: 'actions', header: 'Actions', accessor: 'id' as keyof PolicyCategory,
      cell: (item: PolicyCategory) => (
        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
      )}
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Categories</CardTitle>
            <Button><Plus className="h-4 w-4 mr-2" />Add Category</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={categories} columns={columns} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}