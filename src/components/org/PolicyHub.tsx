import { useState, useCallback } from 'react';
import { FileText, Folder, Download, CheckCircle, Clock, AlertTriangle, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/auth/AuthContext';
import { mockPolicyFolders, mockPolicyDocs, mockPolicyAcks } from '@/mocks/orgData';
import type { PolicyDoc, PolicyAck } from '@/types/org';
import { toast } from 'sonner';

interface PolicyHubProps {
  className?: string;
}

export function PolicyHub({ className }: PolicyHubProps) {
  const { user: currentUser } = useAuth();
  const isHRAdmin = currentUser?.role === 'HR' || currentUser?.role === 'Admin';

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Policy Hub</h1>
        <p className="text-muted-foreground">
          Access company policies, procedures, and acknowledgement tracking.
        </p>
      </div>

      <Tabs defaultValue={isHRAdmin ? "library" : "acknowledgements"} className="space-y-4">
        <TabsList>
          {isHRAdmin && (
            <TabsTrigger value="library">Library</TabsTrigger>
          )}
          <TabsTrigger value="acknowledgements">Acknowledgements</TabsTrigger>
        </TabsList>

        {isHRAdmin && (
          <TabsContent value="library">
            <PolicyLibrary />
          </TabsContent>
        )}

        <TabsContent value="acknowledgements">
          <PolicyAcknowledgements />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PolicyLibrary() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const renderFolderTree = (folders: any[], level = 0) => {
    return folders.map((folder) => (
      <div key={folder.id} style={{ marginLeft: level * 20 }}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
            selectedFolder === folder.id ? 'bg-muted' : ''
          }`}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <Folder className="h-4 w-4" />
          <span className="text-sm">{folder.name}</span>
        </div>
        {folder.children && renderFolderTree(folder.children, level + 1)}
      </div>
    ));
  };

  const selectedFolderDocs = mockPolicyDocs.filter(doc => 
    selectedFolder ? doc.folder_id === selectedFolder : true
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Tree */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Folders</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Folder name" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div
              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                !selectedFolder ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">All Documents</span>
            </div>
            {renderFolderTree(mockPolicyFolders)}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolder 
                ? mockPolicyFolders.find(f => f.id === selectedFolder)?.name || 'Documents'
                : 'All Documents'
              }
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Policy Document</DialogTitle>
                </DialogHeader>
                <UploadPolicyForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedFolderDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{doc.version}</TableCell>
                  <TableCell>{new Date(doc.effective_from).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(doc.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {doc.is_mandatory ? (
                      <Badge variant="destructive">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeof doc.visibility_json.audience === 'string' 
                        ? doc.visibility_json.audience 
                        : 'Targeted'
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.owner_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function UploadPolicyForm() {
  const [formData, setFormData] = useState({
    title: '',
    version: '',
    isMandatory: false,
    audience: 'all',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Policy document uploaded successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Document title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
      />
      
      <Input
        placeholder="Version (e.g., 1.0, 2.1)"
        value={formData.version}
        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">File Upload</label>
        <Input type="file" accept=".pdf,.doc,.docx" />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="mandatory"
          checked={formData.isMandatory}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, isMandatory: !!checked }))
          }
        />
        <label htmlFor="mandatory" className="text-sm">
          This is a mandatory policy requiring acknowledgement
        </label>
      </div>

      <Textarea
        placeholder="Additional notes or description"
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Upload Document</Button>
      </div>
    </form>
  );
}

function PolicyAcknowledgements() {
  const [pendingPolicies] = useState(
    mockPolicyDocs.filter(doc => 
      doc.is_mandatory && !mockPolicyAcks.some(ack => ack.policy_id === doc.id)
    )
  );
  
  const [acknowledgedPolicies] = useState(mockPolicyAcks);

  return (
    <div className="space-y-6">
      {/* Pending Acknowledgements */}
      {pendingPolicies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Pending Acknowledgements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPolicies.map((policy) => (
                <PendingPolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acknowledged Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Acknowledged Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Acknowledged At</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acknowledgedPolicies.map((ack) => (
                <TableRow key={ack.id}>
                  <TableCell className="font-medium">{ack.policy_title}</TableCell>
                  <TableCell>{ack.policy_version}</TableCell>
                  <TableCell>{new Date(ack.acknowledged_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface PendingPolicyCardProps {
  policy: PolicyDoc;
}

function PendingPolicyCard({ policy }: PendingPolicyCardProps) {
  const [hasReadDocument, setHasReadDocument] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreviewDocument = () => {
    // Simulate opening document
    setHasReadDocument(true);
    toast.info('Document opened. You can now acknowledge after reading.');
  };

  const handleAcknowledge = async () => {
    if (!hasReadDocument) {
      toast.error('Please read the document first');
      return;
    }

    if (!typedName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Policy acknowledged successfully');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium">{policy.title}</h3>
            <p className="text-sm text-muted-foreground">Version {policy.version}</p>
            <p className="text-sm text-muted-foreground">
              Effective from: {new Date(policy.effective_from).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="destructive">Action Required</Badge>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handlePreviewDocument}
          >
            <FileText className="h-4 w-4 mr-2" />
            Preview Document
          </Button>

          {hasReadDocument && (
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`read-${policy.id}`}
                  checked={hasReadDocument}
                  disabled
                />
                <label htmlFor={`read-${policy.id}`} className="text-sm">
                  I have read and understood this policy document
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">Type your full name to confirm:</label>
                <Input
                  placeholder="Enter your full name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button 
                className="w-full"
                onClick={handleAcknowledge}
                disabled={isSubmitting || !typedName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acknowledge Policy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}