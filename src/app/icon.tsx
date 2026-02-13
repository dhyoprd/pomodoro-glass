import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 128,
          background: 'linear-gradient(135deg, #2a145f 0%, #7c3aed 100%)',
          position: 'relative',
          color: '#ffffff',
          fontSize: 220,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        ⏳
      </div>
    ),
    size,
  );
}
