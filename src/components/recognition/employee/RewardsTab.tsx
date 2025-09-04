import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gift, Wallet, History, ShoppingCart, Star, ExternalLink, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface RewardItem {
  id: string
  name: string
  description: string
  points: number
  category: 'gift-cards' | 'experiences' | 'merchandise' | 'charity'
  image: string
  available: boolean
  vendor?: string
}

interface RedemptionHistory {
  id: string
  rewardName: string
  points: number
  status: 'pending' | 'approved' | 'delivered' | 'rejected'
  requestDate: string
  deliveryDate?: string
  notes?: string
}

export const RewardsTab = () => {
  const [activeTab, setActiveTab] = useState('catalog')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const currentBalance = 385
  const lifetimeEarned = 1247
  const lifetimeRedeemed = 862

  const rewardItems: RewardItem[] = [
    {
      id: '1',
      name: 'Amazon Gift Card - $25',
      description: 'Perfect for online shopping across millions of products',
      points: 250,
      category: 'gift-cards',
      image: '/api/placeholder/200/120',
      available: true,
      vendor: 'Amazon'
    },
    {
      id: '2',
      name: 'Starbucks Gift Card - $10',
      description: 'Enjoy your favorite coffee and treats',
      points: 100,
      category: 'gift-cards',
      image: '/api/placeholder/200/120',
      available: true,
      vendor: 'Starbucks'
    },
    {
      id: '3',
      name: 'Company Branded Water Bottle',
      description: 'High-quality insulated water bottle with company logo',
      points: 150,
      category: 'merchandise',
      image: '/api/placeholder/200/120',
      available: true
    },
    {
      id: '4',
      name: 'Team Lunch Experience',
      description: 'Team lunch at a premium restaurant for 4 people',
      points: 400,
      category: 'experiences',
      image: '/api/placeholder/200/120',
      available: false
    },
    {
      id: '5',
      name: 'Charity Donation - $50',
      description: 'Donate to your choice of pre-approved charities',
      points: 300,
      category: 'charity',
      image: '/api/placeholder/200/120',
      available: true
    }
  ]

  const redemptionHistory: RedemptionHistory[] = [
    {
      id: '1',
      rewardName: 'Amazon Gift Card - $25',
      points: 250,
      status: 'delivered',
      requestDate: '2024-01-10',
      deliveryDate: '2024-01-12',
      notes: 'Gift card code sent via email'
    },
    {
      id: '2',
      rewardName: 'Starbucks Gift Card - $10',
      points: 100,
      status: 'approved',
      requestDate: '2024-01-08',
      notes: 'Processing for delivery'
    },
    {
      id: '3',
      rewardName: 'Team Lunch Experience',
      points: 400,
      status: 'pending',
      requestDate: '2024-01-05',
      notes: 'Awaiting manager approval'
    },
    {
      id: '4',
      rewardName: 'Company Branded Water Bottle',
      points: 150,
      status: 'rejected',
      requestDate: '2023-12-28',
      notes: 'Out of stock - points refunded'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Categories', count: rewardItems.length },
    { id: 'gift-cards', name: 'Gift Cards', count: rewardItems.filter(r => r.category === 'gift-cards').length },
    { id: 'experiences', name: 'Experiences', count: rewardItems.filter(r => r.category === 'experiences').length },
    { id: 'merchandise', name: 'Merchandise', count: rewardItems.filter(r => r.category === 'merchandise').length },
    { id: 'charity', name: 'Charity', count: rewardItems.filter(r => r.category === 'charity').length }
  ]

  const filteredRewards = selectedCategory === 'all' 
    ? rewardItems 
    : rewardItems.filter(item => item.category === selectedCategory)

  const handleRedeem = (reward: RewardItem) => {
    if (currentBalance < reward.points) {
      toast.error('Insufficient points for this reward')
      return
    }
    
    toast.success(`Redemption request submitted for ${reward.name}`)
  }

  const getStatusIcon = (status: RedemptionHistory['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'approved':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: RedemptionHistory['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentBalance}</div>
            <p className="text-xs text-muted-foreground">Available points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Earned</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lifetimeEarned}</div>
            <p className="text-xs text-muted-foreground">Total points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lifetimeRedeemed}</div>
            <p className="text-xs text-muted-foreground">Total points used</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards
          </CardTitle>
          <CardDescription>Redeem your points for exciting rewards and experiences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="catalog">Catalog</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => (
                  <Card key={reward.id} className={`hover:shadow-lg transition-shadow ${!reward.available ? 'opacity-60' : ''}`}>
                    <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                      <img 
                        src={reward.image} 
                        alt={reward.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-medium">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        {reward.vendor && (
                          <p className="text-xs text-muted-foreground mt-1">by {reward.vendor}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {reward.points} points
                        </Badge>
                        {!reward.available && (
                          <Badge variant="outline" className="text-red-600">
                            Unavailable
                          </Badge>
                        )}
                      </div>

                      <Button 
                        className="w-full" 
                        disabled={!reward.available || currentBalance < reward.points}
                        onClick={() => handleRedeem(reward)}
                      >
                        {!reward.available ? (
                          'Out of Stock'
                        ) : currentBalance < reward.points ? (
                          `Need ${reward.points - currentBalance} more points`
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Redeem
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredRewards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No rewards available in this category
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                {redemptionHistory.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.rewardName}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1 capitalize">{item.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Requested: {format(new Date(item.requestDate), 'MMM d, yyyy')}
                              </span>
                              {item.deliveryDate && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Delivered: {format(new Date(item.deliveryDate), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>

                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="font-semibold">{item.points} pts</div>
                          {item.status === 'delivered' && (
                            <Button variant="ghost" size="sm" className="mt-2">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {redemptionHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No redemption history yet
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}