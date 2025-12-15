import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ScorecardPanel } from '@/components/assignments/ScorecardPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart3 } from 'lucide-react';

interface ScorecardMobileWrapperProps {
  type: 'project' | 'employee';
  data: any;
  show?: boolean;
}

export function ScorecardMobileWrapper({ type, data, show = true }: ScorecardMobileWrapperProps) {
  const isMobile = useIsMobile();

  if (!show) return null;

  // Desktop: render inline
  if (!isMobile) {
    return (
      <div className="col-span-1">
        <ScorecardPanel type={type} data={data} />
      </div>
    );
  }

  // Mobile: render as floating button with drawer
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-4 right-4 z-50 shadow-lg md:hidden"
          size="lg"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Scorecard
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="p-4 overflow-y-auto">
          <ScorecardPanel type={type} data={data} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
