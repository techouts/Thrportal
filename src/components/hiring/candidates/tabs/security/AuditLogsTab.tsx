import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { candidateSecurityService } from '@/services/candidateSecurityService';
import { AuditLogEntry } from '@/types/candidateSecurity';

export function AuditLogsTab() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    success: '',
    userId: ''
  });

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const logs = await candidateSecurityService.getAuditLogs({
        ...filters,
        successOnly: filters.success ? filters.success === 'true' : undefined
      });
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter logs based on search term
    const filtered = auditLogs.filter(log =>
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAuditLogs(filtered);
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      create: CheckCircle,
      edit: Clock,
      delete: AlertTriangle,
      view: User,
      approve: CheckCircle,
      reject: AlertTriangle
    };
    return icons[action] || User;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'text-green-600',
      edit: 'text-blue-600',
      delete: 'text-red-600',
      view: 'text-gray-600',
      approve: 'text-green-600',
      reject: 'text-red-600'
    };
    return colors[action] || 'text-gray-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Track all security events and user actions in the Candidates module
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, resource, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.action} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, action: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resource} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, resource: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="candidate_profile">Candidate Profile</SelectItem>
                <SelectItem value="candidate_offers">Offers</SelectItem>
                <SelectItem value="talent_pools">Talent Pools</SelectItem>
                <SelectItem value="candidate_audit_logs">Security Config</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.success} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, success: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadAuditLogs}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({auditLogs.length} events)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full bg-muted ${getActionColor(log.action)}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.userName}</span>
                        <Badge variant="outline" className="text-xs">{log.userRole}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.action.replace(/_/g, ' ')} {log.resource.replace(/_/g, ' ')}
                        </span>
                        {log.resourceName && (
                          <span className="text-sm font-medium">"{log.resourceName}"</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatTimestamp(log.timestamp)}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        <Badge 
                          variant={log.success ? 'default' : 'destructive'} 
                          className="text-xs"
                        >
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>

                      {log.errorMessage && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          {log.errorMessage}
                        </div>
                      )}

                      {log.details && (
                        <div className="mt-2 text-xs">
                          <details className="cursor-pointer">
                            <summary className="text-muted-foreground">Details</summary>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {auditLogs.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No audit logs found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}