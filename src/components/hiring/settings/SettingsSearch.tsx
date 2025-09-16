import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowRight } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResult {
  topTab: string
  subTab: string
  label: string
  description: string
  category: string
}

interface SettingsSearchProps {
  query: string
  onQueryChange: (query: string) => void
  onNavigate: (topTab: string, subTab: string) => void
}

export function SettingsSearch({ query, onQueryChange, onNavigate }: SettingsSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debouncedQuery = useDebounce(query, 250)

  const searchableSettings = useMemo(() => [
    // Performance
    { topTab: 'performance', subTab: 'targets', label: 'Targets', description: 'Recruiter and team targets, change log', category: 'Performance' },
    { topTab: 'performance', subTab: 'metrics', label: 'Metrics', description: 'KPI weights & performance scoring', category: 'Performance' },
    
    // Workflow
    { topTab: 'workflow', subTab: 'approvals', label: 'Approvals', description: 'JD approvals, offer approvals, rule engine', category: 'Workflow' },
    { topTab: 'workflow', subTab: 'feedback', label: 'Feedback', description: 'Interview feedback templates, nudges, reminders', category: 'Workflow' },
    { topTab: 'workflow', subTab: 'sla', label: 'SLA', description: 'Submission, feedback, interview schedule timers', category: 'Workflow' },
    { topTab: 'workflow', subTab: 'pipeline', label: 'Pipeline', description: 'Board controls, WIP limits, move policies', category: 'Workflow' },
    
    // Content
    { topTab: 'content', subTab: 'parser', label: 'Parser', description: 'JD/CV parser settings, field mappings', category: 'Content' },
    { topTab: 'content', subTab: 'reject-reasons', label: 'Reject Reasons', description: 'Lists, categories, localization', category: 'Content' },
    { topTab: 'content', subTab: 'offers', label: 'Offers', description: 'Offer Matrix, bands, currencies, guardrails', category: 'Content' },
    
    // Compliance
    { topTab: 'compliance', subTab: 'vendors', label: 'Vendors', description: 'BGV/vendor onboarding rules, documents', category: 'Compliance' },
    { topTab: 'compliance', subTab: 'data-audit', label: 'Data & Audit', description: 'DPDP/GDPR consent, retention, audit viewers', category: 'Compliance' },
    
    // Defaults
    { topTab: 'defaults', subTab: 'global', label: 'Global', description: 'Default SLA values, JD templates, comms templates', category: 'Defaults' },
    { topTab: 'defaults', subTab: 'notifications', label: 'Notifications', description: 'Channels, cadence, escalation flows', category: 'Defaults' }
  ], [])

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    
    const queryLower = debouncedQuery.toLowerCase()
    return searchableSettings.filter(setting => 
      setting.label.toLowerCase().includes(queryLower) ||
      setting.description.toLowerCase().includes(queryLower) ||
      setting.category.toLowerCase().includes(queryLower)
    ).slice(0, 6) // Limit to 6 results
  }, [debouncedQuery, searchableSettings])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || searchResults.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % searchResults.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length)
          break
        case 'Enter':
          e.preventDefault()
          if (searchResults[selectedIndex]) {
            const result = searchResults[selectedIndex]
            onNavigate(result.topTab, result.subTab)
            setIsOpen(false)
            onQueryChange('')
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchResults, selectedIndex, onNavigate, onQueryChange])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchResults])

  // Show/hide search results
  useEffect(() => {
    setIsOpen(debouncedQuery.trim().length > 0 && searchResults.length > 0)
  }, [debouncedQuery, searchResults])

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.topTab, result.subTab)
    setIsOpen(false)
    onQueryChange('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search settings..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10"
          onFocus={() => query && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {isOpen && searchResults.length > 0 && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
          <CardContent className="p-0">
            {searchResults.map((result, index) => (
              <div
                key={`${result.topTab}-${result.subTab}`}
                className={`p-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                  index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{result.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {debouncedQuery.trim() && searchResults.length === 0 && isOpen && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
          <CardContent className="p-4 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No settings found for "{debouncedQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}