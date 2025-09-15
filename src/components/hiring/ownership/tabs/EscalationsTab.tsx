import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock, User, ArrowRight, MessageSquare } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { ownershipService } from '@/services/ownershipService';
import type { EscalationEvent } from '@/types/ownership';

export function EscalationsTab() {
  const [escalations, setEscalations] = useState<EscalationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationEvent | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    resourceType: '',
    level: ''
  });

  useEffect(() => {
    loadEscalations();
  }, [filters]);

  const loadEscalations = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getEscalationEvents();
      setEscalations(data);
    } catch (error) {
      console.error('Failed to load escalations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalation = async (escalationId: string, action: string, comment?: string) => {
    try {
      // await ownershipService.resolveEscalation(escalationId, action, comment);
      console.log('Resolving escalation:', escalationId, action, comment);
      loadEscalations();
    } catch (error) {
      console.error('Failed to handle escalation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Triggered': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const escalationColumns = [
    {
      id: 'resourceType',
      accessor: 'resourceType' as keyof EscalationEvent,
      header: 'Type',
      cell: (value: any, row: EscalationEvent) => (
        <Badge variant="outline">{row.resourceType}</Badge>
      ),
    },
    {
      id: 'resourceName',
      accessor: 'resourceName' as keyof EscalationEvent,
      header: 'Resource',
      cell: (value: any, row: EscalationEvent) => (
        <div className="font-medium">{row.resourceName}</div>
      ),
    },
    {
      id: 'fromUser',
      accessor: 'fromUser' as keyof EscalationEvent,
      header: 'From',
      cell: (value: any, row: EscalationEvent) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {row.fromUser}
        </div>
      ),
    },
    {
      id: 'toUser',
      accessor: 'toUser' as keyof EscalationEvent,
      header: 'To',
      cell: (value: any, row: EscalationEvent) => (
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          {row.toUser}
        </div>
      ),
    },
    {
      id: 'escalationLevel',
      accessor: 'escalationLevel' as keyof EscalationEvent,
      header: 'Level',
      cell: (value: any, row: EscalationEvent) => (
        <Badge variant="secondary">{row.escalationLevel}</Badge>
      ),
    },
    {
      id: 'triggeredAt',
      accessor: 'triggeredAt' as keyof EscalationEvent,
      header: 'Triggered',
      cell: (value: any, row: EscalationEvent) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {new Date(row.triggeredAt).toLocaleString()}
        </div>
      ),
    },
    {
      id: 'status',
      accessor: 'status' as keyof EscalationEvent,
      header: 'Status',
      cell: (value: any, row: EscalationEvent) => (
        <Badge className={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      accessor: () => 'actions',
      header: 'Actions',
      cell: (value: any, row: EscalationEvent) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setSelectedEscalation(row)}
          >
            View
          </Button>
          {row.status === 'Triggered' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleEscalation(row.id, 'reassign')}
              >
                Reassign
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleEscalation(row.id, 'override')}
              >
                Override
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SLA Breach Dashboard</h2>
          <p className="text-muted-foreground">
            Manage escalations and SLA breaches across JDs and candidates
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escalations.filter(e => e.status === 'Triggered').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escalations.filter(e => e.status === 'In Progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escalations.filter(e => 
                e.status === 'Resolved' && 
                new Date(e.resolvedAt || '').toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Triggered">Triggered</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resourceType} onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="JD">JD</SelectItem>
                <SelectItem value="Candidate">Candidate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Escalation Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadEscalations} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Escalations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Escalations</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={escalationColumns}
            data={escalations}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Escalation Details Dialog */}
      {selectedEscalation && (
        <Dialog open={!!selectedEscalation} onOpenChange={() => setSelectedEscalation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Escalation Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Resource</label>
                  <p className="text-sm text-muted-foreground">{selectedEscalation.resourceName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground">{selectedEscalation.resourceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">From</label>
                  <p className="text-sm text-muted-foreground">{selectedEscalation.fromUser}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">To</label>
                  <p className="text-sm text-muted-foreground">{selectedEscalation.toUser}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason</label>
                <p className="text-sm text-muted-foreground">{selectedEscalation.reason}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Actions Taken</label>
                <div className="space-y-2">
                  {selectedEscalation.actions.map((action, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{action.actionType}</span>
                        <span className="text-muted-foreground">{new Date(action.performedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">{action.description}</p>
                      <p className="text-sm">By: {action.performedBy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleEscalation(selectedEscalation.id, 'resolve')}>
                  Mark Resolved
                </Button>
                <Button variant="outline" onClick={() => handleEscalation(selectedEscalation.id, 'cancel')}>
                  Cancel Escalation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}