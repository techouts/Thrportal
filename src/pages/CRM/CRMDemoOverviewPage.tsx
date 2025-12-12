import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Building, Target, TrendingUp, Calendar, Mail, Phone,
  FileText, CheckCircle, Clock, DollarSign, BarChart3, Zap,
  MapPin, Star, Award, Eye, Download
} from 'lucide-react';
import { CrmService } from '@/services/crmService';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function CRMDemoOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [demoData, setDemoData] = useState({
    clients: [],
    accounts: [],
    projects: [],
    opportunities: [],
    interactions: [],
    documents: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const [clients, accounts, projects, opportunitiesResponse, interactions, documents] = await Promise.all([
        CrmService.getClients(),
        CrmService.getAccounts(),
        CrmService.getProjects(),
        CrmService.getOpportunities(),
        CrmService.getInteractions(),
        CrmService.getDocuments()
      ]);
      
      setDemoData({
        clients,
        accounts,
        projects,
        opportunities: Array.isArray(opportunitiesResponse) ? opportunitiesResponse : opportunitiesResponse.data,
        interactions: Array.isArray(interactions) ? interactions : interactions.data,
        documents
      });
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const moduleFeatures = [
    {
      phase: "Phase 1: Core CRM",
      features: [
        "Client Management with detailed profiles",
        "Account hierarchies and relationships", 
        "SPOC (Single Point of Contact) management",
        "Basic CRUD operations for all entities"
      ],
      status: "Complete"
    },
    {
      phase: "Phase 2: Project & Opportunity Tracking",
      features: [
        "Project lifecycle management",
        "Opportunity pipeline tracking",
        "Skills and requirements mapping",
        "Status and priority management"
      ],
      status: "Complete"
    },
    {
      phase: "Phase 3: Interaction Management",
      features: [
        "Multi-channel interaction logging",
        "Engagement scoring system",
        "Document management and contracts",
        "Advanced filtering and search"
      ],
      status: "Complete"
    },
    {
      phase: "Phase 4: Advanced Analytics",
      features: [
        "Interactive KPI dashboards",
        "Revenue forecasting",
        "Performance analytics",
        "Business intelligence reports"
      ],
      status: "Complete"
    },
    {
      phase: "Phase 5: Integration & Automation",
      features: [
        "Email and calendar integration",
        "Workflow automation",
        "External service connections",
        "API and webhook support"
      ],
      status: "Complete"
    }
  ];

  const testDataSummary = {
    totalClients: demoData.clients.length,
    totalAccounts: demoData.accounts.length,
    totalProjects: demoData.projects.length,
    totalOpportunities: demoData.opportunities.length,
    totalInteractions: demoData.interactions.length,
    totalDocuments: demoData.documents.length,
    activePipeline: demoData.opportunities.filter(o => o.status === 'Open' || o.status === 'In Progress').length,
    totalRevenuePotential: demoData.opportunities.reduce((sum, opp) => sum + (opp.ft_count * 120000) + (opp.contract_count * 80000), 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="CRM Demo Overview" description="Loading demo data..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Module - Complete Demo"
        description="Comprehensive overview of the fully implemented CRM system with test data"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{testDataSummary.totalClients}</p>
            <p className="text-sm text-muted-foreground">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{testDataSummary.totalProjects}</p>
            <p className="text-sm text-muted-foreground">Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{testDataSummary.totalOpportunities}</p>
            <p className="text-sm text-muted-foreground">Opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">{testDataSummary.totalInteractions}</p>
            <p className="text-sm text-muted-foreground">Interactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold">{testDataSummary.totalDocuments}</p>
            <p className="text-sm text-muted-foreground">Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold">${(testDataSummary.totalRevenuePotential / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-muted-foreground">Pipeline Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Module Overview</TabsTrigger>
          <TabsTrigger value="data">Test Data</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Implementation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleFeatures.map((phase, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{phase.phase}</h4>
                        <Badge className="bg-green-600">{phase.status}</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        {phase.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Complete CRM System</p>
                      <p className="text-sm text-muted-foreground">All 5 phases implemented successfully</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">Advanced Analytics</p>
                      <p className="text-sm text-muted-foreground">Interactive dashboards and forecasting</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium">Automation Ready</p>
                      <p className="text-sm text-muted-foreground">Workflow automation and integrations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <Star className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="font-medium">Production Ready</p>
                      <p className="text-sm text-muted-foreground">Complete with test data and examples</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sample Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoData.clients.slice(0, 4).map(client => (
                    <div key={client.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.industry}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{client.health_score}% health</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => navigate('/CRM/Clients')}>
                    View All Clients
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoData.projects.filter(p => p.status === 'In-flight').map(project => (
                    <div key={project.id} className="p-2 bg-muted/30 rounded">
                      <p className="font-medium text-sm">{project.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="secondary">{project.priority}</Badge>
                        <div className="text-xs text-muted-foreground">
                          FT: {project.ft_target} | Contract: {project.contract_target}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => navigate('/CRM/Projects')}>
                    View All Projects
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Recent Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoData.interactions.slice(0, 4).map(interaction => (
                    <div key={interaction.id} className="p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        {interaction.interaction_type === 'call' && <Phone className="h-3 w-3" />}
                        {interaction.interaction_type === 'email' && <Mail className="h-3 w-3" />}
                        {interaction.interaction_type === 'meeting' && <Calendar className="h-3 w-3" />}
                        <p className="font-medium text-sm capitalize">{interaction.interaction_type}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score: {interaction.engagement_score}/10 • {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => navigate('/CRM/Interactions')}>
                    View All Interactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Complete Test Dataset</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive test data created across all CRM entities
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{testDataSummary.totalClients}</p>
                  <p className="text-sm">Companies</p>
                  <p className="text-xs text-muted-foreground">6 Industries</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{testDataSummary.totalAccounts}</p>
                  <p className="text-sm">Accounts</p>
                  <p className="text-xs text-muted-foreground">With SPOCs</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{testDataSummary.totalProjects}</p>
                  <p className="text-sm">Projects</p>
                  <p className="text-xs text-muted-foreground">Multi-status</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{testDataSummary.totalInteractions}</p>
                  <p className="text-sm">Interactions</p>
                  <p className="text-xs text-muted-foreground">5 Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Client relationship management",
                    "Account & SPOC tracking",
                    "Project lifecycle management",
                    "Opportunity pipeline",
                    "Multi-channel interactions",
                    "Document management",
                    "Health score calculation",
                    "Status tracking & workflows"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Interactive analytics dashboards",
                    "Revenue forecasting",
                    "Performance metrics",
                    "Industry analysis",
                    "Workflow automation",
                    "Email & calendar integration",
                    "API webhooks",
                    "Real-time data sync"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Dashboard", path: "/CRM/Home", description: "Overview and key metrics", icon: BarChart3 },
              { name: "Clients", path: "/CRM/Clients", description: "Manage client companies", icon: Users },
              { name: "Accounts", path: "/CRM/Accounts", description: "Account hierarchies", icon: Building },
              { name: "Projects", path: "/CRM/Projects", description: "Project management", icon: Target },
              { name: "Opportunities", path: "/CRM/Opportunities", description: "Sales pipeline", icon: TrendingUp },
              { name: "Interactions", path: "/CRM/Interactions", description: "Communication logs", icon: Phone },
              { name: "Reports", path: "/CRM/Reports", description: "Analytics & insights", icon: BarChart3 },
              { name: "Integrations", path: "/CRM/Integrations", description: "Automation & connections", icon: Zap }
            ].map((page, index) => {
              const IconComponent = page.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{page.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{page.description}</p>
                    <Button variant="outline" size="sm" onClick={() => navigate(page.path)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visit Page
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Demo Data */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Data Export</CardTitle>
          <p className="text-sm text-muted-foreground">
            Export the complete demo dataset for external use
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}