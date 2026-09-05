import HeroSection from "@/src/features/home/components/HeroSection";
import StyleCategories from "@/src/features/home/components/StyleCategories";
import FeaturedMoodboards from "@/src/features/home/components/FeaturedMoodboards";
import ShopBySpace from "@/src/features/home/components/ShopBySpace";
import FavoriteProducts from "@/src/features/home/components/FavoriteProducts";
import WhyChoose from "@/src/features/home/components/WhyChoose";
import CommunityBanner from "@/src/features/home/components/CommunityBanner";
import ComingSoonApps from "@/src/features/home/components/ComingSoonApps";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#faf6ee]">
      <HeroSection />
      <StyleCategories />
      <FeaturedMoodboards />
      <ShopBySpace />
      <FavoriteProducts />
      <WhyChoose />
      <CommunityBanner />
      <ComingSoonApps />
    </main>
  );
}
