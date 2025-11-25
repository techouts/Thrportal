import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Settings, Lock, UnlockIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { candidateSecurityService } from '@/services/candidateSecurityService';
import { 
  RolePermissionMatrix, 
  CandidatePermission, 
  CANDIDATE_ROLES,
  CandidateRole 
} from '@/types/candidateSecurity';

export function RolePermissionsTab() {
  const [roles, setRoles] = useState<RolePermissionMatrix[]>([]);
  const [permissions, setPermissions] = useState<Record<string, CandidatePermission[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>('RECRUITER');
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        candidateSecurityService.getRolePermissions(),
        candidateSecurityService.getPermissionsByCategory()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleId: string, permissionId: string, enabled: boolean) => {
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.roleId === roleId 
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permissionId]: enabled
              }
            }
          : role
      )
    );
    setUnsavedChanges(true);
  };

  const saveChanges = async () => {
    try {
      const roleToUpdate = roles.find(r => r.roleId === selectedRole);
      if (roleToUpdate) {
        await candidateSecurityService.updateRolePermissions(
          selectedRole, 
          roleToUpdate.permissions
        );
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const getPermissionStatus = (roleId: string, permissionId: string): boolean => {
    const role = roles.find(r => r.roleId === roleId);
    return role?.permissions[permissionId] || false;
  };

  const getEnabledPermissionsCount = (roleId: string): number => {
    const role = roles.find(r => r.roleId === roleId);
    return role ? Object.values(role.permissions).filter(Boolean).length : 0;
  };

  const getRoleIcon = (roleId: string) => {
    const icons: Record<string, any> = {
      RECRUITER: Users,
      STAFFING_MANAGER: Settings,
      HR_MANAGER: Shield,
      HIRING_MANAGER: CheckCircle,
      LEADERSHIP: AlertTriangle,
      CLIENT_SPOC: Lock,
      ADMIN: UnlockIcon
    };
    return icons[roleId] || Users;
  };

  const getRoleBadgeVariant = (roleId: string) => {
    const variants: Record<string, any> = {
      ADMIN: 'destructive',
      LEADERSHIP: 'default',
      HR_MANAGER: 'default',
      STAFFING_MANAGER: 'secondary',
      HIRING_MANAGER: 'secondary',
      RECRUITER: 'outline',
      CLIENT_SPOC: 'outline'
    };
    return variants[roleId] || 'outline';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading security configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedRoleData = roles.find(r => r.roleId === selectedRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role-Based Access Control</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Configure permissions for each role in the Candidates module. Changes are audited and logged.
              </p>
            </div>
            {unsavedChanges && (
              <Button onClick={saveChanges}>
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map((role) => {
              const Icon = getRoleIcon(role.roleId);
              const enabledCount = getEnabledPermissionsCount(role.roleId);
              const totalPermissions = Object.keys(permissions).reduce(
                (sum, cat) => sum + permissions[cat].length, 0
              );

              return (
                <div
                  key={role.roleId}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole === role.roleId 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRole(role.roleId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{role.roleName}</span>
                    </div>
                    <Badge variant={getRoleBadgeVariant(role.roleId)} className="text-xs">
                      {role.roleId}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {enabledCount} of {totalPermissions} permissions
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(enabledCount / totalPermissions) * 100}%` }}
                    />
                  </div>
                  {role.restrictions.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {role.restrictions.length} restrictions
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Permissions Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Permissions for {selectedRoleData?.roleName}
                </CardTitle>
                <Badge variant={getRoleBadgeVariant(selectedRole)}>
                  {selectedRole}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(permissions)[0]} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  {Object.keys(permissions).slice(0, 4).map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="text-xs"
                    >
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(permissions).map(([category, categoryPermissions]) => (
                  <TabsContent key={category} value={category} className="space-y-3">
                    {categoryPermissions.map((permission) => (
                      <div 
                        key={permission.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {permission.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {permission.resource.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                        <Switch
                          checked={getPermissionStatus(selectedRole, permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(selectedRole, permission.id, checked)
                          }
                        />
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>

              {/* Role Restrictions */}
              {selectedRoleData?.restrictions && selectedRoleData.restrictions.length > 0 && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Role Restrictions
                  </h4>
                  <div className="space-y-2">
                    {selectedRoleData.restrictions.map((restriction) => (
                      <div key={restriction.id} className="text-xs">
                        <Badge variant="outline" className="mr-2">
                          {restriction.type.replace(/_/g, ' ')}
                        </Badge>
                        {restriction.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}