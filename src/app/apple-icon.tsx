import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 42,
          background: 'linear-gradient(135deg, #2a145f 0%, #7c3aed 100%)',
          color: '#ffffff',
          fontSize: 82,
        }}
      >
        ⏳
      </div>
    ),
    size,
  );
}
