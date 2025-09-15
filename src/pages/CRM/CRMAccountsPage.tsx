import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Building, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmAccount, CrmClient } from '@/types/crm';

export function CRMAccountsPage() {
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, clientsData] = await Promise.all([
        CrmService.getAccounts(),
        CrmService.getClients()
      ]);
      setAccounts(accountsData);
      setClients(clientsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load accounts data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<CrmAccount>[] = [
    {
      id: 'name',
      header: 'Account Name',
      accessor: 'name',
      cell: (account: CrmAccount) => (
        <div>
          <div className="font-medium">{account.name}</div>
          {account.type && (
            <div className="text-sm text-muted-foreground">{account.type}</div>
          )}
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: (account: CrmAccount) => account.client?.name || '',
      cell: (account: CrmAccount) => (
        <Link 
          to={`/CRM/Clients/${account.client_id}`}
          className="text-primary hover:underline"
        >
          {account.client?.name || 'Unknown Client'}
        </Link>
      )
    },
    {
      id: 'sla_override',
      header: 'SLA Override',
      accessor: (account: CrmAccount) => account.sla_override || '',
      cell: (account: CrmAccount) => account.sla_override || '-'
    },
    {
      id: 'primary_spoc',
      header: 'Primary SPOC',
      accessor: (account: CrmAccount) => account.primary_spoc?.name || '',
      cell: (account: CrmAccount) => account.primary_spoc?.name || '-'
    },
    {
      id: 'created_at',
      header: 'Created',
      accessor: 'created_at',
      cell: (account: CrmAccount) => new Date(account.created_at).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (account: CrmAccount) => account.id,
      cell: (account: CrmAccount) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/CRM/Clients/${account.client_id}`}>View Client</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Account</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const stats = [
    {
      title: 'Total Accounts',
      value: accounts.length,
      icon: Building,
      description: 'All client accounts'
    },
    {
      title: 'Active Clients',
      value: clients.filter(c => c.status === 'Active').length,
      icon: Users,
      description: 'Clients with active accounts'
    },
    {
      title: 'SLA Overrides',
      value: accounts.filter(a => a.sla_override).length,
      icon: AlertCircle,
      description: 'Accounts with custom SLAs'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Management"
        description="Manage client accounts and their configurations"
        actions={
          <Button asChild>
            <Link to="/CRM/Clients">
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            Comprehensive list of all client accounts and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredAccounts}
            columns={columns}
            loading={loading}
            searchable
            onSearch={setSearchQuery}
            emptyMessage="No accounts found"
          />
        </CardContent>
      </Card>
    </div>
  );
}