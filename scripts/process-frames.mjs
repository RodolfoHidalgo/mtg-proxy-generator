import { Jimp } from "jimp";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR  = "C:/Users/Rodolfo/OneDrive/Negocios/Commanders/FRAMES";
const OUT_DIR  = path.join(__dirname, "../public/frames");

const TARGET_W = 1500;
const TARGET_H = 2100;

// Maps original file name fragment → output file name
const FRAME_MAP = [
  { match: /black.*creature/i,  out: "black-creature.png"  },
  { match: /black.*sorcery/i,   out: "black-sorcery.png"   },
  { match: /blue.*creature/i,   out: "blue-creature.png"   },
  { match: /blue.*sorcery/i,    out: "blue-sorcery.png"    },
  { match: /gold.*creature/i,   out: "gold-creature.png"   },
  { match: /gold.*sorcery/i,    out: "gold-sorcery.png"    },
  { match: /green.*creature/i,  out: "green-creature.png"  },
  { match: /green.*sorcery/i,   out: "green-sorcery.png"   },
  { match: /red.*creature/i,    out: "red-creature.png"    },
  { match: /red.*sorcery/i,     out: "red-sorcery.png"     },
  { match: /white.*creature/i,  out: "white-creature.png"  },
  { match: /white.*sorcery/i,   out: "white-sorcery.png"   },
];

const avg = (data, idx) => {
  const b = idx * 4;
  return (data[b] + data[b + 1] + data[b + 2]) / 3;
};

// Pass 1 — flood from center, capped at y<56% to stop leaking through dark
// outer-border corners that connect the art window to the rules area.
function floodFillCenter(data, width, height) {
  const threshold = 80;
  const artMaxY   = Math.floor(height * 0.56);
  const total     = width * height;
  const visited   = new Uint8Array(total);
  const queue     = [];

  const seedPoints = [
    [0.50, 0.18], [0.50, 0.28], [0.50, 0.38],
    [0.35, 0.23], [0.65, 0.23],
    [0.35, 0.35], [0.65, 0.35],
  ];
  for (const [fx, fy] of seedPoints) {
    const idx = Math.round(fy * height) * width + Math.round(fx * width);
    if (!visited[idx] && avg(data, idx) < threshold) { visited[idx]=1; queue.push(idx); }
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width, y = Math.floor(idx / width);
    const expand = n => { if (!visited[n] && avg(data,n) < threshold) { visited[n]=1; queue.push(n); } };
    if (x > 0)           expand(idx - 1);
    if (x < width - 1)  expand(idx + 1);
    if (y > 0)           expand(idx - width);
    if (y < artMaxY - 1) expand(idx + width); // downward capped at 56%
  }

  let count = 0;
  for (let i = 0; i < total; i++) { if (visited[i]) { data[i*4+3]=0; count++; } }
  return count;
}

// Pass 2 — expand transparency into dark corner pixels adjacent to the now-clear
// art window. Threshold=40 catches the near-black corner pixels (avg 0-37) while
// leaving the frame's rules-area background (avg ~53-73) and decorations intact.
// Only operates in the boundary band y = 50%..70%.
function cleanupCorners(data, width, height) {
  const threshold = 40;
  const yStart    = Math.floor(height * 0.50);
  const yEnd      = Math.floor(height * 0.70);

  const queue = [];

  // Seed: all transparent pixels already in the boundary band
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) queue.push(y * width + x);
    }
  }

  const check = (px, nx, ny) => {
    if (nx < 0 || nx >= width || ny < yStart || ny >= yEnd) return;
    const ni = (ny * width + nx) * 4;
    if (data[ni + 3] > 0 && avg(data, ny * width + nx) < threshold) {
      data[ni + 3] = 0; // mark transparent immediately (acts as visited flag)
      queue.push(ny * width + nx);
    }
  };

  let head = 0, cleared = 0;
  while (head < queue.length) {
    const pIdx = queue[head++];
    const x = pIdx % width, y = Math.floor(pIdx / width);
    check(pIdx, x - 1, y);
    check(pIdx, x + 1, y);
    check(pIdx, x,     y - 1);
    check(pIdx, x,     y + 1);
    cleared++;
  }
  return cleared;
}

async function processFrame(srcPath, outName) {
  const outPath = path.join(OUT_DIR, outName);
  let img = await Jimp.read(srcPath);
  const origW = img.bitmap.width;
  const origH = img.bitmap.height;

  // Resize to canonical size
  if (origW !== TARGET_W || origH !== TARGET_H) {
    img = img.resize({ w: TARGET_W, h: TARGET_H });
    console.log(`    Resized ${origW}×${origH} → ${TARGET_W}×${TARGET_H}`);
  }

  const c1 = floodFillCenter(img.bitmap.data, TARGET_W, TARGET_H);
  const c2 = cleanupCorners(img.bitmap.data, TARGET_W, TARGET_H);
  console.log(`    Cleared ${(c1+c2).toLocaleString()} px (art window: ${c1.toLocaleString()}, corners: ${c2.toLocaleString()})`);

  await img.write(outPath);
  console.log(`    ✓ → ${outName}`);
}

// Find and process each frame
const srcFiles = await readdir(SRC_DIR);
let processed = 0;

for (const mapping of FRAME_MAP) {
  const found = srcFiles.find(f => mapping.match.test(f));
  if (!found) {
    console.warn(`  ⚠ Not found: ${mapping.out}`);
    continue;
  }
  console.log(`\n${found}`);
  try {
    await processFrame(path.join(SRC_DIR, found), mapping.out);
    processed++;
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
  }
}

console.log(`\nDone — ${processed}/${FRAME_MAP.length} frames processed.`);
