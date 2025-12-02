import { useState, useCallback, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  ExternalLink,
  Users,
  Crown,
  Loader2
} from 'lucide-react'
import { VALIDATION_RULES } from '@/types/profile'
import type { EmployeeProfile, ProfileUpdateData } from '@/types/profile'
import { useAuth } from '@/auth/AuthContext'
import { getCurrentProfile, getProfileById, updateProfile } from '@/services/profileService'

interface ProfileProps {
  isOwnProfile?: boolean
  employeeId?: string
}

export default function Profile({ isOwnProfile = true, employeeId }: ProfileProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ProfileUpdateData>>({})
  const [newInterest, setNewInterest] = useState('')
  const [saving, setSaving] = useState(false)
  const [sameAsTemporary, setSameAsTemporary] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const profileData = employeeId 
          ? await getProfileById(employeeId)
          : await getCurrentProfile(user.id)
        
        setProfile(profileData)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id, employeeId, toast])

  const handleEdit = useCallback((section: string) => {
    if (!profile) return
    setEditingSection(section)
    if (section === 'contacts') {
      setEditData({
        phone: profile.phone || '',
        city: profile.city || '',
        country: profile.country || '',
        personal_email: profile.personal_email || '',
        temporary_address: profile.temporary_address || '',
        permanent_address: profile.permanent_address || '',
        alternate_phone: profile.alternate_phone || ''
      })
    } else if (section === 'about') {
      setEditData({
        about: profile.about || '',
        interests: [...(profile.interests || [])]
      })
    }
  }, [profile])

  const handleSave = useCallback(async (section: string) => {
    if (!user?.id || !profile) return

    try {
      // Validation
      if (section === 'contacts') {
        if (editData.phone && !VALIDATION_RULES.phone.pattern.test(editData.phone)) {
          toast({
            title: "Validation Error",
            description: VALIDATION_RULES.phone.message,
            variant: "destructive"
          })
          return
        }
        if (editData.city && editData.city.length > VALIDATION_RULES.city.maxLength) {
          toast({
            title: "Validation Error", 
            description: VALIDATION_RULES.city.message,
            variant: "destructive"
          })
          return
        }
        if (editData.country && editData.country.length > VALIDATION_RULES.country.maxLength) {
          toast({
            title: "Validation Error",
            description: VALIDATION_RULES.country.message,
            variant: "destructive"
          })
          return
        }
      }

      if (section === 'about') {
        if (editData.about && editData.about.length > VALIDATION_RULES.about.maxLength) {
          toast({
            title: "Validation Error",
            description: VALIDATION_RULES.about.message,
            variant: "destructive"
          })
          return
        }
      }

      setSaving(true)
      const success = await updateProfile(user.id, editData as ProfileUpdateData)
      
      if (success) {
        setProfile(prev => prev ? {
          ...prev,
          ...editData,
          updated_at: new Date().toISOString()
        } : null)
        
        setEditingSection(null)
        setEditData({})
        
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully."
        })
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }, [editData, toast, user?.id, profile])

  const handleCancel = useCallback(() => {
    setEditingSection(null)
    setEditData({})
    setNewInterest('')
    setSameAsTemporary(false)
  }, [])

  const handleAddInterest = useCallback(() => {
    if (!newInterest.trim()) return
    
    if (newInterest.length > VALIDATION_RULES.interest.maxLength) {
      toast({
        title: "Validation Error",
        description: VALIDATION_RULES.interest.message,
        variant: "destructive"
      })
      return
    }

    const currentInterests = editData.interests || profile?.interests || []
    if (currentInterests.includes(newInterest.trim())) {
      toast({
        title: "Duplicate Interest",
        description: "This interest is already added.",
        variant: "destructive"
      })
      return
    }

    setEditData(prev => ({
      ...prev,
      interests: [...currentInterests, newInterest.trim()]
    }))
    setNewInterest('')
  }, [newInterest, editData.interests, profile?.interests, toast])

  const handleRemoveInterest = useCallback((interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: (prev.interests || profile?.interests || []).filter(i => i !== interest)
    }))
  }, [profile?.interests])

  const getDisplayName = (firstName: string, lastName: string) => `${firstName} ${lastName}`.trim() || 'Unknown'
  const getInitials = (firstName: string, lastName: string) => {
    const f = firstName?.[0] || ''
    const l = lastName?.[0] || ''
    return (f + l).toUpperCase() || '?'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="about">About & Hobbies</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.photo_url} alt={getDisplayName(profile.first_name, profile.last_name)} />
                      <AvatarFallback className="text-xl">
                        {getInitials(profile.first_name, profile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{getDisplayName(profile.first_name, profile.last_name)}</h2>
                    <p className="text-lg text-muted-foreground">{profile.role_title}</p>
                    <div className="flex items-center gap-2">
                      {profile.department?.name && <Badge variant="secondary">{profile.department.name}</Badge>}
                      {(profile.city || profile.country) && (
                        <Badge variant="outline">{[profile.city, profile.country].filter(Boolean).join(', ')}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${profile.email}`} className="text-sm hover:underline">
                    {profile.email}
                  </a>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone}`} className="text-sm hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile.business_unit?.name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.business_unit.name}</span>
                  </div>
                )}
                {profile.cost_center?.code && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.cost_center.code}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Tab */}
        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Official employment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                  <p className="font-mono">{profile.employee_code}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <p>{profile.role_title}</p>
                </div>
                {profile.date_of_joining && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Date of Joining</Label>
                    <p>{new Date(profile.date_of_joining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Notice Period</Label>
                  <p>{profile.notice_period || '3 months'}</p>
                </div>
                {profile.band && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Band</Label>
                    <p>{profile.band}</p>
                  </div>
                )}
                {profile.business_unit?.name && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Business Unit</Label>
                    <p>{profile.business_unit.name}</p>
                  </div>
                )}
                {profile.department?.name && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p>{profile.department.name}</p>
                  </div>
                )}
                {profile.cost_center?.code && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Cost Center</Label>
                    <p>{profile.cost_center.code}{profile.cost_center.name ? ` - ${profile.cost_center.name}` : ''}</p>
                  </div>
                )}
                {profile.manager && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Reporting Manager</Label>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profile.manager.photo_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(profile.manager.first_name, profile.manager.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{getDisplayName(profile.manager.first_name, profile.manager.last_name)}</span>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.manager.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Your contact details</CardDescription>
                </div>
                {isOwnProfile && editingSection !== 'contacts' && (
                  <Button onClick={() => handleEdit('contacts')}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingSection === 'contacts' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Read-only)</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={editData.phone || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personal_email">Personal Email</Label>
                    <Input 
                      id="personal_email" 
                      type="email"
                      value={editData.personal_email || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, personal_email: e.target.value }))}
                      placeholder="personal@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternate_phone">Alternate Mobile Number</Label>
                    <Input 
                      id="alternate_phone" 
                      value={editData.alternate_phone || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, alternate_phone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={editData.city || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      value={editData.country || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temporary_address">Temporary Address</Label>
                    <Textarea 
                      id="temporary_address" 
                      value={editData.temporary_address || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, temporary_address: e.target.value }))}
                      placeholder="Enter temporary address"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanent_address">Permanent Address</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox 
                        id="same-address"
                        checked={sameAsTemporary}
                        onCheckedChange={(checked) => {
                          setSameAsTemporary(checked as boolean);
                          if (checked) {
                            setEditData(prev => ({ ...prev, permanent_address: prev.temporary_address || '' }));
                          }
                        }}
                      />
                      <label
                        htmlFor="same-address"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Same as Temporary Address
                      </label>
                    </div>
                    <Textarea 
                      id="permanent_address" 
                      value={editData.permanent_address || ''} 
                      onChange={(e) => {
                        setEditData(prev => ({ ...prev, permanent_address: e.target.value }));
                        setSameAsTemporary(false);
                      }}
                      placeholder="Enter permanent address"
                      rows={2}
                      disabled={sameAsTemporary}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave('contacts')} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p>{profile.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p>{profile.phone || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Personal Email</Label>
                    <p>{profile.personal_email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Alternate Mobile Number</Label>
                    <p>{profile.alternate_phone || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">City</Label>
                    <p>{profile.city || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                    <p>{profile.country || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Temporary Address</Label>
                    <p>{profile.temporary_address || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Permanent Address</Label>
                    <p>{profile.permanent_address || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* About & Hobbies Tab */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>About & Hobbies</CardTitle>
                  <CardDescription>Tell us about yourself and your interests</CardDescription>
                </div>
                {isOwnProfile && editingSection !== 'about' && (
                  <Button onClick={() => handleEdit('about')}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {editingSection === 'about' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="about">About</Label>
                    <Textarea 
                      id="about"
                      value={editData.about || ''} 
                      onChange={(e) => setEditData(prev => ({ ...prev, about: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={VALIDATION_RULES.about.maxLength}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {(editData.about || '').length}/{VALIDATION_RULES.about.maxLength}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                      {(editData.interests || []).map((interest, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {interest}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                            onClick={() => handleRemoveInterest(interest)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest..."
                        maxLength={VALIDATION_RULES.interest.maxLength}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                      />
                      <Button type="button" variant="outline" onClick={handleAddInterest}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave('about')} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">About</Label>
                    <p className="text-sm">{profile.about || 'No information provided yet.'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">{interest}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No interests added yet.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          {profile.manager && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Reporting Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.manager.photo_url} />
                    <AvatarFallback>
                      {getInitials(profile.manager.first_name, profile.manager.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getDisplayName(profile.manager.first_name, profile.manager.last_name)}</p>
                    <p className="text-sm text-muted-foreground">{profile.manager.role_title}</p>
                    <p className="text-sm text-muted-foreground">{profile.manager.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Direct Reports ({profile.reports?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.reports && profile.reports.length > 0 ? (
                <div className="space-y-3">
                  {profile.reports.map((report) => (
                    <div key={report.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={report.photo_url} />
                        <AvatarFallback>
                          {getInitials(report.first_name, report.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{getDisplayName(report.first_name, report.last_name)}</p>
                        <p className="text-sm text-muted-foreground">{report.role_title}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No direct reports</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
