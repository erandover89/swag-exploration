import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/mockData';
import { DesignToolPage } from './designTool/DesignToolPage';

export function SwagDesignTool() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const product = PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0];
  const locationState = location.state as { from?: string; drillDesignId?: string } | null;

  // Derive the lookbook this product is being edited within.
  // Priority: explicit drillDesignId (from MyDesigns) > from-path extraction (from DesignWorkspace)
  const fromPath = locationState?.from;
  const lookbookId =
    locationState?.drillDesignId ??
    (fromPath?.startsWith('/designs/') ? fromPath.replace('/designs/', '') : null);

  const handleClose = () => navigate(-1);

  const approveMode = fromPath?.startsWith('/swag-builder') ?? false;
  const handleSave = fromPath && !approveMode
    ? (pickedLookbookId?: string) => {
        // Catalog context: no lookbookId was set, user just picked a design → return to
        // product modal in "ready" mode with the picked design as background.
        if (pickedLookbookId && !fromPath.startsWith('/designs/')) {
          navigate(`/product/${product.id}`, {
            state: {
              backgroundLocation: { pathname: `/designs/${pickedLookbookId}` },
              from: `/designs/${pickedLookbookId}`,
            },
            replace: true,
          });
        } else {
          navigate(fromPath, { replace: true });
        }
      }
    : undefined;

  return (
    <DesignToolPage
      product={product}
      lookbookId={lookbookId}
      onClose={handleClose}
      onSave={handleSave}
      approveMode={approveMode}
    />
  );
}
