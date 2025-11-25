import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Settings, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function PayrollSetupForm() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    entity: 'Tech Company Ltd',
    cycle: 'MONTHLY',
    cutoffDate: 25,
    paymentDate: 30,
    financialYear: '2024-25',
    pfEnabled: true,
    esiEnabled: true,
    ptEnabled: true,
    lwfEnabled: false,
    tdsEnabled: true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payroll configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Setup</h2>
          <p className="text-muted-foreground">Configure entity and cycle settings</p>
        </div>
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Configuration */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Entity Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entity">Company Name</Label>
                <Input
                  id="entity"
                  value={config.entity}
                  onChange={(e) => setConfig(prev => ({ ...prev, entity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialYear">Financial Year</Label>
                <Select value={config.financialYear} onValueChange={(value) => setConfig(prev => ({ ...prev, financialYear: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Configuration */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Payroll Cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle">Cycle Type</Label>
                <Select value={config.cycle} onValueChange={(value) => setConfig(prev => ({ ...prev, cycle: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cutoff">Cutoff Date</Label>
                <Input
                  id="cutoff"
                  type="number"
                  min="1"
                  max="31"
                  value={config.cutoffDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, cutoffDate: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">Payment Date</Label>
              <Input
                id="payment"
                type="number"
                min="1"
                max="31"
                value={config.paymentDate}
                onChange={(e) => setConfig(prev => ({ ...prev, paymentDate: parseInt(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statutory Configuration */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Statutory Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pf">Provident Fund</Label>
                <p className="text-xs text-muted-foreground">12% Employee + 12% Employer</p>
              </div>
              <Switch
                id="pf"
                checked={config.pfEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, pfEnabled: checked }))}
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="esi">ESI</Label>
                <p className="text-xs text-muted-foreground">0.75% Employee + 3.25% Employer</p>
              </div>
              <Switch
                id="esi"
                checked={config.esiEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, esiEnabled: checked }))}
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pt">Professional Tax</Label>
                <p className="text-xs text-muted-foreground">State-specific rates</p>
              </div>
              <Switch
                id="pt"
                checked={config.ptEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ptEnabled: checked }))}
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tds">TDS</Label>
                <p className="text-xs text-muted-foreground">Income Tax deduction</p>
              </div>
              <Switch
                id="tds"
                checked={config.tdsEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, tdsEnabled: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="min-w-32">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}