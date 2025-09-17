import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MSAData {
  id: string;
  title: string;
  client: string;
  validFrom: string;
  validTo: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  sowCount: number;
  docLink?: string;
}

export function MSATab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const msas: MSAData[] = [
    {
      id: '1',
      title: 'Master Service Agreement - TechCorp',
      client: 'TechCorp Inc',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      status: 'active',
      sowCount: 3,
      docLink: '#'
    },
    {
      id: '2',
      title: 'MSA - StartupInc Development Services',
      client: 'StartupInc',
      validFrom: '2024-02-15',
      validTo: '2025-02-14',
      status: 'active',
      sowCount: 2,
      docLink: '#'
    },
    {
      id: '3',
      title: 'Framework Agreement - RetailCorp',
      client: 'RetailCorp',
      validFrom: '2023-06-01',
      validTo: '2024-05-31',
      status: 'expired',
      sowCount: 1
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'terminated':
        return <Badge variant="outline">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateMSA = () => {
    toast({
      title: "Create MSA",
      description: "MSA creation dialog would open here",
    });
  };

  const handleEditMSA = (id: string) => {
    toast({
      title: "Edit MSA",
      description: `Editing MSA ${id}`,
    });
  };

  const handleDeleteMSA = (id: string) => {
    toast({
      title: "Delete MSA",
      description: `MSA ${id} deletion confirmation would appear`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Master Service Agreements</h2>
          <p className="text-muted-foreground">Manage framework agreements with clients</p>
        </div>
        <Button onClick={handleCreateMSA} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create MSA
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search MSAs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                <SelectItem value="startup">StartupInc</SelectItem>
                <SelectItem value="retail">RetailCorp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* MSA List */}
      <Card>
        <CardHeader>
          <CardTitle>MSA Registry ({msas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {msas.map((msa) => (
              <div key={msa.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{msa.title}</h3>
                    {getStatusBadge(msa.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Client: {msa.client}</p>
                    <p>Valid: {msa.validFrom} - {msa.validTo}</p>
                    <p>{msa.sowCount} SOW(s) linked</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {msa.docLink && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditMSA(msa.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMSA(msa.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}