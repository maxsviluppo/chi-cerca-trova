export interface HiddenObject {
  id: string;
  name: string;
  x: number; // Position X as percentage of container width (0 - 100)
  y: number; // Position Y as percentage of container height (0 - 100)
  radius: number; // Click radius as percentage of container size (e.g. 4% to 8%)
  emoji?: string; // Optional emoji sticker for custom items
  scale?: number; // Scale for emoji sticker (0.5 to 3)
  rotation?: number; // Rotation in degrees (0 to 360)
  opacity?: number; // Opacity (0.1 to 1.0) for blending
  hint?: string; // A custom clue text
  found?: boolean; // Client-side gameplay state
}

export interface Level {
  id: string;
  name: string;
  creator: string;
  isCustom: boolean;
  backgroundImageUrl?: string; // Background URL/Data URL for custom levels
  objects: HiddenObject[];
  hasCartoonAnimations?: boolean; // True for our built-in animated interactive SVG scene
  difficulty: "Facile" | "Medio" | "Difficile";
  gameMode?: "objects" | "differences";
}
