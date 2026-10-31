import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  ImagePlus,
  LayoutGrid,
  Minus,
  Moon,
  Move,
  Plus,
  RotateCw,
  Sun,
  Trash2,
  Upload,
  Undo2,
  Redo2,
  X,
} from "lucide-react";
import {
  calculateLayout,
  getPageDimensions,
  type ImageAsset,
  type LayoutSettings,
  type PlacedPhoto,
  type PhotoBorderStyle,
  type PresetId,
  type PageSize,
} from "./layout";

const initialSettings: LayoutSettings = {
  preset: "passport",
  pageSize: "A4",
  customWidth: 210,
  customHeight: 297,
  orientation: "portrait",
  photoWidth: 35,
  photoHeight: 45,
  quantity: 8,
  margin: 10,
  gap: 3,
  background: "#ffffff",
  border: true,
  borderWidthMm: 0.25,
  borderColor: "#202a3a",
  borderStyle: "solid",
};

const presets: { id: PresetId; title: string; subtitle: string }[] = [
  { id: "passport", title: "Passport photos", subtitle: "35 × 45 mm · A4 sheet" },
  { id: "a4", title: "A4 photo sheet", subtitle: "Arrange photos on A4" },
  { id: "borderless", title: "Borderless A4", subtitle: "Full-page photo layout" },
];

const pageSizes: PageSize[] = ["A4", "A5", "A3", "4x6", "5x7", "custom"];

function makePhoto(assetId: string, x: number, y: number, settings: LayoutSettings): PlacedPhoto {
  return {
    id: crypto.randomUUID(),
    assetId,
    x,
    y,
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
  };
}

