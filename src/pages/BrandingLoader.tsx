import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ANIMATION_URL = 'https://mappsnet7.github.io/Snappy_ThreeJS_SwagGeneration/';
const MOCK_DURATION_SEC = 12;
// Navigate slightly after the mock finishes so the "ready" state is visible briefly
const NAV_DELAY_MS = (MOCK_DURATION_SEC + 2) * 1000;

export function BrandingLoader() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const locState = state as { logoUrl?: string; productIds?: string[]; collectionName?: string; destination?: string } | null;
  const logoUrl        = locState?.logoUrl ?? null;
  const productIds     = locState?.productIds;
  const collectionName = locState?.collectionName;
  const destination    = locState?.destination ?? '/collection/edit';

  const iframeSrc = `${ANIMATION_URL}?mock&mockDuration=${MOCK_DURATION_SEC}`;

  function doNavigate() {
    navigate(destination, { state: { logoUrl, productIds, collectionName } });
  }

  useEffect(() => {
    const t = setTimeout(doNavigate, NAV_DELAY_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <iframe
        src={iframeSrc}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        title="Creating your swag collection"
        allow="accelerometer; autoplay"
      />

      {/* Skip button — floats above the iframe */}
      <button
        onClick={doNavigate}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 32,
          zIndex: 10,
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.02em',
          padding: '6px 12px',
          borderRadius: 8,
          transition: 'color 0.2s',
          pointerEvents: 'auto',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
      >
        Skip →
      </button>
    </div>
  );
}
