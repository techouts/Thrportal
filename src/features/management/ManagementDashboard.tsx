import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { KPICard } from '@/components/shared/KPICard'
import { Users, Briefcase, DollarSign, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { FilterBar } from './FilterBar'
import {
  TopClientsChart, CountryPieChart, DepartmentPieChart,
  BillableByDepartmentChart, NonBillableBreakdownChart, ClientProjectsChart,
} from './Charts'
import { fetchDashboard } from './api'
import type { DashboardResponse, Filters } from './types'

export function ManagementDashboard() {
  const [filters, setFilters] = useState<Filters>({})
  const [dash, setDash] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await fetchDashboard(filters)
      setDash(d)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const kpis = useMemo(() => {
    if (!dash) return null
    const totalHeadcount = dash.byCountry.reduce((s, x) => s + x.count, 0)
    const billable = dash.billableByDepartment
      .filter((x) => x.billable === 'BILLABLE')
      .reduce((s, x) => s + x.count, 0)
    const nonBillable = totalHeadcount - billable
    const activeClients = dash.topClients.length
    return { totalHeadcount, billable, nonBillable, activeClients }
  }, [dash])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              options={dash?.filterOptions ?? { countries: [], departments: [], clients: [], projects: [] }}
            />
            {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
          </div>
        </CardContent>
      </Card>

      {/* KPI strip */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard title="Total Headcount" value={kpis.totalHeadcount} icon={Users} />
          <KPICard title="Billable" value={kpis.billable} icon={DollarSign} />
          <KPICard title="Non-Billable" value={kpis.nonBillable} icon={AlertCircle} />
          <KPICard title="Active Clients" value={kpis.activeClients} icon={Briefcase} />
        </div>
      )}

      {/* Charts — bigger cards for business readability */}
      {dash && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TopClientsChart data={dash.topClients} />
          <CountryPieChart data={dash.byCountry} />
          <DepartmentPieChart data={dash.byDepartment} />
          <BillableByDepartmentChart data={dash.billableByDepartment} />
          <NonBillableBreakdownChart data={dash.nonBillableBreakdown} />
          <ClientProjectsChart data={dash.clientProjects.rows} client={dash.clientProjects.client} />
        </div>
      )}
    </div>
  )
}
