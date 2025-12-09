
import { GlassPanel } from "@/components/ui/glass-panel";
import { Play } from "lucide-react";
import { FeaturedSection } from "@/components/home/featured-section";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: 'url(https://images7.alphacoders.com/132/1327170.png)' }} // Placeholder
        />

        <div className="absolute bottom-0 left-0 p-8 z-20 max-w-2xl">
           <GlassPanel className="p-6 backdrop-blur-xl bg-black/40 border-white/10">
              <h1 className="text-4xl font-bold font-caveat text-white mb-2">Frieren: Beyond Journey&apos;s End</h1>
              <p className="text-gray-200 line-clamp-2 mb-4">
                Pháp sư yêu tinh Frieren và những người bạn dũng cảm của cô đã đánh bại Quỷ vương và mang lại hòa bình cho vùng đất. Nhưng đó là chuyện của quá khứ...
              </p>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25">
                <Play className="w-5 h-5 fill-current" />
                Xem ngay
              </button>
           </GlassPanel>
        </div>
      </section>

      {/* Trending Section */}
      <FeaturedSection />
    </div>
  );
}
