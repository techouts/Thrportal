import React, { useState } from 'react'
import { Users, MessageSquare, ChevronLeft, ChevronRight, Vote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface OrgPulseWidgetProps {
  onVote?: (pollId: string, optionId: string) => void
}

export function OrgPulseWidget({ onVote }: OrgPulseWidgetProps) {
  const [showQuote, setShowQuote] = useState(true)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  
  const quotes = [
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" }
  ]

  const currentQuote = quotes[currentQuoteIndex]

  const poll = {
    id: '1',
    question: 'Preferred WFH Schedule?',
    options: [
      { id: 'opt1', text: 'Mon & Fri', pct: 45 },
      { id: 'opt2', text: 'Tue & Thu', pct: 30 },
      { id: 'opt3', text: 'Wed only', pct: 25 }
    ],
    participation: 78
  }

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
  }

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length)
  }

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Organization
          </div>
          <div className="flex gap-1">
            <Button
              variant={showQuote ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowQuote(true)}
              className="h-6 px-2 text-xs"
            >
              Quote
            </Button>
            <Button
              variant={!showQuote ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowQuote(false)}
              className="h-6 px-2 text-xs"
            >
              Poll
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showQuote ? (
          // Daily Quote View
          <div className="space-y-3">
            <div className="text-center space-y-2">
              <blockquote className="text-sm italic text-muted-foreground leading-relaxed">
                "{currentQuote.text}"
              </blockquote>
              <p className="text-xs font-medium">— {currentQuote.author}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevQuote}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <div className="flex gap-1">
                {quotes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentQuoteIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={nextQuote}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          // Active Poll View
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{poll.question}</span>
                <Badge variant="secondary" className="text-xs">
                  {poll.participation}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                {poll.options.map((option) => (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{option.text}</span>
                      <span className="text-muted-foreground">{option.pct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={option.pct} className="flex-1 h-1.5" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onVote?.(poll.id, option.id)}
                      >
                        <Vote className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}