import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import { schedulingService } from '@/services/schedulingService'
import { useToast } from '@/hooks/use-toast'

const createSlotSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  project_id: z.string().min(1, 'Project is required'),
  spoc_id: z.string().optional(),
  date: z.date({
    required_error: 'Date is required',
  }),
  from_time: z.string().min(1, 'From time is required'),
  to_time: z.string().min(1, 'To time is required'),
}).refine((data) => {
  if (data.from_time && data.to_time) {
    return data.from_time < data.to_time
  }
  return true
}, {
  message: 'From time must be before to time',
  path: ['to_time'],
})

type CreateSlotForm = z.infer<typeof createSlotSchema>

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  client_id: string
}

interface SPOC {
  id: string
  name: string
  client_id: string
}

interface CreateSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlotCreated: () => void
}

export function CreateSlotDialog({ open, onOpenChange, onSlotCreated }: CreateSlotDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [spocs, setSpocs] = useState<SPOC[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [spocSearch, setSpocSearch] = useState('')
  const { toast } = useToast()

  const form = useForm<CreateSlotForm>({
    resolver: zodResolver(createSlotSchema),
    defaultValues: {
      client_id: '',
      project_id: '',
      spoc_id: '',
      from_time: '',
      to_time: '',
    },
  })

  const selectedClientId = form.watch('client_id')

  useEffect(() => {
    if (open) {
      loadClients()
    }
  }, [open])

  useEffect(() => {
    if (selectedClientId) {
      loadProjects(selectedClientId)
      loadSpocs(selectedClientId)
      form.setValue('project_id', '')
      form.setValue('spoc_id', '')
    }
  }, [selectedClientId])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, name')
        .eq('status', 'Active')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Failed to load clients:', error)
      toast({
        title: 'Error',
        description: 'Failed to load clients',
        variant: 'destructive',
      })
    }
  }

  const loadProjects = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('crm_projects')
        .select('id, name, client_id')
        .eq('client_id', clientId)
        .in('status', ['Planned', 'Active'])
        .order('name')

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      })
    }
  }

  const loadSpocs = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('crm_spocs')
        .select('id, name, client_id')
        .eq('client_id', clientId)
        .order('name')

      if (error) throw error
      setSpocs(data || [])
    } catch (error) {
      console.error('Failed to load SPOCs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load SPOCs',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (data: CreateSlotForm) => {
    setLoading(true)
    try {
      await schedulingService.createSlot({
        client_id: data.client_id,
        project_id: data.project_id,
        date: format(data.date, 'yyyy-MM-dd'),
        from_time: data.from_time,
        to_time: data.to_time,
        mode: 'virtual',
        panel_text: spocs.find(s => s.id === data.spoc_id)?.name || '',
      })

      toast({
        title: 'Success',
        description: 'Interview slot created successfully',
      })

      form.reset()
      onSlotCreated()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create slot:', error)
      toast({
        title: 'Error',
        description: 'Failed to create interview slot',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const filteredSpocs = spocs.filter(spoc =>
    spoc.name.toLowerCase().includes(spocSearch.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Interview Slot</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search clients..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="h-8 w-full border-0 p-0 focus:ring-0"
                        />
                      </div>
                      {filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClientId}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="h-8 w-full border-0 p-0 focus:ring-0"
                        />
                      </div>
                      {filteredProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spoc_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SPOC {spocs.length > 1 ? '*' : '(Optional)'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClientId}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select SPOC" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Search SPOCs..."
                          value={spocSearch}
                          onChange={(e) => setSpocSearch(e.target.value)}
                          className="h-8 w-full border-0 p-0 focus:ring-0"
                        />
                      </div>
                      {filteredSpocs.map((spoc) => (
                        <SelectItem key={spoc.id} value={spoc.id}>
                          {spoc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Time *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Time *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Enter times in 24-hour format (e.g., 14:30 for 2:30 PM)
            </p>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Slot'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}