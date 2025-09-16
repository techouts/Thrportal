export const getSLAHealthColor = (health: string): "default" | "secondary" | "destructive" => {
  switch (health) {
    case 'good':
      return 'default'
    case 'warning':
      return 'secondary'
    case 'critical':
    default:
      return 'destructive'
  }
}