import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface LeaveDonutChartProps {
  available: number;
  consumed: number;
  label?: string;
}

export function LeaveDonutChart({ available, consumed, label = 'Days Available' }: LeaveDonutChartProps) {
  const data = [
    { name: 'Available', value: Math.max(0, available) },
    { name: 'Consumed', value: Math.max(0, consumed) },
  ];

  const total = available + consumed;
  const hasData = total > 0;

  // Use CSS variable colors
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

  return (
    <div className="relative w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={hasData ? data : [{ name: 'Empty', value: 1 }]}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={hasData ? 2 : 0}
            dataKey="value"
            strokeWidth={0}
          >
            {hasData ? (
              data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))
            ) : (
              <Cell fill="hsl(var(--muted))" />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{available}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>

      {/* Legend */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Available</span>
          <span className="font-medium text-foreground">{available}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-muted-foreground">Consumed</span>
          <span className="font-medium text-foreground">{consumed}</span>
        </div>
      </div>
    </div>
  );
}
