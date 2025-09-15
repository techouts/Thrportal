import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Briefcase, 
  FileText, 
  Target,
  Plus,
  Edit,
  Star,
  Calendar
} from 'lucide-react';
import { CrmService } from '@/services/crmService';
import { CreateClientForm } from '@/components/crm/forms/CreateClientForm';
import { CreateSpocForm } from '@/components/crm/forms/CreateSpocForm';
import { CreateAccountForm } from '@/components/crm/forms/CreateAccountForm';
import { CreateProjectForm } from '@/components/crm/forms/CreateProjectForm';
import { CreateOpportunityForm } from '@/components/crm/forms/CreateOpportunityForm';
import { CreateDocumentForm } from '@/components/crm/forms/CreateDocumentForm';
import { DataTable } from '@/components/shared/DataTable';
import type { CrmClient, CrmSpoc, CrmAccount, CrmProject, CrmOpportunity, CrmDocument } from '@/types/crm';
import { formatDistanceToNow, format } from 'date-fns';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSpocForm, setShowSpocForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadClientDetails();
    }
  }, [clientId]);

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      const data = await CrmService.getClientById(clientId!);
      setClient(data);
    } catch (error) {
      console.error('Error loading client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!client) {
    return <div className="flex items-center justify-center h-64">Client not found</div>;
  }

  const spocColumns = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name' as keyof CrmSpoc,
      cell: (spoc: CrmSpoc) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{spoc.name}</span>
            {spoc.is_primary && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
          </div>
          <p className="text-sm text-muted-foreground">{spoc.role}</p>
        </div>
      )
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: 'email' as keyof CrmSpoc,
      cell: (spoc: CrmSpoc) => (
        <div className="space-y-1">
          {spoc.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {spoc.email}
            </div>
          )}
          {spoc.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {spoc.phone}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'last_contacted',
      header: 'Last Contact',
      accessor: 'last_contacted_at' as keyof CrmSpoc,
      cell: (spoc: CrmSpoc) => (
        <span className="text-sm text-muted-foreground">
          {spoc.last_contacted_at 
            ? formatDistanceToNow(new Date(spoc.last_contacted_at), { addSuffix: true })
            : 'Never'
          }
        </span>
      )
    }
  ];

  const accountColumns = [
    {
      id: 'name',
      header: 'Account Name',
      accessor: 'name' as keyof CrmAccount,
      cell: (account: CrmAccount) => (
        <div className="space-y-1">
          <span className="font-medium">{account.name}</span>
          {account.type && (
            <Badge variant="outline" className="text-xs">{account.type}</Badge>
          )}
        </div>
      )
    },
    {
      id: 'primary_spoc',
      header: 'Primary SPOC',
      accessor: 'primary_spoc_id' as keyof CrmAccount,
      cell: (account: CrmAccount) => (
        <span className="text-sm">{account.primary_spoc?.name || 'Not assigned'}</span>
      )
    },
    {
      id: 'sla_override',
      header: 'SLA Override',
      accessor: 'sla_override' as keyof CrmAccount,
      cell: (account: CrmAccount) => (
        <span className="text-sm">{account.sla_override || 'Inherits from client'}</span>
      )
    }
  ];

  const projectColumns = [
    {
      id: 'name',
      header: 'Project Name',
      accessor: 'name' as keyof CrmProject,
      cell: (project: CrmProject) => (
        <div className="space-y-1">
          <span className="font-medium">{project.name}</span>
          <Badge variant="outline">{project.status}</Badge>
        </div>
      )
    },
    {
      id: 'targets',
      header: 'Targets',
      accessor: 'ft_target' as keyof CrmProject,
      cell: (project: CrmProject) => (
        <div className="flex gap-2">
          <Badge variant="secondary">{project.ft_target} FT</Badge>
          <Badge variant="outline">{project.contract_target} Contract</Badge>
        </div>
      )
    },
    {
      id: 'dates',
      header: 'Timeline',
      accessor: 'start_date' as keyof CrmProject,
      cell: (project: CrmProject) => (
        <div className="text-sm">
          {project.start_date && project.end_date ? 
            `${format(new Date(project.start_date), 'MMM dd')} - ${format(new Date(project.end_date), 'MMM dd, yyyy')}` :
            'Dates not set'
          }
        </div>
      )
    }
  ];

  const opportunityColumns = [
    {
      id: 'counts',
      header: 'Opportunity',
      accessor: 'ft_count' as keyof CrmOpportunity,
      cell: (opportunity: CrmOpportunity) => (
        <div className="flex gap-2">
          <Badge variant="secondary">{opportunity.ft_count} FT</Badge>
          <Badge variant="outline">{opportunity.contract_count} Contract</Badge>
          <Badge variant="outline">{opportunity.jd_count} JDs</Badge>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof CrmOpportunity,
      cell: (opportunity: CrmOpportunity) => (
        <Badge variant={opportunity.status === 'Open' ? 'default' : 'secondary'}>
          {opportunity.status}
        </Badge>
      )
    },
    {
      id: 'notes',
      header: 'Notes',
      accessor: 'notes' as keyof CrmOpportunity,
      cell: (opportunity: CrmOpportunity) => (
        <span className="text-sm text-muted-foreground">
          {opportunity.notes || 'No notes'}
        </span>
      )
    }
  ];

  const documentColumns = [
    {
      id: 'name',
      header: 'Document',
      accessor: 'name' as keyof CrmDocument,
      cell: (document: CrmDocument) => (
        <div className="space-y-1">
          <span className="font-medium">{document.name}</span>
          <Badge variant="outline">{document.document_type}</Badge>
        </div>
      )
    },
    {
      id: 'validity',
      header: 'Validity',
      accessor: 'valid_until' as keyof CrmDocument,
      cell: (document: CrmDocument) => (
        <div className="text-sm">
          {document.valid_until ? 
            `Valid until ${format(new Date(document.valid_until), 'MMM dd, yyyy')}` :
            'No expiry set'
          }
        </div>
      )
    },
    {
      id: 'link',
      header: 'Link',
      accessor: 'sharepoint_url' as keyof CrmDocument,
      cell: (document: CrmDocument) => (
        <Button variant="outline" size="sm" asChild>
          <a href={document.sharepoint_url} target="_blank" rel="noopener noreferrer">
            <Globe className="h-3 w-3 mr-1" />
            Open
          </a>
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/CRM/Clients')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clients
        </Button>
        <PageHeader
          title={client.name}
          description={`${client.industry || 'Industry not specified'} • ${client.location || 'Location not specified'}`}
        />
      </div>

      {/* Client Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">{client.name}</span>
                </div>
                <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {client.industry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {client.industry}
                  </div>
                )}
                {client.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {client.location}
                  </div>
                )}
                {client.domain && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {client.domain}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Health Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getHealthScoreColor(client.health_score)}`}>
                    {client.health_score}%
                  </span>
                </div>
                <Progress value={client.health_score} className="w-20 h-2 mt-1" />
              </div>

              <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                  </DialogHeader>
                  <CreateClientForm 
                    mode="edit"
                    initialData={client}
                    onSuccess={() => {
                      setShowEditForm(false);
                      loadClientDetails();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spocs">SPOCs</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Billing Model:</span>
                  <span>{client.billing_model || 'Not specified'}</span>
                  
                  <span className="text-muted-foreground">Contract Type:</span>
                  <span>{client.contract_type || 'Not specified'}</span>
                  
                  <span className="text-muted-foreground">SLA Reference:</span>
                  <span>{client.sla_reference || 'Not specified'}</span>
                  
                  <span className="text-muted-foreground">GST/VAT:</span>
                  <span>{client.gst_vat || 'Not specified'}</span>
                  
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{client.accounts?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Accounts</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{client.spocs?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">SPOCs</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{client.projects?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{client.opportunities?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spocs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Single Points of Contact
                </CardTitle>
                <Dialog open={showSpocForm} onOpenChange={setShowSpocForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add SPOC
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New SPOC</DialogTitle>
                    </DialogHeader>
                    <CreateSpocForm 
                      clientId={client.id}
                      onSuccess={() => {
                        setShowSpocForm(false);
                        loadClientDetails();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={client.spocs || []}
                columns={spocColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Accounts
                </CardTitle>
                <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Account</DialogTitle>
                    </DialogHeader>
                    <CreateAccountForm 
                      clientId={client.id}
                      spocs={client.spocs || []}
                      onSuccess={() => {
                        setShowAccountForm(false);
                        loadClientDetails();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={client.accounts || []}
                columns={accountColumns}
                searchableColumns={['name', 'type']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Projects
                </CardTitle>
                <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Project</DialogTitle>
                    </DialogHeader>
                    <CreateProjectForm 
                      clientId={client.id}
                      accounts={client.accounts || []}
                      spocs={client.spocs || []}
                      onSuccess={() => {
                        setShowProjectForm(false);
                        loadClientDetails();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={client.projects || []}
                columns={projectColumns}
                searchableColumns={['name']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Opportunities
                </CardTitle>
                <Dialog open={showOpportunityForm} onOpenChange={setShowOpportunityForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Opportunity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Opportunity</DialogTitle>
                    </DialogHeader>
                    <CreateOpportunityForm 
                      clientId={client.id}
                      accounts={client.accounts || []}
                      projects={client.projects || []}
                      onSuccess={() => {
                        setShowOpportunityForm(false);
                        loadClientDetails();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={client.opportunities || []}
                columns={opportunityColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Document</DialogTitle>
                    </DialogHeader>
                    <CreateDocumentForm 
                      clientId={client.id}
                      accounts={client.accounts || []}
                      projects={client.projects || []}
                      onSuccess={() => {
                        setShowDocumentForm(false);
                        loadClientDetails();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={client.documents || []}
                columns={documentColumns}
                searchableColumns={['name']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recruiter Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Recruiter assignment functionality will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}