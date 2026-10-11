import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { PCOptimizationSection } from './components/PCOptimizationSection';
import { ChatbotSection } from './components/ChatbotSection';
import { WebDevServicesSection } from './components/WebDevServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ProcessSection } from './components/ProcessSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { BlogSection } from './components/BlogSection';
import { TrackOrderSection } from './components/TrackOrderSection';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { RtdbAdminPanel } from './components/RtdbAdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { PoliciesModal } from './components/PoliciesModal';
import { DevDocsModal } from './components/DevDocsModal';
import { SiteProtection } from './components/SiteProtection';
import { OfferBar } from './components/OfferBar';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { ProductCompare } from './components/ProductCompare';
import { WhatsAppIcon } from './components/icons';
import { waLink } from './utils/whatsapp';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
    toast,
    siteSettings,
    products,
    t,
  } = useApp();

  const hasPublishedProducts = products.some((p) => p.isPublished);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-stone-800">
      <SiteProtection />
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-stone-900 text-white text-sm font-medium shadow-xl">
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navigation */}
      <OfferBar />
      <Navbar />

      {/* Main View Switching */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {activeTab === 'home' && (
          <div>
            <Hero />
            <WebDevServicesSection />
            <PortfolioSection />
            <PricingSection />
            <ProcessSection />
            <Testimonials />
            <FaqSection />

            {/* Shop — secondary, only when products exist */}
            {hasPublishedProducts && (
            <div className="border-t border-stone-200/70 bg-transparent">
              <div className="max-w-6xl mx-auto px-5 pt-10 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-stone-900">{t('sec.shop.t')}</h2>
                  <p className="text-sm text-stone-500 mt-1">{t('sec.shop.sub')}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setActiveTab('products');
                  }}
                  className="text-sm font-semibold text-emerald-700 underline underline-offset-4 shrink-0 hover:text-emerald-600"
                >
                  {t('sec.shop.all')}
                </button>
              </div>
              <ProductCatalog />
            </div>
            )}

            {/* CTA */}
            <section className="bg-transparent">
              <div className="max-w-6xl mx-auto px-5 pb-20">
                <div className="relative rounded-[2rem] overflow-hidden bg-stone-900 text-white p-10 sm:p-16 text-center">
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/20 blur-3xl pointer-events-none" />
                  <h3 className="relative text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">{t('cta.t')}</h3>
                  <p className="relative text-sm text-stone-400 mb-7">{t('cta.sub')}</p>
                  <a
                    href={waLink(siteSettings.whatsappNumber, 'Hello Sairah Labs! I need a website. Please share a free quote.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-block px-8 py-3.5 rounded-full bg-white text-stone-900 text-sm font-bold hover:bg-stone-200 transition"
                  >
                    {t('cta.btn')}
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: PRODUCTS CATALOG */}
        {activeTab === 'products' && <ProductCatalog />}

        {/* VIEW: PC OPTIMIZATION */}
        {activeTab === 'pc-optimization' && <PCOptimizationSection />}

        {/* VIEW: GAMING TOOLS (Category shortcut) */}
        {activeTab === 'gaming-tools' && (
          <div className="py-6">
            <ProductCatalog />
          </div>
        )}

        {/* VIEW: WINDOWS PANELS */}
        {activeTab === 'windows-panels' && (
          <div className="py-6">
            <ProductCatalog />
          </div>
        )}

        {/* VIEW: WEBSITES SHOP */}
        {activeTab === 'websites' && (
          <div className="py-6">
            <ProductCatalog />
          </div>
        )}

        {/* VIEW: AI CHATBOT */}
        {activeTab === 'chatbot' && <ChatbotSection />}

        {/* VIEW: CUSTOM DEVELOPMENT */}
        {activeTab === 'custom-dev' && <WebDevServicesSection />}

        {/* VIEW: PORTFOLIO */}
        {activeTab === 'portfolio' && <PortfolioSection />}

        {/* VIEW: BLOG */}
        {activeTab === 'blog' && <BlogSection />}

        {/* VIEW: TRACK ORDER */}
        {activeTab === 'track' && <TrackOrderSection />}

        {/* VIEW: CONTACT & FAQ */}
        {activeTab === 'contact' && <ContactSection />}

        {/* VIEW: RTDB ADMIN (separate Realtime Database panel) */}
        {activeTab === 'rtdb-admin' && <RtdbAdminPanel />}
      </main>

      {/* Slide-overs & Modals */}
      <CartDrawer />
      <ProductDetailModal />
      <StickyMobileCTA />
      <ProductCompare />
      <OrderSuccessModal />
      <OrderTrackerModal />
      <PoliciesModal />
      <DevDocsModal />

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
