import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DashboardResponse, LabelCount } from './types'

type BreakdownRow = DashboardResponse['nonBillableBreakdown'][number]

const COLOR_BAR = '#3b6d92'
const PIE_COLORS = ['#3b6d92', '#e1893a', '#5aaa46', '#c44545', '#7b4db0', '#d9b441', '#417db0', '#7a9e3f']

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[460px] pt-0">{children}</CardContent>
    </Card>
  )
}

export function TopClientsChart({ data }: { data: LabelCount[] }) {
  return (
    <ChartCard title="Top 10 Customers">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 140, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={200} tick={{ fontSize: 13 }} interval={0} />
          <Tooltip />
          <Bar dataKey="count" fill={COLOR_BAR} barSize={22}>
            <LabelList dataKey="count" position="right" style={{ fontSize: 13, fill: '#333', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CountryPieChart({ data }: { data: LabelCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <ChartCard title="Employees by Country">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%" cy="50%"
            outerRadius={140}
            labelLine
            label={(e) => `${e.label}: ${e.count} (${total ? Math.round((e.count / total) * 100) : 0}%)`}
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function DepartmentPieChart({ data }: { data: LabelCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <ChartCard title="Employees by Department">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%" cy="50%"
            outerRadius={140}
            labelLine
            label={(e) => `${e.count} (${total ? Math.round((e.count / total) * 100) : 0}%)`}
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function BillableByDepartmentChart({
  data,
}: {
  data: DashboardResponse['billableByDepartment']
}) {
  // Pivot to rows: [{ department, BILLABLE, NON_BILLABLE }]
  const map = new Map<string, { department: string; BILLABLE: number; NON_BILLABLE: number }>()
  for (const r of data) {
    const cur = map.get(r.department) || { department: r.department, BILLABLE: 0, NON_BILLABLE: 0 }
    cur[r.billable] = r.count
    map.set(r.department, cur)
  }
  const rows = Array.from(map.values()).sort((a, b) => (b.BILLABLE + b.NON_BILLABLE) - (a.BILLABLE + a.NON_BILLABLE))

  return (
    <ChartCard title="Billable vs Non-billable by Department">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 10, right: 40, left: 140, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="department" width={200} tick={{ fontSize: 13 }} interval={0} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="BILLABLE" stackId="a" fill="#3b6d92" barSize={22}>
            <LabelList dataKey="BILLABLE" position="insideRight" style={{ fontSize: 12, fill: '#fff', fontWeight: 600 }} />
          </Bar>
          <Bar dataKey="NON_BILLABLE" stackId="a" fill="#e1893a" barSize={22}>
            <LabelList dataKey="NON_BILLABLE" position="insideRight" style={{ fontSize: 12, fill: '#fff', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function StatusBucketsChart({ data }: { data: LabelCount[] }) {
  return (
    <ChartCard title="Headcount by Status">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval={0}
            angle={-30}
            textAnchor="end"
            height={120}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b6d92" barSize={36}>
            <LabelList dataKey="count" position="top" style={{ fontSize: 13, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function ClientProjectsChart({
  data,
  client,
}: {
  data: LabelCount[]
  client: string | null
}) {
  return (
    <ChartCard title={client ? `${client} Project Engagement` : 'Project Engagement'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 140, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={200} tick={{ fontSize: 13 }} interval={0} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b6d92" barSize={22}>
            <LabelList dataKey="count" position="right" style={{ fontSize: 13, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/**
 * Hierarchical bar chart — non-billable headcount grouped by Country → Department → Reason.
 * Matches the Excel-style 3-tier x-axis: bars on top, reason label beneath each bar,
 * then department and country group bars below.
 */
export function NonBillableBreakdownChart({ data }: { data: BreakdownRow[] }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title="Non-Billable Breakdown (Country → Department → Status)">
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No non-billable employees match the filters.
        </div>
      </ChartCard>
    )
  }

  // Pre-compute column groupings so each dept/country label spans multiple bars
  const countryGroups: Array<{ name: string; span: number }> = []
  const deptGroups: Array<{ name: string; span: number; country: string }> = []
  for (const r of data) {
    const c = countryGroups[countryGroups.length - 1]
    if (c && c.name === r.country) c.span += 1
    else countryGroups.push({ name: r.country, span: 1 })

    const d = deptGroups[deptGroups.length - 1]
    if (d && d.name === r.department && d.country === r.country) d.span += 1
    else deptGroups.push({ name: r.department, span: 1, country: r.country })
  }

  // Use the reason as the primary x-axis label (shown under each bar by recharts)
  const chartData = data.map((r, i) => ({
    key: `${r.country}|${r.department}|${r.reason}|${i}`,
    reason: r.reason,
    count: r.count,
    country: r.country,
    department: r.department,
  }))

  return (
    <ChartCard title="Non-Billable Breakdown (Country → Department → Status)">
      <div className="h-full flex flex-col">
        {/* Bars */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="reason" tick={false} axisLine />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const p: any = payload?.[0]?.payload
                  return p ? `${p.country} › ${p.department} › ${p.reason}` : ''
                }}
              />
              <Bar dataKey="count" fill="#3b6d92" barSize={34}>
                <LabelList dataKey="count" position="top" style={{ fontSize: 13, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hierarchical x-axis labels: reason → department → country */}
        <div className="px-[50px] pb-1 pt-1 text-[11px]">
          {/* row 1: reason labels under each bar */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
            {data.map((r, i) => (
              <div key={`r-${i}`} className="truncate text-center border-r last:border-r-0 px-1 font-medium" title={r.reason}>
                {r.reason}
              </div>
            ))}
          </div>
          {/* row 2: department groups */}
          <div className="grid mt-1" style={{ gridTemplateColumns: deptGroups.map((g) => `${g.span}fr`).join(' ') }}>
            {deptGroups.map((g, i) => (
              <div key={`d-${i}`} className="truncate text-center border-l border-r bg-muted/50 py-1 text-[11px]" title={g.name}>
                {g.name}
              </div>
            ))}
          </div>
          {/* row 3: country groups */}
          <div className="grid" style={{ gridTemplateColumns: countryGroups.map((g) => `${g.span}fr`).join(' ') }}>
            {countryGroups.map((g, i) => (
              <div key={`c-${i}`} className="truncate text-center border-l border-r bg-muted py-1 text-[12px] font-semibold" title={g.name}>
                {g.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  )
}
