import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect, Transformer, Line } from 'react-konva';
import type Konva from 'konva';
import { type DesignLayer, type ImageLayer, type TextLayer, resolvePersonalizationText } from './types';

// ── Snap guide types ───────────────────────────────────────────────────────────

interface SnapGuide { orientation: 'h' | 'v'; position: number; }

function getSnapResult(
  draggedLayer: DesignLayer,
  node: Konva.Node,
  otherLayers: DesignLayer[],
  pa: { x: number; y: number; width: number; height: number },
  scale: number,
  threshold = 5,
): { x: number; y: number; guides: SnapGuide[] } {
  const nodeX = node.x();
  const nodeY = node.y();
  const w = draggedLayer.width;
  const h = draggedLayer.height;
  const snap = threshold / scale;

  // X snap targets: printable area edges + midpoint, plus other layer edges + midpoints
  const xTargets: number[] = [pa.x, pa.x + pa.width / 2, pa.x + pa.width];
  for (const l of otherLayers) {
    if (l.id === draggedLayer.id || !l.visible || l.locked) continue;
    xTargets.push(l.x, l.x + l.width / 2, l.x + l.width);
  }

  // Y snap targets
  const yTargets: number[] = [pa.y, pa.y + pa.height / 2, pa.y + pa.height];
  for (const l of otherLayers) {
    if (l.id === draggedLayer.id || !l.visible || l.locked) continue;
    yTargets.push(l.y, l.y + l.height / 2, l.y + l.height);
  }

  // Candidate x edges of dragged layer
  const xCandidates = [nodeX, nodeX + w / 2, nodeX + w];
  let bestX = nodeX;
  let xGuide: SnapGuide | null = null;
  let bestXDist = snap;

  for (const cand of xCandidates) {
    const offset = cand - nodeX; // how far this edge is from the layer origin
    for (const target of xTargets) {
      const dist = Math.abs(cand - target);
      if (dist < bestXDist) {
        bestXDist = dist;
        bestX = target - offset;
        xGuide = { orientation: 'v', position: target };
      }
    }
  }

  const yCandidates = [nodeY, nodeY + h / 2, nodeY + h];
  let bestY = nodeY;
  let yGuide: SnapGuide | null = null;
  let bestYDist = snap;

  for (const cand of yCandidates) {
    const offset = cand - nodeY;
    for (const target of yTargets) {
      const dist = Math.abs(cand - target);
      if (dist < bestYDist) {
        bestYDist = dist;
        bestY = target - offset;
        yGuide = { orientation: 'h', position: target };
      }
    }
  }

  const guides: SnapGuide[] = [];
  if (xGuide) guides.push(xGuide);
  if (yGuide) guides.push(yGuide);

  return { x: bestX, y: bestY, guides };
}

// ── Image node ────────────────────────────────────────────────────────────────

interface ImageNodeProps {
  layer: ImageLayer;
  allLayers: DesignLayer[];
  printableArea: { x: number; y: number; width: number; height: number };
  scale: number;
  onSelect: () => void;
  onChange: (patch: Partial<ImageLayer>) => void;
  onSnapGuides: (guides: SnapGuide[]) => void;
}

