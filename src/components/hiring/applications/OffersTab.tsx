import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Offer {
  id: string;
  applicationId: string;
  candidateName: string;
  jdTitle: string;
  offerRole: string;
  offerCTC: number;
  currency: string;
  approvalStatus: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  candidateResponse: 'Pending' | 'Accepted' | 'Declined' | 'Negotiating';
  doj?: string;
  offerDate: string;
  expiryDate: string;
  approvers: Array<{
    name: string;
    role: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    date?: string;
    comments?: string;
  }>;
  documents: string[];
  notes?: string;
}

export function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    // Mock data
    const mockOffers: Offer[] = [
      {
        id: 'offer-001',
        applicationId: 'app-003',
        candidateName: 'David Wilson',
        jdTitle: 'Full Stack Developer',
        offerRole: 'Senior Full Stack Developer',
        offerCTC: 140000,
        currency: 'USD',
        approvalStatus: 'Approved',
        candidateResponse: 'Pending',
        offerDate: '2024-01-13',
        expiryDate: '2024-01-20',
        approvers: [
          {
            name: 'Sarah Johnson',
            role: 'Hiring Manager',
            status: 'Approved',
            date: '2024-01-13',
            comments: 'Approved. Good fit for the role.'
          },
          {
            name: 'Mike Rodriguez',
            role: 'HR Manager',
            status: 'Approved',
            date: '2024-01-13'
          }
        ],
        documents: ['Offer Letter.pdf', 'Benefits Summary.pdf'],
        notes: 'Candidate has requested flexibility for start date'
      },
      {
        id: 'offer-002',
        applicationId: 'app-004',
        candidateName: 'Sarah Davis',
        jdTitle: 'DevOps Engineer',
        offerRole: 'Senior DevOps Engineer',
        offerCTC: 135000,
        currency: 'USD',
        approvalStatus: 'Pending Approval',
        candidateResponse: 'Pending',
        offerDate: '2024-01-15',
        expiryDate: '2024-01-22',
        approvers: [
          {
            name: 'John Anderson',
            role: 'Technical Lead',
            status: 'Approved',
            date: '2024-01-15',
            comments: 'Technical skills are excellent'
          },
          {
            name: 'Lisa Thompson',
            role: 'HR Director',
            status: 'Pending'
          }
        ],
        documents: ['Draft Offer Letter.pdf'],
        notes: 'Waiting for final HR approval'
      },
      {
        id: 'offer-003',
        applicationId: 'app-005',
        candidateName: 'Michael Brown',
        jdTitle: 'Senior Java Developer',
        offerRole: 'Principal Java Developer',
        offerCTC: 160000,
        currency: 'USD',
        approvalStatus: 'Approved',
        candidateResponse: 'Accepted',
        doj: '2024-02-01',
        offerDate: '2024-01-08',
        expiryDate: '2024-01-15',
        approvers: [
          {
            name: 'Sarah Johnson',
            role: 'Hiring Manager',
            status: 'Approved',
            date: '2024-01-08'
          },
          {
            name: 'Mike Rodriguez',
            role: 'HR Manager',
            status: 'Approved',
            date: '2024-01-08'
          }
        ],
        documents: ['Signed Offer Letter.pdf', 'Background Check Form.pdf', 'Tax Forms.pdf'],
        notes: 'Candidate accepted offer. DOJ confirmed.'
      }
    ];
    
    setOffers(mockOffers);
    setLoading(false);
  };

  const getApprovalStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Pending Approval': return 'default';
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCandidateResponseBadgeVariant = (response: string) => {
    switch (response) {
      case 'Pending': return 'secondary';
      case 'Accepted': return 'default';
      case 'Declined': return 'destructive';
      case 'Negotiating': return 'default';
      default: return 'secondary';
    }
  };

  const getApproverStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offers</h2>
          <p className="text-muted-foreground">Track and manage job offers</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Initiate Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Initiate New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Application</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app-001">John Smith - Senior React Developer</SelectItem>
                    <SelectItem value="app-002">Emily Chen - Python Backend Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Offer Role</label>
                <Input placeholder="Enter offer role title..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">CTC Amount</label>
                  <Input type="number" placeholder="140000" />
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea placeholder="Any additional notes..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Create Offer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {offers.filter(o => o.approvalStatus === 'Pending Approval').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {offers.filter(o => o.candidateResponse === 'Accepted').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg CTC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(offers.reduce((sum, o) => sum + o.offerCTC, 0) / offers.length / 1000)}K
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Application ID</th>
                  <th className="text-left p-3 font-medium">Candidate</th>
                  <th className="text-left p-3 font-medium">JD</th>
                  <th className="text-left p-3 font-medium">Offer Role</th>
                  <th className="text-left p-3 font-medium">CTC</th>
                  <th className="text-left p-3 font-medium">Approval Status</th>
                  <th className="text-left p-3 font-medium">Candidate Response</th>
                  <th className="text-left p-3 font-medium">DOJ</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-mono text-sm">{offer.applicationId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{offer.candidateName}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{offer.jdTitle}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{offer.offerRole}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {offer.currency} {(offer.offerCTC / 1000).toFixed(0)}K
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={getApprovalStatusBadgeVariant(offer.approvalStatus)}>
                        {offer.approvalStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getCandidateResponseBadgeVariant(offer.candidateResponse)}>
                        {offer.candidateResponse}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {offer.doj ? new Date(offer.doj).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <User className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">{offer.candidateName} - {offer.offerRole}</div>
                  <Badge variant={getApprovalStatusBadgeVariant(offer.approvalStatus)}>
                    {offer.approvalStatus}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {offer.approvers.map((approver, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex items-center gap-3">
                        {getApproverStatusIcon(approver.status)}
                        <div>
                          <div className="font-medium text-sm">{approver.name}</div>
                          <div className="text-xs text-muted-foreground">{approver.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{approver.status}</div>
                        {approver.date && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(approver.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {offer.notes && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <strong>Notes:</strong> {offer.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents and Status Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {offers.flatMap(offer => 
                offer.documents.map((doc, index) => (
                  <div key={`${offer.id}-${index}`} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{doc}</div>
                      <div className="text-xs text-muted-foreground">{offer.candidateName}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offers.filter(o => o.approvalStatus === 'Pending Approval').map((offer) => (
                <div key={offer.id} className="p-3 border rounded-lg bg-yellow-50">
                  <div className="font-medium text-sm">{offer.candidateName}</div>
                  <div className="text-xs text-muted-foreground">Pending approval from HR</div>
                  <div className="mt-2">
                    <Button size="sm" variant="outline">
                      Route for Approval
                    </Button>
                  </div>
                </div>
              ))}
              
              {offers.filter(o => o.candidateResponse === 'Pending' && o.approvalStatus === 'Approved').map((offer) => (
                <div key={offer.id} className="p-3 border rounded-lg bg-blue-50">
                  <div className="font-medium text-sm">{offer.candidateName}</div>
                  <div className="text-xs text-muted-foreground">Awaiting candidate response</div>
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}