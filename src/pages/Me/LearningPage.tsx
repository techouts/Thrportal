import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  BookOpen, 
  Award, 
  Target, 
  Heart, 
  Search, 
  Filter,
  Clock,
  Users,
  Star,
  Trophy,
  Flame,
  Download,
  ExternalLink,
  Play,
  CheckCircle
} from 'lucide-react'

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState('courses')

  const myCoursesData = [
    {
      id: '1',
      title: 'React Advanced Patterns',
      instructor: 'John Doe',
      progress: 65,
      status: 'in-progress',
      duration: '35 hours',
      rating: 4.9,
      thumbnail: '/courses/react-advanced.jpg'
    },
    {
      id: '2',
      title: 'Leadership Fundamentals',
      instructor: 'Sarah Johnson',
      progress: 100,
      status: 'completed',
      duration: '25 hours',
      rating: 4.7,
      completedDate: '2024-01-30',
      certificateUrl: '/certificates/leadership.pdf'
    },
    {
      id: '3',
      title: 'TypeScript Mastery',
      instructor: 'Mike Chen',
      progress: 25,
      status: 'in-progress',
      duration: '40 hours',
      rating: 4.8
    }
  ]

  const skillsData = [
    {
      category: 'Technical Skills',
      skills: [
        { name: 'React', current: 'Intermediate', target: 'Advanced', progress: 75, certified: true },
        { name: 'TypeScript', current: 'Beginner', target: 'Intermediate', progress: 40, certified: false },
        { name: 'Node.js', current: 'Intermediate', target: 'Advanced', progress: 60, certified: false },
        { name: 'GraphQL', current: 'Beginner', target: 'Intermediate', progress: 30, certified: false }
      ]
    },
    {
      category: 'Soft Skills',
      skills: [
        { name: 'Leadership', current: 'Intermediate', target: 'Advanced', progress: 85, certified: true },
        { name: 'Communication', current: 'Advanced', target: 'Expert', progress: 90, certified: false },
        { name: 'Project Management', current: 'Beginner', target: 'Intermediate', progress: 20, certified: false }
      ]
    }
  ]

  const certificates = [
    {
      id: '1',
      title: 'React Advanced Patterns',
      issuer: 'TechEd Institute',
      issueDate: '2024-01-30',
      expiryDate: '2026-01-30',
      verified: true,
      credentialId: 'REACT-ADV-2024-001'
    },
    {
      id: '2',
      title: 'Leadership Fundamentals',
      issuer: 'Leadership Academy',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-15',
      verified: true,
      credentialId: 'LEAD-FUND-2024-087'
    }
  ]

  const wishlistData = [
    {
      id: '1',
      title: 'Machine Learning Basics',
      instructor: 'Dr. Emily Watson',
      duration: '45 hours',
      cost: 399,
      priority: 'high',
      addedDate: '2024-02-01',
      justification: 'Required for upcoming AI project'
    },
    {
      id: '2',
      title: 'Public Speaking Mastery',
      instructor: 'James Wilson',
      duration: '20 hours',
      cost: 199,
      priority: 'medium',
      addedDate: '2024-01-28'
    }
  ]

  const gamificationData = {
    currentStreak: 7,
    longestStreak: 15,
    totalPoints: 2450,
    badges: [
      { name: 'Early Bird', icon: '🌅', earned: '2024-01-15' },
      { name: 'Course Crusher', icon: '📚', earned: '2024-01-25' },
      { name: 'Skill Builder', icon: '🛠️', earned: '2024-02-01' }
    ],
    leaderboardPosition: 23
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning & Development"
        description="Enhance your skills and advance your career"
        icon={BookOpen}
      />

      {/* Gamification Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{gamificationData.currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{gamificationData.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-2xl font-bold">{gamificationData.badges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard</p>
                <p className="text-2xl font-bold">#{gamificationData.leaderboardPosition}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="skills">Skill Profile</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Learning Journey</h3>
            <Button>Browse Catalog</Button>
          </div>
          
          <div className="grid gap-4">
            {myCoursesData.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                        {course.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                      {course.status === 'completed' && course.certificateUrl && (
                        <Button size="sm" variant="outline" className="mt-2">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Skills Development</h3>
            <Button variant="outline">Take Skills Assessment</Button>
          </div>

          {skillsData.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.certified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {skill.current} → {skill.target}
                      </div>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {skill.progress}% towards {skill.target} level
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Certificates</h3>
            <Button variant="outline">Upload Certificate</Button>
          </div>

          <div className="grid gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cert.title}</h4>
                        <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span>Issued: {cert.issueDate}</span>
                          <span>Expires: {cert.expiryDate}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Credential ID: {cert.credentialId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {cert.verified && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Wishlist</h3>
            <Button>Browse Catalog</Button>
          </div>

          <div className="grid gap-4">
            {wishlistData.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">by {item.instructor}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span>{item.duration}</span>
                          <span>${item.cost}</span>
                          <span>Added {item.addedDate}</span>
                        </div>
                        {item.justification && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            Reason: {item.justification}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : 
                                item.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {item.priority} priority
                      </Badge>
                      <Button size="sm">Request Approval</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LearningPage