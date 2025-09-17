import React, { useState } from 'react'
import { Star, Heart, Award, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const categories = [
  { id: 'CUSTOMER_DELIGHT', label: 'Customer Delight', icon: Heart },
  { id: 'INNOVATION_IMPACT', label: 'Innovation', icon: Award },
  { id: 'TEAMWORK_COLLAB', label: 'Teamwork', icon: Users },
  { id: 'QUALITY_EXCELLENCE', label: 'Excellence', icon: Star }
]

export function QuickRecognitionWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    // Handle recognition submission
    console.log({ recipient, category, message })
    setIsOpen(false)
    setRecipient('')
    setCategory('')
    setMessage('')
  }

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4" />
          Quick Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center space-y-2">
          <div className="text-2xl">🎉</div>
          <p className="text-xs text-muted-foreground">
            Recognize someone's great work
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              Give Recognition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Give Recognition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient</label>
                <Input 
                  placeholder="Search employee..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Write your recognition message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={!recipient || !category || !message}
              >
                Send Recognition
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="grid grid-cols-4 gap-1">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <div key={cat.id} className="text-center">
                <Icon className="h-3 w-3 mx-auto text-muted-foreground" />
                <div className="text-xs text-muted-foreground mt-1">
                  {cat.label.split(' ')[0]}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}