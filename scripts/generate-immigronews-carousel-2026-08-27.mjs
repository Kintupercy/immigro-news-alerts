import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outDir = path.resolve('public/social/2026-08-27-h1b-fee');
fs.mkdirSync(outDir, { recursive: true });

const slides = [
  {
    kicker: 'IMMIGRONEWS ALERT',
    title: 'H-1B fee proposal',
    body: ['DHS proposed a new', '$103,265 fee', 'for H-1B cap-subject petitions.'],
    foot: 'Source: Federal Register, Aug. 25, 2026'
  },
  {
    kicker: 'WHAT CHANGED',
    title: 'It is not final yet',
    body: ['This is a proposed rule,', 'not a final rule.', 'Public comments are open until Sept. 24, 2026.'],
    foot: 'Docket: USCIS-2026-0298'
  },
  {
    kicker: 'WHO IT AFFECTS',
    title: 'Cap-subject H-1B filings',
    body: ['DHS says it would apply to cap-subject petitions,', 'including advanced-degree exemption cases.', 'Cap-exempt filings are described separately.'],
    foot: 'General information only, not legal advice.'
  },
  {
    kicker: 'WHAT TO WATCH',
    title: 'Save the source',
    body: ['Track the Federal Register docket.', 'Employers file H-1B petitions, not workers.', 'Follow @immigronews for plain-English updates.'],
    foot: 'immigronews.com'
  }
];

function esc(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function textLines(lines, x, y, size=58, gap=84, weight=700) {
  return lines.map((line,i)=>`<text x="${x}" y="${y+i*gap}" class="body" font-size="${size}" font-weight="${weight}">${esc(line)}</text>`).join('\n');
}

for (let i=0; i<slides.length; i++) {
  const s = slides[i];
  const svg = `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7fbff"/><stop offset="1" stop-color="#eef6ff"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.14"/></filter>
  </defs>
  <rect width="1080" height="1350" fill="url(#bg)"/>
  <circle cx="925" cy="138" r="145" fill="#dbeafe" opacity=".8"/>
  <circle cx="70" cy="1165" r="180" fill="#bfdbfe" opacity=".45"/>
  <rect x="70" y="90" width="940" height="1170" rx="54" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="70" y="90" width="940" height="20" fill="#2563eb"/>
  <text x="110" y="180" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#2563eb" letter-spacing="3">${esc(s.kicker)}</text>
  <text x="110" y="315" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="900" fill="#0f172a">${esc(s.title)}</text>
  <line x1="110" y1="385" x2="930" y2="385" stroke="#dbeafe" stroke-width="6"/>
  <g font-family="Arial, Helvetica, sans-serif" fill="#111827">
    ${textLines(s.body, 110, 520, 58, 88, 750)}
  </g>
  <rect x="110" y="1010" width="820" height="120" rx="28" fill="#eff6ff"/>
  <text x="150" y="1085" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#1e3a8a">${esc(s.foot)}</text>
  <text x="110" y="1215" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#334155">@immigronews | US immigration updates</text>
  <text x="902" y="1215" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#64748b">${i+1}/4</text>
</svg>`;
  const file = path.join(outDir, `slide-${i+1}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 92, mozjpeg: true }).toFile(file);
}

const contact = sharp({ create: { width: 1080*2, height: 1350*2, channels: 3, background: '#f8fafc' } });
const composites = [];
for (let i=0; i<4; i++) {
  composites.push({ input: path.join(outDir, `slide-${i+1}.jpg`), left: (i%2)*1080, top: Math.floor(i/2)*1350 });
}
await contact.composite(composites).jpeg({ quality: 88 }).toFile(path.join(outDir, 'contact-sheet.jpg'));
console.log(JSON.stringify({ outDir, files: fs.readdirSync(outDir) }, null, 2));
