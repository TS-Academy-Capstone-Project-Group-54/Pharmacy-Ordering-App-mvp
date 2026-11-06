import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgressBar } from "@/components/ui/scroll-progress";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BackToTop } from "@/components/ui/back-to-top";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { FloatingContactButton } from "@/components/ui/floating-contact";
import { RoutePersistence } from "@/components/route-persistence";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoutePersistence />
      <ScrollReveal />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ScrollProgressBar />
      <Header />
      <div className="md:pl-64">
        <main id="main-content" className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8 md:px-6">
          {children}
        </main>
        <Footer />
      </div>
      <BackToTop />
      <FloatingContactButton />
      <CookieBanner />
    </>
  );
}
