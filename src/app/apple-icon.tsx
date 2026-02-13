import { ImageResponse } from 'next/og';

import { BrandIcon } from './brandIcon';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<BrandIcon glyphSize={104} cornerRadius={42} />, size);
}
