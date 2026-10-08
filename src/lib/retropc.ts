// Active recipe only: alternate modes and disabled post-effects are omitted.
export const preset = {
  cellSize: 9, density: 0, contrast: 115, brightness: 0,
  saturation: 100, grayscale: 0, coverage: 100, invert: false,
  animSpeed: 100, animIntensity: 60,
  tint: '#409cff', tintOpacity: 45, edgeEmphasis: 40,
  bgOpacity: 100, vignette: 72,
};

export function flickerOpacity(time: number) {
  const beat = Math.floor(time / (160 * 100 / preset.animSpeed));
  const noise = Math.sin(beat * 12.9898 + 78.233) * 43758.5453;
  // Limit full-frame luminance changes to 6% at this preset's intensity.
  return 1 - (noise - Math.floor(noise)) * 0.1 * preset.animIntensity / 100;
}

export function sampleCells(data: Uint8ClampedArray, width: number, height: number, size = preset.cellSize) {
  const cells: { x: number; y: number; color: string; luminance: number; alpha: number }[] = [];
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const rgb = [0, 0, 0];
      let count = 0;
      let opacity = 0;
      for (let sy = y; sy < Math.min(y + size, height); sy++) {
        for (let sx = x; sx < Math.min(x + size, width); sx++) {
          const offset = (sy * width + sx) * 4;
          const alpha = data[offset + 3]! / 255;
          opacity += alpha;
          for (let channel = 0; channel < 3; channel++) rgb[channel]! += data[offset + channel]! * alpha;
          count++;
        }
      }
      const [r, g, b] = rgb.map(value => opacity ? value / opacity : 0) as [number, number, number];
      cells.push({ x, y, color: `rgb(${r} ${g} ${b})`, luminance: (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255, alpha: opacity / count });
    }
  }
  return cells;
}

export function edgeStrength(cells: { luminance: number }[], index: number, columns: number) {
  const light = cells[index]!.luminance;
  const right = index % columns < columns - 1 ? cells[index + 1]?.luminance ?? light : light;
  const below = cells[index + columns]?.luminance ?? light;
  return Math.min(1, Math.abs(light - right) + Math.abs(light - below));
}
