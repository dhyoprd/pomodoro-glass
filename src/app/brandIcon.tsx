type BrandIconProps = {
  glyphSize: number;
  cornerRadius: number;
};

export function BrandIcon({ glyphSize, cornerRadius }: BrandIconProps) {
  const frame = Math.round(glyphSize * 0.1);
  const sand = Math.max(6, Math.round(glyphSize * 0.1));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: cornerRadius,
        background:
          'radial-gradient(circle at 20% 20%, #c4b5fd 0%, rgba(196,181,253,0) 45%), linear-gradient(145deg, #1d1140 0%, #6d28d9 50%, #8b5cf6 100%)',
      }}
    >
      <div
        style={{
          width: glyphSize,
          height: glyphSize,
          borderRadius: Math.round(glyphSize * 0.2),
          border: `${frame}px solid rgba(255,255,255,0.95)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.12) inset',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: Math.round(glyphSize * 0.68),
            height: Math.round(glyphSize * 0.68),
            borderTop: `${frame}px solid rgba(255,255,255,0.95)`,
            borderBottom: `${frame}px solid rgba(255,255,255,0.95)`,
            clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: Math.max(4, Math.round(glyphSize * 0.06)),
            height: Math.round(glyphSize * 0.16),
            borderRadius: 999,
            background: 'rgba(255,255,255,0.95)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: sand,
            height: sand,
            borderRadius: 999,
            background: '#fde68a',
            bottom: Math.round(glyphSize * 0.21),
            boxShadow: '0 0 16px rgba(253, 230, 138, 0.7)',
          }}
        />
      </div>
    </div>
  );
}
