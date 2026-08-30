import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outDir = path.resolve('public/social/2026-08-30-i539-i765');
fs.mkdirSync(outDir, { recursive: true });
const refPath = '/opt/data/immigronews-character-reference.jpg';
const W = 1080, H = 1350;
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

const slides = [
  {
    kicker: 'IMMIGRONEWS ALERT',
    title: 'New I-539 and I-765 forms start Sept. 15',
    body: ['USCIS says revised Form I-539 and Form I-765 editions will be published Sept. 15, 2026.'],
    foot: 'Source: USCIS alert, Aug. 14, 2026'
  },
  {
    kicker: 'WHAT CHANGED',
    title: 'There is no grace period',
    body: ['USCIS says older editions are accepted only if filed before Sept. 15. On or after Sept. 15, older editions will be rejected.'],
    foot: 'Forms: I-539 and I-765'
  },
  {
    kicker: 'WHO TO WATCH',
    title: 'Students and work permit filers',
    body: ['This matters for people filing to extend or change nonimmigrant status, and people filing for employment authorization.'],
    foot: 'Check the official form page before filing'
  },
  {
    kicker: 'GENERAL INFORMATION',
    title: 'Save the official source',
    body: ['Do not file the new editions before Sept. 15. This is general information, not legal advice. For your case, talk to a qualified immigration attorney.'],
    foot: 'Visit immigronews.com • Follow @immigronews'
  }
];

function wrap(text, maxChars) {
  const words = text.split(/\s+/); const lines=[]; let cur='';
  for (const w of words) {
    const t = (cur+' '+w).trim();
    if (t.length <= maxChars) cur=t;
    else { if(cur) lines.push(cur); cur=w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function textBlock(lines, x, y, size, weight=700, fill='#172033', maxChars=31, gap=1.23) {
  let out='', yy=y;
  for (const raw of lines) for (const line of wrap(raw, maxChars)) {
    out += `<text x="${x}" y="${yy}" font-family="DejaVu Sans, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`;
    yy += Math.round(size*gap);
  }
  return out;
}

let refBuf = null;
if (fs.existsSync(refPath)) {
  refBuf = await sharp(refPath).resize(250,250,{fit:'cover',position:'top'}).jpeg({quality:88}).toBuffer();
}

for (let i=0; i<slides.length; i++) {
  const s = slides[i];
  const titleLines = wrap(s.title, 22).slice(0,3);
  let titleSvg='', ty=300;
  for (const line of titleLines) {
    titleSvg += `<text x="110" y="${ty}" font-family="Georgia, 'Times New Roman', serif" font-size="70" font-weight="900" fill="#10233f">${esc(line)}</text>`;
    ty += 84;
  }
  const bodyY = Math.max(560, ty+70);
  const bodySvg = textBlock(s.body, 110, bodyY, 42, 500, '#172033', i === 1 ? 37 : 34, 1.28);
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1350" fill="#f7f0e6"/>
  <circle cx="940" cy="178" r="150" fill="#e9dccd" opacity=".8"/><circle cx="90" cy="1168" r="190" fill="#e7c0aa" opacity=".28"/>
  <rect x="62" y="72" width="956" height="1196" rx="56" fill="#fffaf0" stroke="#e9dccd" stroke-width="4"/>
  <rect x="62" y="72" width="956" height="36" fill="#10233f"/>
  <text x="110" y="170" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" font-weight="800" fill="#c8643c" letter-spacing="2">${esc(s.kicker)}</text>
  ${titleSvg}
  <rect x="110" y="${ty-30}" width="820" height="10" rx="5" fill="#c8643c"/>
  ${bodySvg}
  <rect x="110" y="1040" width="860" height="104" rx="24" fill="#efe5d7"/>
  <text x="142" y="1102" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="800" fill="#10233f">${esc(s.foot)}</text>
  <text x="110" y="1214" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="800" fill="#172033">@immigronews | US immigration updates</text>
  <text x="895" y="1214" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="800" fill="#c8643c">${i+1}/4</text>
  </svg>`;
  const composites = [];
  if (refBuf) {
    const card = Buffer.from(`<svg width="292" height="322" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="292" height="322" rx="52" fill="#f0dfcf"/><text x="30" y="296" font-family="DejaVu Sans, Arial" font-size="28" font-weight="800" fill="#10233f">ImmigroNews</text></svg>`);
    const mask = Buffer.from(`<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg"><rect width="250" height="250" rx="44" fill="white"/></svg>`);
    const rounded = await sharp(refBuf).composite([{input:mask, blend:'dest-in'}]).png().toBuffer();
    composites.push({input:card,left:712,top:520},{input:rounded,left:733,top:541});
  }
  await sharp(Buffer.from(svg)).jpeg({quality:92, mozjpeg:true}).composite(composites).toFile(path.join(outDir, `slide-${i+1}.jpg`));
}
const composites = [];
for (let i=0; i<4; i++) composites.push({input:path.join(outDir,`slide-${i+1}.jpg`), left:(i%2)*W, top:Math.floor(i/2)*H});
await sharp({create:{width:W*2,height:H*2,channels:3,background:'#ffffff'}}).composite(composites).jpeg({quality:88}).toFile(path.join(outDir,'contact-sheet.jpg'));
console.log(JSON.stringify({outDir, files:fs.readdirSync(outDir).sort()}, null, 2));
