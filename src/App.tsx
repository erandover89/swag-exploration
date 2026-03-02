import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TopBar, MainNav } from './components/TopBar';
import { SwagCatalog } from './pages/SwagCatalog';
import { ProductDetail } from './pages/ProductDetail';
import { SwagDesignTool } from './pages/SwagDesignTool';
import { CollectionBuilder } from './pages/CollectionBuilder';
import { SendGiftFlow } from './pages/SendGiftFlow';

function AppShell() {
  const location = useLocation();
  const hideBars = location.pathname === '/send';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideBars && <TopBar />}
      {!hideBars && <MainNav currentPage="swag" />}
      <div className="flex-1">
        <Routes>
          <Route path="/"               element={<SwagCatalog />} />
          <Route path="/catalog"        element={<SwagCatalog />} />
          <Route path="/product/:id"    element={<ProductDetail />} />
          <Route path="/design/:id"     element={<SwagDesignTool />} />
          <Route path="/collection/new" element={<CollectionBuilder />} />
          <Route path="/send"           element={<SendGiftFlow />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