function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [photos, setPhotos] = useState<PlacedPhoto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const galleryDragActive = useRef(false);
  const undoStack = useRef<PlacedPhoto[][]>([]);
  const redoStack = useRef<PlacedPhoto[][]>([]);

  const [pageWidth, pageHeight] = getPageDimensions(settings);
  const selectedPhoto = photos.find((photo) => photo.id === selectedId) ?? null;
  const selectedAsset = selectedPhoto
    ? assets.find((asset) => asset.id === selectedPhoto.assetId)
    : null;
  const selectedCropRatio = selectedPhoto && selectedAsset
    ? Math.abs(selectedPhoto.width / selectedPhoto.height - selectedAsset.width / selectedAsset.height) < 0.005
      ? "original"
      : Math.abs(selectedPhoto.width / selectedPhoto.height - 1) < 0.005
        ? "1.000"
        : Math.abs(selectedPhoto.width / selectedPhoto.height - 0.75) < 0.005
          ? "0.750"
          : Math.abs(selectedPhoto.width / selectedPhoto.height - 0.8) < 0.005
            ? "0.800"
            : "custom"
    : "custom";
  const layoutPreview = useMemo(
    () => calculateLayout(assets, settings),
    [assets, settings],
  );
  const pageTitle = settings.preset === "borderless"
    ? "Borderless A4"
    : settings.pageSize === "custom"
      ? "Custom Photo Sheet"
      : `${settings.pageSize} Photo Sheet`;
  const photoFilter = (photo: PlacedPhoto) =>
    `brightness(${photo.brightness}%) contrast(${photo.contrast}%) saturate(${photo.saturation}%) grayscale(${photo.grayscale ? 100 : 0}%)`;

  const commitPhotos = useCallback((next: PlacedPhoto[]) => {
    undoStack.current.push(photos);
    if (undoStack.current.length > 40) undoStack.current.shift();
    redoStack.current = [];
    setPhotos(next);
  }, [photos]);

  const updatePhoto = (id: string, changes: Partial<PlacedPhoto>) => {
    commitPhotos(photos.map((photo) => photo.id === id ? { ...photo, ...changes } : photo));
  };

  const updateSetting = <K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => {
    const next = { ...settings, [key]: value };
    const pageDimensionChanged = ["pageSize", "orientation", "customWidth", "customHeight"].includes(key);
    if (next.preset === "borderless" && pageDimensionChanged) {
      const [width, height] = getPageDimensions(next);
      next.photoWidth = width;
      next.photoHeight = height;
      commitPhotos(calculateLayout(assets, next).photos);
    }
    setSettings(next);
  };

  const arrangePhotos = () => {
    const result = calculateLayout(assets, settings);
    if (result.photos.length === 0) {
      setNotice(assets.length ? "Those photo dimensions do not fit on this page." : "Upload photos before arranging the sheet.");
      return;
    }
    commitPhotos(result.photos);
    setSelectedId(null);
    if (!result.fits) {
      setNotice(`Only ${result.capacity} photos fit. Reduce the quantity or choose a larger page.`);
    } else {
      setNotice(`${result.photos.length} photos arranged on ${settings.pageSize}.`);
    }
  };

  const loadFiles = async (files: FileList | File[]) => {
    const errors: string[] = [];
    const valid = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        errors.push(`${file.name}: use a JPG, PNG, or WebP image.`);
        return false;
      }
      if (file.size > 30 * 1024 * 1024) {
        errors.push(`${file.name}: files must be smaller than 30 MB.`);
        return false;
      }
      return true;
    });
    const loaded: ImageAsset[] = [];
    for (const file of valid) {
      const url = URL.createObjectURL(file);
      try {
        const dimensions = await new Promise<[number, number]>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve([image.naturalWidth, image.naturalHeight]);
          image.onerror = () => reject(new Error("This image could not be decoded."));
          image.src = url;
        });
        loaded.push({
          id: crypto.randomUUID(),
          name: file.name,
          url,
          width: dimensions[0],
          height: dimensions[1],
        });
      } catch {
        URL.revokeObjectURL(url);
        errors.push(`${file.name}: this image appears to be damaged or unsupported.`);
      }
    }
    if (!loaded.length) {
      if (errors.length) setNotice(errors.join(" "));
      return;
    }
    const combined = [...assets, ...loaded];
    setAssets(combined);
    setSelectedAssetId(loaded[0].id);
    if (photos.length === 0) {
      const result = calculateLayout(combined, settings);
      setPhotos(result.photos);
      if (result.photos.length) {
        setNotice([`${result.photos.length} photos arranged. You can move them on the sheet.`, ...errors].join(" "));
      } else if (errors.length) {
        setNotice(errors.join(" "));
      }
    } else {
      setNotice([`${loaded.length} image${loaded.length === 1 ? "" : "s"} added to your gallery.`, ...errors].join(" "));
    }
  };

  const removeAsset = (assetId: string) => {
    const asset = assets.find((item) => item.id === assetId);
    if (asset) URL.revokeObjectURL(asset.url);
    setAssets((current) => current.filter((item) => item.id !== assetId));
    commitPhotos(photos.filter((photo) => photo.assetId !== assetId));
    if (selectedAssetId === assetId) setSelectedAssetId(null);
    if (photos.some((photo) => photo.id === selectedId && photo.assetId === assetId)) setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedPhoto) return;
    const duplicate = { ...selectedPhoto, id: crypto.randomUUID(), x: selectedPhoto.x + 5, y: selectedPhoto.y + 5 };
    commitPhotos([...photos, duplicate]);
    setSelectedId(duplicate.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commitPhotos(photos.filter((photo) => photo.id !== selectedId));
    setSelectedId(null);
  };

  const undo = useCallback(() => {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push(photos);
    setPhotos(previous);
  }, [photos]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(photos);
    setPhotos(next);
  }, [photos]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.tagName === "INPUT" || target?.tagName === "SELECT" || target?.tagName === "TEXTAREA";
      if (editing) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelected();
      } else if (event.key === "Escape") {
        setSelectedId(null);
        setShowHelp(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const latestAssets = useRef(assets);
  useEffect(() => { latestAssets.current = assets; }, [assets]);
  useEffect(() => () => latestAssets.current.forEach((asset) => URL.revokeObjectURL(asset.url)), []);

  const startPhotoDrag = (
    event: ReactPointerEvent<HTMLElement>,
    photo: PlacedPhoto,
    mode: "move" | "resize",
  ) => {
    if (galleryDragActive.current) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(photo.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const base = { ...photo };
    const rect = paperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) * pageWidth / rect.width;
      const dy = (moveEvent.clientY - startY) * pageHeight / rect.height;
      setPhotos((current) => current.map((item) => {
        if (item.id !== base.id) return item;
        if (mode === "move") {
          return {
            ...item,
            x: Math.max(0, Math.min(pageWidth - item.width, base.x + dx)),
            y: Math.max(0, Math.min(pageHeight - item.height, base.y + dy)),
          };
        }
        const scale = Math.max(
          10 / base.width,
          (base.width + dx) / base.width,
          (base.height + dy) / base.height,
        );
        const maxScale = Math.min(
          (pageWidth - base.x) / base.width,
          (pageHeight - base.y) / base.height,
        );
        const boundedScale = Math.min(scale, maxScale);
        return {
          ...item,
          width: base.width * boundedScale,
          height: base.height * boundedScale,
        };
      }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      undoStack.current.push(photos);
      redoStack.current = [];
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    galleryDragActive.current = false;
    setDragging(false);
    const assetId = event.dataTransfer.getData("text/plain");
    const asset = assets.find((item) => item.id === assetId);
    const rect = paperRef.current?.getBoundingClientRect();
    if (!asset || !rect) return;
    const targetPhotoId = (event.target as HTMLElement).closest<HTMLElement>("[data-photo-id]")?.dataset.photoId;
    if (targetPhotoId) {
      commitPhotos(photos.map((photo) => photo.id === targetPhotoId
        ? { ...photo, assetId, brightness: 100, contrast: 100, saturation: 100, grayscale: false, flipX: false, flipY: false, cropX: 50, cropY: 50 }
        : photo));
      setSelectedId(targetPhotoId);
      setSelectedAssetId(asset.id);
      return;
    }
    const x = Math.max(0, (event.clientX - rect.left) * pageWidth / rect.width - settings.photoWidth / 2);
    const y = Math.max(0, (event.clientY - rect.top) * pageHeight / rect.height - settings.photoHeight / 2);
    const photo = makePhoto(assetId, Math.min(x, pageWidth - settings.photoWidth), Math.min(y, pageHeight - settings.photoHeight), settings);
    commitPhotos([...photos, photo]);
    setSelectedId(photo.id);
  };

  const handlePreset = (preset: PresetId) => {
    const next = { ...settings, preset };
    if (preset === "passport") Object.assign(next, { pageSize: "A4" as PageSize, photoWidth: 35, photoHeight: 45, quantity: 8, margin: 10, gap: 3 });
    if (preset === "a4") Object.assign(next, { pageSize: "A4" as PageSize, photoWidth: 40, photoHeight: 50, quantity: 8, margin: 8, gap: 4 });
    if (preset === "borderless") Object.assign(next, { pageSize: "A4" as PageSize, photoWidth: 210, photoHeight: 297, quantity: 1, margin: 0, gap: 0 });
    setSettings(next);
    const result = calculateLayout(assets, next);
    if (result.photos.length) commitPhotos(result.photos);
    setSelectedId(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setNotice("");
    try {
      const { exportPdf } = await import("./pdf");
      const bytes = await exportPdf(assets, photos, settings);
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `starz-print-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice("Your print-ready PDF has been downloaded.");
    } catch (error) {
      setNotice(error instanceof Error ? `Export failed: ${error.message}` : "The PDF could not be exported.");
    } finally {
      setIsExporting(false);
    }
  };

  const changePhotoSize = (key: "width" | "height", value: number) => {
    if (selectedPhoto && Number.isFinite(value) && value > 0) {
      updatePhoto(selectedPhoto.id, key === "width" ? { width: value } : { height: value });
    }
  };

  return (
    <div className={`app-shell${darkMode ? " dark" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><span /></div>
          <div><strong>starz</strong><span>PRINT STUDIO</span></div>
        </div>
        <div className="project-title"><span className="status-dot" /> Untitled project <ChevronDown size={14} /></div>
        <div className="top-actions">
          <button className="icon-button" title="Undo (Ctrl+Z)" onClick={undo}><Undo2 size={17} /></button>
          <button className="icon-button" title="Redo (Ctrl+Y)" onClick={redo}><Redo2 size={17} /></button>
          <span className="top-divider" />
          <button className="icon-button" title="Toggle theme" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="button button-primary export-button" onClick={handleExport} disabled={isExporting || photos.length === 0}>
            <Download size={16} /> {isExporting ? "Preparing…" : "Export PDF"}
          </button>
        </div>
      </header>

      <main className={`workspace${leftPanelCollapsed ? " left-panel-collapsed" : ""}${rightPanelCollapsed ? " right-panel-collapsed" : ""}`}>
        <aside className={`left-panel${leftPanelCollapsed ? " is-collapsed" : ""}`}>
          <button
            type="button"
            className="panel-toggle"
            title={leftPanelCollapsed ? "Show photo library panel" : "Hide photo library panel"}
            aria-label={leftPanelCollapsed ? "Show photo library panel" : "Hide photo library panel"}
            aria-expanded={!leftPanelCollapsed}
            onClick={() => setLeftPanelCollapsed((collapsed) => !collapsed)}
          >
            {leftPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <div className="panel-content">
          <div className="panel-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>Design sheet</h2></div><button className="icon-button small" title="Help and keyboard shortcuts" onClick={() => setShowHelp(true)}><CircleHelp size={17} /></button></div>
          <button className="upload-button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void loadFiles(event.dataTransfer.files); }}>
            <Upload size={17} /><span><b>Upload photos</b><small>JPG, PNG or WebP · up to 30 MB</small></span><Plus size={17} />
          </button>
          <input ref={inputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { if (event.target.files) void loadFiles(event.target.files); event.target.value = ""; }} />

          <section className="panel-section gallery-section">
            <div className="section-title"><h3>Photo library <span className="count-badge">{assets.length}</span></h3><button className="text-button" onClick={() => inputRef.current?.click()}>Add photos</button></div>
            {assets.length ? (
              <div className="asset-grid">
                {assets.map((asset) => (
                  <div
                    className={`asset-card${selectedAssetId === asset.id ? " active" : ""}`}
                    key={asset.id}
                    draggable
                    onDragStart={(event) => { galleryDragActive.current = true; event.dataTransfer.setData("text/plain", asset.id); event.dataTransfer.effectAllowed = "copy"; }}
                    onDragEnd={() => { galleryDragActive.current = false; }}
                    onClick={() => setSelectedAssetId(asset.id)}
                    title={`${asset.name} · ${asset.width} × ${asset.height}px`}
                  >
                    <img src={asset.url} alt={asset.name} />
                    <button className="asset-remove" aria-label={`Remove ${asset.name}`} onClick={(event) => { event.stopPropagation(); removeAsset(asset.id); }}><X size={12} /></button>
                    <span className="asset-name">{asset.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <button className="empty-gallery" onClick={() => inputRef.current?.click()}>
                <ImagePlus size={20} /><span>Your photos will appear here</span><small>Choose images to get started</small>
              </button>
            )}
          </section>

          <section className="panel-section preset-section">
            <div className="section-title"><h3>Quick presets</h3></div>
            <div className="preset-list">
              {presets.map((preset) => (
                <button className={`preset-card${settings.preset === preset.id ? " active" : ""}`} key={preset.id} onClick={() => handlePreset(preset.id)}>
                  <span className={`preset-icon ${preset.id}`}><LayoutGrid size={17} /></span>
                  <span className="preset-copy"><b>{preset.title}</b><small>{preset.subtitle}</small></span>
                  {settings.preset === preset.id && <Check size={16} className="preset-check" />}
                </button>
              ))}
            </div>
            <div className="tip-card"><span className="tip-icon"><CircleHelp size={15} /></span><span><b>Print tip</b><small>Borderless printing depends on your printer and driver settings.</small></span></div>
          </section>

          <section className="panel-section page-section">
            <div className="section-title"><h3>Page setup</h3></div>
            <label className="field-label">Paper size</label>
            <div className="select-wrap"><select value={settings.pageSize} onChange={(event) => updateSetting("pageSize", event.target.value as PageSize)}>{pageSizes.map((size) => <option key={size} value={size}>{size === "custom" ? "Custom size" : `${size}${size === "4x6" || size === "5x7" ? " in" : ""}`}</option>)}</select><ChevronDown size={14} /></div>
            {settings.pageSize === "custom" && <div className="two-fields custom-dimensions"><NumberField label="Page width" value={settings.customWidth} min={10} step={1} suffix="mm" onChange={(value) => updateSetting("customWidth", value)} /><NumberField label="Page height" value={settings.customHeight} min={10} step={1} suffix="mm" onChange={(value) => updateSetting("customHeight", value)} /></div>}
            <div className="orientation-control">
              <button className={settings.orientation === "portrait" ? "active" : ""} onClick={() => updateSetting("orientation", "portrait")}><span className="orientation-icon portrait" /> Portrait</button>
              <button className={settings.orientation === "landscape" ? "active" : ""} onClick={() => updateSetting("orientation", "landscape")}><span className="orientation-icon landscape" /> Landscape</button>
            </div>
            <div className="two-fields">
              <NumberField label="Margin" value={settings.margin} min={0} step={1} suffix="mm" onChange={(value) => updateSetting("margin", value)} />
              <NumberField label="Spacing" value={settings.gap} min={0} step={0.5} suffix="mm" onChange={(value) => updateSetting("gap", value)} />
            </div>
          </section>
          <div className="left-footer"><span className="privacy-dot" /> Your photos stay on this device</div>
          </div>
        </aside>

        <section className="canvas-area">
          <div className="canvas-toolbar">
            <div className="canvas-title"><span className="paper-icon"><FileImage size={16} /></span><div><b>{pageTitle}</b><small>{pageWidth} × {pageHeight} mm · {settings.orientation}</small></div></div>
            <div className="canvas-actions">
              <span className="photo-total"><LayoutGrid size={14} /> {photos.length} {photos.length === 1 ? "photo" : "photos"}</span>
              <button className="button button-secondary arrange-button" onClick={arrangePhotos}><LayoutGrid size={15} /> Auto arrange</button>
            </div>
          </div>
          <div className="canvas-stage">
            <div
              className="paper-wrap"
              style={{
                width: `${Math.min(620, pageWidth / pageHeight * 760) * zoom / 100}px`,
                maxWidth: `${zoom}%`,
                aspectRatio: `${pageWidth} / ${pageHeight}`,
              }}
            >
              <div
                ref={paperRef}
                className={`paper${dragging ? " drop-active" : ""}`}
                style={{ width: `calc(100% / ${zoom / 100})`, aspectRatio: `${pageWidth} / ${pageHeight}`, backgroundColor: settings.background, transform: `scale(${zoom / 100})` }}
                onClick={() => setSelectedId(null)}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {photos.map((photo) => {
                  const asset = assets.find((item) => item.id === photo.assetId);
                  if (!asset) return null;
                  return (
                    <div
                      key={photo.id}
                      data-photo-id={photo.id}
                      className={`placed-photo${selectedId === photo.id ? " selected" : ""}`}
                      style={{
                        left: `${photo.x / pageWidth * 100}%`,
                        top: `${photo.y / pageHeight * 100}%`,
                        width: `${photo.width / pageWidth * 100}%`,
                        height: `${photo.height / pageHeight * 100}%`,
                        transform: `rotate(${photo.rotation}deg)`,
                        border: settings.border
                          ? `${settings.borderWidthMm * 96 / 25.4}px ${settings.borderStyle} ${settings.borderColor}`
                          : "none",
                      }}
                      onClick={(event) => { event.stopPropagation(); setSelectedId(photo.id); }}
                      onPointerDown={(event) => startPhotoDrag(event, photo, "move")}
                      onDoubleClick={() => { setSelectedId(photo.id); setShowAdjustments(true); }}
                      title={`${photo.width.toFixed(1)} × ${photo.height.toFixed(1)} mm`}
                    >
                      <img src={asset.url} alt={asset.name} draggable={false} style={{ filter: photoFilter(photo), transform: `scale(${photo.flipX ? -1 : 1}, ${photo.flipY ? -1 : 1})`, objectPosition: `${photo.cropX}% ${photo.cropY}%` }} />
                      {selectedId === photo.id && <><span className="selection-label">{photo.width.toFixed(1)} × {photo.height.toFixed(1)} mm</span><button className="resize-handle" aria-label="Resize photo" onPointerDown={(event) => startPhotoDrag(event, photo, "resize")}><span /></button></>}
                    </div>
                  );
                })}
                {!photos.length && (
                  <div className="paper-empty"><span className="paper-empty-icon"><ImagePlus size={22} /></span><b>Your sheet is ready</b><small>Upload photos, then drag them here<br />or use Auto arrange.</small></div>
                )}
              </div>
              {dragging && <span className="drop-hint">Drop photo onto sheet</span>}
            </div>
          </div>
          <div className="canvas-footer">
            <span className="canvas-hint"><Move size={13} /> Drag photos to reposition <span className="hint-divider">·</span> Double-click to adjust</span>
            <div className="zoom-control">
              <button className="icon-button small" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(50, value - 10))}><Minus size={14} /></button>
              <input
                className="zoom-slider"
                type="range"
                min="50"
                max="150"
                step="10"
                value={zoom}
                aria-label="Canvas zoom"
                onChange={(event) => setZoom(Number(event.target.value))}
              />
              <span className="zoom-value">{zoom}%</span>
              <button className="icon-button small" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(150, value + 10))}><Plus size={14} /></button>
              <span className="zoom-divider" />
              <button className="fit-button" onClick={() => setZoom(100)}>Fit</button>
            </div>
          </div>
          {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={14} /></button></div>}
        </section>

        <aside className={`right-panel${rightPanelCollapsed ? " is-collapsed" : ""}`}>
          <button
            type="button"
            className="panel-toggle"
            title={rightPanelCollapsed ? "Show properties panel" : "Hide properties panel"}
            aria-label={rightPanelCollapsed ? "Show properties panel" : "Hide properties panel"}
            aria-expanded={!rightPanelCollapsed}
            onClick={() => setRightPanelCollapsed((collapsed) => !collapsed)}
          >
            {rightPanelCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="panel-content">
          <div className="right-panel-heading"><span className="eyebrow">PROPERTIES</span><button className="icon-button small" title="Close properties" onClick={() => setSelectedId(null)}><X size={16} /></button></div>
          {selectedPhoto && selectedAsset ? (
            <div className="property-content">
              <div className="selected-preview"><img src={selectedAsset.url} alt="" style={{ filter: photoFilter(selectedPhoto) }} /><div><b>Photo selected</b><small>{selectedAsset.name}</small></div><button className="icon-button small" title="Delete photo" onClick={deleteSelected}><Trash2 size={15} /></button></div>
              <div className="property-group">
                <h3>Size <span>mm</span></h3>
                <div className="two-fields">
                  <NumberField label="Width" value={selectedPhoto.width} min={5} step={0.5} suffix="mm" onChange={(value) => changePhotoSize("width", value)} />
                  <NumberField label="Height" value={selectedPhoto.height} min={5} step={0.5} suffix="mm" onChange={(value) => changePhotoSize("height", value)} />
                </div>
              </div>
              <div className="property-group">
                <h3>Position <span>from top-left</span></h3>
                <div className="two-fields">
                  <NumberField label="X" value={selectedPhoto.x} min={0} step={0.5} suffix="mm" onChange={(value) => updatePhoto(selectedPhoto.id, { x: value })} />
                  <NumberField label="Y" value={selectedPhoto.y} min={0} step={0.5} suffix="mm" onChange={(value) => updatePhoto(selectedPhoto.id, { y: value })} />
                </div>
              </div>
              <div className="property-group">
                <h3>Transform</h3>
                <div className="action-row">
                  <button className="tool-button" onClick={() => updatePhoto(selectedPhoto.id, { rotation: (selectedPhoto.rotation + 90) % 360 })}><RotateCw size={15} /> Rotate</button>
                  <button className="tool-button" onClick={() => updatePhoto(selectedPhoto.id, { flipX: !selectedPhoto.flipX })}><ArrowLeftRight size={15} /> Flip X</button>
                </div>
                <div className="action-row">
                  <button className="tool-button" onClick={() => updatePhoto(selectedPhoto.id, { flipY: !selectedPhoto.flipY })}><ArrowUpDown size={15} /> Flip Y</button>
                  <button className="tool-button" onClick={() => updatePhoto(selectedPhoto.id, { rotation: 0, flipX: false, flipY: false })}><RotateCw size={15} /> Reset transform</button>
                </div>
                <div className="action-row">
                  <button className="tool-button" onClick={duplicateSelected}><Copy size={15} /> Duplicate</button>
                  <button className="tool-button" onClick={deleteSelected}><Trash2 size={15} /> Delete</button>
                </div>
                <div className="action-row order-actions">
                  <button className="tool-button" onClick={() => { const index = photos.findIndex((photo) => photo.id === selectedPhoto.id); if (index < photos.length - 1) { const next = [...photos]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; commitPhotos(next); } }}><ArrowUp size={15} /> Bring forward</button>
                  <button className="tool-button" onClick={() => { const index = photos.findIndex((photo) => photo.id === selectedPhoto.id); if (index > 0) { const next = [...photos]; [next[index], next[index - 1]] = [next[index - 1], next[index]]; commitPhotos(next); } }}><ArrowDown size={15} /> Send backward</button>
                </div>
              </div>
              <div className="property-group">
                <h3>Crop</h3>
                <label className="field-label crop-label">Frame aspect ratio</label>
                <div className="select-wrap"><select value={selectedCropRatio} onChange={(event) => {
                  const ratio = event.target.value;
                  if (ratio === "custom") return;
                  const nextHeight = ratio === "original"
                    ? selectedPhoto.width / (selectedAsset.width / selectedAsset.height)
                    : selectedPhoto.width / Number(ratio);
                  updatePhoto(selectedPhoto.id, { height: nextHeight });
                }}>
                  <option value="original">Original photo</option><option value="1.000">1 : 1</option><option value="0.750">3 : 4</option><option value="0.800">4 : 5</option><option value="custom">Custom frame</option>
                </select><ChevronDown size={14} /></div>
                <Slider label="Horizontal crop" value={selectedPhoto.cropX} max={100} onChange={(value) => updatePhoto(selectedPhoto.id, { cropX: value })} />
                <Slider label="Vertical crop" value={selectedPhoto.cropY} max={100} onChange={(value) => updatePhoto(selectedPhoto.id, { cropY: value })} />
                <button className="text-button reset-button" onClick={() => updatePhoto(selectedPhoto.id, { cropX: 50, cropY: 50 })}>Center crop</button>
              </div>
              <div className="property-group adjustment-group">
                <button className="group-toggle" onClick={() => setShowAdjustments((value) => !value)}><span><b>Image adjustments</b><small>Brightness, contrast, saturation</small></span><ChevronDown size={16} className={showAdjustments ? "turned" : ""} /></button>
                {showAdjustments && <div className="sliders">
                  <Slider label="Brightness" value={selectedPhoto.brightness} onChange={(value) => updatePhoto(selectedPhoto.id, { brightness: value })} />
                  <Slider label="Contrast" value={selectedPhoto.contrast} onChange={(value) => updatePhoto(selectedPhoto.id, { contrast: value })} />
                  <Slider label="Saturation" value={selectedPhoto.saturation} onChange={(value) => updatePhoto(selectedPhoto.id, { saturation: value })} />
                  <label className="check-row"><input type="checkbox" checked={selectedPhoto.grayscale} onChange={(event) => updatePhoto(selectedPhoto.id, { grayscale: event.target.checked })} /> Grayscale</label>
                  <button className="text-button reset-button" onClick={() => updatePhoto(selectedPhoto.id, { brightness: 100, contrast: 100, saturation: 100, grayscale: false, rotation: 0, flipX: false, flipY: false })}>Reset adjustments</button>
                </div>}
              </div>
            </div>
          ) : (
            <div className="page-properties">
              <div className="page-preview-card">
                <div className="page-preview" style={{ aspectRatio: `${pageWidth}/${pageHeight}` }}><span>{settings.pageSize}</span></div>
                <div><b>Page settings</b><small>{pageWidth} × {pageHeight} mm</small></div>
              </div>
              <div className="property-group">
                <h3>Photo layout</h3>
                <div className="two-fields">
                  <NumberField label="Photo width" value={settings.photoWidth} min={5} step={0.5} suffix="mm" onChange={(value) => updateSetting("photoWidth", value)} />
                  <NumberField label="Photo height" value={settings.photoHeight} min={5} step={0.5} suffix="mm" onChange={(value) => updateSetting("photoHeight", value)} />
                </div>
                <div className="quantity-row"><label htmlFor="quantity">Number of photos</label><input id="quantity" type="number" min="1" max="200" value={settings.quantity} onChange={(event) => updateSetting("quantity", Math.max(1, Number(event.target.value) || 1))} /></div>
                {assets.length > 0 && <div className={`capacity-message${layoutPreview.fits ? "" : " warning"}`}>{layoutPreview.capacity} fit on this page{layoutPreview.fits ? "" : ` · requested ${settings.quantity}`}</div>}
              </div>
              <div className="property-group">
                <h3>Page appearance</h3>
                <label className="color-row"><span>Background color</span><input type="color" value={settings.background} onChange={(event) => updateSetting("background", event.target.value)} /></label>
                <label className="check-row"><input type="checkbox" checked={settings.border} onChange={(event) => updateSetting("border", event.target.checked)} /> Add photo border</label>
                {settings.border && (
                  <div className="border-options">
                    <label className="border-option">
                      <span>Weight</span>
                      <select value={settings.borderWidthMm} onChange={(event) => updateSetting("borderWidthMm", Number(event.target.value))}>
                        <option value={0.25}>Thin</option>
                        <option value={0.5}>Medium</option>
                        <option value={1}>Thick</option>
                      </select>
                    </label>
                    <label className="border-option">
                      <span>Style</span>
                      <select value={settings.borderStyle} onChange={(event) => updateSetting("borderStyle", event.target.value as PhotoBorderStyle)}>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="double">Double</option>
                      </select>
                    </label>
                    <label className="color-row border-color-row">
                      <span>Border color</span>
                      <input type="color" value={settings.borderColor} onChange={(event) => updateSetting("borderColor", event.target.value)} />
                    </label>
                  </div>
                )}
              </div>
              <button
                className="button button-primary full-button"
                style={{
                  background: "#5146e5",
                  backgroundImage: "none",
                  border: "1px solid #5146e5",
                  color: "#ffffff",
                }}
                onClick={arrangePhotos}
              >
                <LayoutGrid size={15} /> Arrange photos
              </button>
              <div className="page-note"><CircleHelp size={15} /><span>Click a photo on the sheet to edit its size, position, and image adjustments.</span></div>
            </div>
          )}
          <div className="right-footer"><span>STARZ PRINT STUDIO</span><span>v1.0</span></div>
          </div>
        </aside>
      </main>
      {showHelp && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowHelp(false); }}>
        <section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <div className="help-heading"><div><span className="eyebrow">QUICK GUIDE</span><h2 id="help-title">Make a print sheet</h2></div><button className="icon-button" aria-label="Close help" onClick={() => setShowHelp(false)}><X size={18} /></button></div>
          <ol><li><b>Choose a preset</b><span>Start with passport photos, A4, or full-bleed A4.</span></li><li><b>Add your images</b><span>Upload a group of photos, then use Auto arrange or drag them onto the paper.</span></li><li><b>Fine-tune the sheet</b><span>Select a photo to change its size, crop, position, or adjustments. Drag an image onto a photo to replace it.</span></li><li><b>Export for printing</b><span>Download a PDF with the selected paper dimensions and 300 DPI photo output.</span></li></ol>
          <div className="shortcut-list"><b>Keyboard shortcuts</b><span><kbd>Ctrl</kbd> + <kbd>Z</kbd><i>Undo</i></span><span><kbd>Ctrl</kbd> + <kbd>Y</kbd><i>Redo</i></span><span><kbd>Ctrl</kbd> + <kbd>D</kbd><i>Duplicate photo</i></span><span><kbd>Delete</kbd><i>Delete selected photo</i></span></div>
          <button className="button button-primary help-done" onClick={() => setShowHelp(false)}>Got it</button>
        </section>
      </div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(Number(value.toFixed(2))));
  useEffect(() => { setDraft(String(Number(value.toFixed(2)))); }, [value]);
  return (
    <label className="number-field">
      <span>{label}</span>
      <span className="number-input"><input type="number" value={draft} min={min} step={step} onChange={(event) => setDraft(event.target.value)} onBlur={() => { const parsed = Number(draft); if (Number.isFinite(parsed) && parsed >= min) onChange(parsed); else setDraft(String(Number(value.toFixed(2)))); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /><i>{suffix}</i></span>
    </label>
  );
}

function Slider({ label, value, max = 200, onChange }: { label: string; value: number; max?: number; onChange: (value: number) => void }) {
  return <label className="slider-field"><span>{label}<b>{value}%</b></span><input type="range" min="0" max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export default App;
