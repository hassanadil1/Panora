import { create } from "zustand";

export type MapCameraView = {
  lng: number;
  lat: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

type MapStore = MapCameraView & {
  savedCamera: MapCameraView | null;
  hoveredSlug: string | null;
  selectedSlug: string | null;
  saveCamera: (view: MapCameraView) => void;
  restoreCamera: () => MapCameraView | null;
  setHoveredSlug: (slug: string | null) => void;
  setSelectedSlug: (slug: string | null) => void;
};

const defaultCamera: MapCameraView = {
  lng: 74.3587,
  lat: 31.5204,
  zoom: 11,
};

export const useMapStore = create<MapStore>((set, get) => ({
  ...defaultCamera,
  savedCamera: null,
  hoveredSlug: null,
  selectedSlug: null,
  saveCamera: (view) => set({ savedCamera: view }),
  restoreCamera: () => {
    const saved = get().savedCamera;
    if (!saved) return null;
    set({
      lng: saved.lng,
      lat: saved.lat,
      zoom: saved.zoom,
      bearing: saved.bearing,
      pitch: saved.pitch,
      savedCamera: null,
    });
    return saved;
  },
  setHoveredSlug: (slug) => set({ hoveredSlug: slug }),
  setSelectedSlug: (slug) => set({ selectedSlug: slug }),
}));
