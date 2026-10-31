export type PageSize = "A4" | "A5" | "A3" | "4x6" | "5x7" | "custom";
export type PresetId = "passport" | "a4" | "borderless";
export type PhotoBorderStyle = "solid" | "dashed" | "double";

export interface LayoutSettings {
  preset: PresetId;
  pageSize: PageSize;
  customWidth: number;
  customHeight: number;
  orientation: "portrait" | "landscape";
  photoWidth: number;
  photoHeight: number;
  quantity: number;
  margin: number;
  gap: number;
  background: string;
  border: boolean;
  borderWidthMm: number;
  borderColor: string;
  borderStyle: PhotoBorderStyle;
}

export interface PhotoAdjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  flipX: boolean;
  flipY: boolean;
  cropX: number;
  cropY: number;
}

export interface PlacedPhoto extends PhotoAdjustment {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ImageAsset {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

export const PAGE_DIMENSIONS: Record<PageSize, [number, number]> = {
  A4: [210, 297],
  A5: [148, 210],
  A3: [297, 420],
  "4x6": [101.6, 152.4],
  "5x7": [127, 177.8],
  custom: [210, 297],
};

export interface LayoutResult {
  photos: PlacedPhoto[];
  capacity: number;
  fits: boolean;
}

export function getPageDimensions(settings: LayoutSettings): [number, number] {
  const [baseWidth, baseHeight] = settings.pageSize === "custom"
    ? [settings.customWidth, settings.customHeight]
    : PAGE_DIMENSIONS[settings.pageSize];
  return settings.orientation === "portrait"
    ? [Math.min(baseWidth, baseHeight), Math.max(baseWidth, baseHeight)]
    : [Math.max(baseWidth, baseHeight), Math.min(baseWidth, baseHeight)];
}

export function calculateLayout(
  assets: ImageAsset[],
  settings: LayoutSettings,
): LayoutResult {
  if (!assets.length || settings.photoWidth <= 0 || settings.photoHeight <= 0) {
    return { photos: [], capacity: 0, fits: false };
  }

  const [pageWidth, pageHeight] = getPageDimensions(settings);
  const usableWidth = pageWidth - settings.margin * 2;
  const usableHeight = pageHeight - settings.margin * 2;
  const columns = Math.max(
    0,
    Math.floor((usableWidth + settings.gap) / (settings.photoWidth + settings.gap)),
  );
  const rows = Math.max(
    0,
    Math.floor((usableHeight + settings.gap) / (settings.photoHeight + settings.gap)),
  );
  const capacity = columns * rows;
  const count = Math.min(Math.floor(settings.quantity), capacity);
  const photos: PlacedPhoto[] = [];

  for (let index = 0; index < count; index += 1) {
    const asset = assets[index % assets.length];
    const row = Math.floor(index / columns);
    const column = index % columns;
    photos.push({
      id: crypto.randomUUID(),
      assetId: asset.id,
      x: settings.margin + column * (settings.photoWidth + settings.gap),
      y: settings.margin + row * (settings.photoHeight + settings.gap),
      width: settings.photoWidth,
      height: settings.photoHeight,
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: false,
      flipX: false,
      flipY: false,
      cropX: 50,
      cropY: 50,
    });
  }

  return { photos, capacity, fits: settings.quantity <= capacity };
}
