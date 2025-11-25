import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Clock } from "lucide-react";
import { useSendNudge } from "../../hooks/usePerformance";
import { formatDistanceToNow } from "date-fns";

interface NudgeButtonProps {
  empId: string;
  type: "review" | "goal" | "meeting";
  lastNudgedAt?: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function NudgeButton({
  empId,
  type,
  lastNudgedAt,
  disabled = false,
  size = "sm",
  variant = "outline",
}: NudgeButtonProps) {
  const [isNudging, setIsNudging] = useState(false);
  const sendNudge = useSendNudge();

  const handleNudge = async () => {
    setIsNudging(true);
    try {
      await sendNudge.mutateAsync({ empId, type });
    } finally {
      setIsNudging(false);
    }
  };

  const canNudge = !disabled && !isNudging && (!lastNudgedAt || 
    Date.now() - new Date(lastNudgedAt).getTime() > 24 * 60 * 60 * 1000); // 24 hours

  const getNudgeLabel = () => {
    switch (type) {
      case "review": return "Nudge Review";
      case "goal": return "Nudge Goals";
      case "meeting": return "Nudge Meeting";
      default: return "Send Nudge";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size={size}
        variant={variant}
        onClick={handleNudge}
        disabled={!canNudge || isNudging}
      >
        <Send className="w-3 h-3 mr-1" />
        {getNudgeLabel()}
      </Button>
      
      {lastNudgedAt && (
        <Badge variant="secondary" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {formatDistanceToNow(new Date(lastNudgedAt), { addSuffix: true })}
        </Badge>
      )}
    </div>
  );
}