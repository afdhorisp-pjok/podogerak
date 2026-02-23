import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCard } from './BadgeCard';
import { BADGES, getEarnedBadges, getCategoryLabel, Badge } from '@/lib/badgeData';
import { UserData } from '@/lib/workoutData';
import { Trophy, Flame, Layers, Star } from 'lucide-react';

interface BadgesSectionProps {
  user: UserData;
}

export const BadgesSection = ({ user }: BadgesSectionProps) => {
  const earnedBadges = getEarnedBadges(user);
  const earnedBadgeIds = earnedBadges.map(b => b.id);

  const categories: { key: Badge['category']; icon: React.ReactNode }[] = [
    { key: 'session', icon: <Trophy className="w-4 h-4" /> },
    { key: 'streak', icon: <Flame className="w-4 h-4" /> },
    { key: 'domain', icon: <Layers className="w-4 h-4" /> },
    { key: 'special', icon: <Star className="w-4 h-4" /> },
  ];

  const getBadgesByCategory = (category: Badge['category']) => {
    return BADGES.filter(b => b.category === category);
  };

  return (
    <Card className="animate-slide-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">🏅 Koleksi Badge</CardTitle>
          <BadgeUI variant="secondary" className="font-fredoka">
            {earnedBadges.length}/{BADGES.length}
          </BadgeUI>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            {categories.map(({ key, icon }) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                {icon}
                <span className="hidden sm:inline">{getCategoryLabel(key)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map(({ key }) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getBadgesByCategory(key).map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    user={user}
                    isEarned={earnedBadgeIds.includes(badge.id)}
                    size="sm"
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
