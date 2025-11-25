import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Building,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CandidateClientResumesTabProps {
  candidateId: string | null;
}

interface OriginalResume {
  id: string;
  fileName: string;
  uploadedDate: string;
  uploadedBy: string;
  fileSize: number;
  fileUrl: string;
}

interface ClientResume {
  id: string;
  fileName: string;
  client: string;
  project: string;
  jdId: string;
  uploadedBy: string;
  uploadedDate: string;
  fileUrl: string;
  applicationId?: string;
}

export function CandidateClientResumesTab({ candidateId }: CandidateClientResumesTabProps) {
  const { toast } = useToast();
  const [originalResumes, setOriginalResumes] = useState<OriginalResume[]>([]);
  const [clientResumes, setClientResumes] = useState<ClientResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newClientResume, setNewClientResume] = useState({
    client: '',
    project: '',
    jdId: '',
    file: null as File | null
  });

  useEffect(() => {
    if (candidateId) {
      loadResumes();
    }
  }, [candidateId]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      // Mock data for original resumes
      const mockOriginalResumes: OriginalResume[] = [
        {
          id: 'orig-1',
          fileName: 'John_Doe_Resume_Original.pdf',
          uploadedDate: '2024-01-15',
          uploadedBy: 'Sarah Johnson',
          fileSize: 245760,
          fileUrl: '/mock/resume-original.pdf'
        },
        {
          id: 'orig-2',
          fileName: 'John_Doe_Resume_Updated.docx',
          uploadedDate: '2024-02-10',
          uploadedBy: 'John Doe',
          fileSize: 189440,
          fileUrl: '/mock/resume-updated.docx'
        }
      ];

      // Mock data for client-ready resumes
      const mockClientResumes: ClientResume[] = [
        {
          id: 'client-1',
          fileName: 'TECHCORP_PROJECT1_JD001_JohnDoe_20240220.pdf',
          client: 'TechCorp',
          project: 'Digital Transformation',
          jdId: 'JD-2024-001',
          uploadedBy: 'Sarah Johnson',
          uploadedDate: '2024-02-20',
          fileUrl: '/mock/client-resume-1.pdf',
          applicationId: 'APP-2024-001'
        },
        {
          id: 'client-2',
          fileName: 'INNOVATE_WEBAPP_JD005_JohnDoe_20240315.pdf',
          client: 'InnovateTech',
          project: 'Web Application',
          jdId: 'JD-2024-005',
          uploadedBy: 'David Chen',
          uploadedDate: '2024-03-15',
          fileUrl: '/mock/client-resume-2.pdf',
          applicationId: 'APP-2024-002'
        }
      ];

      setOriginalResumes(mockOriginalResumes);
      setClientResumes(mockClientResumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load resume data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!newClientResume.client || !newClientResume.project || !newClientResume.jdId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before uploading",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Generate filename based on convention
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const candidateName = 'JohnDoe'; // This would come from candidate data
      const extension = file.name.split('.').pop();
      const suggestedFileName = `${newClientResume.client.toUpperCase()}_${newClientResume.project.replace(/\s+/g, '')}_${newClientResume.jdId}_${candidateName}_${timestamp}.${extension}`;

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newResume: ClientResume = {
        id: `client-${Date.now()}`,
        fileName: suggestedFileName,
        client: newClientResume.client,
        project: newClientResume.project,
        jdId: newClientResume.jdId,
        uploadedBy: 'Current User',
        uploadedDate: new Date().toISOString().split('T')[0],
        fileUrl: `/mock/${suggestedFileName}`
      };

      setClientResumes(prev => [...prev, newResume]);
      setNewClientResume({ client: '', project: '', jdId: '', file: null });

      toast({
        title: "Upload Successful",
        description: `Client-ready resume uploaded: ${suggestedFileName}`,
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload client-ready resume",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!candidateId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a candidate to view resumes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Resumes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Original Resume(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {originalResumes.length > 0 ? (
            <div className="space-y-4">
              {originalResumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">{resume.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        Uploaded by {resume.uploadedBy} on {new Date(resume.uploadedDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(resume.fileSize)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No original resumes uploaded
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Client-Ready Resumes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Client-Ready Resumes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload New Client Resume */}
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Client-Ready Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Input
                    id="client"
                    placeholder="e.g., TechCorp"
                    value={newClientResume.client}
                    onChange={(e) => setNewClientResume(prev => ({ ...prev, client: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Input
                    id="project"
                    placeholder="e.g., Digital Transformation"
                    value={newClientResume.project}
                    onChange={(e) => setNewClientResume(prev => ({ ...prev, project: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jdId">JD ID *</Label>
                  <Input
                    id="jdId"
                    placeholder="e.g., JD-2024-001"
                    value={newClientResume.jdId}
                    onChange={(e) => setNewClientResume(prev => ({ ...prev, jdId: e.target.value }))}
                  />
                </div>
              </div>

              {newClientResume.client && newClientResume.project && newClientResume.jdId && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm">
                    <strong>Suggested filename:</strong>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {newClientResume.client.toUpperCase()}_{newClientResume.project.replace(/\s+/g, '')}_{newClientResume.jdId}_CandidateName_{new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="resume-file">Resume File *</Label>
                <Input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="text-sm text-muted-foreground">
                    Uploading resume...
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div>File naming convention ensures consistency and traceability.</div>
                  <div>All uploads create audit entries for compliance tracking.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Client Resumes */}
          {clientResumes.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm font-medium">Existing Client-Ready Resumes ({clientResumes.length})</div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">File</th>
                      <th className="text-left p-2">Client</th>
                      <th className="text-left p-2">Project</th>
                      <th className="text-left p-2">JD</th>
                      <th className="text-left p-2">Uploaded By</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientResumes.map((resume) => (
                      <tr key={resume.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="text-sm font-medium">{resume.fileName}</div>
                              {resume.applicationId && (
                                <div className="text-xs text-muted-foreground">
                                  App: {resume.applicationId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{resume.client}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">{resume.project}</div>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary">{resume.jdId}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-sm">{resume.uploadedBy}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">
                              {new Date(resume.uploadedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No client-ready resumes uploaded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
