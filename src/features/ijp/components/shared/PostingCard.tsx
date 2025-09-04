import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bookmark, BookmarkCheck, MapPin, Building, Users, Star } from 'lucide-react';
import type { IjpPosting } from '../../types';
import { useSavePosting } from '../../hooks/useIjp';
import { cn } from '@/lib/utils';

interface PostingCardProps {
  posting: IjpPosting;
  onApply: (posting: IjpPosting) => void;
  showMatchScore?: boolean;
}

export function PostingCard({ posting, onApply, showMatchScore = false }: PostingCardProps) {
  const savePosting = useSavePosting();

  const handleSave = () => {
    savePosting.mutate({ id: posting.id, saved: !posting.isSaved });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(posting.visibilityEnd);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isNew = () => {
    const createdDate = new Date(posting.updatedAt);
    const today = new Date();
    const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 3;
  };

  return (
    <Card 
      className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
      data-testid="posting-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(posting.status)}>
                {posting.status}
              </Badge>
              {isNew() && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  New
                </Badge>
              )}
              {isExpiringSoon() && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Expiring Soon
                </Badge>
              )}
              {showMatchScore && posting.matchScore && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{posting.matchScore}% match</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {posting.title}
            </h3>
            <div className="text-sm text-muted-foreground">
              {posting.requisitionId} • {posting.level}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={savePosting.isPending}
            className="shrink-0"
          >
            {posting.isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{posting.bu} • {posting.dept}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{posting.location}</span>
          </div>
        </div>

        {posting.skills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 shrink-0" />
              <span>Skills Required</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {posting.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {posting.skills.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{posting.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {posting.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {posting.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-2 border-t">
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onApply(posting);
            }}
            disabled={posting.status !== 'OPEN'}
            data-testid="apply-btn"
          >
            {posting.status === 'OPEN' ? 'Apply Now' : 'Not Available'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}