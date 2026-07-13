import { type SavedDesign } from '../context/DesignsContext';
import { type ImageLayer, type TextLayer } from '../pages/designTool/types';

interface Props {
  design: SavedDesign;
}

/**
 * Renders saved design layers (logo, graphics, text) as CSS overlays
 * on top of a product image. Coordinates are scaled from canvas space
 * to container space using percentages.
 */
export function DesignedProductPreview({ design }: Props) {
  const { layers, canvasWidth, canvasHeight } = design;

  return (
    <>
      {[...layers]
        .filter(l => l.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(layer => {
          const style: React.CSSProperties = {
            position: 'absolute',
            left:   `${(layer.x / canvasWidth)  * 100}%`,
            top:    `${(layer.y / canvasHeight) * 100}%`,
            width:  `${(layer.width  / canvasWidth)  * 100}%`,
            height: `${(layer.height / canvasHeight) * 100}%`,
            transform: `rotate(${layer.rotation}deg)`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          };

          if (layer.type === 'logo' || layer.type === 'graphic') {
            const img = layer as ImageLayer;
            return (
              <img
                key={layer.id}
                src={img.src}
                alt=""
                style={{
                  ...style,
                  objectFit: 'contain',
                  mixBlendMode: layer.type === 'logo' ? 'multiply' : 'normal',
                  opacity: 0.9,
                }}
              />
            );
          }

          if (layer.type === 'text') {
            const txt = layer as TextLayer;
            return (
              <div
                key={layer.id}
                style={{
                  ...style,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent:
                    txt.textAlign === 'center' ? 'center' :
                    txt.textAlign === 'right'  ? 'flex-end' : 'flex-start',
                  fontSize: `${(txt.fontSize / canvasHeight) * 100}cqh`,
                  fontFamily: txt.fontFamily,
                  fontWeight: txt.fontWeight,
                  color: txt.fillEnabled ? txt.fillColor : 'transparent',
                  WebkitTextStroke: txt.strokeEnabled
                    ? `${(txt.strokeWidth / canvasWidth) * 100}cqw ${txt.strokeColor}`
                    : undefined,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                }}
              >
                {txt.text}
              </div>
            );
          }

          return null;
        })}
    </>
  );
}
