const fs = require('fs');
const path = require('path');

const STICKERS_DIR = path.join(__dirname, '..', 'public', 'stickers');
if (!fs.existsSync(STICKERS_DIR)) {
  fs.mkdirSync(STICKERS_DIR, { recursive: true });
}

// 40 Sticker definitions across 5 moods
const STICKERS = [
  // --- SWEET (8) ---
  {
    id: "sweet-01",
    name: "Bear Hug",
    mood: "sweet",
    desc: "Boy and girl bear hugging with hearts",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Boy Bear Body & Ears -->
  <circle cx="160" cy="180" r="45" fill="#C68B59"/><circle cx="160" cy="180" r="25" fill="#FAD0C4"/>
  <circle cx="280" cy="170" r="45" fill="#C68B59"/><circle cx="280" cy="170" r="25" fill="#FAD0C4"/>
  <ellipse cx="210" cy="270" rx="90" ry="85" fill="#C68B59"/>
  <!-- Girl Bear Body & Ears -->
  <circle cx="250" cy="175" r="45" fill="#E8A598"/><circle cx="250" cy="175" r="25" fill="#FFE2DC"/>
  <circle cx="370" cy="185" r="45" fill="#E8A598"/><circle cx="370" cy="185" r="25" fill="#FFE2DC"/>
  <ellipse cx="310" cy="275" rx="85" ry="80" fill="#E8A598"/>
  <!-- Girl Bear Bow -->
  <path d="M260 170 C240 150, 240 190, 260 170 Z M260 170 C280 150, 280 190, 260 170 Z" fill="#FF5376"/>
  <circle cx="260" cy="170" r="6" fill="#FF8DA1"/>
  <!-- Faces -->
  <ellipse cx="195" cy="265" rx="35" ry="25" fill="#FCEBD9"/>
  <circle cx="195" cy="255" r="8" fill="#3D2314"/>
  <ellipse cx="315" cy="270" rx="35" ry="25" fill="#FFF0EC"/>
  <circle cx="315" cy="260" r="8" fill="#3D2314"/>
  <!-- Eyes -->
  <circle cx="180" cy="240" r="6" fill="#3D2314"/><circle cx="215" cy="240" r="6" fill="#3D2314"/>
  <path d="M295 245 Q305 235 315 245" stroke="#3D2314" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M325 245 Q335 235 345 245" stroke="#3D2314" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Cheeks -->
  <circle cx="170" cy="255" r="12" fill="#FF8A80" opacity="0.6"/>
  <circle cx="340" cy="260" r="12" fill="#FF8A80" opacity="0.6"/>
  <!-- Hug Arms -->
  <path d="M160 320 C210 330, 280 340, 310 300" stroke="#C68B59" stroke-width="26" stroke-linecap="round" fill="none"/>
  <path d="M350 320 C300 340, 230 340, 200 310" stroke="#E8A598" stroke-width="24" stroke-linecap="round" fill="none"/>
  <!-- Floating Hearts -->
  <path d="M256 100 C240 70, 200 80, 200 110 C200 145, 256 175, 256 185 C256 175, 312 145, 312 110 C312 80, 272 70, 256 100 Z" fill="#FF4081"/>
  <path d="M340 90 C330 70, 305 75, 305 95 C305 115, 340 135, 340 140 C340 135, 375 115, 375 95 C375 75, 350 70, 340 90 Z" fill="#FF80AB"/>
</svg>`
  },
  {
    id: "sweet-02",
    name: "Flower for You",
    mood: "sweet",
    desc: "Boy bear presenting a red rose",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="180" cy="140" r="45" fill="#C68B59"/><circle cx="180" cy="140" r="25" fill="#FAD0C4"/>
  <circle cx="332" cy="140" r="45" fill="#C68B59"/><circle cx="332" cy="140" r="25" fill="#FAD0C4"/>
  <ellipse cx="256" cy="240" rx="100" ry="90" fill="#C68B59"/>
  <ellipse cx="256" cy="250" rx="45" ry="32" fill="#FCEBD9"/>
  <ellipse cx="256" cy="240" rx="12" ry="8" fill="#3D2314"/>
  <circle cx="215" cy="205" r="8" fill="#3D2314"/><circle cx="297" cy="205" r="8" fill="#3D2314"/>
  <circle cx="195" cy="225" r="14" fill="#FF8A80" opacity="0.6"/><circle cx="317" cy="225" r="14" fill="#FF8A80" opacity="0.6"/>
  <!-- Body & Paws holding rose -->
  <ellipse cx="256" cy="380" rx="85" ry="90" fill="#C68B59"/>
  <circle cx="200" cy="340" r="24" fill="#C68B59"/><circle cx="312" cy="340" r="24" fill="#C68B59"/>
  <!-- Red Rose -->
  <path d="M256 340 L256 280" stroke="#4CAF50" stroke-width="8" stroke-linecap="round"/>
  <path d="M256 310 Q280 300 280 290" stroke="#4CAF50" stroke-width="6" fill="none"/>
  <circle cx="256" cy="265" r="26" fill="#F44336"/>
  <circle cx="256" cy="265" r="16" fill="#D32F2F"/>
  <circle cx="256" cy="265" r="8" fill="#B71C1C"/>
</svg>`
  },
  {
    id: "sweet-03",
    name: "Blowing Kisses",
    mood: "sweet",
    desc: "Girl bear blowing sweet kiss hearts",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="170" cy="160" r="42" fill="#E8A598"/><circle cx="170" cy="160" r="22" fill="#FFE2DC"/>
  <circle cx="320" cy="160" r="42" fill="#E8A598"/><circle cx="320" cy="160" r="22" fill="#FFE2DC"/>
  <ellipse cx="245" cy="250" rx="95" ry="85" fill="#E8A598"/>
  <path d="M310 150 C290 130, 290 170, 310 150 Z M310 150 C330 130, 330 170, 310 150 Z" fill="#FF4081"/>
  <!-- Wink and Kiss Mouth -->
  <path d="M195 220 Q205 210 215 220" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="275" cy="215" r="8" fill="#3D2314"/>
  <ellipse cx="245" cy="255" rx="35" ry="24" fill="#FFF0EC"/>
  <!-- Kiss mouth -->
  <circle cx="245" cy="250" r="6" fill="#3D2314"/>
  <circle cx="245" cy="264" r="8" fill="#FF4081"/>
  <circle cx="190" cy="245" r="14" fill="#FF8A80" opacity="0.6"/>
  <circle cx="295" cy="245" r="14" fill="#FF8A80" opacity="0.6"/>
  <!-- Floating trail of hearts -->
  <path d="M320 230 C310 215, 290 220, 290 235 C290 250, 320 270, 320 275 C320 270, 350 250, 350 235 C350 220, 330 215, 320 230 Z" fill="#FF4081"/>
  <path d="M375 190 C368 175, 350 180, 350 195 C350 210, 375 225, 375 230 C375 225, 400 210, 400 195 C400 180, 382 175, 375 190 Z" fill="#FF80AB"/>
  <path d="M420 150 C415 140, 400 145, 400 155 C400 165, 420 175, 420 180 C420 175, 440 165, 440 155 C440 145, 425 140, 420 150 Z" fill="#FFA4D4"/>
</svg>`
  },
  {
    id: "sweet-04",
    name: "Holding Paws",
    mood: "sweet",
    desc: "Bears holding paws under gentle glow",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="160" cy="210" r="80" fill="#C68B59"/>
  <circle cx="352" cy="210" r="75" fill="#E8A598"/>
  <circle cx="110" cy="140" r="30" fill="#C68B59"/>
  <circle cx="395" cy="145" r="30" fill="#E8A598"/>
  <!-- Paws Joined in Middle -->
  <circle cx="256" cy="340" r="35" fill="#C68B59"/>
  <circle cx="256" cy="340" r="28" fill="#E8A598"/>
  <path d="M256 315 C246 300, 226 305, 226 320 C226 335, 256 355, 256 360 C256 355, 286 335, 286 320 C286 305, 266 300, 256 315 Z" fill="#FF4081"/>
  <!-- Faces looking at each other -->
  <circle cx="180" cy="205" r="6" fill="#3D2314"/>
  <circle cx="332" cy="205" r="6" fill="#3D2314"/>
  <circle cx="190" cy="225" r="10" fill="#FF8A80" opacity="0.6"/>
  <circle cx="320" cy="225" r="10" fill="#FF8A80" opacity="0.6"/>
</svg>`
  },
  {
    id: "sweet-05",
    name: "Honey Share",
    mood: "sweet",
    desc: "Sharing a jar of golden honey",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="190" r="90" fill="#C68B59"/>
  <circle cx="190" cy="115" r="35" fill="#C68B59"/><circle cx="322" cy="115" r="35" fill="#C68B59"/>
  <ellipse cx="256" cy="200" rx="35" ry="25" fill="#FCEBD9"/>
  <circle cx="256" cy="192" r="8" fill="#3D2314"/>
  <circle cx="225" cy="165" r="7" fill="#3D2314"/><circle cx="287" cy="165" r="7" fill="#3D2314"/>
  <!-- Honey Pot -->
  <ellipse cx="256" cy="380" rx="80" ry="75" fill="#FFB300"/>
  <ellipse cx="256" cy="315" rx="55" ry="15" fill="#FFA000"/>
  <rect x="206" y="360" width="100" height="40" rx="8" fill="#FFF8E1"/>
  <text x="256" y="386" font-family="sans-serif" font-weight="bold" font-size="20" fill="#FF8F00" text-anchor="middle">HONEY</text>
  <!-- Dripping honey spoon -->
  <path d="M256 270 L256 320" stroke="#FFD54F" stroke-width="12" stroke-linecap="round"/>
  <circle cx="256" cy="330" r="10" fill="#FFD54F"/>
</svg>`
  },
  {
    id: "sweet-06",
    name: "Shoulder Ride",
    mood: "sweet",
    desc: "Girl bear on boy bear's shoulders",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Boy Bear Bottom -->
  <ellipse cx="256" cy="360" rx="100" ry="90" fill="#C68B59"/>
  <circle cx="170" cy="290" r="35" fill="#C68B59"/><circle cx="342" cy="290" r="35" fill="#C68B59"/>
  <!-- Big smiling boy face -->
  <circle cx="215" cy="335" r="7" fill="#3D2314"/><circle cx="297" cy="335" r="7" fill="#3D2314"/>
  <path d="M236 365 Q256 385 276 365" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Girl Bear Top -->
  <circle cx="256" cy="160" r="75" fill="#E8A598"/>
  <circle cx="195" cy="100" r="28" fill="#E8A598"/><circle cx="317" cy="100" r="28" fill="#E8A598"/>
  <circle cx="230" cy="145" r="6" fill="#3D2314"/><circle cx="282" cy="145" r="6" fill="#3D2314"/>
  <circle cx="215" cy="165" r="10" fill="#FF8A80" opacity="0.6"/><circle cx="297" cy="165" r="10" fill="#FF8A80" opacity="0.6"/>
  <!-- Cheering Arms -->
  <path d="M190 170 Q140 120 160 80" stroke="#E8A598" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M322 170 Q372 120 352 80" stroke="#E8A598" stroke-width="18" stroke-linecap="round" fill="none"/>
</svg>`
  },
  {
    id: "sweet-07",
    name: "Cozy Scarf",
    mood: "sweet",
    desc: "Wrapped together in a warm red scarf",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="190" cy="200" r="70" fill="#C68B59"/>
  <circle cx="315" cy="200" r="68" fill="#E8A598"/>
  <circle cx="130" cy="145" r="26" fill="#C68B59"/>
  <circle cx="375" cy="145" r="26" fill="#E8A598"/>
  <circle cx="170" cy="190" r="6" fill="#3D2314"/><circle cx="210" cy="190" r="6" fill="#3D2314"/>
  <circle cx="295" cy="190" r="6" fill="#3D2314"/><circle cx="335" cy="190" r="6" fill="#3D2314"/>
  <!-- Cozy knitted red scarf wrapping both -->
  <rect x="130" y="250" width="250" height="60" rx="30" fill="#E53935"/>
  <rect x="220" y="290" width="45" height="90" rx="10" fill="#C62828"/>
  <!-- Scarf fringe -->
  <line x1="225" y1="380" x2="225" y2="400" stroke="#FFF" stroke-width="4"/>
  <line x1="235" y1="380" x2="235" y2="400" stroke="#FFF" stroke-width="4"/>
  <line x1="245" y1="380" x2="245" y2="400" stroke="#FFF" stroke-width="4"/>
  <line x1="255" y1="380" x2="255" y2="400" stroke="#FFF" stroke-width="4"/>
</svg>`
  },
  {
    id: "sweet-08",
    name: "Eskimo Kiss",
    mood: "sweet",
    desc: "Bears touching noses gently",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="170" cy="240" r="85" fill="#C68B59"/>
  <circle cx="342" cy="240" r="85" fill="#E8A598"/>
  <!-- Noses touching in center -->
  <ellipse cx="250" cy="250" rx="12" ry="10" fill="#3D2314"/>
  <ellipse cx="262" cy="250" rx="12" ry="10" fill="#3D2314"/>
  <!-- Happy closed eyes -->
  <path d="M160 215 Q175 200 190 215" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M322 215 Q337 200 352 215" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="245" r="14" fill="#FF8A80" opacity="0.6"/>
  <circle cx="362" cy="245" r="14" fill="#FF8A80" opacity="0.6"/>
  <!-- Sparkles -->
  <circle cx="256" cy="170" r="10" fill="#FFD700"/>
  <circle cx="256" cy="130" r="5" fill="#FFD700"/>
</svg>`
  },

  // --- SILLY (8) ---
  {
    id: "silly-01",
    name: "Tongue Out",
    mood: "silly",
    desc: "Sticking tongue out playfully",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="180" cy="140" r="45" fill="#C68B59"/>
  <circle cx="332" cy="140" r="45" fill="#C68B59"/>
  <circle cx="256" cy="240" r="100" fill="#C68B59"/>
  <!-- Goofy Winking Eyes -->
  <circle cx="205" cy="205" r="12" fill="#3D2314"/>
  <path d="M285 210 Q305 190 325 210" stroke="#3D2314" stroke-width="6" fill="none" stroke-linecap="round"/>
  <ellipse cx="256" cy="245" rx="35" ry="25" fill="#FCEBD9"/>
  <circle cx="256" cy="235" r="8" fill="#3D2314"/>
  <!-- Tongue sticking out -->
  <path d="M245 260 C245 285, 267 285, 267 260 Z" fill="#FF5252"/>
  <line x1="256" y1="260" x2="256" y2="275" stroke="#D32F2F" stroke-width="3"/>
  <circle cx="185" cy="235" r="14" fill="#FF8A80" opacity="0.6"/><circle cx="327" cy="235" r="14" fill="#FF8A80" opacity="0.6"/>
</svg>`
  },
  {
    id: "silly-02",
    name: "Pot on Head",
    mood: "silly",
    desc: "Boy bear with honey pot stuck on head",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="270" r="95" fill="#C68B59"/>
  <!-- Inverted Pot on head -->
  <ellipse cx="256" cy="160" rx="80" ry="70" fill="#FFA000"/>
  <ellipse cx="256" cy="220" rx="70" ry="18" fill="#FF8F00"/>
  <!-- Drips over face -->
  <path d="M210 220 Q215 250 220 230" stroke="#FFD54F" stroke-width="8" stroke-linecap="round"/>
  <path d="M280 220 Q290 260 295 240" stroke="#FFD54F" stroke-width="10" stroke-linecap="round"/>
  <!-- Confused Cross-eyed -->
  <circle cx="225" cy="270" r="7" fill="#3D2314"/>
  <circle cx="275" cy="270" r="7" fill="#3D2314"/>
  <circle cx="256" cy="295" r="8" fill="#3D2314"/>
  <path d="M245 320 Q256 310 267 320" stroke="#3D2314" stroke-width="4" fill="none"/>
</svg>`
  },
  {
    id: "silly-03",
    name: "Wiggle Dance",
    mood: "silly",
    desc: "Girl bear doing a happy wiggle dance",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="180" cy="150" r="40" fill="#E8A598"/><circle cx="320" cy="150" r="40" fill="#E8A598"/>
  <circle cx="250" cy="230" r="85" fill="#E8A598"/>
  <ellipse cx="265" cy="345" rx="75" ry="65" fill="#E8A598" transform="rotate(12 265 345)"/>
  <!-- Motion lines -->
  <path d="M120 300 Q140 280 120 260" stroke="#FF80AB" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M390 350 Q410 330 390 310" stroke="#FF80AB" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- Singing face -->
  <circle cx="220" cy="210" r="6" fill="#3D2314"/><circle cx="275" cy="205" r="6" fill="#3D2314"/>
  <ellipse cx="250" cy="245" rx="14" ry="18" fill="#FF4081"/>
  <!-- Musical notes -->
  <text x="360" y="180" font-size="36" fill="#FF4081">🎶</text>
</svg>`
  },
  {
    id: "silly-04",
    name: "Cool Shades",
    mood: "silly",
    desc: "Bears wearing oversized cool sunglasses",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="240" r="105" fill="#C68B59"/>
  <circle cx="170" cy="140" r="40" fill="#C68B59"/><circle cx="342" cy="140" r="40" fill="#C68B59"/>
  <!-- Cool Black Sunglasses -->
  <rect x="170" y="195" width="75" height="55" rx="14" fill="#212121"/>
  <rect x="267" y="195" width="75" height="55" rx="14" fill="#212121"/>
  <rect x="240" y="210" width="30" height="8" fill="#212121"/>
  <!-- Glasses Glare -->
  <line x1="180" y1="235" x2="205" y2="205" stroke="#FFFFFF" stroke-width="4" opacity="0.7"/>
  <line x1="277" y1="235" x2="302" y2="205" stroke="#FFFFFF" stroke-width="4" opacity="0.7"/>
  <!-- Smirk -->
  <path d="M245 285 Q265 295 280 275" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`
  },
  {
    id: "silly-05",
    name: "Tickle Monster",
    mood: "silly",
    desc: "Boy bear tickling girl bear giggling",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="220" cy="250" r="80" fill="#C68B59"/>
  <circle cx="330" cy="240" r="75" fill="#E8A598"/>
  <!-- Squinting laughing eyes -->
  <path d="M300 220 L315 230 L300 240" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M350 220 L335 230 L350 240" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Tickling paws -->
  <circle cx="280" cy="280" r="22" fill="#C68B59"/>
  <circle cx="270" cy="250" r="20" fill="#C68B59"/>
  <text x="340" y="160" font-family="sans-serif" font-weight="bold" font-size="28" fill="#FF4081">HEHEHE!</text>
</svg>`
  },
  {
    id: "silly-06",
    name: "Apple Balance",
    mood: "silly",
    desc: "Balancing an apple on bear head",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="270" r="95" fill="#C68B59"/>
  <circle cx="170" cy="180" r="38" fill="#C68B59"/><circle cx="342" cy="180" r="38" fill="#C68B59"/>
  <!-- Concentrating eyes looking up -->
  <ellipse cx="220" cy="235" rx="8" ry="12" fill="#3D2314"/>
  <ellipse cx="292" cy="235" rx="8" ry="12" fill="#3D2314"/>
  <!-- Red apple on head -->
  <circle cx="256" cy="135" r="40" fill="#E53935"/>
  <path d="M256 95 Q265 75 275 80" stroke="#795548" stroke-width="5" fill="none"/>
  <ellipse cx="268" cy="85" rx="10" ry="6" fill="#4CAF50" transform="rotate(-20 268 85)"/>
  <!-- Sweat drop -->
  <path d="M330 220 Q335 235 325 240 Q315 235 320 220 Z" fill="#29B6F6"/>
</svg>`
  },
  {
    id: "silly-07",
    name: "Box Pop",
    mood: "silly",
    desc: "Popping out of a cardboard box",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Bear head popping out -->
  <circle cx="256" cy="200" r="75" fill="#E8A598"/>
  <circle cx="195" cy="135" r="30" fill="#E8A598"/><circle cx="317" cy="135" r="30" fill="#E8A598"/>
  <circle cx="230" cy="185" r="8" fill="#3D2314"/><circle cx="282" cy="185" r="8" fill="#3D2314"/>
  <ellipse cx="256" cy="215" rx="16" ry="12" fill="#FF4081"/>
  <!-- Cardboard Box -->
  <rect x="156" y="250" width="200" height="150" fill="#BCAAA4"/>
  <path d="M156 250 L120 210 L176 250 Z" fill="#A1887F"/>
  <path d="M356 250 L392 210 L336 250 Z" fill="#A1887F"/>
  <text x="256" y="340" font-family="sans-serif" font-weight="bold" font-size="24" fill="#5D4037" text-anchor="middle">PEEK-A-BOO!</text>
</svg>`
  },
  {
    id: "silly-08",
    name: "Secret Handshake",
    mood: "silly",
    desc: "Bears doing a secret funny handshake",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="200" r="65" fill="#C68B59"/>
  <circle cx="362" cy="200" r="65" fill="#E8A598"/>
  <!-- High Five Explosion in Center -->
  <circle cx="256" cy="260" r="30" fill="#FFEB3B"/>
  <polygon points="256,190 270,240 320,240 280,270 295,320 256,290 217,320 232,270 192,240 242,240" fill="#FFA000"/>
  <!-- Paws clamping -->
  <rect x="180" y="245" width="60" height="30" rx="15" fill="#C68B59"/>
  <rect x="272" y="245" width="60" height="30" rx="15" fill="#E8A598"/>
  <text x="256" y="390" font-family="sans-serif" font-weight="bold" font-size="32" fill="#FF6D00" text-anchor="middle">TEAM US!</text>
</svg>`
  },

  // --- SORRY (8) ---
  {
    id: "sorry-01",
    name: "Puppy Eyes",
    mood: "sorry",
    desc: "Droopy ears and sad big eyes",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Droopy ears -->
  <ellipse cx="160" cy="190" rx="35" ry="48" fill="#C68B59"/>
  <ellipse cx="352" cy="190" rx="35" ry="48" fill="#C68B59"/>
  <circle cx="256" cy="240" r="100" fill="#C68B59"/>
  <!-- Huge glossy eyes -->
  <circle cx="210" cy="215" r="22" fill="#3D2314"/>
  <circle cx="203" cy="208" r="8" fill="#FFFFFF"/>
  <circle cx="302" cy="215" r="22" fill="#3D2314"/>
  <circle cx="295" cy="208" r="8" fill="#FFFFFF"/>
  <!-- Sad quivering mouth -->
  <path d="M236 280 Q256 265 276 280" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Teardrop -->
  <path d="M210 245 Q215 260 205 265 Q195 260 200 245 Z" fill="#29B6F6"/>
  <!-- Holding Sorry sign -->
  <rect x="176" y="340" width="160" height="60" rx="12" fill="#FFFFFF" stroke="#C68B59" stroke-width="4"/>
  <text x="256" y="378" font-family="sans-serif" font-weight="bold" font-size="24" fill="#D32F2F" text-anchor="middle">I'M SORRY</text>
</svg>`
  },
  {
    id: "sorry-02",
    name: "Band-aid Heart",
    mood: "sorry",
    desc: "Offering a band-aid with mended heart",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="200" r="85" fill="#C68B59"/>
  <circle cx="180" cy="130" r="35" fill="#C68B59"/><circle cx="332" cy="130" r="35" fill="#C68B59"/>
  <circle cx="225" cy="185" r="7" fill="#3D2314"/><circle cx="287" cy="185" r="7" fill="#3D2314"/>
  <!-- Heart with Bandage -->
  <path d="M256 280 C230 240, 170 250, 170 290 C170 340, 256 380, 256 395 C256 380, 342 340, 342 290 C342 250, 282 240, 256 280 Z" fill="#E91E63"/>
  <!-- Bandage crossing heart -->
  <rect x="216" y="300" width="80" height="30" rx="8" fill="#FFE082" transform="rotate(-25 256 315)"/>
  <circle cx="245" cy="315" r="3" fill="#FFB74D"/>
  <circle cx="267" cy="315" r="3" fill="#FFB74D"/>
</svg>`
  },
  {
    id: "sorry-03",
    name: "Hiding Face",
    mood: "sorry",
    desc: "Paws covering face peeking out",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="240" r="100" fill="#E8A598"/>
  <circle cx="170" cy="150" r="40" fill="#E8A598"/><circle cx="342" cy="150" r="40" fill="#E8A598"/>
  <!-- Paws covering face -->
  <circle cx="205" cy="240" r="45" fill="#E8A598" stroke="#D87A68" stroke-width="4"/>
  <circle cx="307" cy="240" r="45" fill="#E8A598" stroke="#D87A68" stroke-width="4"/>
  <!-- Eyes peeking between paws -->
  <circle cx="230" cy="215" r="8" fill="#3D2314"/>
  <circle cx="282" cy="215" r="8" fill="#3D2314"/>
  <text x="256" y="360" font-family="sans-serif" font-weight="bold" font-size="22" fill="#D87A68" text-anchor="middle">Forgive me please?</text>
</svg>`
  },
  {
    id: "sorry-04",
    name: "Single Daisy",
    mood: "sorry",
    desc: "Head bowed with a single gentle flower",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="220" r="85" fill="#C68B59"/>
  <!-- Bowed eyes -->
  <path d="M210 215 Q225 230 240 215" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M272 215 Q287 230 302 215" stroke="#3D2314" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Stem & Daisy -->
  <path d="M256 360 L256 280" stroke="#4CAF50" stroke-width="6"/>
  <circle cx="256" cy="275" r="14" fill="#FFEB3B"/>
  <!-- Petals -->
  <circle cx="256" cy="250" r="12" fill="#FFFFFF"/>
  <circle cx="256" cy="300" r="12" fill="#FFFFFF"/>
  <circle cx="231" cy="275" r="12" fill="#FFFFFF"/>
  <circle cx="281" cy="275" r="12" fill="#FFFFFF"/>
</svg>`
  },
  {
    id: "sorry-05",
    name: "Pinky Promise",
    mood: "sorry",
    desc: "Pinky fingers locked together in promise",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="160" cy="220" r="75" fill="#C68B59"/>
  <circle cx="352" cy="220" r="75" fill="#E8A598"/>
  <!-- Pinkies entwined in center -->
  <path d="M210 270 Q256 290 256 260" stroke="#C68B59" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M302 270 Q256 290 256 260" stroke="#E8A598" stroke-width="20" stroke-linecap="round" fill="none"/>
  <circle cx="256" cy="245" r="8" fill="#FF4081"/>
  <text x="256" y="380" font-family="sans-serif" font-weight="bold" font-size="24" fill="#FF4081" text-anchor="middle">Promise won't happen again</text>
</svg>`
  },
  {
    id: "sorry-06",
    name: "Gentle Pat",
    mood: "sorry",
    desc: "Comforting gentle pat on partner's head",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="320" cy="260" r="80" fill="#E8A598"/>
  <circle cx="180" cy="240" r="75" fill="#C68B59"/>
  <!-- Boy bear reaching over to pat girl bear -->
  <path d="M190 220 Q260 160 300 185" stroke="#C68B59" stroke-width="26" stroke-linecap="round" fill="none"/>
  <circle cx="300" cy="185" r="16" fill="#C68B59"/>
  <circle cx="320" cy="235" r="12" fill="#FF8A80" opacity="0.6"/>
  <path d="M305 240 Q320 225 335 240" stroke="#3D2314" stroke-width="4" fill="none"/>
</svg>`
  },
  {
    id: "sorry-07",
    name: "Rain Umbrella",
    mood: "sorry",
    desc: "Holding umbrella over sad partner in rain",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Umbrella -->
  <path d="M160 170 Q256 90 352 170 Z" fill="#29B6F6"/>
  <line x1="256" y1="170" x2="256" y2="280" stroke="#37474F" stroke-width="8"/>
  <!-- Two bears huddled underneath -->
  <circle cx="215" cy="280" r="55" fill="#C68B59"/>
  <circle cx="297" cy="280" r="52" fill="#E8A598"/>
  <!-- Raindrops outside -->
  <line x1="120" y1="180" x2="110" y2="210" stroke="#90CAF9" stroke-width="4" stroke-linecap="round"/>
  <line x1="390" y1="180" x2="380" y2="210" stroke="#90CAF9" stroke-width="4" stroke-linecap="round"/>
</svg>`
  },
  {
    id: "sorry-08",
    name: "Forehead Nuzzle",
    mood: "sorry",
    desc: "Gentle forehead reconciliation",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="190" cy="230" r="80" fill="#C68B59"/>
  <circle cx="322" cy="230" r="80" fill="#E8A598"/>
  <!-- Foreheads touching -->
  <circle cx="170" cy="210" r="6" fill="#3D2314"/>
  <circle cx="342" cy="210" r="6" fill="#3D2314"/>
  <!-- Warm glow in middle -->
  <circle cx="256" cy="215" r="25" fill="#FFE082" opacity="0.6"/>
  <path d="M256 160 C246 145, 226 150, 226 165 C226 180, 256 200, 256 205 C256 200, 286 180, 286 165 C286 150, 266 145, 256 160 Z" fill="#FF4081"/>
</svg>`
  },

  // --- MISS YOU (8) ---
  {
    id: "missyou-01",
    name: "Photo Frame",
    mood: "missyou",
    desc: "Looking at a framed photo of partner",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="220" r="85" fill="#C68B59"/>
  <circle cx="130" cy="140" r="32" fill="#C68B59"/><circle cx="270" cy="140" r="32" fill="#C68B59"/>
  <!-- Eyes looking down at frame -->
  <ellipse cx="185" cy="210" rx="6" ry="10" fill="#3D2314"/>
  <ellipse cx="235" cy="210" rx="6" ry="10" fill="#3D2314"/>
  <!-- Photo Frame held in paws -->
  <rect x="260" y="220" width="120" height="150" rx="10" fill="#8D6E63" stroke="#5D4037" stroke-width="8"/>
  <rect x="275" y="235" width="90" height="120" fill="#FFF0EC"/>
  <!-- Picture of girl bear inside -->
  <circle cx="320" cy="285" r="26" fill="#E8A598"/>
  <circle cx="320" cy="330" r="4" fill="#FF4081"/>
</svg>`
  },
  {
    id: "missyou-02",
    name: "Cup Telephone",
    mood: "missyou",
    desc: "Speaking into paper cup string telephone",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="160" cy="230" r="75" fill="#C68B59"/>
  <!-- Paper cup held to ear -->
  <polygon points="210,190 260,175 260,245 210,230" fill="#FF7043"/>
  <line x1="260" y1="210" x2="420" y2="210" stroke="#B0BEC5" stroke-width="4" stroke-dasharray="6 6"/>
  <text x="340" y="190" font-family="sans-serif" font-weight="bold" font-size="20" fill="#FF7043">CAN YOU HEAR ME?</text>
</svg>`
  },
  {
    id: "missyou-03",
    name: "Pillow Hug",
    mood: "missyou",
    desc: "Hugging partner's pillow tightly",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Big fluffy pillow -->
  <rect x="180" y="180" width="190" height="160" rx="35" fill="#E1F5FE" stroke="#81D4FA" stroke-width="6"/>
  <!-- Bear arms wrapping around pillow -->
  <circle cx="210" cy="180" r="65" fill="#E8A598"/>
  <path d="M160 260 Q230 330 310 260" stroke="#E8A598" stroke-width="28" stroke-linecap="round" fill="none"/>
  <!-- Peaceful sleeping eyes -->
  <path d="M190 170 Q205 160 220 170" stroke="#3D2314" stroke-width="4" fill="none"/>
  <text x="275" y="270" font-size="28" fill="#FF4081">❤️</text>
</svg>`
  },
  {
    id: "missyou-04",
    name: "Window Rain",
    mood: "missyou",
    desc: "Looking out rain streaked window",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Window frame -->
  <rect x="140" y="120" width="232" height="260" rx="12" fill="#E0F7FA" stroke="#78909C" stroke-width="12"/>
  <line x1="256" y1="120" x2="256" y2="380" stroke="#78909C" stroke-width="8"/>
  <line x1="140" y1="250" x2="372" y2="250" stroke="#78909C" stroke-width="8"/>
  <!-- Bear silhouette inside looking out -->
  <circle cx="220" cy="270" r="45" fill="#C68B59"/>
  <circle cx="190" cy="225" r="18" fill="#C68B59"/>
  <!-- Drawn heart on steamed glass -->
  <path d="M310 180 Q300 170 290 180 Q280 190 310 210 Q340 190 330 180 Z" stroke="#FF4081" stroke-width="4" fill="none"/>
</svg>`
  },
  {
    id: "missyou-05",
    name: "Counting Days",
    mood: "missyou",
    desc: "Marking X on calendar with red marker",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Calendar -->
  <rect x="180" y="140" width="200" height="230" rx="16" fill="#FFFFFF" stroke="#B0BEC5" stroke-width="6"/>
  <rect x="180" y="140" width="200" height="50" rx="8" fill="#E53935"/>
  <text x="280" y="175" font-family="sans-serif" font-weight="bold" font-size="22" fill="#FFFFFF" text-anchor="middle">DAYS UNTIL</text>
  <!-- Grid with big red heart on 14th -->
  <circle cx="280" cy="270" r="35" fill="#FFEBEE"/>
  <text x="280" y="280" font-family="sans-serif" font-weight="bold" font-size="28" fill="#D32F2F" text-anchor="middle">SOON</text>
  <!-- Bear paw marking calendar -->
  <circle cx="160" cy="300" r="45" fill="#C68B59"/>
  <line x1="160" y1="300" x2="230" y2="270" stroke="#E53935" stroke-width="10" stroke-linecap="round"/>
</svg>`
  },
  {
    id: "missyou-06",
    name: "Paper Plane",
    mood: "missyou",
    desc: "Sending a paper airplane with love note",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="180" cy="260" r="80" fill="#E8A598"/>
  <!-- Throwing Arm -->
  <path d="M190 230 Q250 170 300 180" stroke="#E8A598" stroke-width="22" stroke-linecap="round" fill="none"/>
  <!-- Paper airplane flying -->
  <polygon points="320,170 420,130 350,210 350,180" fill="#FFFFFF" stroke="#90A4AE" stroke-width="4"/>
  <line x1="320" y1="170" x2="350" y2="180" stroke="#90A4AE" stroke-width="3"/>
  <path d="M390 140 C380 130 370 140 375 145 Z" fill="#FF4081"/>
</svg>`
  },
  {
    id: "missyou-07",
    name: "Same Star",
    mood: "missyou",
    desc: "Gazing at the same star tonight",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="330" r="90" fill="#C68B59"/>
  <!-- Night Sky Backdrop -->
  <ellipse cx="256" cy="180" rx="140" ry="80" fill="#1A237E" opacity="0.15"/>
  <!-- Huge shining yellow star -->
  <polygon points="256,90 268,125 305,125 275,148 286,182 256,160 226,182 237,148 207,125 244,125" fill="#FFD54F"/>
  <!-- Head tilted up gazing -->
  <circle cx="230" cy="290" r="8" fill="#3D2314"/><circle cx="282" cy="290" r="8" fill="#3D2314"/>
  <text x="256" y="440" font-family="sans-serif" font-weight="bold" font-size="20" fill="#3F51B5" text-anchor="middle">Under the same sky</text>
</svg>`
  },
  {
    id: "missyou-08",
    name: "Dreaming Sigh",
    mood: "missyou",
    desc: "Bear sighing with partner thought bubble",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="190" cy="290" r="80" fill="#C68B59"/>
  <ellipse cx="190" cy="305" rx="30" ry="20" fill="#FCEBD9"/>
  <circle cx="190" cy="295" r="7" fill="#3D2314"/>
  <!-- Dream bubble -->
  <circle cx="270" cy="200" r="12" fill="#E0F7FA"/>
  <circle cx="300" cy="170" r="18" fill="#E0F7FA"/>
  <ellipse cx="360" cy="120" rx="60" ry="45" fill="#E0F7FA" stroke="#80DEEA" stroke-width="4"/>
  <!-- Partner face in dream -->
  <circle cx="360" cy="120" r="25" fill="#E8A598"/>
  <circle cx="360" cy="110" r="3" fill="#FF4081"/>
</svg>`
  },

  // --- GOODNIGHT (8) ---
  {
    id: "goodnight-01",
    name: "Tucked In",
    mood: "goodnight",
    desc: "Tucked in bed under starry quilt fast asleep",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Pillow -->
  <rect x="156" y="180" width="200" height="90" rx="30" fill="#FFF9C4"/>
  <!-- Bear head sleeping -->
  <circle cx="256" cy="220" r="65" fill="#C68B59"/>
  <circle cx="200" cy="165" r="25" fill="#C68B59"/><circle cx="312" cy="165" r="25" fill="#C68B59"/>
  <!-- Sleeping eyes -->
  <path d="M225 215 Q235 225 245 215" stroke="#3D2314" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M267 215 Q277 225 287 215" stroke="#3D2314" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Starry Quilt -->
  <rect x="140" y="250" width="232" height="160" rx="20" fill="#3949AB"/>
  <circle cx="180" cy="300" r="6" fill="#FFF59D"/>
  <circle cx="280" cy="330" r="8" fill="#FFF59D"/>
  <circle cx="330" cy="290" r="5" fill="#FFF59D"/>
  <!-- Zzz -->
  <text x="330" y="150" font-family="sans-serif" font-weight="bold" font-size="28" fill="#5C6BC0">Zzz...</text>
</svg>`
  },
  {
    id: "goodnight-02",
    name: "Forehead Kiss",
    mood: "goodnight",
    desc: "Goodnight kiss on forehead before sleep",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="230" cy="270" r="75" fill="#E8A598"/>
  <circle cx="290" cy="200" r="70" fill="#C68B59"/>
  <!-- Boy kissing girl forehead -->
  <ellipse cx="250" cy="220" rx="14" ry="10" fill="#C68B59"/>
  <!-- Sleeping peaceful face -->
  <path d="M205 270 Q215 280 225 270" stroke="#3D2314" stroke-width="4" fill="none"/>
  <path d="M245 270 Q255 280 265 270" stroke="#3D2314" stroke-width="4" fill="none"/>
  <!-- Floating sweet dream stars -->
  <text x="350" y="140" font-size="32" fill="#FFD54F">✨</text>
</svg>`
  },
  {
    id: "goodnight-03",
    name: "Moon Hug",
    mood: "goodnight",
    desc: "Hugging a smiling yellow crescent moon",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Crescent Moon -->
  <path d="M256 100 C340 100 400 170 400 256 C400 342 340 412 256 412 C290 370 310 320 310 256 C310 192 290 142 256 100 Z" fill="#FDD835"/>
  <!-- Bear holding onto the moon -->
  <circle cx="240" cy="250" r="70" fill="#C68B59"/>
  <circle cx="180" cy="190" r="26" fill="#C68B59"/>
  <path d="M220 280 Q280 260 290 300" stroke="#C68B59" stroke-width="20" stroke-linecap="round" fill="none"/>
  <path d="M220 240 Q230 250 240 240" stroke="#3D2314" stroke-width="4" fill="none"/>
  <text x="180" y="380" font-family="sans-serif" font-weight="bold" font-size="24" fill="#FBC02D">SWEET DREAMS</text>
</svg>`
  },
  {
    id: "goodnight-04",
    name: "Cloud Snooze",
    mood: "goodnight",
    desc: "Sleeping on a fluffy night cloud",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Bear sleeping -->
  <circle cx="256" cy="220" r="70" fill="#E8A598"/>
  <circle cx="195" cy="165" r="25" fill="#E8A598"/><circle cx="317" cy="165" r="25" fill="#E8A598"/>
  <path d="M230 215 Q240 225 250 215" stroke="#3D2314" stroke-width="4" fill="none"/>
  <path d="M265 215 Q275 225 285 215" stroke="#3D2314" stroke-width="4" fill="none"/>
  <!-- Fluffy Cloud -->
  <path d="M170 330 C140 330 120 300 140 270 C140 240 180 230 200 250 C220 220 280 220 300 250 C330 230 370 250 370 280 C390 300 380 330 350 330 Z" fill="#EDE7F6" stroke="#D1C4E9" stroke-width="6"/>
</svg>`
  },
  {
    id: "goodnight-05",
    name: "Firefly Lantern",
    mood: "goodnight",
    desc: "Night lantern with glowing fireflies",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="250" r="80" fill="#C68B59"/>
  <!-- Lantern held in paw -->
  <rect x="290" y="210" width="70" height="110" rx="12" fill="#FFF9C4" stroke="#455A64" stroke-width="8"/>
  <rect x="280" y="195" width="90" height="20" rx="6" fill="#37474F"/>
  <rect x="280" y="315" width="90" height="20" rx="6" fill="#37474F"/>
  <!-- Glowing firefly inside -->
  <circle cx="325" cy="265" r="16" fill="#FFEB3B"/>
  <circle cx="325" cy="265" r="8" fill="#FFF59D"/>
</svg>`
  },
  {
    id: "goodnight-06",
    name: "Pyjama Yawn",
    mood: "goodnight",
    desc: "Yawning in striped pyjamas holding teddy",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="190" r="80" fill="#C68B59"/>
  <circle cx="185" cy="120" r="30" fill="#C68B59"/><circle cx="327" cy="120" r="30" fill="#C68B59"/>
  <!-- Yawning mouth -->
  <ellipse cx="256" cy="210" rx="22" ry="28" fill="#D32F2F"/>
  <!-- Nightcap on head -->
  <path d="M210 135 Q256 70 330 90 L290 145 Z" fill="#3F51B5"/>
  <circle cx="335" cy="90" r="12" fill="#FFFFFF"/>
  <!-- Striped pyjamas -->
  <rect x="186" y="270" width="140" height="130" rx="20" fill="#E8EAF6"/>
  <line x1="186" y1="310" x2="326" y2="310" stroke="#3F51B5" stroke-width="8"/>
  <line x1="186" y1="350" x2="326" y2="350" stroke="#3F51B5" stroke-width="8"/>
</svg>`
  },
  {
    id: "goodnight-07",
    name: "Counting Sheep",
    mood: "goodnight",
    desc: "Watching tiny fluffy sheep jump",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="180" cy="290" r="70" fill="#E8A598"/>
  <!-- Sleepy eyes looking right -->
  <path d="M165 275 Q180 285 195 275" stroke="#3D2314" stroke-width="4" fill="none"/>
  <!-- Jumping Sheep -->
  <ellipse cx="330" cy="190" rx="35" ry="25" fill="#FFFFFF" stroke="#B0BEC5" stroke-width="4"/>
  <circle cx="300" cy="180" r="14" fill="#37474F"/>
  <line x1="315" y1="210" x2="310" y2="235" stroke="#37474F" stroke-width="4"/>
  <line x1="345" y1="210" x2="350" y2="235" stroke="#37474F" stroke-width="4"/>
  <text x="375" y="170" font-family="sans-serif" font-weight="bold" font-size="24" fill="#78909C">#1</text>
</svg>`
  },
  {
    id: "goodnight-08",
    name: "Sweet Dreams",
    mood: "goodnight",
    desc: "Dream bubble showing the two bears together",
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="210" cy="320" r="75" fill="#C68B59"/>
  <!-- Big dream cloud with both bears -->
  <ellipse cx="310" cy="150" rx="110" ry="75" fill="#FFF9C4" stroke="#FFE082" stroke-width="6"/>
  <!-- Bears hugging in dream -->
  <circle cx="280" cy="150" r="26" fill="#C68B59"/><circle cx="335" cy="150" r="24" fill="#E8A598"/>
  <circle cx="310" cy="130" r="8" fill="#FF4081"/>
  <text x="310" y="200" font-family="sans-serif" font-weight="bold" font-size="14" fill="#FF8F00" text-anchor="middle">SEE YOU IN MY DREAMS</text>
</svg>`
  }
];

// Write individual SVG files
for (const s of STICKERS) {
  const filePath = path.join(STICKERS_DIR, `${s.id}.svg`);
  fs.writeFileSync(filePath, s.svg, 'utf8');
}

// Write manifest.json
const manifestPath = path.join(STICKERS_DIR, 'manifest.json');
const manifestData = STICKERS.map(s => ({
  id: s.id,
  name: s.name,
  file: `/stickers/${s.id}.svg`,
  mood: s.mood,
  animated: false,
  description: s.desc
}));

fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
console.log(`Generated ${STICKERS.length} stickers and manifest.json at ${STICKERS_DIR}`);