function ImageNode({ layer, allLayers, printableArea, scale, onSelect, onChange, onSnapGuides }: ImageNodeProps) {
  const nodeRef = useRef<Konva.Image>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = new window.Image();
    el.onload = () => setImg(el);
    el.onerror = () => setImg(null);
    el.src = layer.src;
  }, [layer.src]);

  if (!img) return null;

  return (
    <KonvaImage
      ref={nodeRef}
      id={layer.id}
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.visible ? (layer.opacity ?? 1) : 0.25}
      draggable={layer.visible && !layer.locked}
      listening={layer.visible && !layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={e => {
        const node = e.target;
        const { x, y, guides } = getSnapResult(layer, node, allLayers, printableArea, scale);
        node.x(x);
        node.y(y);
        onSnapGuides(guides);
      }}
      onDragEnd={e => {
        onSnapGuides([]);
        onChange({ x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const sx = node.scaleX();
        const sy = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * sx),
          height: Math.max(10, node.height() * sy),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

// ── Text node ─────────────────────────────────────────────────────────────────

interface TextNodeProps {
  layer: TextLayer;
  allLayers: DesignLayer[];
  printableArea: { x: number; y: number; width: number; height: number };
  scale: number;
  previewMode: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<TextLayer>) => void;
  onSnapGuides: (guides: SnapGuide[]) => void;
}

function TextNode({ layer, allLayers, printableArea, scale, previewMode, onSelect, onChange, onSnapGuides }: TextNodeProps) {
  const nodeRef = useRef<Konva.Text>(null);

  return (
    <KonvaText
      ref={nodeRef}
      id={layer.id}
      text={resolvePersonalizationText(layer.text, previewMode) || ' '}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fontStyle={layer.fontWeight === 'bold' ? 'bold' : 'normal'}
      align={layer.textAlign}
      fill={layer.fillEnabled ? layer.fillColor : 'rgba(0,0,0,0)'}
      stroke={layer.strokeEnabled ? layer.strokeColor : undefined}
      strokeWidth={layer.strokeEnabled ? layer.strokeWidth : 0}
      letterSpacing={layer.letterSpacing ?? 0}
      lineHeight={layer.lineHeight ?? 1.2}
      rotation={layer.rotation}
      opacity={layer.visible ? (layer.opacity ?? 1) : 0.25}
      draggable={layer.visible && !layer.locked}
      listening={layer.visible && !layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={e => {
        const node = e.target;
        const { x, y, guides } = getSnapResult(layer, node, allLayers, printableArea, scale);
        node.x(x);
        node.y(y);
        onSnapGuides(guides);
      }}
      onDragEnd={e => {
        onSnapGuides([]);
        onChange({ x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const sx = node.scaleX();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * sx),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

// ── Main canvas ───────────────────────────────────────────────────────────────

interface Props {
  layers: DesignLayer[];
  selectedLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  printableArea: { x: number; y: number; width: number; height: number };
  productImage: string;
  productColorHex: string;
  zoom: number;
  backgroundColor: string | null;
  stageRef?: React.RefObject<Konva.Stage | null>;
  previewMode?: boolean;
  hidePrintArea?: boolean;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<DesignLayer>) => void;
}

export function DesignCanvas({
  layers, selectedLayerId, canvasWidth, canvasHeight, printableArea,
  productImage, productColorHex, zoom, backgroundColor, stageRef, previewMode, hidePrintArea, onSelect, onUpdateLayer,
}: Props) {
  const internalRef = useRef<Konva.Stage | null>(null);
  const effectiveStageRef = stageRef ?? internalRef;
  const trRef = useRef<Konva.Transformer | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

  const scale = zoom / 100;
  const displayW = Math.round(canvasWidth * scale);
  const displayH = Math.round(canvasHeight * scale);
  const isPhoto = productImage.startsWith('/');

  const selectedLayer = layers.find(l => l.id === selectedLayerId) ?? null;

  // Keep transformer in sync with selected layer
  useEffect(() => {
    const tr = trRef.current;
    const stage = effectiveStageRef.current;
    if (!tr) return;

    if (!selectedLayerId || !stage || selectedLayer?.locked) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const node = stage.findOne(`#${selectedLayerId}`);
    if (node) {
      tr.nodes([node as Konva.Node]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedLayerId, layers, selectedLayer?.locked]);

  return (
    <div
      className="relative bg-white rounded-[24px] overflow-hidden select-none shrink-0"
      style={{
        width: `${displayW}px`,
        height: `${displayH}px`,
        boxShadow: '0px 32px 80px rgba(1,39,84,0.32), 0px 8px 24px rgba(1,39,84,0.16)',
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    >
      {/* Product background */}
      {isPhoto ? (
        <>
          <img
            src={productImage}
            alt="Product"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: productColorHex, opacity: 0.08 }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ background: `${productColorHex}20` }}
        >
          <span className="text-[120px] select-none" style={{ lineHeight: 1 }}>
            {productImage}
          </span>
        </div>
      )}

      {/* Konva Stage */}
      <Stage
        ref={effectiveStageRef as React.RefObject<Konva.Stage>}
        width={displayW}
        height={displayH}
        scaleX={scale}
        scaleY={scale}
        className="absolute inset-0"
        onMouseDown={e => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
      >
        <Layer>
          {/* Print area background color fill */}
          {backgroundColor && (
            <Rect
              x={printableArea.x}
              y={printableArea.y}
              width={printableArea.width}
              height={printableArea.height}
              fill={backgroundColor}
              listening={false}
            />
          )}

          {/* Snap guides — hidden in print preview */}
          {!hidePrintArea && snapGuides.map((g, i) =>
            g.orientation === 'v'
              ? <Line key={i} points={[g.position, 0, g.position, canvasHeight]} stroke="#3077c9" strokeWidth={1 / scale} listening={false} />
              : <Line key={i} points={[0, g.position, canvasWidth, g.position]} stroke="#3077c9" strokeWidth={1 / scale} listening={false} />
          )}

          {/* Printable area dashed rect — hidden in print preview */}
          {!hidePrintArea && (
            <Rect
              x={printableArea.x}
              y={printableArea.y}
              width={printableArea.width}
              height={printableArea.height}
              stroke="rgba(230,57,70,0.5)"
              strokeWidth={1.5 / scale}
              dash={[6 / scale, 4 / scale]}
              fill="transparent"
              listening={false}
            />
          )}

          {/* Design layers (sorted by zIndex) */}
          {[...layers]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(layer => {
              if (layer.type === 'logo' || layer.type === 'graphic') {
                return (
                  <ImageNode
                    key={layer.id}
                    layer={layer as ImageLayer}
                    allLayers={layers}
                    printableArea={printableArea}
                    scale={scale}
                    onSelect={() => onSelect(layer.id)}
                    onChange={patch => onUpdateLayer(layer.id, patch as Partial<DesignLayer>)}
                    onSnapGuides={setSnapGuides}
                  />
                );
              }
              if (layer.type === 'text') {
                return (
                  <TextNode
                    key={layer.id}
                    layer={layer as TextLayer}
                    allLayers={layers}
                    printableArea={printableArea}
                    scale={scale}
                    previewMode={previewMode ?? false}
                    onSelect={() => onSelect(layer.id)}
                    onChange={patch => onUpdateLayer(layer.id, patch as Partial<DesignLayer>)}
                    onSnapGuides={setSnapGuides}
                  />
                );
              }
              return null;
            })}

          {/* Transformer */}
          <Transformer
            ref={trRef as React.RefObject<Konva.Transformer>}
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="var(--snp-indigo-600)"
            anchorStroke="var(--snp-indigo-600)"
            anchorFill="#ffffff"
            rotateAnchorOffset={24}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
