import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Eye, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { OffboardingDocument } from '@/types/onoffboarding';

export const OffboardingDocumentsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<OffboardingDocument[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'generated' | 'signed'>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await OnOffboardingService.getOffboardingDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Failed to load offboarding documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-700';
      case 'generated':
        return 'bg-blue-500/20 text-blue-700';
      case 'signed':
        return 'bg-emerald-500/20 text-emerald-700';
      case 'expired':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'relieving_letter':
      case 'experience_certificate':
      case 'fnf_statement':
        return FileText;
      default:
        return FileText;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  const documentCounts = {
    all: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    generated: documents.filter(d => d.status === 'generated').length,
    signed: documents.filter(d => d.status === 'signed').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Offboarding Documents</h3>
          <p className="text-muted-foreground">
            Manage and track employee offboarding documents
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({documentCounts.all})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({documentCounts.pending})
        </Button>
        <Button
          variant={filter === 'generated' ? 'default' : 'outline'}
          onClick={() => setFilter('generated')}
          size="sm"
        >
          Generated ({documentCounts.generated})
        </Button>
        <Button
          variant={filter === 'signed' ? 'default' : 'outline'}
          onClick={() => setFilter('signed')}
          size="sm"
        >
          Signed ({documentCounts.signed})
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => {
          const IconComponent = getDocumentIcon(document.type);
          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">
                        {document.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                      <CardDescription>{document.employeeName}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(document.status)}
                  >
                    {document.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{document.department}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Employee ID:</span>
                    <span className="font-medium">{document.employeeId}</span>
                  </div>

                  {document.generatedDate && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Generated:</span>
                      <span className="font-medium">
                        {new Date(document.generatedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {document.signedDate && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Signed:</span>
                      <span className="font-medium">
                        {new Date(document.signedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last Working Day:</span>
                    <span className="font-medium">
                      {new Date(document.lastWorkingDay).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    {document.status === 'pending' ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Upload className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>

                  {document.status === 'signed' && (
                    <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 p-2 rounded">
                      <CheckCircle className="h-4 w-4" />
                      <span>Document completed and signed</span>
                    </div>
                  )}

                  {document.status === 'pending' && (
                    <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>Awaiting document generation</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">
              No {filter !== 'all' ? filter + ' ' : ''}documents found
            </div>
            <div className="text-muted-foreground">
              {filter === 'all' 
                ? 'No offboarding documents have been created yet'
                : `No ${filter} documents at the moment`
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};