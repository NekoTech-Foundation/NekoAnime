
"use client"

import { useHomeData } from "@/hooks/use-home-data"
import { ScheduleSection } from "@/components/home/schedule-section"
import { RankingSection } from "@/components/home/ranking-section"
import { UpcomingSection } from "@/components/home/upcoming-section"
import { FeaturedSection } from "@/components/home/featured-section"
import { Spotlight } from "@/components/home/spotlight"
import { GlassPanel } from "@/components/ui/glass-panel"

export default function Home() {
  const { data, loading, error } = useHomeData()

  if (loading) {
     return (
        <div className="space-y-8 animate-pulse">
            <div className="h-[500px] w-full bg-white/5 rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl" />)}
                    </div>
                </div>
                <div className="lg:col-span-1 bg-white/5 h-[600px] rounded-2xl" />
            </div>
        </div>
     )
  }

  if (error) {
    // ... same error
    return <GlassPanel className="p-6 text-center text-red-400">{error}</GlassPanel>
  }

  if (!data) return null

  return (
    <div className="space-y-12">
      {/* Dynamic Spotlight Carousel */}
      <Spotlight items={data.nominate} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-3 space-y-12">
                
                {/* Schedule */}
                <ScheduleSection data={data.schedule} />

                {/* Latest Updates & Lists */}
                <FeaturedSection data={data} />

                {/* Upcoming */}
                <UpcomingSection data={data.preRelease} />
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1 space-y-8">
                <RankingSection data={data.ranking} />
                
                {/* Could add more sidebar widgets here like "Genres" */}
          </div>
      </div>
    </div>
  );
}
