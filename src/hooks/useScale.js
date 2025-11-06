import { useWindowDimensions, PixelRatio } from 'react-native';

// Base guideline size (iPhone 6/7/8-ish). Tweak if you prefer another baseline.
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * useScale hook
 * Returns helpers to scale sizes responsively across screens.
 * s(size) -> horizontal scale
 * vs(size) -> vertical scale
 * ms(size, factor=0.5) -> moderate scale (mix between s and original)
 * text(size) -> scaled text size that respects PixelRatio
 */
export default function useScale() {
  const { width, height } = useWindowDimensions();

  const scale = width / guidelineBaseWidth;
  const verticalScale = height / guidelineBaseHeight;

  const s = (size) => Math.round(size * scale);
  const vs = (size) => Math.round(size * verticalScale);

  // moderateScale: mix between original and scaled size (factor between 0 and 1)
  const ms = (size, factor = 0.5) => Math.round(size + (s(size) - size) * factor);

  // text: scale but keep consistent with device pixel ratio
  const text = (size) => Math.round(PixelRatio.roundToNearestPixel(size * Math.min(scale, verticalScale)));

  return { width, height, scale, verticalScale, s, vs, ms, text };
}

// Named exports for direct usage without hook (provide width/height manually)
export const createScaler = (width, height) => {
  const scale = width / guidelineBaseWidth;
  const verticalScale = height / guidelineBaseHeight;
  const s = (size) => Math.round(size * scale);
  const vs = (size) => Math.round(size * verticalScale);
  const ms = (size, factor = 0.5) => Math.round(size + (s(size) - size) * factor);
  const text = (size) => Math.round(PixelRatio.roundToNearestPixel(size * Math.min(scale, verticalScale)));
  return { scale, verticalScale, s, vs, ms, text };
};
