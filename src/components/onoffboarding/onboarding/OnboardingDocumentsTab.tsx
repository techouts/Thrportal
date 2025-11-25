import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { OnOffboardingService } from '@/services/onoffboardingService';
import { 
  Search, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  User,
  Calendar
} from 'lucide-react';

interface OnboardingDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  documentType: 'pan' | 'aadhaar' | 'bank_details' | 'pf_uan' | 'esic' | 'photo' | 'resume';
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedDate?: string;
  verifiedDate?: string;
  fileName?: string;
  fileSize?: string;
  comments?: string;
  joiningDate: string;
  isMandatory: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const OnboardingDocumentsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from the service
      const mockDocuments: OnboardingDocument[] = [
        {
          id: '1',
          employeeId: 'EMP101',
          employeeName: 'Rajesh Kumar',
          department: 'Engineering',
          documentType: 'pan',
          status: 'verified',
          uploadedDate: '2024-02-10',
          verifiedDate: '2024-02-10',
          fileName: 'pan_card.pdf',
          fileSize: '2.5 MB',
          joiningDate: '2024-02-12',
          isMandatory: true,
          priority: 'high'
        },
        {
          id: '2',
          employeeId: 'EMP101',
          employeeName: 'Rajesh Kumar',
          department: 'Engineering',
          documentType: 'aadhaar',
          status: 'uploaded',
          uploadedDate: '2024-02-10',
          fileName: 'aadhaar_masked.pdf',
          fileSize: '1.8 MB',
          joiningDate: '2024-02-12',
          isMandatory: true,
          priority: 'high'
        },
        {
          id: '3',
          employeeId: 'EMP102',
          employeeName: 'Priya Sharma',
          department: 'Marketing',
          documentType: 'bank_details',
          status: 'pending',
          joiningDate: '2024-02-08',
          isMandatory: true,
          priority: 'high'
        },
        {
          id: '4',
          employeeId: 'EMP102',
          employeeName: 'Priya Sharma',
          department: 'Marketing',
          documentType: 'photo',
          status: 'rejected',
          uploadedDate: '2024-02-09',
          fileName: 'photo.jpg',
          fileSize: '500 KB',
          comments: 'Photo quality is poor, please upload a clearer image',
          joiningDate: '2024-02-08',
          isMandatory: true,
          priority: 'medium'
        }
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'uploaded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pan': return <FileText className="h-4 w-4" />;
      case 'aadhaar': return <Shield className="h-4 w-4" />;
      case 'bank_details': return <FileText className="h-4 w-4" />;
      case 'pf_uan': return <FileText className="h-4 w-4" />;
      case 'esic': return <FileText className="h-4 w-4" />;
      case 'photo': return <User className="h-4 w-4" />;
      case 'resume': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentDisplayName = (type: string) => {
    const names = {
      'pan': 'PAN Card',
      'aadhaar': 'Aadhaar Card',
      'bank_details': 'Bank Details',
      'pf_uan': 'PF/UAN Details',
      'esic': 'ESIC Details',
      'photo': 'Passport Photo',
      'resume': 'Resume'
    };
    return names[type as keyof typeof names] || type;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter;
    const matchesSearch = 
      doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDocumentDisplayName(doc.documentType).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const documentCounts = {
    all: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    uploaded: documents.filter(d => d.status === 'uploaded').length,
    verified: documents.filter(d => d.status === 'verified').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  const getEmployeeProgress = (employeeId: string) => {
    const employeeDocs = documents.filter(d => d.employeeId === employeeId);
    const totalDocs = employeeDocs.length;
    const verifiedDocs = employeeDocs.filter(d => d.status === 'verified').length;
    return totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Onboarding Documents</h2>
        <p className="text-muted-foreground">
          Manage and verify employee documents for compliance and onboarding
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by employee name, ID, or document type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(documentCounts).map(([status, count]) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="flex items-center gap-2"
          >
            {status === 'pending' && <Clock className="h-3 w-3" />}
            {status === 'uploaded' && <Upload className="h-3 w-3" />}
            {status === 'verified' && <CheckCircle className="h-3 w-3" />}
            {status === 'rejected' && <AlertTriangle className="h-3 w-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
          </Button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <div className="text-lg font-medium">No documents found</div>
              <div className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : `No ${filter} documents at the moment`}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.documentType)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{getDocumentDisplayName(doc.documentType)}</h3>
                          <Badge variant="outline" className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                          {doc.isMandatory && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{doc.employeeName} ({doc.employeeId})</span>
                          <span>{doc.department}</span>
                          <span>Joining: {doc.joiningDate}</span>
                        </div>
                      </div>
                    </div>

                    {doc.fileName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{doc.fileName}</span>
                        <span>({doc.fileSize})</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {doc.uploadedDate && (
                        <div className="flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          <span>Uploaded: {doc.uploadedDate}</span>
                        </div>
                      )}
                      {doc.verifiedDate && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified: {doc.verifiedDate}</span>
                        </div>
                      )}
                    </div>

                    {doc.comments && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-yellow-800">Comments</div>
                            <div className="text-sm text-yellow-700">{doc.comments}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {doc.documentType === 'aadhaar' && doc.status === 'verified' && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Shield className="h-4 w-4" />
                        <span>DPDP Compliant - Aadhaar data masked</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {doc.status === 'pending' && (
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    )}
                    {doc.status === 'uploaded' && (
                      <>
                        <Button size="sm">
                          Verify
                        </Button>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                      </>
                    )}
                    {(doc.status === 'verified' || doc.status === 'uploaded') && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    {doc.status === 'verified' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};