import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Plus, Settings } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { EscalationRule } from '@/types/ownership';

export function EscalationRulesTab() {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getEscalationRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to load escalation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Escalation Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure automatic escalation chains and SLA thresholds
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.isActive} />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Trigger</p>
                      <Badge variant="outline">{rule.triggerType}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Threshold</p>
                      <p className="font-medium">{rule.thresholdDays} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Chain Steps</p>
                      <p className="font-medium">{rule.escalationChain.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Notifications</p>
                      <p className="font-medium">{rule.notificationMethods.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}