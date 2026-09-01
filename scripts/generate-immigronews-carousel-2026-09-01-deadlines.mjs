import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outDir = path.resolve('public/social/2026-09-01-deadline-checklist');
fs.mkdirSync(outDir, { recursive: true });
const refPath = '/opt/data/immigronews-character-reference.jpg';
const W = 1080, H = 1350;
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

const slides = [
  {
    kicker: 'IMMIGRONEWS CHECKLIST',
    title: '3 USCIS dates to watch in September',
    body: ['Sept. 15: I-539 and I-765 editions change.', 'Sept. 18: I-485 edition changes.', 'Sept. 24: H-1B fee proposal comments close.'],
    foot: 'Save this if you are preparing a filing'
  },
  {
    kicker: 'SEPT. 15',
    title: 'I-539 and I-765 change',
    body: ['USCIS says older editions are accepted only if filed before Sept. 15, 2026.', 'On or after Sept. 15, older editions will be rejected.'],
    foot: 'Source: USCIS alert, Aug. 14, 2026'
  },
  {
    kicker: 'SEPT. 18',
    title: 'I-485 changes for green-card applicants',
    body: ['USCIS says there is no grace period for the old I-485 edition after Sept. 18.', 'Do not file the new edition before Sept. 18.'],
    foot: 'Source: USCIS alert, Aug. 19, 2026'
  },
  {
    kicker: 'GENERAL INFORMATION',
    title: 'Before you file',
    body: ['Check the official USCIS form page on the day you file.', 'This is general information, not legal advice.', 'For your case, talk to a qualified immigration attorney.'],
    foot: 'Follow @immigronews • Visit immigronews.com'
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
function textLines(rawLines, x, y, size, weight=600, fill='#172033', maxChars=32, gap=1.24) {
  let out='', yy=y;
  for (const raw of rawLines) {
    for (const line of wrap(raw, maxChars)) {
      out += `<text x="${x}" y="${yy}" font-family="DejaVu Sans, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`;
      yy += Math.round(size*gap);
    }
    yy += Math.round(size*.38);
  }
  return out;
}

let refBuf = null;
if (fs.existsSync(refPath)) refBuf = await sharp(refPath).resize(246,246,{fit:'cover',position:'top'}).jpeg({quality:90}).toBuffer();

for (let i=0; i<slides.length; i++) {
  const s = slides[i];
  const titleLines = wrap(s.title, 21).slice(0,3);
  let titleSvg='', ty=295;
  for (const line of titleLines) {
    titleSvg += `<text x="100" y="${ty}" font-family="Georgia, 'Times New Roman', serif" font-size="70" font-weight="900" fill="#10233f">${esc(line)}</text>`;
    ty += 84;
  }
  const bodyY = Math.max(560, ty+54);
  const bodySvg = textLines(s.body, 100, bodyY, i === 0 ? 39 : 42, 650, '#172033', i === 0 ? 42 : 35, 1.22);
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" fill="#f7f0e6"/>
    <circle cx="930" cy="178" r="150" fill="#e9dccd" opacity=".85"/><circle cx="90" cy="1168" r="190" fill="#c8643c" opacity=".13"/>
    <rect x="58" y="66" width="964" height="1206" rx="58" fill="#fffaf0" stroke="#e3d3c4" stroke-width="4"/>
    <rect x="58" y="66" width="964" height="38" fill="#10233f"/>
    <text x="100" y="168" font-family="DejaVu Sans, Arial, sans-serif" font-size="32" font-weight="900" fill="#c8643c" letter-spacing="2">${esc(s.kicker)}</text>
    ${titleSvg}
    <rect x="100" y="${ty-30}" width="800" height="10" rx="5" fill="#c8643c"/>
    ${bodySvg}
    <rect x="100" y="1036" width="880" height="112" rx="26" fill="#efe5d7"/>
    ${textLines([s.foot], 132, 1098, 29, 800, '#10233f', 45, 1.1)}
    <text x="100" y="1218" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="900" fill="#172033">@immigronews | US immigration updates</text>
    <text x="895" y="1218" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="900" fill="#c8643c">${i+1}/4</text>
  </svg>`;
  const composites = [];
  if (refBuf) {
    const card = Buffer.from(`<svg width="288" height="318" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="288" height="318" rx="52" fill="#f0dfcf"/><text x="29" y="293" font-family="DejaVu Sans, Arial" font-size="28" font-weight="900" fill="#10233f">ImmigroNews</text></svg>`);
    const mask = Buffer.from(`<svg width="246" height="246" xmlns="http://www.w3.org/2000/svg"><rect width="246" height="246" rx="44" fill="white"/></svg>`);
    const rounded = await sharp(refBuf).composite([{input:mask, blend:'dest-in'}]).png().toBuffer();
    composites.push({input:card,left:724,top:523},{input:rounded,left:745,top:544});
  }
  await sharp(Buffer.from(svg)).composite(composites).jpeg({quality:92, mozjpeg:true}).toFile(path.join(outDir, `slide-${i+1}.jpg`));
}
const composites = [];
for (let i=0; i<4; i++) composites.push({input:path.join(outDir,`slide-${i+1}.jpg`), left:(i%2)*W, top:Math.floor(i/2)*H});
await sharp({create:{width:W*2,height:H*2,channels:3,background:'#ffffff'}}).composite(composites).jpeg({quality:88}).toFile(path.join(outDir,'contact-sheet.jpg'));
console.log(JSON.stringify({outDir, files:fs.readdirSync(outDir).sort()}, null, 2));
