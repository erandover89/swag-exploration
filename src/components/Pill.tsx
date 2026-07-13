// Pill / Status chip — from Unwrapped Design System (node 6027:3748)

export type PillColor = 'Green' | 'Blue' | 'Red' | 'Purple' | 'Yellow' | 'Gray';
export type PillSize  = 'Small' | 'Medium';
export type PillShape = 'Curved' | 'Round';

export interface PillProps {
  label: string;
  color?: PillColor;
  size?: PillSize;
  shape?: PillShape;
  showIcon?: boolean;
  className?: string;
}

const COLOR_TOKENS: Record<PillColor, { bg: string; border: string; text: string; dot: string }> = {
  Green:  { bg: '#effbf5', border: '#d6f5e7', text: '#006644', dot: '#006644' },
  Blue:   { bg: '#eaf1fa', border: '#d6e4f4', text: '#2864a8', dot: '#2864a8' },
  Red:    { bg: '#fcf2f2', border: '#fae8ed', text: '#bd0000', dot: '#bd0000' },
  Purple: { bg: '#f1ecfa', border: '#dbcff3', text: '#713fcf', dot: '#713fcf' },
  Yellow: { bg: '#fff6e5', border: '#f5ebe4', text: '#99670b', dot: '#99670b' },
  Gray:   { bg: '#f2f4f6', border: '#e6e9ee', text: '#1f3b5c', dot: '#1f3b5c' },
};

const SIZE_TOKENS: Record<PillSize, { height: string; px: string; fontSize: string; dot: string }> = {
  Small:  { height: '28px', px: '8px',  fontSize: '10px', dot: '6px' },
  Medium: { height: '36px', px: '10px', fontSize: '12px', dot: '8px' },
};

const SHAPE_TOKENS: Record<PillShape, Record<PillSize, string>> = {
  Curved: { Small: '4px',    Medium: '8px' },
  Round:  { Small: '1000px', Medium: '1000px' },
};

export function Pill({
  label,
  color = 'Green',
  size = 'Small',
  shape = 'Curved',
  showIcon = true,
  className,
}: PillProps) {
  const c = COLOR_TOKENS[color];
  const s = SIZE_TOKENS[size];
  const r = SHAPE_TOKENS[shape][size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        height: s.height,
        padding: `0 ${s.px}`,
        borderRadius: r,
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: s.fontSize,
        fontWeight: 700,
        color: c.text,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && (
        <span
          style={{
            width: s.dot,
            height: s.dot,
            borderRadius: '50%',
            backgroundColor: c.dot,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
}
