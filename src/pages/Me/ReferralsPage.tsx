import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { KPICard } from '@/components/shared/KPICard'
import { UserPlus, Users, DollarSign, CheckCircle, Clock, Send } from 'lucide-react'

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState('refer')
  const [referralForm, setReferralForm] = useState({
    candidateName: '',
    candidateEmail: '',
    position: '',
    relationship: '',
    notes: ''
  })

  const mockReferrals = [
    {
      id: '1',
      candidateName: 'John Smith',
      position: 'Software Engineer',
      status: 'In Review',
      submittedAt: '2024-01-15',
      bonus: '$2,000'
    },
    {
      id: '2', 
      candidateName: 'Sarah Johnson',
      position: 'Product Manager',
      status: 'Hired',
      submittedAt: '2024-01-10',
      bonus: '$3,000'
    },
    {
      id: '3',
      candidateName: 'Mike Chen',
      position: 'UX Designer',
      status: 'Rejected',
      submittedAt: '2024-01-05',
      bonus: '$0'
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setReferralForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitReferral = () => {
    console.log('Submitting referral:', referralForm)
    // Reset form
    setReferralForm({
      candidateName: '',
      candidateEmail: '',
      position: '',
      relationship: '',
      notes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hired': return 'bg-green-100 text-green-800'
      case 'In Review': return 'bg-blue-100 text-blue-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Referrals"
        description="Refer qualified candidates and track your referral rewards"
        breadcrumbs={[
          { label: 'Me', href: '/Me' },
          { label: 'Referrals', href: '/Me/Referrals' }
        ]}
        icon={UserPlus}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Referrals"
          value="12"
          description="All time"
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="Successful Hires"
          value="4"
          description="33% success rate"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <KPICard
          title="Pending Review"
          value="3"
          description="Active applications"
          icon={<Clock className="h-4 w-4" />}
        />
        <KPICard
          title="Total Earned"
          value="$8,500"
          description="Referral bonuses"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="refer" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Refer Candidate
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Referrals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="refer">
          <Card>
            <CardHeader>
              <CardTitle>Refer a Candidate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name *</Label>
                  <Input
                    id="candidateName"
                    value={referralForm.candidateName}
                    onChange={(e) => handleInputChange('candidateName', e.target.value)}
                    placeholder="Enter candidate's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateEmail">Email Address *</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={referralForm.candidateEmail}
                    onChange={(e) => handleInputChange('candidateEmail', e.target.value)}
                    placeholder="candidate@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={referralForm.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Job title or position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={referralForm.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    placeholder="How do you know this candidate?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={referralForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Tell us why this candidate would be a great fit..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitReferral} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Referral
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>My Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockReferrals}
                columns={[
                  {
                    id: 'candidateName',
                    header: 'Candidate',
                    accessor: 'candidateName'
                  },
                  {
                    id: 'position',
                    header: 'Position',
                    accessor: 'position'
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: 'status',
                    cell: (value) => (
                      <Badge className={getStatusColor(value as string)}>
                        {value}
                      </Badge>
                    )
                  },
                  {
                    id: 'submittedAt',
                    header: 'Submitted',
                    accessor: 'submittedAt'
                  },
                  {
                    id: 'bonus',
                    header: 'Bonus',
                    accessor: 'bonus'
                  }
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}