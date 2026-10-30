const fs = require("fs");
const path = require("path");

const demoDir = path.join(__dirname, "..", "..", "public", "images", "demo");

if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}

// Helper to create stylish, modern SVG room illustrations
function createRoomSvg({ title, subtitle, tag, themeColor, accentColor, bgColor, type }) {
  let interiorElements = "";

  if (type === "bedroom") {
    interiorElements = `
      <!-- Window with curtains -->
      <rect x="520" y="70" width="180" height="200" rx="8" fill="#e0f2fe" stroke="#cbd5e1" stroke-width="4"/>
      <line x1="610" y1="70" x2="610" y2="270" stroke="#94a3b8" stroke-width="3"/>
      <line x1="520" y1="170" x2="700" y2="170" stroke="#94a3b8" stroke-width="3"/>
      <path d="M500 60 Q520 180 500 280 L520 280 L520 60 Z" fill="${accentColor}" opacity="0.85"/>
      <path d="M720 60 Q700 180 720 280 L700 280 L700 60 Z" fill="${accentColor}" opacity="0.85"/>

      <!-- Wall Art / Poster -->
      <rect x="180" y="80" width="120" height="80" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
      <circle cx="240" cy="115" r="20" fill="#fde047"/>
      <polygon points="195,150 225,120 250,145 285,110 300,150" fill="${themeColor}" opacity="0.7"/>

      <!-- Bed Headboard & Frame -->
      <rect x="100" y="240" width="280" height="150" rx="10" fill="#78350f"/>
      <!-- Mattress & Bed Sheet -->
      <rect x="110" y="270" width="290" height="130" rx="8" fill="#f8fafc"/>
      <!-- Duvet / Blanket -->
      <rect x="200" y="270" width="200" height="130" rx="6" fill="${themeColor}"/>
      <!-- Pillows -->
      <rect x="125" y="250" width="60" height="40" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="125" y="295" width="60" height="40" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>

      <!-- Bedside Table & Lamp -->
      <rect x="50" y="320" width="45" height="70" rx="4" fill="#92400e"/>
      <rect x="62" y="290" width="20" height="30" fill="#cbd5e1"/>
      <polygon points="52,290 92,290 82,260 62,260" fill="#fbbf24"/>
      <circle cx="72" cy="275" r="10" fill="#fef08a" opacity="0.6"/>

      <!-- Study Desk on Right -->
      <rect x="520" y="310" width="180" height="18" rx="3" fill="#78350f"/>
      <rect x="535" y="328" width="12" height="90" fill="#451a03"/>
      <rect x="670" y="328" width="12" height="90" fill="#451a03"/>
      <!-- Laptop on Desk -->
      <rect x="575" y="285" width="45" height="25" rx="3" fill="#334155"/>
      <rect x="565" y="307" width="65" height="4" rx="2" fill="#64748b"/>
    `;
  } else if (type === "living") {
    interiorElements = `
      <!-- Large Balcony Glass Door -->
      <rect x="80" y="60" width="220" height="250" rx="6" fill="#e0f2fe" stroke="#94a3b8" stroke-width="4"/>
      <line x1="190" y1="60" x2="190" y2="310" stroke="#64748b" stroke-width="4"/>

      <!-- Wall Clock -->
      <circle cx="480" cy="110" r="30" fill="#ffffff" stroke="${themeColor}" stroke-width="4"/>
      <line x1="480" y1="110" x2="480" y2="92" stroke="#1e293b" stroke-width="3"/>
      <line x1="480" y1="110" x2="496" y2="110" stroke="#1e293b" stroke-width="2"/>

      <!-- Modern Sofa / Couch -->
      <rect x="350" y="250" width="340" height="100" rx="16" fill="${themeColor}"/>
      <rect x="370" y="230" width="300" height="50" rx="12" fill="${themeColor}"/>
      <!-- Cushions -->
      <rect x="390" y="240" width="50" height="40" rx="8" fill="${accentColor}"/>
      <rect x="590" y="240" width="50" height="40" rx="8" fill="#fbbf24"/>
      <!-- Sofa legs -->
      <rect x="375" y="350" width="12" height="25" fill="#451a03"/>
      <rect x="655" y="350" width="12" height="25" fill="#451a03"/>

      <!-- Coffee Table & Indoor Plant -->
      <ellipse cx="520" cy="385" rx="90" ry="22" fill="#d97706"/>
      <rect x="515" y="355" width="14" height="20" rx="2" fill="#ffffff" stroke="#94a3b8"/>
      <circle cx="522" cy="345" r="14" fill="#15803d"/>
    `;
  } else if (type === "pg_hostel") {
    interiorElements = `
      <!-- Bunk Bed or Twin Beds -->
      <!-- Bed 1 (Left) -->
      <rect x="80" y="220" width="18" height="190" rx="4" fill="#334155"/>
      <rect x="260" y="220" width="18" height="190" rx="4" fill="#334155"/>
      <!-- Top Bunk -->
      <rect x="98" y="235" width="162" height="25" rx="4" fill="${themeColor}"/>
      <rect x="105" y="225" width="40" height="15" rx="4" fill="#ffffff"/>
      <!-- Bottom Bunk -->
      <rect x="98" y="335" width="162" height="25" rx="4" fill="${accentColor}"/>
      <rect x="105" y="325" width="40" height="15" rx="4" fill="#ffffff"/>
      <!-- Ladder -->
      <line x1="220" y1="220" x2="220" y2="400" stroke="#64748b" stroke-width="4"/>
      <line x1="240" y1="220" x2="240" y2="400" stroke="#64748b" stroke-width="4"/>
      <line x1="220" y1="260" x2="240" y2="260" stroke="#64748b" stroke-width="3"/>
      <line x1="220" y1="300" x2="240" y2="300" stroke="#64748b" stroke-width="3"/>
      <line x1="220" y1="340" x2="240" y2="340" stroke="#64748b" stroke-width="3"/>

      <!-- Lockers / Wardrobes -->
      <rect x="340" y="150" width="140" height="250" rx="6" fill="#475569" stroke="#1e293b" stroke-width="3"/>
      <line x1="410" y1="150" x2="410" y2="400" stroke="#1e293b" stroke-width="3"/>
      <circle cx="395" cy="270" r="5" fill="#f59e0b"/>
      <circle cx="425" cy="270" r="5" fill="#f59e0b"/>

      <!-- Study Desk (Right) -->
      <rect x="540" y="280" width="180" height="18" rx="3" fill="#78350f"/>
      <rect x="550" y="298" width="12" height="105" fill="#451a03"/>
      <rect x="695" y="298" width="12" height="105" fill="#451a03"/>
      <!-- Bookshelf -->
      <rect x="570" y="130" width="120" height="14" fill="#78350f"/>
      <rect x="580" y="100" width="18" height="30" fill="#dc2626"/>
      <rect x="600" y="95" width="22" height="35" fill="#2563eb"/>
      <rect x="625" y="102" width="16" height="28" fill="#16a34a"/>
    `;
  } else if (type === "study") {
    interiorElements = `
      <!-- Bookshelf full wall -->
      <rect x="80" y="80" width="260" height="320" rx="6" fill="#78350f" stroke="#451a03" stroke-width="4"/>
      <line x1="80" y1="150" x2="340" y2="150" stroke="#451a03" stroke-width="4"/>
      <line x1="80" y1="230" x2="340" y2="230" stroke="#451a03" stroke-width="4"/>
      <line x1="80" y1="310" x2="340" y2="310" stroke="#451a03" stroke-width="4"/>
      <!-- Books -->
      <rect x="100" y="105" width="20" height="45" fill="#e11d48"/>
      <rect x="122" y="95" width="25" height="55" fill="#2563eb"/>
      <rect x="150" y="110" width="30" height="40" fill="#059669"/>
      <rect x="200" y="180" width="22" height="50" fill="#d97706"/>
      <rect x="225" y="175" width="28" height="55" fill="${themeColor}"/>

      <!-- Study Desk Center -->
      <rect x="420" y="270" width="280" height="20" rx="4" fill="#92400e"/>
      <rect x="440" y="290" width="16" height="110" fill="#78350f"/>
      <rect x="665" y="290" width="16" height="110" fill="#78350f"/>
      <!-- Desktop Screen -->
      <rect x="520" y="175" width="90" height="65" rx="4" fill="#1e293b"/>
      <rect x="525" y="180" width="80" height="50" fill="#38bdf8"/>
      <rect x="557" y="240" width="16" height="30" fill="#64748b"/>
      <rect x="545" y="267" width="40" height="4" rx="2" fill="#64748b"/>
      <!-- Study Chair -->
      <rect x="525" y="290" width="80" height="60" rx="10" fill="${accentColor}"/>
      <rect x="555" y="350" width="20" height="55" fill="#1e293b"/>
    `;
  } else if (type === "kitchen") {
    interiorElements = `
      <!-- Kitchen Cabinets Top -->
      <rect x="100" y="60" width="600" height="90" rx="6" fill="#334155" stroke="#1e293b" stroke-width="3"/>
      <line x1="250" y1="60" x2="250" y2="150" stroke="#1e293b" stroke-width="2"/>
      <line x1="400" y1="60" x2="400" y2="150" stroke="#1e293b" stroke-width="2"/>
      <line x1="550" y1="60" x2="550" y2="150" stroke="#1e293b" stroke-width="2"/>

      <!-- Kitchen Countertop -->
      <rect x="80" y="260" width="640" height="25" rx="3" fill="#0f172a"/>
      <rect x="100" y="285" width="600" height="135" fill="${themeColor}"/>

      <!-- Chimney & Stove -->
      <polygon points="340,150 460,150 490,210 310,210" fill="#64748b"/>
      <rect x="360" y="245" width="80" height="15" rx="3" fill="#334155"/>
      <circle cx="385" cy="252" r="6" fill="#ef4444"/>
      <circle cx="415" cy="252" r="6" fill="#ef4444"/>

      <!-- Refrigerator (Right) -->
      <rect x="570" y="170" width="110" height="245" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/>
      <line x1="570" y1="260" x2="680" y2="260" stroke="#94a3b8" stroke-width="3"/>
      <rect x="580" y="210" width="8" height="35" rx="2" fill="#64748b"/>
      <rect x="580" y="280" width="8" height="45" rx="2" fill="#64748b"/>
    `;
  } else {
    // Balcony / View
    interiorElements = `
      <!-- Open Balcony Railing -->
      <rect x="60" y="260" width="680" height="14" rx="4" fill="#334155"/>
      <line x1="60" y1="274" x2="740" y2="274" stroke="#64748b" stroke-width="3"/>
      ${[100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700]
        .map((x) => `<line x1="${x}" y1="274" x2="${x}" y2="395" stroke="#475569" stroke-width="6"/>`)
        .join("")}
      <rect x="60" y="395" width="680" height="25" fill="#1e293b"/>

      <!-- Bihar City Skyline in Background -->
      <rect x="120" y="130" width="60" height="130" fill="#94a3b8" opacity="0.5"/>
      <rect x="210" y="90" width="80" height="170" fill="#64748b" opacity="0.6"/>
      <rect x="320" y="150" width="70" height="110" fill="#94a3b8" opacity="0.5"/>
      <rect x="420" y="110" width="90" height="150" fill="#475569" opacity="0.6"/>
      <rect x="540" y="140" width="80" height="120" fill="#94a3b8" opacity="0.5"/>
      <circle cx="670" cy="90" r="35" fill="#fef08a" opacity="0.8"/>

      <!-- Balcony Coffee Chairs -->
      <rect x="230" y="290" width="50" height="60" rx="8" fill="${themeColor}"/>
      <rect x="330" y="290" width="50" height="60" rx="8" fill="${themeColor}"/>
      <ellipse cx="305" cy="325" rx="20" ry="10" fill="#78350f"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background Wall & Floor -->
  <rect width="800" height="400" fill="url(#bgGrad)"/>
  <rect y="400" width="800" height="100" fill="#94a3b8"/>
  <line x1="0" y1="400" x2="800" y2="400" stroke="#64748b" stroke-width="4"/>

  <!-- Interior Elements -->
  ${interiorElements}

  <!-- Top Title Badge -->
  <g filter="url(#shadow)">
    <rect x="40" y="30" width="360" height="70" rx="12" fill="#0f242a" opacity="0.9"/>
    <rect x="40" y="30" width="8" height="70" rx="4" fill="${accentColor}"/>
    <text x="65" y="60" fill="#ffffff" font-size="20" font-weight="700" font-family="'Segoe UI', -apple-system, sans-serif">${title}</text>
    <text x="65" y="82" fill="#94a3b8" font-size="13" font-family="'Segoe UI', -apple-system, sans-serif">${subtitle}</text>
  </g>

  <!-- Tag Pill -->
  <g>
    <rect x="650" y="30" width="110" height="34" rx="17" fill="${themeColor}"/>
    <text x="705" y="52" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700" font-family="'Segoe UI', sans-serif">${tag}</text>
  </g>
</svg>`;
}

const imagesToCreate = [
  { file: "room-single-1.svg", title: "Single Bedroom", subtitle: "Comfortable bed, desk & window", tag: "BEDROOM", themeColor: "#0f5c65", accentColor: "#c45c26", bgColor: "#f1f5f9", type: "bedroom" },
  { file: "room-single-2.svg", title: "Cozy Furnished Room", subtitle: "Wood wardrobe & study setup", tag: "SINGLE", themeColor: "#1e3a8a", accentColor: "#f59e0b", bgColor: "#f8fafc", type: "bedroom" },
  { file: "room-single-3.svg", title: "Deluxe AC Bedroom", subtitle: "Attached bath & premium bed", tag: "DELUXE", themeColor: "#065f46", accentColor: "#ea580c", bgColor: "#ecfdf5", type: "bedroom" },
  { file: "room-double-1.svg", title: "Double Sharing Room", subtitle: "Twin beds, tables & lockers", tag: "DOUBLE", themeColor: "#3730a3", accentColor: "#10b981", bgColor: "#eef2ff", type: "bedroom" },
  { file: "room-double-2.svg", title: "Twin Sharing Room", subtitle: "Bright room with private study", tag: "SHARING", themeColor: "#0f766e", accentColor: "#f97316", bgColor: "#f0fdfa", type: "bedroom" },
  { file: "room-living-1.svg", title: "1 BHK Living Room", subtitle: "Spacious hall with sofa & TV", tag: "HALL", themeColor: "#0f5c65", accentColor: "#d97706", bgColor: "#f4f7f8", type: "living" },
  { file: "room-living-2.svg", title: "2 BHK Family Lounge", subtitle: "Modern furniture & dining area", tag: "LOUNGE", themeColor: "#1e293b", accentColor: "#0284c7", bgColor: "#f8fafc", type: "living" },
  { file: "room-pg-1.svg", title: "Student PG Accommodation", subtitle: "Bedding, cupboards & WiFi", tag: "PG ROOM", themeColor: "#166534", accentColor: "#ca8a04", bgColor: "#f0fdf4", type: "pg_hostel" },
  { file: "room-pg-2.svg", title: "Executive PG Suite", subtitle: "Air-conditioned with study desk", tag: "EXEC PG", themeColor: "#0369a1", accentColor: "#e11d48", bgColor: "#f0f9ff", type: "pg_hostel" },
  { file: "room-hostel-1.svg", title: "Hostel Bunk Bed Dorm", subtitle: "Secure lockers & study lamps", tag: "HOSTEL", themeColor: "#475569", accentColor: "#f59e0b", bgColor: "#f1f5f9", type: "pg_hostel" },
  { file: "room-hostel-2.svg", title: "Hostel Study & Bunk Unit", subtitle: "Quiet environment for students", tag: "DORM", themeColor: "#334155", accentColor: "#10b981", bgColor: "#f8fafc", type: "pg_hostel" },
  { file: "room-study-1.svg", title: "Private Study Room", subtitle: "Computer desk, chair & shelves", tag: "STUDY", themeColor: "#78350f", accentColor: "#2563eb", bgColor: "#fef3c7", type: "study" },
  { file: "room-study-2.svg", title: "Quiet Library Corner", subtitle: "Dedicated exam preparation setup", tag: "STUDY", themeColor: "#1e3a8a", accentColor: "#f97316", bgColor: "#eff6ff", type: "study" },
  { file: "room-kitchen-1.svg", title: "Modular Kitchen", subtitle: "Countertop, cabinets & fridge", tag: "KITCHEN", themeColor: "#1f2937", accentColor: "#ef4444", bgColor: "#f9fafb", type: "kitchen" },
  { file: "room-balcony-1.svg", title: "Open Balcony View", subtitle: "Fresh air with city skyline", tag: "BALCONY", themeColor: "#0f5c65", accentColor: "#eab308", bgColor: "#e0f2fe", type: "balcony" },
  { file: "room-balcony-2.svg", title: "Terrace Sitting Space", subtitle: "Panoramic Bihar city view", tag: "TERRACE", themeColor: "#1e293b", accentColor: "#14b8a6", bgColor: "#f1f5f9", type: "balcony" }
];

imagesToCreate.forEach((img) => {
  const filePath = path.join(demoDir, img.file);
  const svgContent = createRoomSvg(img);
  fs.writeFileSync(filePath, svgContent, "utf8");
});

console.log(`Successfully generated ${imagesToCreate.length} demo SVG room images in ${demoDir}`);
