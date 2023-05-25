import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

async function downloadFile(url, target) {
  const res = fetch(url);
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  const fileStream = fs.createWriteStream(target, { flags: "wx" });
  await finished(
    Readable.fromWeb(
      // @ts-expect-error - shut up TS, they're the same
      (
        await res
      ).body,
    ).pipe(fileStream),
  );
}

const cssUrl = (symbol) =>
  `https://fonts.googleapis.com/css2?family=Material+Symbols+${symbol}:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`;

async function downloadToDist(symbol) {
  const writeDir = path.join("dist", "fonts");
  const writeCss = path.join(writeDir, `${symbol.toLowerCase()}.css`);
  const writeFont = path.join(writeDir, `${symbol.toLowerCase()}.woff2`);

  const cssFile = await (
    await fetch(cssUrl(symbol), { method: "GET", headers: { "User-Agent": "Firefox/999" } })
  ).text();

  const fontUrl = cssFile.match(/url\(([^)]+)\)/)[1];

  downloadFile(fontUrl, writeFont);

  fs.writeFileSync(
    writeCss,
    `@font-face{font-family:"Material Symbols Outlined";font-style:normal;font-weight:100 700;src:url(./${symbol.toLowerCase()}.woff2)format('woff2');}.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga";-moz-font-feature-settings:"liga";-webkit-font-feature-settings:"liga";}`,
    { encoding: "utf-8" },
  );
}

const symbolFonts = ["Sharp", "Rounded", "Outlined"];

for (const symbol of symbolFonts) {
  downloadToDist(symbol);
}
