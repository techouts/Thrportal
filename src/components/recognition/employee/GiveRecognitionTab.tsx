import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Send, Star } from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  name: string
  department: string
  avatar?: string
  role: string
}

interface Category {
  id: string
  name: string
  description: string
  points: number
  color: string
}

export const GiveRecognitionTab = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [searchTerm, setSearchTerm] = useState('')

  const categories: Category[] = [
    { id: 'customer-delight', name: 'Customer Delight', description: 'Going above and beyond for customers', points: 10, color: 'bg-blue-100 text-blue-800' },
    { id: 'innovation', name: 'Innovation Impact', description: 'Creative solutions and new ideas', points: 15, color: 'bg-purple-100 text-purple-800' },
    { id: 'teamwork', name: 'Teamwork & Collaboration', description: 'Supporting colleagues and team goals', points: 10, color: 'bg-green-100 text-green-800' },
    { id: 'leadership', name: 'Ownership & Leadership', description: 'Taking initiative and leading by example', points: 20, color: 'bg-orange-100 text-orange-800' },
    { id: 'quality', name: 'Quality Excellence', description: 'Delivering high-quality work consistently', points: 15, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'rising-star', name: 'Rising Star', description: 'Outstanding growth and potential', points: 20, color: 'bg-yellow-100 text-yellow-800' }
  ]

  const employees: Employee[] = [
    { id: '1', name: 'Sarah Johnson', department: 'Engineering', role: 'Senior Developer', avatar: '/api/placeholder/32/32' },
    { id: '2', name: 'Mike Chen', department: 'Design', role: 'UX Designer', avatar: '/api/placeholder/32/32' },
    { id: '3', name: 'Emily Davis', department: 'Product', role: 'Product Manager', avatar: '/api/placeholder/32/32' },
    { id: '4', name: 'Alex Rodriguez', department: 'Marketing', role: 'Marketing Lead', avatar: '/api/placeholder/32/32' },
    { id: '5', name: 'Lisa Wang', department: 'Engineering', role: 'Tech Lead', avatar: '/api/placeholder/32/32' }
  ]

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCategory = categories.find(cat => cat.id === category)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee || !category || !message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.success(`Recognition sent to ${selectedEmployee.name}!`)
    
    // Reset form
    setSelectedEmployee(null)
    setCategory('')
    setMessage('')
    setVisibility('public')
    setSearchTerm('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Give Recognition
        </CardTitle>
        <CardDescription>
          Recognize your colleagues for their outstanding work and contributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Select Colleague *</Label>
            <div className="space-y-3">
              <Input
                id="employee-search"
                placeholder="Search by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              {searchTerm && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 flex items-center gap-3 ${
                        selectedEmployee?.id === employee.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedEmployee(employee)
                        setSearchTerm('')
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.role} • {employee.department}</div>
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground">No employees found</div>
                  )}
                </div>
              )}
              
              {selectedEmployee && (
                <div className="p-3 border rounded-lg bg-muted/20 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                    <AvatarFallback>{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{selectedEmployee.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedEmployee.role} • {selectedEmployee.department}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Recognition Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <Badge className={cat.color}>{cat.points} pts</Badge>
                      <div>
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-xs text-muted-foreground">{cat.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <div className="text-sm text-muted-foreground">
                This recognition is worth <strong>{selectedCategory.points} points</strong>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Recognition Message *</Label>
            <Textarea
              id="message"
              placeholder="Describe why this person deserves recognition..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <Label>Visibility</Label>
            <RadioGroup value={visibility} onValueChange={setVisibility}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-muted-foreground">Visible to everyone in the organization</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-muted-foreground">Only visible to you, the recipient, and their manager</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Recognition
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}