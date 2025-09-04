import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, ExternalLink, Video, FileText, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpResource {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'faq' | 'external'
  url?: string
  content?: string
  tags?: string[]
  duration?: string // for videos
}

interface HelpLinkProps {
  topic: string
  resources?: HelpResource[]
  variant?: 'button' | 'icon' | 'link'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const defaultResources: HelpResource[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    description: 'Learn the basics of using this feature',
    type: 'article',
    content: 'This is a placeholder help article. In a real implementation, this would contain detailed instructions and screenshots.',
    tags: ['basics', 'tutorial']
  },
  {
    id: '2',
    title: 'Video Tutorial',
    description: 'Watch a step-by-step walkthrough',
    type: 'video',
    url: '#',
    duration: '5:30',
    tags: ['video', 'tutorial']
  },
  {
    id: '3',
    title: 'Frequently Asked Questions',
    description: 'Common questions and answers',
    type: 'faq',
    content: 'Q: How do I...?\nA: You can...\n\nQ: What if...?\nA: In that case...',
    tags: ['faq', 'troubleshooting']
  }
]

export function HelpLink({ 
  topic, 
  resources = defaultResources, 
  variant = 'icon',
  size = 'md',
  className 
}: HelpLinkProps) {
  const [open, setOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<HelpResource | null>(null)

  const getResourceIcon = (type: HelpResource['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'faq':
        return <MessageSquare className="h-4 w-4" />
      case 'external':
        return <ExternalLink className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const getResourceTypeColor = (type: HelpResource['type']) => {
    switch (type) {
      case 'video':
        return 'destructive'
      case 'faq':
        return 'secondary'
      case 'external':
        return 'outline'
      default:
        return 'default'
    }
  }

  const renderTrigger = () => {
    const baseClasses = "inline-flex items-center gap-1"
    
    switch (variant) {
      case 'button':
        return (
          <Button variant="outline" size={size === 'md' ? 'default' : size} className={cn(baseClasses, className)}>
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        )
      case 'link':
        return (
          <button className={cn(baseClasses, "text-primary hover:text-primary/80 underline", className)}>
            <HelpCircle className="h-3 w-3" />
            <span className="text-sm">Help</span>
          </button>
        )
      default:
        return (
          <Button variant="ghost" size="icon" className={cn("h-6 w-6", className)}>
            <HelpCircle className="h-4 w-4" />
          </Button>
        )
    }
  }

  const handleResourceClick = (resource: HelpResource) => {
    if (resource.type === 'external' && resource.url) {
      window.open(resource.url, '_blank')
    } else {
      setSelectedResource(resource)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help: {topic}
          </DialogTitle>
          <DialogDescription>
            Find answers and resources to help you with {topic.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        {selectedResource ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getResourceIcon(selectedResource.type)}
                <h3 className="font-medium">{selectedResource.title}</h3>
                <Badge variant={getResourceTypeColor(selectedResource.type)}>
                  {selectedResource.type}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedResource(null)}
              >
                ← Back to resources
              </Button>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {selectedResource.content ? (
                <div className="whitespace-pre-wrap text-sm">
                  {selectedResource.content}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Resource content would be loaded here</p>
                  {selectedResource.url && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.open(selectedResource.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Resource
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">Available Resources</h3>
            <div className="grid gap-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="mt-0.5">
                    {getResourceIcon(resource.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      <Badge variant={getResourceTypeColor(resource.type)} className="text-xs">
                        {resource.type}
                      </Badge>
                      {resource.duration && (
                        <span className="text-xs text-muted-foreground">
                          {resource.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                    {resource.tags && (
                      <div className="flex gap-1">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {resource.type === 'external' && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?{' '}
                <button className="text-primary hover:underline">
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}