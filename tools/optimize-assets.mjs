// Otimizador de assets do jogo (uso pontual, fora do runtime).
//   node tools/optimize-assets.mjs
// Gera versoes .webp leves dos fundos de menu (PNG) e das texturas de mapa (JPG),
// que sao o grosso do peso de download. Nao apaga os originais — apenas cria os
// .webp ao lado; a troca das referencias fica em styles.css e game.js.
import sharp from "sharp";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

// Fundos de UI: manter as dimensoes (sao renderizados em tela cheia), so trocar
// PNG -> WebP com qualidade alta. Os com alpha sao preservados pelo WebP.
const menuBackgrounds = [
  "assets/menu/menu-background.png",
  "assets/menu/shop-background.png",
  "assets/menu/button-plate.png",
  "assets/menu/character-shelf.png",
  "assets/menu/shop-board.png"
];

// Texturas de chao: sao repetidas em tile, entao reduzir a resolucao quase nao
// se percebe e corta MUITO o peso. 3072x2048 -> 1536x1024.
const mapTextures = [
  "assets/maps/generated_map_green.jpg",
  "assets/maps/generated_map_waste.jpg",
  "assets/maps/generated_map_fire.jpg"
];

async function convert(rel, transform) {
  const src = join(root, rel);
  const out = src.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  const before = (await stat(src)).size;
  await transform(sharp(src)).webp({ quality: 80, effort: 6 }).toFile(out);
  const after = (await stat(out)).size;
  console.log(
    `${basename(src).padEnd(26)} ${kb(before).padStart(9)}  ->  ${kb(after).padStart(8)}` +
    `   (-${(100 - (after / before) * 100).toFixed(0)}%)`
  );
  return { before, after };
}

let totalBefore = 0;
let totalAfter = 0;

console.log("\nFundos de menu (PNG -> WebP, mesma resolucao):");
for (const rel of menuBackgrounds) {
  const r = await convert(rel, (img) => img);
  totalBefore += r.before;
  totalAfter += r.after;
}

console.log("\nTexturas de mapa (downscale 50% + WebP):");
for (const rel of mapTextures) {
  const r = await convert(rel, (img) => img.resize(1536, 1024, { fit: "fill" }));
  totalBefore += r.before;
  totalAfter += r.after;
}

console.log(
  `\nTOTAL convertido: ${kb(totalBefore)}  ->  ${kb(totalAfter)}` +
  `   (economia de ${kb(totalBefore - totalAfter)}, -${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%)\n`
);
