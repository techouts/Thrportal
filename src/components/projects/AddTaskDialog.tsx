import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { taskService } from '@/services/taskService'
import { toast } from 'sonner'

const addTaskSchema = z.object({
  name: z.string().trim().min(1, 'Task name is required').max(255, 'Task name must be less than 255 characters'),
  estHours: z.coerce.number().min(0, 'Estimated hours must be 0 or greater'),
  actualHours: z.coerce.number().min(0, 'Actual hours must be 0 or greater').optional(),
  billable: z.enum(['yes', 'no'], { required_error: 'Please select billable option' }),
})

type AddTaskFormData = z.infer<typeof addTaskSchema>

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  onSuccess: () => void
}

export function AddTaskDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  onSuccess,
}: AddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      name: '',
      estHours: 0,
      actualHours: 0,
      billable: 'yes',
    },
  })

  const billableValue = watch('billable')

  const onSubmit = async (data: AddTaskFormData) => {
    setIsSubmitting(true)
    try {
      await taskService.createTask({
        projectId,
        name: data.name,
        estHours: data.estHours,
        actualHours: data.actualHours ?? null,
        billable: data.billable === 'yes',
      })
      toast.success('Task created successfully')
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a new task for "{projectName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name *</Label>
            <Input
              id="name"
              placeholder="Enter task name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estHours">Estimated Hours *</Label>
            <Input
              id="estHours"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              {...register('estHours')}
            />
            {errors.estHours && (
              <p className="text-sm text-destructive">{errors.estHours.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualHours">Actual Hours</Label>
            <Input
              id="actualHours"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              {...register('actualHours')}
            />
            {errors.actualHours && (
              <p className="text-sm text-destructive">{errors.actualHours.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Billable *</Label>
            <RadioGroup
              value={billableValue}
              onValueChange={(value) => setValue('billable', value as 'yes' | 'no')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="billable-yes" />
                <Label htmlFor="billable-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="billable-no" />
                <Label htmlFor="billable-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
            {errors.billable && (
              <p className="text-sm text-destructive">{errors.billable.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
