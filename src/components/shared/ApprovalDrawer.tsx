import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react'

interface ApprovalItem {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  submittedDate: string
  priority?: 'low' | 'medium' | 'high'
}

interface ApprovalDrawerProps {
  open: boolean
  onClose: () => void
  items: ApprovalItem[]
  onApprove: (ids: string[], comment?: string) => void
  onReject: (ids: string[], comment: string) => void
  title?: string
  description?: string
}

export function ApprovalDrawer({ 
  open, 
  onClose, 
  items, 
  onApprove, 
  onReject,
  title = "Approval Queue",
  description = "Review and approve/reject pending items"
}: ApprovalDrawerProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const pendingItems = items.filter(item => item.status === 'pending')
  const selectedCount = selectedItems.length

  const handleSelectAll = () => {
    if (selectedCount === pendingItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(pendingItems.map(item => item.id))
    }
  }

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleAction = () => {
    if (!action || selectedItems.length === 0) return

    if (action === 'approve') {
      onApprove(selectedItems, comment || undefined)
    } else {
      if (!comment.trim()) {
        alert('Comment is required for rejection')
        return
      }
      onReject(selectedItems, comment)
    }

    // Reset state
    setSelectedItems([])
    setComment('')
    setAction(null)
    onClose()
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {/* Bulk Actions */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCount === pendingItems.length && pendingItems.length > 0}
                onChange={handleSelectAll}
                className="rounded border-input"
              />
              <span className="text-sm text-muted-foreground">
                {selectedCount} of {pendingItems.length} selected
              </span>
            </div>
            
            {selectedCount > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAction('approve')}
                  disabled={action === 'reject'}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAction('reject')}
                  disabled={action === 'approve'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending approvals</p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    className="mt-1 rounded border-input"
                  />
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.priority && (
                        <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {item.submittedBy}</span>
                      <span>•</span>
                      <span>{item.submittedDate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Section */}
          {action && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="comment">
                Comment {action === 'reject' && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  action === 'approve' 
                    ? "Add optional comment..." 
                    : "Please provide reason for rejection..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {action && (
            <Button 
              onClick={handleAction}
              variant={action === 'approve' ? 'default' : 'destructive'}
              disabled={selectedItems.length === 0 || (action === 'reject' && !comment.trim())}
            >
              {action === 'approve' ? 'Approve' : 'Reject'} ({selectedCount})
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}