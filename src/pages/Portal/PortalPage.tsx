import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Calendar, Gift, Heart, MessageSquare, Star, Users, ExternalLink } from 'lucide-react'
import { moduleRegistry } from '@/lib/moduleRegistry'

const sections = [
  { id: 'announcements', name: 'Announcements', icon: MessageSquare },
  { id: 'polls', name: 'Polls', icon: Users },
  { id: 'recognitions', name: 'Recognitions', icon: Star },
  { id: 'celebrations', name: 'Celebrations', icon: Gift },
  { id: 'holidays', name: 'Holidays', icon: Calendar }
]

export default function PortalPage() {
  const [activeSection, setActiveSection] = useState('announcements')

  // Register module spec
  const moduleSpec = moduleRegistry.getModuleSpec('/Portal/Dashboard') || 
    moduleRegistry.registerModuleSpec('/Portal/Dashboard', {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: 'Employee portal with announcements, polls, recognitions, celebrations, and holidays'
    })

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const mockAnnouncements = [
    {
      id: 1,
      title: 'Q4 All-Hands Meeting',
      content: 'Join us for our quarterly all-hands meeting on December 15th at 2 PM PST.',
      author: 'John Smith',
      date: '2024-12-01',
      priority: 'high' as const,
      category: 'Company News'
    },
    {
      id: 2,
      title: 'New Employee Benefits Package',
      content: 'We are excited to announce enhanced benefits including increased health coverage.',
      author: 'HR Team',
      date: '2024-11-28',
      priority: 'medium' as const,
      category: 'Benefits'
    }
  ]

  const mockRecognitions = [
    {
      id: 1,
      recognizer: 'Sarah Johnson',
      recognized: 'Mike Chen',
      message: 'Outstanding work on the Q3 project delivery!',
      type: 'Excellence Award',
      date: '2024-12-01'
    },
    {
      id: 2,
      recognizer: 'Team Lead',
      recognized: 'Anna Davis',
      message: 'Great collaboration and team spirit.',
      type: 'Team Player',
      date: '2024-11-30'
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Portal"
        description="Stay connected with company updates, announcements, and celebrations"
        breadcrumbs={[
          { label: 'Portal', href: '/Portal/Dashboard' }
        ]}
        moduleSpec={moduleSpec}
      />

      {/* Sticky Navigation */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4 py-3">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => scrollToSection(section.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {section.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Announcements Section */}
      <section id="announcements" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Announcements</h2>
          <Badge variant="secondary">{mockAnnouncements.length}</Badge>
        </div>
        
        <div className="grid gap-4">
          {mockAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>by {announcement.author}</span>
                      <span>•</span>
                      <span>{announcement.date}</span>
                      <Badge variant="outline">{announcement.category}</Badge>
                      <Badge 
                        variant={announcement.priority === 'high' ? 'destructive' : 'default'}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Polls Section */}
      <section id="polls" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Polls</h2>
          <Badge variant="secondary">2 Active</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferred Remote Work Days</CardTitle>
            <CardDescription>Help us plan better office schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Monday & Friday</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Tuesday & Thursday</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">35%</span>
                </div>
              </div>
              <Button size="sm" className="mt-3">Vote</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recognitions Section */}
      <section id="recognitions" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Recognitions</h2>
          <Badge variant="secondary">{mockRecognitions.length}</Badge>
        </div>
        
        <div className="grid gap-4">
          {mockRecognitions.map((recognition) => (
            <Card key={recognition.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {recognition.recognized.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{recognition.recognized}</span>
                      <Badge variant="outline">{recognition.type}</Badge>
                    </div>
                    <p className="text-muted-foreground">"{recognition.message}"</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Recognized by {recognition.recognizer}</span>
                      <span>•</span>
                      <span>{recognition.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Celebrations Section */}
      <section id="celebrations" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Celebrations</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Birthdays This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-muted-foreground">December 3rd</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Alice Smith</div>
                    <div className="text-sm text-muted-foreground">December 5th</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Work Anniversaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>MB</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Mike Brown</div>
                    <div className="text-sm text-muted-foreground">5 years - December 1st</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Holidays Section */}
      <section id="holidays" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Upcoming Holidays</h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Christmas Day</div>
                  <div className="text-sm text-muted-foreground">Company Holiday</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">December 25</div>
                  <Badge variant="outline">22 days</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">New Year's Day</div>
                  <div className="text-sm text-muted-foreground">Company Holiday</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">January 1</div>
                  <Badge variant="outline">29 days</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}