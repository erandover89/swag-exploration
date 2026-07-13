import { useReducer, useCallback } from 'react';
import type {
  DesignState, DesignEditorState, DesignLayer, TextLayer, PrintableArea,
} from './types';

// ── Alignment type ────────────────────────────────────────────────────────────

export type AlignmentType = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';

// ── Action types ──────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_LAYER';      layer: DesignLayer }
  | { type: 'UPDATE_LAYER';   id: string; patch: Partial<DesignLayer> }
  | { type: 'DELETE_LAYER';   id: string }
  | { type: 'DUPLICATE_LAYER';id: string }
  | { type: 'REORDER_LAYERS'; ids: string[] }
  | { type: 'SELECT_LAYER';   id: string | null }
  | { type: 'SET_ZOOM';       zoom: number }
  | { type: 'SET_BG_COLOR';   color: string | null }
  | { type: 'ALIGN_LAYER';    alignment: AlignmentType; printableArea: PrintableArea }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// ── Pure state mutation helpers ───────────────────────────────────────────────

function reassignZIndices(layers: DesignLayer[]): DesignLayer[] {
  return layers.map((l, i) => ({ ...l, zIndex: i }));
}

function applyToPresent(
  state: DesignEditorState,
  fn: (s: DesignState) => DesignState,
): DesignEditorState {
  const next = fn(state.present);
  return {
    present: next,
    past: [...state.past, state.present].slice(-50),
    future: [],
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: DesignEditorState, action: Action): DesignEditorState {
  switch (action.type) {

    case 'ADD_LAYER':
      return applyToPresent(state, s => ({
        ...s,
        selectedLayerId: action.layer.id,
        layers: reassignZIndices([...s.layers, { ...action.layer, zIndex: s.layers.length }]),
      }));

    case 'UPDATE_LAYER':
      return applyToPresent(state, s => ({
        ...s,
        layers: s.layers.map(l => l.id === action.id ? { ...l, ...action.patch } as DesignLayer : l),
      }));

    case 'DELETE_LAYER':
      return applyToPresent(state, s => ({
        ...s,
        selectedLayerId: s.selectedLayerId === action.id ? null : s.selectedLayerId,
        layers: reassignZIndices(s.layers.filter(l => l.id !== action.id)),
      }));

    case 'DUPLICATE_LAYER': {
      const src = state.present.layers.find(l => l.id === action.id);
      if (!src) return state;
      const clone: DesignLayer = { ...src, id: `layer-${Date.now()}`, x: src.x + 20, y: src.y + 20 };
      return applyToPresent(state, s => ({
        ...s,
        selectedLayerId: clone.id,
        layers: reassignZIndices([...s.layers, clone]),
      }));
    }

    case 'REORDER_LAYERS':
      return applyToPresent(state, s => {
        const ordered = action.ids
          .map(id => s.layers.find(l => l.id === id))
          .filter(Boolean) as DesignLayer[];
        return { ...s, layers: reassignZIndices(ordered) };
      });

    case 'SELECT_LAYER':
      return { ...state, present: { ...state.present, selectedLayerId: action.id } };

    case 'SET_ZOOM':
      return { ...state, present: { ...state.present, zoom: action.zoom } };

    case 'SET_BG_COLOR':
      return { ...state, present: { ...state.present, backgroundColor: action.color } };

    case 'ALIGN_LAYER': {
      const { alignment, printableArea: pa } = action;
      const selId = state.present.selectedLayerId;
      if (!selId) return state;
      const layer = state.present.layers.find(l => l.id === selId);
      if (!layer) return state;

      let patch: Partial<DesignLayer> = {};
      switch (alignment) {
        case 'left':     patch = { x: pa.x }; break;
        case 'center-h': patch = { x: pa.x + (pa.width - layer.width) / 2 }; break;
        case 'right':    patch = { x: pa.x + pa.width - layer.width }; break;
        case 'top':      patch = { y: pa.y }; break;
        case 'center-v': patch = { y: pa.y + (pa.height - layer.height) / 2 }; break;
        case 'bottom':   patch = { y: pa.y + pa.height - layer.height }; break;
      }
      return applyToPresent(state, s => ({
        ...s,
        layers: s.layers.map(l => l.id === selId ? { ...l, ...patch } as DesignLayer : l),
      }));
    }

    case 'UNDO': {
      if (!state.past.length) return state;
      const prev = state.past[state.past.length - 1];
      return {
        present: prev,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, 50),
      };
    }

    case 'REDO': {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        present: next,
        past: [...state.past, state.present].slice(-50),
        future: state.future.slice(1),
      };
    }

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDesignEditor(initial: DesignState) {
  const [state, dispatch] = useReducer(reducer, {
    present: initial,
    past: [],
    future: [],
  });

  const addLayer    = useCallback((layer: DesignLayer) => dispatch({ type: 'ADD_LAYER', layer }), []);
  const updateLayer = useCallback((id: string, patch: Partial<DesignLayer>) => dispatch({ type: 'UPDATE_LAYER', id, patch }), []);
  const deleteLayer = useCallback((id: string) => dispatch({ type: 'DELETE_LAYER', id }), []);
  const duplicateLayer = useCallback((id: string) => dispatch({ type: 'DUPLICATE_LAYER', id }), []);
  const reorderLayers  = useCallback((ids: string[]) => dispatch({ type: 'REORDER_LAYERS', ids }), []);
  const selectLayer    = useCallback((id: string | null) => dispatch({ type: 'SELECT_LAYER', id }), []);
  const setZoom        = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', zoom }), []);
  const setBackgroundColor = useCallback((color: string | null) => dispatch({ type: 'SET_BG_COLOR', color }), []);
  const alignLayer     = useCallback((alignment: AlignmentType, printableArea: PrintableArea) => dispatch({ type: 'ALIGN_LAYER', alignment, printableArea }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const updateTextLayer = useCallback(
    (id: string, patch: Partial<TextLayer>) => dispatch({ type: 'UPDATE_LAYER', id, patch: patch as Partial<DesignLayer> }),
    [],
  );

  return {
    state: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    addLayer,
    updateLayer,
    updateTextLayer,
    deleteLayer,
    duplicateLayer,
    reorderLayers,
    selectLayer,
    setZoom,
    setBackgroundColor,
    alignLayer,
    undo,
    redo,
  };
}
