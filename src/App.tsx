import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, type Location } from 'react-router-dom';
import { CompanyLogoProvider } from './context/CompanyLogoContext';
import { LookbookProvider } from './context/LookbookContext';
import { LogoBrandingOverlay } from './components/LogoBrandingOverlay';
import { TopBar, MainNav } from './components/TopBar';
import { useCompanyLogo } from './context/CompanyLogoContext';
import { SwagCatalog } from './pages/SwagCatalog';
import { SwagOverview, SwagStores } from './pages/SwagOverview';
import { MyDesigns } from './pages/MyDesigns';
import { DesignWorkspace } from './pages/DesignWorkspace';
import { ProductDetail } from './pages/ProductDetail';
import { SwagDesignTool } from './pages/SwagDesignTool';
import { CollectionBuilder } from './pages/CollectionBuilder';
import { CollectionDetail } from './pages/CollectionDetail';
import { BrandingLoader } from './pages/BrandingLoader';
import { SwagOverviewV2 } from './pages/SwagOverviewV2';
import { SendGiftFlow } from './pages/SendGiftFlow';
import { CollectionEditMode } from './pages/CollectionEditMode';
import { CollectionPublicPreview } from './pages/CollectionPublicPreview';
import { Shipments, Inventory } from './pages/Shipments';
import { ItemsSaved } from './pages/ItemsSaved';
import { FlowsPage } from './pages/FlowsPage';
import { MyCollections } from './pages/MyCollections';
import { BonuslyRewards } from './pages/BonuslyRewards';
import { DesignPublicView } from './pages/DesignPublicView';
import { CollectionPreview } from './pages/CollectionPreview';
import { DesignPublishPage } from './pages/DesignPublishPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppShell() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  const displayLocation = backgroundLocation ?? location;
  const hideBars = displayLocation.pathname === '/send' || displayLocation.pathname === '/generating' || displayLocation.pathname === '/collection/edit' || displayLocation.pathname === '/collection/preview' || displayLocation.pathname.startsWith('/preview/') || displayLocation.pathname.startsWith('/design/') || displayLocation.pathname.startsWith('/designs/') || displayLocation.pathname.startsWith('/share/');

  // Logo branding overlay — show whenever a new logo is uploaded (except on /generating which has its own)
  const { uploadCount, logoUrl } = useCompanyLogo();
  const prevUploadCount = useRef(uploadCount);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayLogoUrl, setOverlayLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (uploadCount > prevUploadCount.current && logoUrl && displayLocation.pathname !== '/generating') {
      setOverlayLogoUrl(logoUrl);
      setOverlayVisible(true);
    }
    prevUploadCount.current = uploadCount;
  }, [uploadCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!hideBars && <TopBar />}
      {!hideBars && <MainNav currentPage="swag" />}
      <div className="flex-1">
        {/* Main routes — rendered at background location when an overlay is active */}
        <Routes location={displayLocation}>
          <Route path="/"               element={<SwagOverview />} />
          <Route path="/swag"           element={<SwagOverview />} />
          <Route path="/catalog"        element={<SwagCatalog defaultTab="catalog" />} />
          <Route path="/brands"          element={<Navigate to="/designs" replace />} />
          <Route path="/designs"         element={<MyDesigns />} />
          <Route path="/designs/:id/publish" element={<DesignPublishPage />} />
          <Route path="/designs/:id"     element={<DesignWorkspace />} />
          <Route path="/inventory"      element={<Inventory />} />
          <Route path="/shipments"      element={<Shipments />} />
          <Route path="/stores"         element={<SwagStores />} />
          <Route path="/product/:id"    element={<ProductDetail />} />
          <Route path="/design/:id"     element={<SwagDesignTool />} />
          <Route path="/generating"         element={<BrandingLoader />} />
          <Route path="/collection/new"   element={<CollectionBuilder />} />
          <Route path="/collection/edit"  element={<CollectionEditMode />} />
          <Route path="/collection/:id"   element={<CollectionDetail />} />
          <Route path="/send"             element={<SendGiftFlow />} />
          <Route path="/swag-v2"          element={<SwagOverviewV2 />} />
          <Route path="/items/saved"        element={<ItemsSaved />} />
          <Route path="/flows"             element={<FlowsPage />} />
          <Route path="/my-collections"    element={<MyCollections />} />
          <Route path="/preview/:token"  element={<CollectionPublicPreview />} />
          <Route path="/bonusly"          element={<BonuslyRewards />} />
          <Route path="/share/:id"          element={<DesignPublicView />} />
          <Route path="/collection/preview" element={<CollectionPreview />} />
        </Routes>

        {/* Overlay routes — rendered on top when backgroundLocation is present */}
        {backgroundLocation && (
          <Routes>
            <Route path="/items/saved" element={<ItemsSaved />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        )}
      </div>

      {/* Dev: reset all data + flows reference */}
      <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-1.5">
        <a
          href="/flows"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white/70 hover:text-white transition-colors"
          style={{ background: 'rgba(1,39,84,0.35)', backdropFilter: 'blur(6px)' }}
          title="View all prototype flows"
        >
          ⊞ Flows
        </a>
        <button
          onClick={() => {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('snappy_'));
            keys.forEach(k => localStorage.removeItem(k));
            window.location.href = '/';
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/90 hover:text-white transition-colors"
          style={{ background: 'rgba(1,39,84,0.55)', backdropFilter: 'blur(6px)' }}
          title="Reset all prototype data (dev)"
        >
          ↺ Reset all
        </button>
      </div>

      {/* Logo branding overlay */}
      {overlayVisible && overlayLogoUrl && (
        <LogoBrandingOverlay
          logoUrl={overlayLogoUrl}
          onDismiss={() => setOverlayVisible(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CompanyLogoProvider>
        <LookbookProvider>
          <AppShell />
        </LookbookProvider>
      </CompanyLogoProvider>
    </BrowserRouter>
  );
}

export default App;
