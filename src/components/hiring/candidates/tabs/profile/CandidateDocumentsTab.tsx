import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateDocument } from '@/types/candidates';
import { FileText, Download, Upload, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UploadDocumentDialog } from '../../forms/UploadDocumentDialog';

interface CandidateDocumentsTabProps {
  candidateId: string;
}

export function CandidateDocumentsTab({ candidateId }: CandidateDocumentsTabProps) {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentFilter, setDocumentFilter] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [candidateId]);

  const loadDocuments = async () => {
    try {
      const data = await candidatesService.getCandidateDocuments(candidateId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    const doc = documents.find(d => d.id === deletingId);
    if (!doc) return;
    
    try {
      await candidatesService.deleteCandidateDocument(deletingId, doc.url);
      toast.success('Document deleted successfully');
      setDeletingId(null);
      loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const resumeDocuments = documents.filter(doc => doc.type === 'Resume');
  const filteredDocuments = documentFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === documentFilter);

  const documentTypes = ['Resume', 'Certificate', 'ID Proof', 'Address Proof', 'Salary Slip', 'Offer Letter'];
  const typeCounts = documentTypes.reduce((acc, type) => {
    acc[type] = documents.filter(d => d.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {resumeDocuments.length > 0 && (
            <>
              <div className="mb-6 p-4 bg-accent/20 rounded-lg border-2 border-primary">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Primary Resume
                </h3>
                <div className="flex items-center justify-between border rounded-lg p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{resumeDocuments[0].name}</p>
                        {resumeDocuments[0].verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(resumeDocuments[0].size)}</span>
                        <span>•</span>
                        <span>{new Date(resumeDocuments[0].uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={resumeDocuments[0].url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
            </>
          )}

          <Tabs value={documentFilter} onValueChange={setDocumentFilter} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({documents.length})</TabsTrigger>
              {documentTypes.map(type => (
                <TabsTrigger key={type} value={type}>
                  {type}s ({typeCounts[type] || 0})
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={documentFilter}>
              {filteredDocuments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No documents found</p>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.name}</p>
                            {doc.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{doc.type}</Badge>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingId(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <UploadDocumentDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        candidateId={candidateId}
        onSuccess={loadDocuments}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
