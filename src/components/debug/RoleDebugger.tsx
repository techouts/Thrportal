import React from 'react';
import { useAuth } from '@/auth/AuthContext';
import { roleToPermissionPatterns } from '@/rbac/permissions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RoleDebugger() {
  const { user, can } = useAuth();

  if (!user) return null;

  const rolePermissions = roleToPermissionPatterns[user.role] || [];

  // Test common permissions
  const testPermissions = [
    'portal.announcements.read',
    'employees.read', 
    'attendance.read',
    'leave.requests.*',
    'timesheets.read',
    'finance.payslips.read',
    'helpdesk.tickets.read_own'
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-sm">Role Debug: {user.role}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>User:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>Role Permissions ({rolePermissions.length}):</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {rolePermissions.slice(0, 5).map((perm, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {perm}
                </Badge>
              ))}
              {rolePermissions.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{rolePermissions.length - 5} more
                </Badge>
              )}
            </div>
          </div>
          <div>
            <strong>Permission Tests:</strong>
            <div className="space-y-1 mt-1">
              {testPermissions.map((perm) => (
                <div key={perm} className="flex justify-between">
                  <span className="truncate">{perm}</span>
                  <Badge 
                    variant={can(perm) ? "default" : "destructive"}
                    className="text-xs ml-2"
                  >
                    {can(perm) ? '✓' : '✗'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}