import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SecurityConfig() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Security Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Security config component</p>
      </CardContent>
    </Card>
  );
}