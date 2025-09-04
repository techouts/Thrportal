import { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { X, RotateCcw } from 'lucide-react'

interface FilterDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  onClear?: () => void
  onApply?: () => void
  testId?: string
}

export function FilterDrawer({
  isOpen,
  onOpenChange,
  title = "Filters",
  description = "Adjust filters to refine your results",
  children,
  onClear,
  onApply,
  testId = "filter-drawer"
}: FilterDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-96" data-test-id={testId}>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {children}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="flex gap-2">
            {onClear && (
              <Button
                variant="outline"
                onClick={onClear}
                className="flex-1"
                data-test-id={`${testId}-clear`}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            {onApply && (
              <Button
                onClick={onApply}
                className="flex-1"
                data-test-id={`${testId}-apply`}
              >
                Apply Filters
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}