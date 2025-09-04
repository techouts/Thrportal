import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Headphones, 
  Plus, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Eye,
  Calendar,
  User,
  Tag,
  ThumbsUp,
  BookOpen,
  Phone,
  Mail,
  Video,
  Upload,
  X,
  ExternalLink
} from 'lucide-react'
import { helpdeskService } from '@/services/helpdeskService'
import { 
  TicketCategory, 
  TicketPriority, 
  TicketStatus, 
  ResolutionMode,
  CreateTicketData,
  Ticket,
  FAQ,
  TICKET_SUBCATEGORIES
} from '@/types/helpdesk'
import { useToast } from '@/hooks/use-toast'

const HelpdeskPage = () => {
  const [activeTab, setActiveTab] = useState('new-ticket')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myTickets, setMyTickets] = useState<Ticket[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [searchFAQ, setSearchFAQ] = useState('')
  const { toast } = useToast()

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState<CreateTicketData>({
    category: 'IT',
    sub_category: '',
    priority: 'Medium',
    title: '',
    description: '',
    preferred_resolution_mode: 'Email'
  })
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [attachments, setAttachments] = useState<File[]>([])

  // Filter state for My Tickets
  const [ticketFilters, setTicketFilters] = useState({
    category: '',
    status: '',
    priority: '',
    search: ''
  })

  useEffect(() => {
    loadMyTickets()
    loadFAQs()
  }, [])

  useEffect(() => {
    if (newTicket.category) {
      const subs = TICKET_SUBCATEGORIES[newTicket.category] || []
      setSubCategories(subs)
      setNewTicket(prev => ({ ...prev, sub_category: '' }))
      
      // Auto-suggest priority based on category
      if (subs.length > 0) {
        helpdeskService.suggestPriority(newTicket.category, subs[0]).then(priority => {
          setNewTicket(prev => ({ ...prev, priority }))
        })
      }
    }
  }, [newTicket.category])

  useEffect(() => {
    if (newTicket.sub_category) {
      helpdeskService.suggestPriority(newTicket.category, newTicket.sub_category).then(priority => {
        setNewTicket(prev => ({ ...prev, priority }))
      })
    }
  }, [newTicket.sub_category])

  const loadMyTickets = async () => {
    try {
      const response = await helpdeskService.getMyTickets('current-employee-id')
      if (response.success) {
        setMyTickets(response.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive'
      })
    }
  }

  const loadFAQs = async () => {
    try {
      const response = await helpdeskService.getFAQs()
      if (response.success) {
        setFaqs(response.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive'
      })
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.sub_category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await helpdeskService.createTicket('current-employee-id', newTicket)
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message
        })
        setNewTicket({
          category: 'IT',
          sub_category: '',
          priority: 'Medium',
          title: '',
          description: '',
          preferred_resolution_mode: 'Email'
        })
        setAttachments([])
        loadMyTickets()
        setActiveTab('my-tickets')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })
    
    setAttachments(prev => [...prev, ...validFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'New':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'Assigned':
        return <User className="h-4 w-4 text-yellow-500" />
      case 'In Progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'Pending Info':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'Critical':
        return 'destructive'
      case 'High':
        return 'destructive'
      case 'Medium':
        return 'default'
      case 'Low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getResolutionModeIcon = (mode: ResolutionMode) => {
    switch (mode) {
      case 'Email':
        return <Mail className="h-4 w-4" />
      case 'Call':
        return <Phone className="h-4 w-4" />
      case 'Meeting':
        return <Video className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const filteredTickets = myTickets.filter(ticket => {
    return (
      (!ticketFilters.category || ticket.category === ticketFilters.category) &&
      (!ticketFilters.status || ticket.status === ticketFilters.status) &&
      (!ticketFilters.priority || ticket.priority === ticketFilters.priority) &&
      (!ticketFilters.search || 
        ticket.title.toLowerCase().includes(ticketFilters.search.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(ticketFilters.search.toLowerCase()))
    )
  })

  const filteredFAQs = faqs.filter(faq => 
    !searchFAQ || 
    faq.question.toLowerCase().includes(searchFAQ.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchFAQ.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchFAQ.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help Desk"
        description="Get support for your workplace needs"
        icon={Headphones}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="new-ticket" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Support Ticket</span>
              </CardTitle>
              <CardDescription>
                Fill out the form below to create a new support request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newTicket.category} onValueChange={(value: TicketCategory) => setNewTicket(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Facilities">Facilities</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub-category">Sub-Category *</Label>
                  <Select value={newTicket.sub_category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, sub_category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map(subCat => (
                        <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value: TicketPriority) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution-mode">Preferred Resolution Mode</Label>
                  <Select value={newTicket.preferred_resolution_mode} onValueChange={(value: ResolutionMode) => setNewTicket(prev => ({ ...prev, preferred_resolution_mode: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your issue"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="attachments" className="cursor-pointer flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload files (PDF, Images, Documents - Max 10MB each)
                    </span>
                  </label>
                </div>
                
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your ticket will be automatically assigned to the appropriate department based on the category selected. 
                  You will receive email notifications for all updates.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => {
                  setNewTicket({
                    category: 'IT',
                    sub_category: '',
                    priority: 'Medium',
                    title: '',
                    description: '',
                    preferred_resolution_mode: 'Email'
                  })
                  setAttachments([])
                }}>
                  Reset
                </Button>
                <Button onClick={handleCreateTicket} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Support Tickets</h3>
            <Button onClick={() => setActiveTab('new-ticket')}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={ticketFilters.search}
                      onChange={(e) => setTicketFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={ticketFilters.category} onValueChange={(value) => setTicketFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Facilities">Facilities</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={ticketFilters.status} onValueChange={(value) => setTicketFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending Info">Pending Info</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={ticketFilters.priority} onValueChange={(value) => setTicketFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All priorities</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-semibold">{ticket.title}</h4>
                        <Badge variant="outline">{ticket.ticket_number}</Badge>
                        <Badge variant={getPriorityColor(ticket.priority) as any}>
                          {ticket.priority}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(ticket.status)}
                          <span className="text-sm">{ticket.status}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>{ticket.category} → {ticket.sub_category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getResolutionModeIcon(ticket.preferred_resolution_mode)}
                          <span>{ticket.preferred_resolution_mode}</span>
                        </div>
                        {ticket.assigned_to_name && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Assigned to: {ticket.assigned_to_name}</span>
                          </div>
                        )}
                      </div>

                      {ticket.is_sla_breached && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            SLA breach detected. This ticket requires immediate attention.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Comment
                      </Button>
                      {ticket.status === 'Resolved' && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Close
                        </Button>
                      )}
                    </div>
                  </div>

                  {ticket.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Latest Update:</h5>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{ticket.comments[0].created_by_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{ticket.comments[0].created_by_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(ticket.comments[0].created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{ticket.comments[0].comment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredTickets.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Headphones className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {ticketFilters.search || ticketFilters.category || ticketFilters.status || ticketFilters.priority
                      ? 'No tickets match your current filters'
                      : "You haven't created any support tickets yet"
                    }
                  </p>
                  <Button onClick={() => setActiveTab('new-ticket')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchFAQ}
                  onChange={(e) => setSearchFAQ(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Before creating a new ticket, please check if your question is answered in our FAQ section. 
              This can help you get faster resolution for common issues.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{faq.question}</h4>
                        {faq.is_featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{faq.answer}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Tag className="h-4 w-4" />
                            <span>{faq.category} → {faq.sub_category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{faq.view_count} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{faq.helpful_count} helpful</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Helpful
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      {faq.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredFAQs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchFAQ
                      ? 'No FAQs match your search terms'
                      : 'No FAQs available at the moment'
                    }
                  </p>
                  <Button onClick={() => setActiveTab('new-ticket')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create a Support Ticket
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HelpdeskPage;