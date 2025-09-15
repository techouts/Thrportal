import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Search, Filter, Share, Download, Edit, Trash2 } from 'lucide-react';
import { candidatesService } from '@/services/candidatesService';
import { TalentPool } from '@/types/candidates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export function TalentPoolsTab() {
  const [pools, setPools] = useState<TalentPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPool, setNewPool] = useState({
    name: '',
    description: '',
    tags: '',
    isPublic: false
  });

  useEffect(() => {
    loadTalentPools();
  }, []);

  const loadTalentPools = async () => {
    setLoading(true);
    try {
      const data = await candidatesService.getTalentPools();
      setPools(data);
    } catch (error) {
      console.error('Failed to load talent pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async () => {
    try {
      const poolData = {
        ...newPool,
        tags: newPool.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        candidateIds: [],
        createdBy: 'Current User',
        sharedWith: []
      };
      
      await candidatesService.createTalentPool(poolData);
      setShowCreateDialog(false);
      setNewPool({ name: '', description: '', tags: '', isPublic: false });
      loadTalentPools();
    } catch (error) {
      console.error('Failed to create talent pool:', error);
    }
  };

  const filteredPools = pools.filter(pool =>
    pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Talent Pools Management</CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Pool
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Talent Pool</DialogTitle>
                  <DialogDescription>
                    Create a reusable talent pool to organize candidates by skills, location, or other criteria.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newPool.name}
                      onChange={(e) => setNewPool(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      placeholder="e.g., Java Developers - Bangalore"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newPool.description}
                      onChange={(e) => setNewPool(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                      placeholder="Describe the pool criteria and purpose"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      value={newPool.tags}
                      onChange={(e) => setNewPool(prev => ({ ...prev, tags: e.target.value }))}
                      className="col-span-3"
                      placeholder="Java, React, Senior, Bangalore (comma-separated)"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="public" className="text-right">
                      Public Pool
                    </Label>
                    <Switch
                      id="public"
                      checked={newPool.isPublic}
                      onCheckedChange={(checked) => setNewPool(prev => ({ ...prev, isPublic: checked }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreatePool}>
                    Create Pool
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pools by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Talent Pools Grid */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading talent pools...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool) => (
            <Card key={pool.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{pool.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pool.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pool Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{pool.candidateIds.length} candidates</span>
                  </div>
                  <Badge variant={pool.isPublic ? 'default' : 'secondary'} className="text-xs">
                    {pool.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {pool.tags.slice(0, 6).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {pool.tags.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{pool.tags.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-muted-foreground">
                  <p>Created by {pool.createdBy}</p>
                  <p>{new Date(pool.createdAt).toLocaleDateString()}</p>
                  {pool.sharedWith.length > 0 && (
                    <p>Shared with {pool.sharedWith.length} users</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    View Candidates
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPools.length === 0 && !loading && (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'No pools match your search' : 'No talent pools created yet'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Pool
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}