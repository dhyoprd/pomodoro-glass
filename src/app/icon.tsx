import { ImageResponse } from 'next/og';

import { BrandIcon } from './brandIcon';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<BrandIcon glyphSize={286} cornerRadius={128} />, size);
}
