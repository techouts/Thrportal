import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { PostingCard } from '@/features/ijp/components/shared/PostingCard';
import { FiltersBar } from '@/features/ijp/components/shared/FiltersBar';
import { usePostings } from '@/features/ijp/hooks/useIjp';
import type { PostingFilters, IjpPosting } from '@/features/ijp/types';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IJPPage() {
  const [filters, setFilters] = useState<PostingFilters>({});
  const [activeTab, setActiveTab] = useState<"POSTINGS" | "RECOMMENDED" | "SAVED" | "MY_APPLICATIONS">("POSTINGS");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: postingsData, isLoading } = usePostings({
    ...filters,
    tab: activeTab === "MY_APPLICATIONS" ? undefined : activeTab,
  });

  const handleApply = (posting: IjpPosting) => {
    // Open application wizard
    console.log('Apply to posting:', posting.id);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Internal Job Postings"
        description="Explore internal opportunities and apply for roles within the organization"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="POSTINGS" data-testid="postings-tab">Postings</TabsTrigger>
            <TabsTrigger value="RECOMMENDED">Recommended</TabsTrigger>
            <TabsTrigger value="SAVED">Saved</TabsTrigger>
            <TabsTrigger value="MY_APPLICATIONS">My Applications</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="POSTINGS" className="space-y-4">
          <FiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            showRecommendedToggle={false}
          />
          
          <div data-testid="postings-list">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {postingsData?.data?.map((posting) => (
                  <PostingCard
                    key={posting.id}
                    posting={posting}
                    onApply={handleApply}
                    showMatchScore={false}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="RECOMMENDED" className="space-y-4">
          <FiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            showRecommendedToggle={true}
          />
          
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {postingsData?.data?.map((posting) => (
              <PostingCard
                key={posting.id}
                posting={posting}
                onApply={handleApply}
                showMatchScore={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="SAVED">
          <div className="text-center py-8 text-muted-foreground">
            No saved postings yet. Save postings to view them here.
          </div>
        </TabsContent>

        <TabsContent value="MY_APPLICATIONS">
          <div className="text-center py-8 text-muted-foreground">
            My Applications functionality coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}