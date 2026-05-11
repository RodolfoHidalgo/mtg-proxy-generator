import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { useApp } from "./AppContext";

const ALL_MANA = ["W","U","B","R","G","C","X","WP","UP","BP","RP","GP","0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];

const DEFAULT_MANA_IMAGES = {
  W: "/symbols/W.png",
  U: "/symbols/U.png",
  B: "/symbols/B.png",
  R: "/symbols/R.png",
  G: "/symbols/G.png",
  C: "/symbols/C.png",
  T: "/symbols/T.png",
  WP: "/symbols/WP.webp",
  UP: "/symbols/UP.webp",
  BP: "/symbols/BP.webp",
  RP: "/symbols/RP.png",
  GP: "/symbols/GP.webp",
};

const MANA_BG = {
  W:"#F9F5E3",U:"#0E68AB",B:"#2B2522",R:"#D3202A",G:"#00733E",
  C:"#CAC5C0",X:"#CAC5C0",
  WP:"#F9F5E3",UP:"#0E68AB",BP:"#2B2522",RP:"#D3202A",GP:"#00733E",
  ...Object.fromEntries(Array.from({length:17},(_,i)=>[String(i),"#CAC5C0"])),
};

/* ── SVG mana icons ── */
function ManaIcon({symbol,s}){
  const h=s/2, sc=s/28;
  const icons={
    W:(
      <g transform={`translate(${h},${h}) scale(${sc})`}>
        <circle cx="0" cy="0" r="4.5" fill="#F9F5E3"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>{
          const r2=a*Math.PI/180;
          return <line key={i} x1={Math.cos(r2)*6} y1={Math.sin(r2)*6}
            x2={Math.cos(r2)*10} y2={Math.sin(r2)*10}
            stroke="#F9F5E3" strokeWidth="1.8" strokeLinecap="round"/>;
        })}
      </g>
    ),
    U:(
      <g transform={`translate(${h},${h}) scale(${sc})`}>
        <path d="M0,-10 C-6,0 -7,5 -7,7 C-7,11 -4,13 0,13 C4,13 7,11 7,7 C7,5 6,0 0,-10Z" fill="#1A8BD0"/>
      </g>
    ),
    B:(
      <g transform={`translate(${h},${h}) scale(${sc})`}>
        <ellipse cx="0" cy="-2" rx="7.5" ry="8" fill="#A69E94"/>
        <ellipse cx="-3" cy="-3" rx="2" ry="2.5" fill="#1a1a1a"/>
        <ellipse cx="3" cy="-3" rx="2" ry="2.5" fill="#1a1a1a"/>
        <path d="M-2,3 Q-1,5 0,3.5 Q1,5 2,3" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
        <rect x="-4" y="5" width="1.5" height="4" rx="0.5" fill="#A69E94"/>
        <rect x="-1.5" y="5.5" width="1.5" height="3.5" rx="0.5" fill="#A69E94"/>
        <rect x="1" y="5.5" width="1.5" height="3.5" rx="0.5" fill="#A69E94"/>
        <rect x="3" y="5" width="1.5" height="4" rx="0.5" fill="#A69E94"/>
      </g>
    ),
    R:(
      <g transform={`translate(${h},${h}) scale(${sc})`}>
        <path d="M0,-11 C-2,-6 -7,-2 -7,4 C-7,9 -4,12 0,12 C4,12 7,9 7,4 C7,-2 2,-6 0,-11Z" fill="#E8452E"/>
        <path d="M0,-2 C-1,1 -3,3 -3,6 C-3,8 -1.5,9.5 0,9.5 C1.5,9.5 3,8 3,6 C3,3 1,1 0,-2Z" fill="#FFAA44"/>
      </g>
    ),
    G:(
      <g transform={`translate(${h},${h}) scale(${sc})`}>
        <path d="M0,-11 C-8,-2 -9,3 -7,6 L-1.2,3 L-1.2,12 L1.2,12 L1.2,3 L7,6 C9,3 8,-2 0,-11Z" fill="#00A550"/>
      </g>
    ),
    C:(
      <g transform={`translate(${h},${h}) scale(${sc})`}>
        <path d="M0,-10 L7,0 L0,10 L-7,0 Z" fill="none" stroke="rgba(190,185,178,0.9)" strokeWidth="2"/>
        <path d="M0,-6 L4,0 L0,6 L-4,0 Z" fill="none" stroke="rgba(190,185,178,0.5)" strokeWidth="1"/>
      </g>
    ),
  };
  return icons[symbol]||null;
}

/* ── Single mana pip ── */
function ManaSymbol({symbol,size=22,customImages}){
  // "1" (one colorless) uses the C image — Priority: customImages → DEFAULT_MANA_IMAGES → SVG
  const imgKey = symbol === "1" ? "C" : symbol;
  const resolvedImg = customImages?.[imgKey] ?? DEFAULT_MANA_IMAGES[imgKey] ?? null;
  const isColorIcon = ["W","U","B","R","G"].includes(symbol);
  const isColorless = symbol==="C" || symbol==="1";

  if(resolvedImg){
    return (
      <span style={{
        display:"inline-flex",alignItems:"center",justifyContent:"center",
        width:size,height:size,borderRadius:"50%",
        border:"1.5px solid rgba(0,0,0,0.35)",
        boxShadow:"0 1px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25)",
        flexShrink:0,overflow:"hidden",
      }}>
        <img src={resolvedImg} alt={symbol} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      </span>
    );
  }

  // Color icons: bare SVG, no container — html-to-image handles SVG transparency
  if(isColorIcon){
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{flexShrink:0,display:"inline-block",verticalAlign:"middle"}}>
        <ManaIcon symbol={symbol} s={size}/>
      </svg>
    );
  }

  // Colorless diamond or generic numbers
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",
      width:size,height:size,borderRadius:"50%",
      border: isColorless ? "1.5px solid rgba(160,155,148,0.8)" : "2px solid rgba(180,175,168,0.85)",
      boxShadow:"0 1px 4px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.3)",
      flexShrink:0,position:"relative",overflow:"hidden",
      background:"transparent",
    }}>
      {isColorless ? (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{position:"absolute",top:0,left:0}}>
          <ManaIcon symbol="C" s={size}/>
        </svg>
      ):(
        <span style={{
          position:"absolute",
          top: ["3","4","5","7","9"].includes(symbol) ? "38%" : "46%",
          left:"50%",
          transform:"translate(-50%,-50%)",
          fontSize: symbol.length > 1 ? size * 0.58 : size * 0.72,
          fontWeight:800,
          color:"rgba(190,185,178,0.9)",
          fontFamily:"'Georgia','Palatino Linotype',serif",
          lineHeight:1,
          textShadow:"none",
          zIndex:1,
        }}>{symbol}</span>
      )}
    </span>
  );
}

/* ── Row of mana pips ── */
function ManaCostDisplay({manaCost,size=22,customImages}){
  if(!manaCost||manaCost.length===0) return null;
  return (
    <span style={{display:"inline-flex",gap:3,alignItems:"center",flexWrap:"wrap"}}>
      {manaCost.map((s,i)=><ManaSymbol key={i} symbol={s} size={size} customImages={customImages}/>)}
    </span>
  );
}

/* ── Parse rules text: {W}, {2}, {T} etc become inline mana symbols ── */
/* ── Adaptive text box: shrinks font until content fits maxHeight ── */
function TextFitBox({rulesText, flavorText, maxHeight, baseFontSize, flavorFontSize, customImages, rulesJustify, color="#fff", flavorColor="rgba(255,255,255,0.7)"}){
  const [fontSize, setFontSize] = useState(baseFontSize);
  const ref = useRef(null);

  useEffect(()=>{ setFontSize(baseFontSize); }, [rulesText, flavorText, baseFontSize, maxHeight]);

  useEffect(()=>{
    if(!ref.current) return;
    if(ref.current.scrollHeight > maxHeight + 2 && fontSize > 7){
      setFontSize(f => Math.max(7, f - 0.5));
    }
  });

  const hasRules = !!rulesText;
  const hasFlavor = !!flavorText;

  return (
    <div ref={ref} style={{overflow:"hidden", maxHeight}}>
      {hasRules && (
        <div style={{fontSize, color, lineHeight:1.5, textAlign:rulesJustify?"justify":"left"}}>
          <RulesTextRender text={rulesText} customImages={customImages}/>
        </div>
      )}
      {hasRules && hasFlavor && (
        <div style={{height:1, background:"rgba(255,255,255,0.25)", margin:"6px 0"}}/>
      )}
      {hasFlavor && (
        <div style={{fontSize:Math.max(fontSize-1, 7), color:flavorColor, lineHeight:1.4, fontStyle:"italic"}}>
          {flavorText}
        </div>
      )}
    </div>
  );
}

function RulesTextRender({text,customImages}){
  if(!text) return null;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line,li)=>(
        <div key={li} style={{minHeight: line==="" ? 12 : undefined}}>
          {parseLine(line,customImages)}
        </div>
      ))}
    </>
  );
}

function parseFormatting(text, keyPrefix){
  // Order matters: *** before ** before * to avoid partial matches
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
  const parts=[];
  let last=0, m, idx=0;
  while((m=regex.exec(text))!==null){
    if(m.index>last) parts.push(<span key={`${keyPrefix}-t${idx++}`}>{text.slice(last,m.index)}</span>);
    if(m[1]!==undefined)      parts.push(<strong key={`${keyPrefix}-bi${idx++}`}><em>{m[1]}</em></strong>);
    else if(m[2]!==undefined) parts.push(<strong key={`${keyPrefix}-b${idx++}`}>{m[2]}</strong>);
    else                      parts.push(<em key={`${keyPrefix}-i${idx++}`}>{m[3]}</em>);
    last=regex.lastIndex;
  }
  if(last<text.length) parts.push(<span key={`${keyPrefix}-t${idx++}`}>{text.slice(last)}</span>);
  return parts;
}

function parseLine(line,customImages){
  const regex = /\{([^}]+)\}/g;
  const parts=[];
  let last=0, m;
  while((m=regex.exec(line))!==null){
    if(m.index>last) parts.push({type:"text",value:line.slice(last,m.index)});
    let sym=m[1].toUpperCase();
    if(sym.endsWith("/P")) sym=sym.replace("/P","P"); // {W/P} → WP
    if(sym==="T"){
      parts.push({type:"tap"});
    } else if(ALL_MANA.includes(sym)){
      parts.push({type:"mana",value:sym});
    } else {
      parts.push({type:"text",value:m[0]});
    }
    last=regex.lastIndex;
  }
  if(last<line.length) parts.push({type:"text",value:line.slice(last)});
  if(parts.length===0) return null;
  return (
    <span style={{display:"inline",lineHeight:1.55}}>
      {parts.map((p,i)=>{
        if(p.type==="mana") return (
          <span key={i} style={{display:"inline-flex",verticalAlign:"middle",margin:"0 1px"}}>
            <ManaSymbol symbol={p.value} size={17} customImages={customImages}/>
          </span>
        );
        if(p.type==="tap") return (
          <span key={i} style={{display:"inline-flex",verticalAlign:"middle",margin:"0 1px"}}>
            <ManaSymbol symbol="T" size={17} customImages={customImages}/>
          </span>
        );
        return <span key={i}>{parseFormatting(p.value, `pl${i}`)}</span>;
      })}
    </span>
  );
}

/* ── P/T icons ── */
function PTSymbol({type,size=18}){
  if(type==="power"){
    // Sword
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <line x1="10" y1="1" x2="10" y2="13" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="5" x2="14" y2="5" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="7" y1="13" x2="13" y2="13" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="13" x2="10" y2="19" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }
  // Shield
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path d="M10,1 L18,5 L18,10 C18,15 14,18.5 10,19.5 C6,18.5 2,15 2,10 L2,5 Z"
        fill="#c0392b" stroke="#8B0000" strokeWidth="0.8"/>
      <path d="M10,3 L16,6 L16,10 C16,14 13,17 10,17.8 C7,17 4,14 4,10 L4,6 Z"
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6"/>
    </svg>
  );
}

const CARD_W=500;
const CARD_H=700;
const BLEED=24;

/* ── Frame system ── */
// WOT frame structure in 500×700 card px (derived from pixel analysis):
//   Header band (creature name): y=20–75   BRIGHT
//   Art window (transparent):    y=80–392
//   Separator band (name/type):  y=395–432 BRIGHT
//   Rules text area:             y=435–640 DARK
//   Bottom margin:               y=650–700
const WOT_LAYOUT = {
  artInset: null, useOverlay: false,
  layout: {
    manaCost: { top:40,  right:40 },
    name:     { top:40,  left:43,  right:110, fontSize:28 },
    nickname: { top:380, left:43,  fontSize:12 },
    typeLine: { top:402, left:40,  right:28,  fontSize:24 },
    rulesBox: { top:442, left:45,  right:45,  maxHeight:160, fontSize:16 },
    artist:   { bottom:26, left:28 },
    pt:       { bottom:32, right:28, fontSize:20, letterSpacing:-1 },
  },
};
const WOT_CREATURE_LAYOUT = {
  artInset: null, useOverlay: false,
  layout: {
    manaCost: { top:40,  right:40 },
    name:     { top:40,  left:43,  right:117, fontSize:28 },
    nickname: { top:358, left:28,  fontSize:12 },
    typeLine: { top:406, left:40,  right:28,  fontSize:20 },
    rulesBox: { top:449, left:45,  right:58,  maxHeight:189, fontSize:20 },
    artist:   { bottom:28, left:28 },
    pt:       { bottom:42, right:40, fontSize:22, letterSpacing:-1 },
  },
};

const FRAME_COLORS = ["white","blue","black","red","green","gold"];
const MANA_TO_COLOR = {W:"white",U:"blue",B:"black",R:"red",G:"green",WP:"white",UP:"blue",BP:"black",RP:"red",GP:"green"};

// Build WOT frames dynamically
const WOT_FRAMES = {};
FRAME_COLORS.forEach(c=>{
  ["sorcery","creature"].forEach(t=>{
    const path = `/frames/${c}-${t}.png`;
    WOT_FRAMES[`wot_${c}_${t}`] = {
      id:`wot_${c}_${t}`, name:`WOT ${c} ${t}`,
      image: path,
      ...(t==="creature" ? WOT_CREATURE_LAYOUT : WOT_LAYOUT),
    };
  });
});

const FRAMES = {
  default: {
    id:"default", name:"Default", image:null,
    artInset:null, useOverlay:true,
    textBlock:{ bottom:28, padding:"0 24px" },
    ptBottom:56,
  },
  ...WOT_FRAMES,
};

// Auto-select WOT frame based on mana cost + card type
function autoWotFrame(manaCost, isCreature){
  const colors = [...new Set(
    manaCost.map(s=>MANA_TO_COLOR[s]).filter(Boolean)
  )];
  const colorName = colors.length===0 ? "gold"
    : colors.length===1 ? colors[0]
    : "gold";
  const type = isCreature ? "creature" : "sorcery";
  return `wot_${colorName}_${type}`;
}

/* ── Color identity gradient for separator ── */
const IDENTITY_COLORS = {W:"#F9F5E3",U:"#0E68AB",B:"#4B3D36",R:"#D3202A",G:"#00733E"};
function getSeparatorGradient(manaCost){
  if(!manaCost||manaCost.length===0) return "linear-gradient(to right, #888, #666, transparent)";
  const PHYREXIAN_COLOR = {WP:"W",UP:"U",BP:"B",RP:"R",GP:"G"};
  const colors = [...new Set(manaCost.map(s=>PHYREXIAN_COLOR[s]||s).filter(s=>["W","U","B","R","G"].includes(s)))];
  if(colors.length===0) return "linear-gradient(to right, #888, #666, transparent)";
  if(colors.length>=5) return "linear-gradient(to right, #D4AF37, #F2D06B, #D4AF37, rgba(212,175,55,0.3), transparent)";
  if(colors.length===1) {
    const c=IDENTITY_COLORS[colors[0]];
    return `linear-gradient(to right, ${c}, ${c}, rgba(0,0,0,0))`;
  }
  const stops=colors.map((c,i)=>{
    const pct=Math.round(i/(colors.length-1)*70);
    return `${IDENTITY_COLORS[c]} ${pct}%`;
  });
  return `linear-gradient(to right, ${stops.join(", ")}, transparent 100%)`;
}

/* ── Quality tokens silently prepended to every prompt ── */
const QUALITY_PREFIX = "masterpiece, best quality, highly detailed, sharp focus, intricate details, professional digital illustration, concept art, artstation";

/* ── Universal negative silently merged into every generation ── */
const UNIVERSAL_NEGATIVE = [
  // anatomy & duplicates
  "multiple heads, extra heads, two heads, three heads, duplicate faces, cloned face, extra faces",
  "extra limbs, extra arms, extra legs, extra hands, fused fingers, too many fingers, bad hands, bad feet",
  "malformed limbs, missing limbs, disconnected limbs, bad anatomy, wrong anatomy, disfigured, deformed, mutated, mutation",
  "gross proportions, long neck, morbid, ugly, poorly drawn face, poorly drawn hands",
  // quality
  "blurry, out of focus, low quality, worst quality, bad quality, low resolution, jpeg artifacts, noise, grain",
  // unwanted content
  "text, watermark, signature, logo, username, artist name, border, frame, split image, multiple panels",
  // style conflicts
  "modern, contemporary, photograph, photorealistic, realistic photo, 3d render, cgi, anime, manga, cartoon",
].join(", ");

/* ── MTG art style presets for Stable Diffusion ── */
const MTG_STYLE_PRESETS = [
  { id:"fantasy", label:"Fantasy Épico", emoji:"⚔️",
    prompt:"single subject, epic fantasy illustration, heroic composition, dramatic cinematic lighting, intricate fantasy armor, painterly brushstrokes, rich magical atmosphere, warm color palette",
    negative:"multiple subjects, crowded scene, flat lighting, modern clothing, contemporary setting" },
  { id:"dark", label:"Oscuro", emoji:"💀",
    prompt:"single figure, dark fantasy art, ominous foreboding atmosphere, dramatic chiaroscuro lighting, deep shadows, gothic aesthetic, grim and menacing expression, muted cold color palette, oil painting style",
    negative:"bright colors, cheerful, happy, daytime, colorful, warm tones" },
  { id:"creature", label:"Criatura", emoji:"🐉",
    prompt:"single creature, one head, solo fantasy beast, close-up portrait, detailed scales and fur texture, fierce glowing eyes, symmetrical anatomy, dramatic rim lighting, dynamic painterly illustration",
    negative:"two heads, multiple heads, multiple creatures, humanoid, human, modern, wide landscape, background characters" },
  { id:"landscape", label:"Paisaje", emoji:"🏔️",
    prompt:"epic fantasy landscape, vast sweeping environment, no characters, dramatic magical sky, volumetric clouds, detailed foliage and terrain, establishing wide shot, painterly fantasy world, god rays",
    negative:"characters, people, portrait, close-up faces, modern buildings, urban, contemporary" },
  { id:"mythic", label:"Mítico", emoji:"✨",
    prompt:"solo legendary hero, single character, bust or full body portrait, divine golden aura, heroic triumphant stance, intricate ornate fantasy armor, mythical power emanating, celestial background, epic composition",
    negative:"multiple characters, group scene, modern clothing, casual, mundane" },
  { id:"artifact", label:"Artefacto", emoji:"⚙️",
    prompt:"single magical artifact, detailed close-up, intricate metalwork and gemstones, glowing arcane runes, ancient craftsmanship, mystical energy, dark dramatic background, no living creatures",
    negative:"characters, people, living creatures, multiple objects, modern technology, industrial" },
];

const SIZE_PRESETS = [
  { label:"512×512",  w:512,  h:512,  orient:"square"    },
  { label:"768×512",  w:768,  h:512,  orient:"landscape" },
  { label:"960×640",  w:960,  h:640,  orient:"landscape" },
  { label:"1024×576", w:1024, h:576,  orient:"landscape" },
  { label:"512×768",  w:512,  h:768,  orient:"portrait"  },
  { label:"640×960",  w:640,  h:960,  orient:"portrait"  },
];

const DEFAULT_SAMPLERS = ["DPM++ 2M","DPM++ SDE","DPM++ 2M SDE","DPM++ 3M SDE","Euler a","Euler","DDIM","UniPC","LCM","Restart"];

/* ── Artist references per style preset ── */
const ARTIST_REFS = {
  fantasy:  ["Greg Rutkowski","Magali Villeneuve","Chris Rahn","Raymond Swanland"],
  dark:     ["Gerald Brom","Nils Hamm","Terese Nielsen","Wayne Reynolds"],
  creature: ["Wayne Barlowe","Clint Cearley","Daarken","Karl Kopinski"],
  landscape:["Adam Paquette","Noah Bradley","Alan Lee","John Avon"],
  mythic:   ["Jason Chan","Howard Lyon","Greg Staples","Magali Villeneuve"],
  artifact: ["Volkan Baga","Mark Winters","Seb McKinnon","Daniel Ljunggren"],
};

/* ── Recommended models note ── */
const MODEL_TIPS = "Para mejores resultados instala en SD un modelo especializado en ilustración fantasy: DreamShaper, Deliberate, ReV Animated o epiCRealism (disponibles en civitai.com). Los modelos SD 1.5 genéricos producen alucinaciones frecuentes.";

/* ── Dynamic overlay gradient based on start, transition width and intensity ── */
function getOverlayGradient(start=20, intensity=1, transition=50){
  const s = Math.min(Math.max(start, 0), 95);
  const t = Math.min(Math.max(transition, 2), 100);
  const d = Math.min(Math.max(intensity, 0), 1);
  const c = (a) => `rgba(0,0,0,${Math.min(a*d,1).toFixed(2)})`;
  const p = (frac) => Math.min(s + frac * t, 100).toFixed(1);
  return `linear-gradient(to bottom, transparent 0%, transparent ${s}%, ${c(0.15)} ${p(0.15)}%, ${c(0.45)} ${p(0.35)}%, ${c(0.72)} ${p(0.55)}%, ${c(0.90)} ${p(0.75)}%, ${c(0.97)} ${p(0.90)}%, ${c(1)} ${p(1)}%)`;
}

/* ══════════════════════ CARD PREVIEW ══════════════════════ */
function CardPreview({cardData,artImage,artPosition,customImages,frameId="default",frameLayout=null,exporting=false,showProxyLabel=true}){
  const{name,typeLine,rulesText,flavorText,power,toughness,manaCost,isCreature,artistName,hasRulesText,rulesJustify,hasNickname,nickname}=cardData;
  const resolvedId = frameId==="wot_auto" ? autoWotFrame(manaCost, isCreature) : frameId;
  const frame = FRAMES[resolvedId] ?? FRAMES.default;
  // Use live frameLayout if provided, else fall back to frame config
  const liveLayout = frameLayout && frame.layout
    ? (isCreature ? frameLayout.creature : frameLayout.sorcery)
    : frame.layout;
  const inset = frame.artInset;

  return (
    <div style={{
      width:CARD_W, height:CARD_H,
      borderRadius:exporting?0:18,
      overflow:"hidden",position:"relative",
      backgroundColor:"#1a1a1a",
      boxShadow:exporting?"none":"0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
      fontFamily:"'Palatino Linotype','Palatino','Georgia',serif",
      flexShrink:0,
    }}>
      {/* Art layer — full-bleed or clipped to frame art window */}
      <div style={{
        position:"absolute",
        top: inset ? inset.top : 0,
        left: inset ? inset.left : 0,
        right: inset ? inset.right : 0,
        bottom: inset ? inset.bottom : 0,
        overflow:"hidden",
      }}>
        {artImage?(
          <div style={{
            position:"absolute", top:0, left:0, right:0, bottom:0,
            backgroundImage:`url(${artImage})`,
            backgroundSize:`${artPosition.zoom*100}%`,
            backgroundPosition:`${artPosition.x}% ${artPosition.y}%`,
            backgroundRepeat:"no-repeat",
            filter:`brightness(${artPosition.brightness}%) contrast(${artPosition.contrast}%) saturate(${artPosition.saturate}%)`,
          }}/>
        ):(
          <div style={{
            width:"100%",height:"100%",
            background:"linear-gradient(135deg,#2c3e50 0%,#1a1a2e 40%,#16213e 60%,#0f3460 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            {!inset && <span style={{color:"rgba(255,255,255,0.15)",fontSize:64,fontWeight:300}}>ART</span>}
          </div>
        )}
      </div>

      {/* Gradient overlay (default frame only) */}
      {frame.useOverlay && (
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,height:"100%",
          background:getOverlayGradient(artPosition.overlayStart ?? 20, artPosition.overlayOpacity ?? 1, artPosition.overlayTransition ?? 50),
          pointerEvents:"none",
        }}/>
      )}

      {/* Built-in frame — pre-processed PNG with transparency */}
      {frame.image && (
        <img src={frame.image} alt="frame" style={{
          position:"absolute", top:0, left:0, width:"100%", height:"100%",
          objectFit:"fill", pointerEvents:"none", zIndex:3,
        }}/>
      )}

      {liveLayout ? (
        /* ── WOT / frame-specific absolute layout ── */
        <>
          {/* Mana cost */}
          {manaCost?.length>0 && (
            <div style={{position:"absolute", top:liveLayout.manaCost.top, right:liveLayout.manaCost.right, zIndex:6}}>
              <ManaCostDisplay manaCost={manaCost} size={22} customImages={customImages}/>
            </div>
          )}

          {/* Name */}
          <div style={{
            position:"absolute", top:liveLayout.name.top,
            left:liveLayout.name.left, right:liveLayout.name.right, zIndex:6,
            fontSize:liveLayout.name.fontSize, fontWeight:800, color:"#000",
            letterSpacing:0.3, lineHeight:1.1,
            fontFamily:"'Palatino Linotype','Palatino',serif",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {hasNickname && nickname ? nickname : (name || "Card Name")}
          </div>
          {hasNickname && nickname && (
            <div style={{
              position:"absolute", top:liveLayout.nickname.top, left:liveLayout.nickname.left, zIndex:6,
              fontSize:liveLayout.nickname.fontSize, fontStyle:"italic", color:"rgba(0,0,0,0.6)",
              fontFamily:"'Palatino Linotype','Palatino',serif",
            }}>{name}</div>
          )}

          {/* Type line */}
          <div style={{
            position:"absolute", top:liveLayout.typeLine.top,
            left:liveLayout.typeLine.left, right:liveLayout.typeLine.right, zIndex:6,
            fontSize:liveLayout.typeLine.fontSize, color:"#000", fontWeight:800,
            letterSpacing:0.8, fontVariant:"small-caps",
            fontFamily:"'Palatino Linotype','Palatino',serif",
            whiteSpace:"nowrap", overflow:"hidden",
          }}>{typeLine || "Type Line"}</div>

          {/* Rules + Flavor — adaptive TextFitBox */}
          {hasRulesText !== false && (
            <div style={{position:"absolute", top:liveLayout.rulesBox.top, left:liveLayout.rulesBox.left, right:liveLayout.rulesBox.right, zIndex:6}}>
              <TextFitBox
                rulesText={rulesText||""}
                flavorText={flavorText}
                maxHeight={liveLayout.rulesBox.maxHeight}
                baseFontSize={liveLayout.rulesBox.fontSize}
                customImages={customImages}
                rulesJustify={rulesJustify}
              />
            </div>
          )}

          {/* P/T */}
          {isCreature && (
            <div style={{position:"absolute", bottom:liveLayout.pt.bottom, right:liveLayout.pt.right, zIndex:10, display:"flex", alignItems:"center", gap:2}}>
              <span style={{fontSize:liveLayout.pt.fontSize??20, fontWeight:800, color:"#000", fontFamily:"'Palatino Linotype',serif", letterSpacing:liveLayout.pt.letterSpacing??-1}}>{power}</span>
              <span style={{fontSize:(liveLayout.pt.fontSize??20)-2, fontWeight:700, color:"#000", margin:"0 1px"}}>/</span>
              <span style={{fontSize:liveLayout.pt.fontSize??20, fontWeight:800, color:"#000", fontFamily:"'Palatino Linotype',serif", letterSpacing:liveLayout.pt.letterSpacing??-1}}>{toughness}</span>
            </div>
          )}

          {/* Artist */}
          <div style={{position:"absolute", bottom:liveLayout.artist.bottom, left:liveLayout.artist.left, zIndex:10, fontSize:15, color:"#fff", letterSpacing:0.4}}>
            {artistName ? `Art: ${artistName}` : ""}{showProxyLabel ? " • Custom Proxy" : ""}
          </div>
        </>
      ) : (
        /* ── Default: text block anchored from bottom ── */
        <>
          <div style={{
            position:"absolute",
            bottom: (isCreature ? 56 : 28) + BLEED,
            left:BLEED, right:BLEED,
            padding:"0 24px", zIndex:5,
            display:"flex", flexDirection:"column",
          }}>
            {manaCost?.length>0 && (
              <div style={{marginBottom:5}}>
                <ManaCostDisplay manaCost={manaCost} size={26} customImages={customImages}/>
              </div>
            )}
            <div style={{fontSize:hasNickname&&nickname?26:28, fontWeight:700, color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)", letterSpacing:0.5, lineHeight:1.15, fontFamily:"'Palatino Linotype','Palatino',serif"}}>
              {hasNickname && nickname ? nickname : (name || "Card Name")}
            </div>
            {hasNickname && nickname && (
              <div style={{fontSize:13, fontWeight:400, color:"rgba(255,255,255,0.5)", textShadow:"0 1px 3px rgba(0,0,0,0.9)", letterSpacing:0.3, lineHeight:1.2, marginTop:1, fontFamily:"'Palatino Linotype','Palatino',serif", fontStyle:"italic"}}>{name}</div>
            )}
            <div style={{fontSize:15, color:"#e8a838", fontWeight:400, textShadow:"0 1px 4px rgba(0,0,0,0.9)", letterSpacing:1.8, marginTop:2, fontFamily:"'Palatino Linotype','Palatino',serif", fontVariant:"small-caps"}}>
              {typeLine || "Type Line"}
            </div>
            <div style={{height:1.5, marginTop:6, marginBottom:10, background:getSeparatorGradient(manaCost), borderRadius:1}}/>
            {hasRulesText !== false && (
              <TextFitBox
                rulesText={rulesText||""}
                flavorText={flavorText}
                maxHeight={200}
                baseFontSize={16}
                customImages={customImages}
                rulesJustify={rulesJustify}
                color="#f0ede8"
                flavorColor="rgba(240,237,232,0.65)"
              />
            )}
          </div>
          {isCreature && (
            <div style={{position:"absolute", bottom:16+BLEED, right:20+BLEED, zIndex:10, display:"flex", alignItems:"center", gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <PTSymbol type="power" size={20}/>
                <span style={{fontSize:22,fontWeight:700,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.9)",fontFamily:"'Palatino Linotype',serif"}}>{power}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <PTSymbol type="toughness" size={20}/>
                <span style={{fontSize:22,fontWeight:700,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.9)",fontFamily:"'Palatino Linotype',serif"}}>{toughness}</span>
              </div>
            </div>
          )}
          <div style={{position:"absolute", bottom:16+BLEED, left:20+BLEED, zIndex:10, fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:0.5}}>
            {artistName ? `Art: ${artistName}` : ""}{showProxyLabel ? " • Custom Proxy" : ""}
          </div>
        </>
      )}

      {/* Border */}
      <div style={{
        position:"absolute", inset:0, borderRadius:exporting?0:18,
        border:"1px solid rgba(255,255,255,0.08)", pointerEvents:"none",
      }}/>
    </div>
  );
}

/* ══════════════════════ MAIN APP ══════════════════════ */
export default function MTGProxyGenerator(){
  const { theme, setTheme, lang, setLang, t } = useApp();
  const [cardData,setCardData] = useState({
    name:"Krark, the Thumbless",
    typeLine:"Legendary Creature — Goblin Wizard",
    rulesText:"Whenever you cast an instant or sorcery spell, flip a coin. If you lose the flip, return that spell to its owner's hand. If you win the flip, copy that spell, and you may choose new targets for the copy.\nPartner",
    flavorText:"",
    power:"2",
    toughness:"2",
    manaCost:["1","R"],
    isCreature:true,
    artistName:"",
    hasRulesText:true,
    rulesJustify:false,
    hasNickname:false,
    nickname:"",
  });

  const [artImage,setArtImage] = useState(null);
  const [artPosition,setArtPosition] = useState({x:50,y:50,zoom:1.5,overlayOpacity:1,overlayStart:20,overlayTransition:50,brightness:105,contrast:105,saturate:110,sharpness:0});
  const [manaInput,setManaInput] = useState("1, R");
  const [activeTab,setActiveTab] = useState("text");
  const [customImages,setCustomImages] = useState({});
  const [searchQuery,setSearchQuery] = useState("");
  const [searchResults,setSearchResults] = useState([]);
  const [searchLoading,setSearchLoading] = useState(false);
  const [searchError,setSearchError] = useState("");
  const [exporting,setExporting] = useState(false);
  const [showProxyLabel,setShowProxyLabel] = useState(true);
  const [artSubTab,setArtSubTab] = useState("upload");
  const [frameId,setFrameId] = useState("default");
  const [calOpen,setCalOpen] = useState(false);
  const [frameLayout,setFrameLayout] = useState(()=>({
    sorcery: JSON.parse(JSON.stringify(WOT_LAYOUT.layout)),
    creature: JSON.parse(JSON.stringify(WOT_CREATURE_LAYOUT.layout)),
  }));
  const [upscaleConfig,setUpscaleConfig] = useState({scale:2, upscaler:"R-ESRGAN 4x+"});
  const [upscaleLoading,setUpscaleLoading] = useState(false);
  const [upscaleError,setUpscaleError] = useState("");
  const [sdConfig,setSdConfig] = useState({
    url:"http://127.0.0.1:7860",
    mode:"basic",
    preset:"fantasy",
    prompt:"",
    // Advanced mode extra negatives (UNIVERSAL_NEGATIVE is always applied on top)
    negativePrompt:"nsfw, nude, sexual content, violence, gore, disturbing imagery",
    steps:30, cfg:7,
    sampler:"DPM++ 2M",
    seed:-1,
    width:768, height:512,
    clipSkip:1,
    model:"",
    activeLoras:[], // [{name, weight}]
    hiresEnabled:false,
    hiresSteps:20,
    hiresDenoise:0.5,
    hiresUpscaler:"Latent",
    hiresWidth:1024,
    hiresHeight:1024,
  });
  const [sdGenerating,setSdGenerating] = useState(false);
  const [sdError,setSdError] = useState("");
  const [sdModels,setSdModels] = useState([]);
  const [sdSamplers,setSdSamplers] = useState(DEFAULT_SAMPLERS);
  const [sdLoras,setSdLoras] = useState([]);
  const [sdUpscalers,setSdUpscalers] = useState(["Latent","Latent (bicubic)","Latent (nearest)","ESRGAN_4x","R-ESRGAN 4x+","R-ESRGAN 4x+ Anime6B"]);
  const [sdPreview,setSdPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const exportRef = useRef(null);
  const searchTimeout = useRef(null);
  const rulesTextareaRef = useRef(null);
  const artPositionRef = useRef(artPosition);
  artPositionRef.current = artPosition;
  const artImageRef = useRef(artImage);
  artImageRef.current = artImage;

  const hasArt = !!artImage;
  useEffect(()=>{
    const el = cardRef.current;
    if(!el || !artImageRef.current) return;
    let drag = null;
    const onDown = (e)=>{
      if(e.button !== 0) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      drag = {
        startX: e.clientX, startY: e.clientY,
        x: artPositionRef.current.x, y: artPositionRef.current.y,
        W: rect.width, H: rect.height,
        zoom: artPositionRef.current.zoom,
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    const onMove = (e)=>{
      if(!drag) return;
      const {startX,startY,x,y,W,H,zoom} = drag;
      const denomX = W*(1-zoom);
      const denomY = H*(1-zoom);
      const rawDx = Math.abs(denomX)>0.01 ? (e.clientX-startX)*100/denomX : 0;
      const rawDy = Math.abs(denomY)>0.01 ? (e.clientY-startY)*100/denomY : 0;
      const newX = Math.min(150,Math.max(-50, x+rawDx));
      const newY = Math.min(150,Math.max(-50, y+rawDy));
      if(newX !== x+rawDx){ drag.startX=e.clientX; drag.x=newX; }
      if(newY !== y+rawDy){ drag.startY=e.clientY; drag.y=newY; }
      setArtPosition(p=>({...p, x:newX, y:newY}));
    };
    const onUp = ()=>{
      drag = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    el.addEventListener("mousedown", onDown);
    return ()=>{
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  },[hasArt]);

  const wrapSelection = (before, after) => {
    const el = rulesTextareaRef.current;
    if(!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = cardData.rulesText;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    updateField("rulesText", newText);
    setTimeout(() => {
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
      el.focus();
    }, 0);
  };

  const saveCard = async ()=>{
    setExporting(true);
    await new Promise(r=>setTimeout(r,150));
    try {
      const pixelRatio = 6; // ~1200 DPI at 63x88mm
      const dataUrl = await toPng(exportRef.current,{
        width: CARD_W,
        height: CARD_H,
        pixelRatio,
        backgroundColor: null,
        style: { transform:"none", margin:0 },
      });
      const link = document.createElement("a");
      link.download = `${cardData.name||"proxy"}.png`;
      link.href = dataUrl;
      link.click();
    } catch(e) {
      console.error("Export error:",e);
      alert("Error al exportar.");
    }
    setExporting(false);
  };

  const handleArtUpload = useCallback((e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>setArtImage(ev.target.result);
    reader.readAsDataURL(file);
  },[]);

  const handleDrop = useCallback((e)=>{
    e.preventDefault();
    const file=e.dataTransfer.files?.[0];
    if(!file||!file.type.startsWith("image/")) return;
    const reader=new FileReader();
    reader.onload=(ev)=>setArtImage(ev.target.result);
    reader.readAsDataURL(file);
  },[]);

  const updateField = (field,value)=>{
    setCardData(prev=>({...prev,[field]:value}));
  };

  const parseManaString = (str)=>{
    return str.split(/[\s,]+/).map(s=>s.trim().toUpperCase()).filter(s=>ALL_MANA.includes(s));
  };

  const handleManaChange = (val)=>{
    setManaInput(val);
    setCardData(prev=>({...prev,manaCost:parseManaString(val)}));
  };

  const handleManaImageUpload = (symbol,e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>setCustomImages(prev=>({...prev,[symbol]:ev.target.result}));
    reader.readAsDataURL(file);
  };

  const removeManaImage = (symbol)=>{
    setCustomImages(prev=>{const n={...prev};delete n[symbol];return n;});
  };

  /* ── Upscale existing image via SD extras ── */
  const upscaleImage = useCallback(async ()=>{
    if(!artImageRef.current) return;
    setUpscaleLoading(true);
    setUpscaleError("");
    try {
      const base64 = artImageRef.current.split(",")[1] ?? artImageRef.current;
      const res = await fetch(`${sdConfig.url}/sdapi/v1/extra-single-image`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          image: base64,
          upscaling_resize: upscaleConfig.scale,
          upscaler_1: upscaleConfig.upscaler,
          gfpgan_visibility: 0,
          codeformer_visibility: 0,
        }),
      });
      const data = await res.json();
      if(data.image){
        setArtImage(`data:image/png;base64,${data.image}`);
      } else {
        setUpscaleError("No se recibió imagen del servidor");
      }
    } catch(e){
      setUpscaleError("Error al conectar con Stable Diffusion");
    }
    setUpscaleLoading(false);
  },[sdConfig.url, upscaleConfig]);

  /* ── Stable Diffusion ── */
  const generateWithSD = useCallback(async ()=>{
    setSdGenerating(true);
    setSdError("");
    const preset = MTG_STYLE_PRESETS.find(p=>p.id===sdConfig.preset);

    // LoRA syntax appended to positive prompt
    const loraStr = (sdConfig.activeLoras||[]).map(l=>`<lora:${l.name}:${l.weight}>`).join(", ");

    // Positive: quality prefix + user prompt + (preset only in basic mode) + loras
    const presetPrompt = sdConfig.mode==="basic" ? preset?.prompt : "";
    const fullPrompt = [QUALITY_PREFIX, sdConfig.prompt, presetPrompt, loraStr].filter(Boolean).join(", ");

    // Negative: universal base always included, then preset-specific (basic) or user-edited (advanced)
    const extraNeg = sdConfig.mode==="advanced"
      ? sdConfig.negativePrompt
      : (preset?.negative || "");
    const fullNegative = [UNIVERSAL_NEGATIVE, extraNeg].filter(Boolean).join(", ");

    try {
      const res = await fetch(`${sdConfig.url}/sdapi/v1/txt2img`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          prompt:fullPrompt,
          negative_prompt:fullNegative,
          steps:sdConfig.steps,
          cfg_scale:sdConfig.cfg,
          sampler_name:sdConfig.sampler,
          seed:sdConfig.seed,
          width:sdConfig.width,
          height:sdConfig.height,
          batch_size:1,
          override_settings:{
            ...(sdConfig.model ? {sd_model_checkpoint:sdConfig.model} : {}),
            ...(sdConfig.clipSkip > 1 ? {CLIP_stop_at_last_layers:sdConfig.clipSkip} : {}),
          },
          ...(sdConfig.hiresEnabled ? {
            enable_hr:true,
            hr_steps:sdConfig.hiresSteps,
            denoising_strength:sdConfig.hiresDenoise,
            hr_upscaler:sdConfig.hiresUpscaler,
            hr_resize_x:sdConfig.hiresWidth,
            hr_resize_y:sdConfig.hiresHeight,
            hr_additional_modules:[], // explicit empty array fixes Forge NoneType bug
          } : {}),
        }),
      });
      if(!res.ok){
        let detail = `HTTP ${res.status}`;
        try { const j = await res.json(); detail = j.message || j.detail || j.error || detail; } catch{}
        throw new Error(detail);
      }
      const data = await res.json();
      if(data.images?.[0]) setSdPreview(`data:image/png;base64,${data.images[0]}`);
      else throw new Error("No se recibió imagen en la respuesta");
    } catch(e){
      const msg = e.message||"";
      const isNetwork = msg.toLowerCase().includes("failed to fetch")
        || msg.toLowerCase().includes("network")
        || msg === "Failed to fetch"
        || msg === "Load failed";
      if(isNetwork){
        setSdError(`No se puede conectar a Stable Diffusion en ${sdConfig.url}.\nAsegúrate de que esté corriendo con los flags: --api --cors-allow-origins=*`);
      } else {
        setSdError(`Error: ${msg}`);
      }
    }
    setSdGenerating(false);
  },[sdConfig]);

  const fetchSDModels = useCallback(async ()=>{
    setSdError("");
    try {
      // Refresh LoRA list on SD side before fetching
      await fetch(`${sdConfig.url}/sdapi/v1/refresh-loras`,{method:"POST"}).catch(()=>{});
      const [modRes,sampRes,loraRes,upscalerRes] = await Promise.all([
        fetch(`${sdConfig.url}/sdapi/v1/sd-models`),
        fetch(`${sdConfig.url}/sdapi/v1/samplers`),
        fetch(`${sdConfig.url}/sdapi/v1/loras`),
        fetch(`${sdConfig.url}/sdapi/v1/upscalers`),
      ]);
      const models = await modRes.json();
      const samplers = await sampRes.json();
      setSdModels(models.map(m=>m.title));
      setSdSamplers(samplers.map(s=>s.name));
      if(loraRes.ok){
        const loras = await loraRes.json();
        setSdLoras(loras.map(l=>l.name||l.alias||"").filter(Boolean));
      }
      if(upscalerRes.ok){
        const upscalers = await upscalerRes.json();
        setSdUpscalers(upscalers.map(u=>u.name).filter(Boolean));
      }
    } catch{
      setSdError("No se pudo conectar a SD para cargar modelos");
    }
  },[sdConfig.url]);

  /* ── Scryfall search ── */
  const parseManaCostString = (mc)=>{
    if(!mc) return [];
    const matches = mc.match(/\{([^}]+)\}/g);
    if(!matches) return [];
    return matches.map(m=>{
      const raw = m.replace(/[{}]/g,"").toUpperCase();
      if(raw.endsWith("/P")) return raw.replace("/P","P"); // {W/P} → WP
      return raw;
    }).filter(s=>ALL_MANA.includes(s));
  };

  const searchScryfall = (query)=>{
    if(!query||query.length<2){setSearchResults([]);setSearchError("");return;}
    setSearchLoading(true);
    setSearchError("");
    fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`)
      .then(r=>r.json())
      .then(data=>{
        if(data.data) setSearchResults(data.data.slice(0,8));
        else setSearchResults([]);
        setSearchLoading(false);
      })
      .catch(()=>{setSearchError("Error de conexión");setSearchLoading(false);});
  };

  const handleSearchInput = (val)=>{
    setSearchQuery(val);
    if(searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(()=>searchScryfall(val),300);
  };

  const importCard = (cardName)=>{
    setSearchLoading(true);
    setSearchQuery("");
    setSearchResults([]);
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`)
      .then(r=>r.json())
      .then(card=>{
        if(card.object==="error"){setSearchError("Carta no encontrada");setSearchLoading(false);return;}
        const mc = parseManaCostString(card.mana_cost);
        const isCreature = (card.type_line||"").toLowerCase().includes("creature");
        // Handle double-faced cards
        const oracleText = card.oracle_text || (card.card_faces?.[0]?.oracle_text) || "";
        const flavorText = card.flavor_text || (card.card_faces?.[0]?.flavor_text) || "";
        const typeLine = card.type_line || (card.card_faces?.[0]?.type_line) || "";
        setCardData({
          name: card.name || "",
          typeLine,
          rulesText: oracleText,
          flavorText,
          power: card.power || "",
          toughness: card.toughness || "",
          manaCost: mc,
          isCreature,
          artistName: card.artist || "",
        });
        setManaInput(mc.join(", "));
        setSearchLoading(false);
      })
      .catch(()=>{setSearchError("Error al importar");setSearchLoading(false);});
  };

  const tabs = [
    {id:"text", label:t("tab_text"), icon:(
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>)},
    {id:"art", label:t("tab_art"), icon:(
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>)},
    {id:"stats", label:t("tab_stats"), icon:(
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>)},
    {id:"symbols", label:t("tab_symbols"), icon:(
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>)},
  ];

  return (
    <div data-theme={theme} style={{
      minHeight:"100vh", background:"var(--bg)", color:"var(--text)",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
      display:"flex", flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{
        borderBottom:"1px solid var(--border)",
        background:"var(--panel)",
        boxShadow:"var(--shadow-sm)",
      }}>
        {/* Gradient accent line */}
        <div style={{height:3, background:"var(--header-accent)", opacity:0.85}}/>
      <div style={{padding:"11px 20px", display:"flex", alignItems:"center", gap:12}}>
        <div style={{
          width:34, height:34, borderRadius:9,
          background:"linear-gradient(135deg,#c0392b,#e74c3c)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:17, fontWeight:800, flexShrink:0,
          boxShadow:"var(--accent-glow)",
        }}>P</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,letterSpacing:0.2,color:"var(--text)"}}>MTG Proxy Generator</div>
          <div style={{fontSize:11,color:"var(--text-3)",marginTop:1}}>{t("subtitle")}</div>
        </div>
        {/* Controls: lang + theme */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{
            padding:"5px 10px", borderRadius:6, border:"1px solid var(--border-2)",
            background:"var(--surface)", color:"var(--text-2)",
            fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:0.5,
            transition:"all 0.18s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent-border)";e.currentTarget.style.color="var(--accent)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-2)";e.currentTarget.style.color="var(--text-2)";}}
          >{lang==="es"?"ES":"EN"}</button>
          <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} title={theme==="dark"?t("theme_light"):t("theme_dark")} style={{
            width:32, height:32, borderRadius:8, border:"1px solid var(--border-2)",
            background:"var(--surface)", color:"var(--text-2)",
            fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.18s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent-border)";e.currentTarget.style.color="var(--accent)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-2)";e.currentTarget.style.color="var(--text-2)";}}
          >{theme==="dark"?"☀":"🌙"}</button>
        </div>
      </div>
      </div>

      <div style={{flex:1, display:"flex", gap:0, flexDirection:"row", overflow:"hidden"}}>
        {/* Editor Panel */}
        <div style={{
          width:380, flexShrink:0,
          borderRight:"1px solid var(--border)",
          display:"flex", flexDirection:"column", overflow:"hidden",
          background:"var(--panel)",
        }}>
          {/* Tabs */}
          <div style={{display:"flex", borderBottom:"1px solid var(--border)", background:"var(--panel)"}}>
            {tabs.map((tab, i)=>(
              <div key={tab.id} style={{display:"contents"}}>
                {i > 0 && <div style={{width:1, background:"var(--border)", flexShrink:0}}/>}
                <button onClick={()=>setActiveTab(tab.id)} style={{
                  flex:1, padding:"13px 6px 11px", border:"none", cursor:"pointer",
                  background: activeTab===tab.id ? "var(--accent-bg)" : "transparent",
                  color: activeTab===tab.id ? "var(--accent)" : "var(--text-3)",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                  borderBottom: activeTab===tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                  transition:"all 0.18s",
                }}
                  onMouseEnter={e=>{ if(activeTab!==tab.id){ e.currentTarget.style.background="var(--surface)"; e.currentTarget.style.color="var(--text-2)"; }}}
                  onMouseLeave={e=>{ if(activeTab!==tab.id){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-3)"; }}}
                >
                  {tab.icon}
                  <span style={{fontSize:10, fontWeight:700, letterSpacing:0.6, textTransform:"uppercase"}}>{tab.label}</span>
                </button>
              </div>
            ))}
          </div>

          <div style={{flex:1, overflow:"auto", padding:20, background:"var(--bg)"}}>
            {/* ── TAB: Text ── */}
            {activeTab==="text" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>

                {/* Scryfall search */}
                <div style={{position:"relative",background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase",marginBottom:10}}>
                    {t("import_label")}
                  </div>
                  <div style={{position:"relative"}}>
                    <input value={searchQuery}
                      onChange={e=>handleSearchInput(e.target.value)}
                      placeholder={t("search_placeholder")}
                      style={{
                        width:"100%",padding:"9px 12px 9px 34px",
                        background:"var(--input-bg)",border:"1px solid var(--input-border)",
                        borderRadius:8,color:"var(--text)",fontSize:13,fontFamily:"inherit",
                        outline:"none",boxSizing:"border-box",transition:"border-color 0.2s",
                      }}
                      onFocus={e=>e.target.style.borderColor="var(--accent)"}
                      onBlur={e=>{e.target.style.borderColor="var(--input-border)";setTimeout(()=>setSearchResults([]),200);}}
                    />
                    <svg width="14" height="14" viewBox="0 0 16 16" style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:0.3,pointerEvents:"none"}}>
                      <circle cx="6.5" cy="6.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {searchLoading && <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"var(--accent)"}}>{t("searching")}</div>}
                  </div>
                  {searchResults.length>0 && (
                    <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:50,marginTop:4,borderRadius:10,overflow:"hidden",background:"var(--dropdown-bg)",border:"1px solid var(--accent-border)",boxShadow:"var(--shadow-md)",maxHeight:240,overflowY:"auto"}}>
                      {searchResults.map((name,i)=>(
                        <div key={i} onMouseDown={()=>importCard(name)}
                          style={{padding:"9px 14px",fontSize:13,color:"var(--text-2)",cursor:"pointer",borderBottom:"1px solid var(--border)",transition:"background 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="var(--accent-bg)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        >{name}</div>
                      ))}
                    </div>
                  )}
                  {searchError && <div style={{fontSize:11,color:"var(--accent)",marginTop:6}}>{searchError}</div>}
                </div>

                {/* Name & Nickname */}
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("field_name")}</div>
                  <Field label="" value={cardData.name} onChange={v=>updateField("name",v)}/>
                  <div style={{height:1,background:"var(--border)"}}/>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,fontWeight:600,color:"var(--text-2)"}}>
                    <input type="checkbox" checked={!!cardData.hasNickname} onChange={e=>updateField("hasNickname",e.target.checked)}/>
                    {t("field_nickname_toggle")}
                  </label>
                  {cardData.hasNickname && (
                    <Field label={t("field_nickname")} value={cardData.nickname} onChange={v=>updateField("nickname",v)} placeholder={t("field_nickname_placeholder")}/>
                  )}
                </div>

                {/* Type line */}
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("field_type")}</div>
                  <Field label="" value={cardData.typeLine} onChange={v=>updateField("typeLine",v)}/>
                </div>

                {/* Rules text */}
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:12,fontWeight:600,color:"var(--text-2)"}}>
                      <input type="checkbox" checked={cardData.hasRulesText!==false} onChange={e=>updateField("hasRulesText",e.target.checked)}/>
                      {t("field_rules_toggle")}
                    </label>
                    {cardData.hasRulesText!==false && (
                      <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11,color:"var(--text-3)"}}>
                        <input type="checkbox" checked={!!cardData.rulesJustify} onChange={e=>updateField("rulesJustify",e.target.checked)}/>
                        {t("field_rules_justify")}
                      </label>
                    )}
                  </div>
                  {cardData.hasRulesText!==false && (<>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      {[["B","**","**"],["I","*","*"]].map(([lbl,before,after])=>(
                        <button key={lbl} onClick={()=>wrapSelection(before,after)} style={{
                          width:26,height:24,border:"1px solid var(--border-2)",borderRadius:5,
                          background:"var(--surface)",color:"var(--text-2)",cursor:"pointer",fontSize:12,
                          fontWeight:lbl==="B"?"700":"400",fontStyle:lbl==="I"?"italic":"normal",
                        }}>{lbl}</button>
                      ))}
                      <span style={{fontSize:10,color:"var(--text-3)",marginLeft:4}}>{t("select_then_format")}</span>
                    </div>
                    <textarea ref={rulesTextareaRef} value={cardData.rulesText}
                      onChange={e=>updateField("rulesText",e.target.value)}
                      rows={5} placeholder={t("field_rules_placeholder")}
                      style={{width:"100%",padding:"9px 12px",background:"var(--input-bg)",border:"1px solid var(--input-border)",borderRadius:8,color:"var(--text)",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",transition:"border-color 0.2s"}}
                      onFocus={e=>e.target.style.borderColor="var(--accent-border)"}
                      onBlur={e=>e.target.style.borderColor="var(--input-border)"}/>
                    <div style={{fontSize:10,color:"var(--text-3)",lineHeight:1.5}}>{t("field_rules_hint")}</div>
                  </>)}
                </div>

                {/* Flavor & Artist */}
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("field_flavor")}</div>
                  <Field label="" value={cardData.flavorText} onChange={v=>updateField("flavorText",v)} multiline rows={2}/>
                  <div style={{height:1,background:"var(--border)"}}/>
                  <Field label={t("field_artist")} value={cardData.artistName} onChange={v=>updateField("artistName",v)} placeholder={t("field_artist_placeholder")}/>
                </div>

              </div>
            )}

            {/* ── TAB: Art ── */}
            {activeTab==="art" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {/* Art subtabs */}
                <div style={{display:"flex",gap:6,background:"var(--panel)",borderRadius:12,padding:8,border:"1px solid var(--border)"}}>
                  {[
                    {id:"upload", label:t("art_upload_tab"), icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>},
                    {id:"generate", label:t("art_generate_tab"), icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>},
                  ].map(sub=>(
                    <button key={sub.id} onClick={()=>setArtSubTab(sub.id)} style={{
                      flex:1, padding:"8px 0", border:"none", cursor:"pointer",borderRadius:8,
                      background:artSubTab===sub.id ? "var(--accent-bg)" : "transparent",
                      color:artSubTab===sub.id ? "var(--accent)" : "var(--text-3)",
                      fontSize:12, fontWeight:600, letterSpacing:0.4,
                      outline:artSubTab===sub.id ? "1px solid var(--accent-border)" : "1px solid transparent",
                      transition:"all 0.18s", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    }}>{sub.icon}{sub.label}</button>
                  ))}
                </div>

                {/* Subtab: Cargar imagen */}
                {artSubTab==="upload" && (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>

                    {/* Frame selector */}
                    <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:10}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>Card Frame</div>
                      <div style={{display:"flex",gap:6}}>
                        {[
                          {id:"default", label:"Default", preview:null},
                          {id:"wot_auto", label:"WOT Auto", preview:"/frames/gold-sorcery.png"},
                        ].map(opt=>(
                          <button key={opt.id} onClick={()=>setFrameId(opt.id)} style={{
                            flex:1, padding:"8px 6px", border:"1px solid", borderRadius:8,
                            cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.18s",
                            borderColor: frameId===opt.id ? "var(--accent)" : "var(--border-2)",
                            background: frameId===opt.id ? "var(--accent-bg)" : "var(--surface)",
                            color: frameId===opt.id ? "var(--accent)" : "var(--text-2)",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                          }}>
                            {opt.preview ? (
                              <img src={opt.preview} alt={opt.label} style={{width:32,height:44,objectFit:"fill",borderRadius:3,opacity:0.85}}/>
                            ) : (
                              <div style={{width:32,height:44,borderRadius:3,background:"linear-gradient(135deg,#2c3e50,#0f3460)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"rgba(255,255,255,0.4)"}}>CSS</div>
                            )}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {frameId==="wot_auto" && (
                        <div style={{fontSize:10,color:"var(--text-3)",lineHeight:1.5}}>
                          Frame: <span style={{color:"var(--accent)",fontWeight:600}}>{autoWotFrame(cardData.manaCost,cardData.isCreature).replace("wot_","").replace(/_/g," ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Frame calibration panel */}
                    {frameId==="wot_auto" && (() => {
                      const mode = cardData.isCreature ? "creature" : "sorcery";
                      const lay = frameLayout[mode];
                      const setLay = (key, subkey, val) => setFrameLayout(prev=>({
                        ...prev,
                        [mode]:{ ...prev[mode], [key]:{ ...prev[mode][key], [subkey]:val }}
                      }));
                      const toggle = () => setCalOpen(o=>!o);
                      const Cal = ({label, obj, k, subk, min=0, max=700}) => (
                        <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid var(--border)"}}>
                          <span style={{fontSize:10,color:"var(--text-3)",width:80,flexShrink:0}}>{label}</span>
                          <input type="range" min={min} max={max} value={obj[subk]??0}
                            onChange={e=>setLay(k,subk,Number(e.target.value))}
                            style={{flex:1}}/>
                          <input type="number" min={min} max={max} value={obj[subk]??0}
                            onChange={e=>setLay(k,subk,Number(e.target.value))}
                            style={{
                              width:46, padding:"2px 4px", borderRadius:5,
                              border:"1px solid var(--border-2)", background:"var(--surface)",
                              color:"var(--accent)", fontSize:11, fontWeight:700,
                              textAlign:"center",
                            }}/>
                        </div>
                      );
                      return (
                        <div style={{background:"var(--panel)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden"}}>
                          {/* Header — always visible */}
                          <div onClick={toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",cursor:"pointer"}}>
                            <span style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>
                              Calibración · {mode}
                            </span>
                            <span style={{fontSize:14,color:"var(--text-3)",transition:"transform 0.2s",display:"inline-block",transform:calOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                          </div>
                          {calOpen && <div style={{padding:"0 14px 14px",display:"flex",flexDirection:"column",gap:2,borderTop:"1px solid var(--border)"}}>
                          <div style={{display:"flex",justifyContent:"flex-end",paddingTop:10,marginBottom:6}}>
                            <button onClick={()=>{
                              const json = JSON.stringify(frameLayout, null, 2);
                              navigator.clipboard.writeText(json);
                            }} style={{padding:"4px 10px",borderRadius:6,border:"1px solid var(--accent-border)",background:"var(--accent-bg)",color:"var(--accent)",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                              Copiar config
                            </button>
                          </div>
                          <div style={{fontSize:10,fontWeight:600,color:"var(--text-3)",padding:"6px 0 2px",textTransform:"uppercase",letterSpacing:0.8}}>Costo de maná</div>
                          <Cal label="Top" obj={lay.manaCost} k="manaCost" subk="top" max={600}/>
                          <Cal label="Right" obj={lay.manaCost} k="manaCost" subk="right" max={400}/>
                          <div style={{fontSize:10,fontWeight:600,color:"var(--text-3)",padding:"6px 0 2px",textTransform:"uppercase",letterSpacing:0.8}}>Nombre</div>
                          <Cal label="Top" obj={lay.name} k="name" subk="top" max={600}/>
                          <Cal label="Left" obj={lay.name} k="name" subk="left" max={200}/>
                          <Cal label="Right" obj={lay.name} k="name" subk="right" max={400}/>
                          <Cal label="Font" obj={lay.name} k="name" subk="fontSize" min={8} max={32}/>
                          <div style={{fontSize:10,fontWeight:600,color:"var(--text-3)",padding:"6px 0 2px",textTransform:"uppercase",letterSpacing:0.8}}>Tipo</div>
                          <Cal label="Top" obj={lay.typeLine} k="typeLine" subk="top" max={650}/>
                          <Cal label="Left" obj={lay.typeLine} k="typeLine" subk="left" max={200}/>
                          <Cal label="Right" obj={lay.typeLine} k="typeLine" subk="right" max={200}/>
                          <Cal label="Font" obj={lay.typeLine} k="typeLine" subk="fontSize" min={8} max={24}/>
                          <div style={{fontSize:10,fontWeight:600,color:"var(--text-3)",padding:"6px 0 2px",textTransform:"uppercase",letterSpacing:0.8}}>Texto de reglas</div>
                          <Cal label="Top" obj={lay.rulesBox} k="rulesBox" subk="top" max={650}/>
                          <Cal label="Left" obj={lay.rulesBox} k="rulesBox" subk="left" max={100}/>
                          <Cal label="Right" obj={lay.rulesBox} k="rulesBox" subk="right" max={100}/>
                          <Cal label="MaxHeight" obj={lay.rulesBox} k="rulesBox" subk="maxHeight" min={40} max={300}/>
                          <Cal label="Font" obj={lay.rulesBox} k="rulesBox" subk="fontSize" min={8} max={22}/>
                          <div style={{fontSize:10,fontWeight:600,color:"var(--text-3)",padding:"6px 0 2px",textTransform:"uppercase",letterSpacing:0.8}}>P/T & Artista</div>
                          <Cal label="PT Bottom" obj={lay.pt} k="pt" subk="bottom" max={200}/>
                          <Cal label="PT Right" obj={lay.pt} k="pt" subk="right" max={200}/>
                          <Cal label="PT Font" obj={lay.pt} k="pt" subk="fontSize" min={8} max={36}/>
                          <Cal label="PT Spacing" obj={lay.pt} k="pt" subk="letterSpacing" min={-5} max={5}/>
                          <Cal label="Artist Bottom" obj={lay.artist} k="artist" subk="bottom" max={200}/>
                          </div>}
                        </div>
                      );
                    })()}

                    {/* Drop zone */}
                    <div style={{background:"var(--panel)",borderRadius:12,border:"1px solid var(--border)"}}>
                      <div onClick={()=>fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e=>e.preventDefault()}
                        style={{padding:"28px 20px",textAlign:"center",cursor:"pointer",borderRadius:12,transition:"background 0.18s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--surface)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{fontSize:28,marginBottom:6}}>🎨</div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--text-2)"}}>{t("art_drop")}</div>
                        <div style={{fontSize:11,color:"var(--text-3)",marginTop:3}}>{t("art_formats")}</div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleArtUpload} style={{display:"none"}}/>
                      </div>
                    </div>

                    {artImage && (<>
                      {/* Preview thumbnail — draggable */}
                      <div style={{background:"var(--panel)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden"}}>
                        <div style={{
                          width:"100%",height:170,cursor:"grab",
                          backgroundImage:`url(${artImage})`,
                          backgroundSize:`${artPosition.zoom*100}%`,
                          backgroundPosition:`${artPosition.x}% ${artPosition.y}%`,
                          backgroundRepeat:"no-repeat",
                        }} onMouseDown={(e)=>{
                          e.preventDefault();
                          artDragRef.current={startX:e.clientX,startY:e.clientY,x:artPosition.x,y:artPosition.y,W:e.currentTarget.offsetWidth,H:e.currentTarget.offsetHeight,zoom:artPosition.zoom};
                        }}/>
                      </div>

                      {/* Position card */}
                      <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:12}}>
                        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("group_position")}</div>
                        <SliderField label={t("slider_scale")} value={Math.round(artPosition.zoom*100)} onChange={v=>setArtPosition(p=>({...p,zoom:v/100}))} min={50} max={300} suffix="%"/>
                        <SliderField label={t("slider_h")} value={Math.round(artPosition.x)} onChange={v=>setArtPosition(p=>({...p,x:v}))} min={-50} max={150}/>
                        <SliderField label={t("slider_v")} value={Math.round(artPosition.y)} onChange={v=>setArtPosition(p=>({...p,y:v}))} min={-50} max={150}/>
                      </div>

                      {/* Rules frame card */}
                      <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:12}}>
                        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("group_rules_frame")}</div>
                        <SliderField label={t("slider_start")} value={artPosition.overlayStart??20} onChange={v=>setArtPosition(p=>({...p,overlayStart:v}))} min={0} max={85} suffix="%"/>
                        <SliderField label={t("slider_transition")} value={artPosition.overlayTransition??50} onChange={v=>setArtPosition(p=>({...p,overlayTransition:v}))} min={2} max={80} suffix="%"/>
                        <SliderField label={t("slider_intensity")} value={Math.round(artPosition.overlayOpacity*100)} onChange={v=>setArtPosition(p=>({...p,overlayOpacity:v/100}))} min={0} max={100} suffix="%"/>
                      </div>

                      {/* Adjustments card */}
                      <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:12}}>
                        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("group_adjustments")}</div>
                        <SliderField label={t("slider_brightness")} value={artPosition.brightness} onChange={v=>setArtPosition(p=>({...p,brightness:v}))} min={50} max={200} suffix="%"/>
                        <SliderField label={t("slider_contrast")} value={artPosition.contrast} onChange={v=>setArtPosition(p=>({...p,contrast:v}))} min={50} max={200} suffix="%"/>
                        <SliderField label={t("slider_saturation")} value={artPosition.saturate} onChange={v=>setArtPosition(p=>({...p,saturate:v}))} min={0} max={300} suffix="%"/>
                      </div>

                      {/* Upscale card */}
                      <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                          </svg>
                          <span style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>Upscale con IA</span>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:10,color:"var(--text-3)",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Escala</div>
                            <div style={{display:"flex",gap:4}}>
                              {[2,4].map(s=>(
                                <button key={s} onClick={()=>setUpscaleConfig(c=>({...c,scale:s}))} style={{
                                  flex:1,padding:"6px 0",border:"1px solid",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s",
                                  borderColor: upscaleConfig.scale===s ? "var(--accent)" : "var(--border-2)",
                                  background: upscaleConfig.scale===s ? "var(--accent-bg)" : "var(--surface)",
                                  color: upscaleConfig.scale===s ? "var(--accent)" : "var(--text-2)",
                                }}>{s}×</button>
                              ))}
                            </div>
                          </div>
                          <div style={{flex:2}}>
                            <div style={{fontSize:10,color:"var(--text-3)",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Upscaler</div>
                            <select value={upscaleConfig.upscaler} onChange={e=>setUpscaleConfig(c=>({...c,upscaler:e.target.value}))}
                              style={{width:"100%",padding:"6px 8px",borderRadius:7,border:"1px solid var(--border-2)",background:"var(--surface)",color:"var(--text)",fontSize:12,cursor:"pointer"}}>
                              {["R-ESRGAN 4x+","R-ESRGAN 4x+ Anime6B","ESRGAN_4x","Lanczos","Nearest"].map(u=>(
                                <option key={u} value={u}>{u}</option>
                              ))}
                              {sdUpscalers.filter(u=>!["R-ESRGAN 4x+","R-ESRGAN 4x+ Anime6B","ESRGAN_4x","Lanczos","Nearest"].includes(u)).map(u=>(
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button onClick={upscaleImage} disabled={upscaleLoading} style={{
                          padding:"9px",border:"none",borderRadius:9,cursor:upscaleLoading?"wait":"pointer",
                          background:"linear-gradient(135deg,#6c3483,#8e44ad)",
                          color:"#fff",fontSize:12,fontWeight:700,letterSpacing:0.4,
                          display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                          opacity:upscaleLoading?0.7:1,transition:"opacity 0.2s",
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                          </svg>
                          {upscaleLoading ? "Procesando..." : "Mejorar resolución"}
                        </button>
                        {upscaleError && <div style={{fontSize:11,color:"var(--accent)"}}>{upscaleError}</div>}
                      </div>

                      <button onClick={()=>{setArtImage(null);setArtPosition({x:50,y:50,zoom:1.5,overlayOpacity:1,overlayStart:20,overlayTransition:50,brightness:105,contrast:105,saturate:110,sharpness:0});}}
                        style={{padding:"9px",border:"1px solid var(--border-2)",borderRadius:10,background:"var(--panel)",color:"var(--text-3)",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.18s",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent-border)";e.currentTarget.style.color="var(--accent)";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-2)";e.currentTarget.style.color="var(--text-3)";}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        {t("art_remove")}
                      </button>
                    </>)}
                  </div>
                )}

                {/* Subtab: Generar con IA */}
                {artSubTab==="generate" && (
                  <SDGeneratePanel
                    sdConfig={sdConfig}
                    setSdConfig={setSdConfig}
                    sdGenerating={sdGenerating}
                    sdError={sdError}
                    sdPreview={sdPreview}
                    sdModels={sdModels}
                    sdSamplers={sdSamplers}
                    sdLoras={sdLoras}
                    sdUpscalers={sdUpscalers}
                    onGenerate={generateWithSD}
                    onFetchModels={fetchSDModels}
                    onUseAsArt={()=>{
                      setArtImage(sdPreview);
                      setArtPosition({x:50,y:50,zoom:1.5,overlayOpacity:1,overlayStart:20,overlayTransition:50,brightness:105,contrast:105,saturate:110,sharpness:0});
                      setArtSubTab("upload");
                    }}
                  />
                )}
              </div>
            )}

            {/* ── TAB: Stats ── */}
            {activeTab==="stats" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>

                {/* Mana cost card */}
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase"}}>{t("field_mana")}</div>
                  <Field label="" value={manaInput} onChange={handleManaChange} placeholder={t("mana_placeholder")}/>
                  <div style={{fontSize:10,color:"var(--text-3)"}}>{t("mana_hint")}</div>
                  {cardData.manaCost.length>0 && (
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",paddingTop:2}}>
                      <ManaCostDisplay manaCost={cardData.manaCost} size={28} customImages={customImages}/>
                    </div>
                  )}
                </div>

                {/* Card options card */}
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:0}}>
                  {[
                    {checked:cardData.isCreature, onChange:e=>updateField("isCreature",e.target.checked), label:t("is_creature")},
                    {checked:showProxyLabel, onChange:e=>setShowProxyLabel(e.target.checked), label:t("show_proxy")},
                  ].map((row,i,arr)=>(
                    <label key={i} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"11px 0",borderBottom:i<arr.length-1?"1px solid var(--border)":"none",fontSize:13,color:"var(--text-2)",fontWeight:500}}>
                      <input type="checkbox" checked={row.checked} onChange={row.onChange}/>
                      {row.label}
                    </label>
                  ))}
                </div>

                {/* Power / Toughness */}
                {cardData.isCreature && (
                  <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)",display:"flex",gap:12}}>
                    <Field label={t("field_power")} value={cardData.power} onChange={v=>updateField("power",v)} small/>
                    <Field label={t("field_toughness")} value={cardData.toughness} onChange={v=>updateField("toughness",v)} small/>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Symbols ── */}
            {activeTab==="symbols" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontSize:12,color:"var(--text-2)",lineHeight:1.6,background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)"}}>
                  {t("symbols_hint")}
                </div>
                <div style={{background:"var(--panel)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden"}}>
                  {["W","U","B","R","G","C","X","T","WP","UP","BP","RP","GP"].map((sym,i,arr)=>(
                    <div key={sym} style={{borderBottom:i<arr.length-1?"1px solid var(--border)":"none"}}>
                      <ManaImageRow symbol={sym} customImg={customImages[sym]}
                        onUpload={(e)=>handleManaImageUpload(sym,e)}
                        onRemove={()=>removeManaImage(sym)}
                        customImages={customImages}/>
                    </div>
                  ))}
                </div>
                <div style={{background:"var(--panel)",borderRadius:12,padding:14,border:"1px solid var(--border)"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1.1,color:"var(--text-3)",textTransform:"uppercase",marginBottom:12}}>{t("generics")}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {Array.from({length:17},(_,i)=>String(i)).map(sym=>(
                      <ManaImageMini key={sym} symbol={sym} customImg={customImages[sym]}
                        onUpload={(e)=>handleManaImageUpload(sym,e)}
                        onRemove={()=>removeManaImage(sym)}
                        customImages={customImages}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          background:"var(--preview-bg)",
          padding:24, overflow:"auto", minWidth:0,
          flexDirection:"column", gap:20,
        }}>
          <div ref={cardRef} style={{transform:"scale(0.85)",transformOrigin:"center", cursor: artImage ? "grab" : "default"}}>
            <CardPreview cardData={cardData} artImage={artImage} artPosition={artPosition} customImages={customImages} frameId={frameId} frameLayout={frameLayout} showProxyLabel={showProxyLabel}/>
          </div>
          <button onClick={saveCard} disabled={exporting} style={{
            padding:"10px 28px", border:"none", borderRadius:9,
            background: exporting ? "var(--surface-2)" : "linear-gradient(135deg,#c0392b,#e74c3c)",
            color: exporting ? "var(--text-3)" : "#fff",
            fontSize:13, fontWeight:700, cursor: exporting?"wait":"pointer",
            letterSpacing:0.5, display:"flex", alignItems:"center", gap:8,
            boxShadow: exporting ? "none" : "var(--accent-glow)",
            transition:"all 0.2s",
          }}>
            {exporting ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-4.56"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {exporting ? t("saving") : t("save")}
          </button>

          {/* Hidden export card (no border-radius, full scale) */}
          <div style={{position:"fixed",left:"-9999px",top:0}}>
            <div ref={exportRef}>
              <CardPreview cardData={cardData} artImage={artImage} artPosition={artPosition} customImages={customImages} frameId={frameId} frameLayout={frameLayout} exporting={true} showProxyLabel={showProxyLabel}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mana image upload row (for WUBRGCXT) ── */
function ManaImageRow({symbol,customImg,onUpload,onRemove,customImages}){
  const ref=useRef(null);
  const LABELS={W:"Blanco (W)",U:"Azul (U)",B:"Negro (B)",R:"Rojo (R)",G:"Verde (G)",C:"Incoloro (C)",X:"Variable (X)",T:"Tap (T)",WP:"Phyrexiano Blanco",UP:"Phyrexiano Azul",BP:"Phyrexiano Negro",RP:"Phyrexiano Rojo",GP:"Phyrexiano Verde"};
  const hasDefault = !!DEFAULT_MANA_IMAGES[symbol];
  const isCustom = !!customImg;
  const statusLabel = isCustom ? "Custom" : hasDefault ? "Default" : "SVG";
  const statusColor = isCustom ? "#e74c3c" : hasDefault ? "#3aaf70" : "rgba(255,255,255,0.25)";

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"8px 10px", borderRadius:8,
      background: isCustom ? "rgba(231,76,60,0.04)" : "rgba(255,255,255,0.02)",
      border: isCustom ? "1px solid rgba(231,76,60,0.2)" : "1px solid rgba(255,255,255,0.05)",
    }}>
      <ManaSymbol symbol={symbol} size={30} customImages={customImages}/>
      <div style={{flex:1}}>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{LABELS[symbol]||symbol}</div>
        <div style={{fontSize:10,color:statusColor,marginTop:1}}>{statusLabel}</div>
      </div>
      <button onClick={()=>ref.current?.click()} style={{
        padding:"5px 12px", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:6, background:"rgba(255,255,255,0.05)",
        color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:11,
      }}>
        {isCustom ? "Cambiar" : "Subir"}
      </button>
      {isCustom && (
        <button onClick={onRemove} title="Restaurar predeterminado" style={{
          padding:"5px 8px", border:"1px solid rgba(192,57,43,0.3)",
          borderRadius:6, background:"rgba(192,57,43,0.1)",
          color:"#e74c3c", cursor:"pointer", fontSize:11,
        }}>↩</button>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={onUpload} style={{display:"none"}}/>
    </div>
  );
}

/* ── Mini mana image upload (for numbers) ── */
function ManaImageMini({symbol,customImg,onUpload,onRemove,customImages}){
  const ref=useRef(null);
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      padding:6, borderRadius:6,
      background:customImg ? "rgba(192,57,43,0.1)" : "rgba(255,255,255,0.02)",
      border:customImg ? "1px solid rgba(192,57,43,0.3)" : "1px solid rgba(255,255,255,0.05)",
      cursor:"pointer", position:"relative",
    }}
      onClick={()=>ref.current?.click()}
    >
      <ManaSymbol symbol={symbol} size={28} customImages={customImages}/>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{symbol}</div>
      {customImg && (
        <div onClick={e=>{e.stopPropagation();onRemove();}} style={{
          position:"absolute", top:-4, right:-4, width:14, height:14, borderRadius:"50%",
          background:"#c0392b", color:"#fff", fontSize:9,
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
        }}>✕</div>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={onUpload} style={{display:"none"}}/>
    </div>
  );
}

/* ── SD connectivity ping ── */
function SDPingButton({url}){
  const [status,setStatus] = useState(null); // null | "ok" | string(error)
  const [testing,setTesting] = useState(false);
  const test = async ()=>{
    setTesting(true);
    setStatus(null);
    try{
      const r = await fetch(`${url}/sdapi/v1/memory`);
      if(r.ok) setStatus("ok");
      else setStatus(`HTTP ${r.status}`);
    }catch(e){
      setStatus(e.message||"error desconocido");
    }
    setTesting(false);
  };
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
      <button onClick={test} disabled={testing} title="Probar conexión" style={{
        padding:"4px 8px", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:5, background:"rgba(255,255,255,0.03)",
        color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:11,
      }}>{testing ? "..." : "⚡ Test"}</button>
      {status && (
        <span style={{fontSize:10, color: status==="ok" ? "#4ade80" : "#f87171", whiteSpace:"nowrap"}}>
          {status==="ok" ? "✓ conectado" : status}
        </span>
      )}
    </div>
  );
}

/* ── Stable Diffusion generation panel ── */
function SDGeneratePanel({sdConfig,setSdConfig,sdGenerating,sdError,sdPreview,sdModels,sdSamplers,sdLoras,sdUpscalers,onGenerate,onUseAsArt,onFetchModels}){
  const upd = (k,v) => setSdConfig(prev=>({...prev,[k]:v}));
  const preset = MTG_STYLE_PRESETS.find(p=>p.id===sdConfig.preset);

  const toggleLora = (loraName) => {
    const existing = (sdConfig.activeLoras||[]).find(l=>l.name===loraName);
    if(existing){
      upd("activeLoras",(sdConfig.activeLoras||[]).filter(l=>l.name!==loraName));
    } else {
      upd("activeLoras",[...(sdConfig.activeLoras||[]),{name:loraName,weight:0.7}]);
    }
  };

  const updateLoraWeight = (loraName, weight) => {
    upd("activeLoras",(sdConfig.activeLoras||[]).map(l=>l.name===loraName ? {...l,weight} : l));
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Mode toggle + API URL */}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>
          {[["basic","Básico"],["advanced","Avanzado"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>upd("mode",m)} style={{
              padding:"5px 11px", border:"none", cursor:"pointer",
              background:sdConfig.mode===m ? "rgba(192,57,43,0.25)" : "transparent",
              color:sdConfig.mode===m ? "#e74c3c" : "rgba(255,255,255,0.35)",
              fontSize:11, fontWeight:600,
              borderRight:m==="basic" ? "1px solid rgba(255,255,255,0.1)" : "none",
              transition:"all 0.15s",
            }}>{lbl}</button>
          ))}
        </div>
        <SDPingButton url={sdConfig.url}/>
        {sdConfig.mode==="advanced" && (
          <input value={sdConfig.url} onChange={e=>upd("url",e.target.value)}
            placeholder="http://127.0.0.1:7860"
            style={{
              flex:1, padding:"5px 8px",
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:6, color:"#e8e4df",
              fontSize:11, fontFamily:"monospace", outline:"none",
            }}/>
        )}
      </div>

      {/* Style presets — basic mode only */}
      {sdConfig.mode==="basic" && (
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Estilo predefinido</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
          {MTG_STYLE_PRESETS.map(p=>(
            <button key={p.id} onClick={()=>upd("preset",p.id)} style={{
              padding:"8px 4px", border:"1px solid",
              borderColor:sdConfig.preset===p.id ? "rgba(231,76,60,0.5)" : "rgba(255,255,255,0.07)",
              borderRadius:7,
              background:sdConfig.preset===p.id ? "rgba(231,76,60,0.12)" : "rgba(255,255,255,0.02)",
              color:sdConfig.preset===p.id ? "#e8e4df" : "rgba(255,255,255,0.45)",
              cursor:"pointer", fontSize:11, fontWeight:sdConfig.preset===p.id ? 600 : 400,
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              transition:"all 0.15s",
            }}>
              <span style={{fontSize:17}}>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        {preset && (
          <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:6,lineHeight:1.4,fontStyle:"italic"}}>
            {preset.prompt.split(",").slice(0,4).join(", ")}...
          </div>
        )}
      </div>
      )}

      {/* Artist references — basic mode only */}
      {sdConfig.mode==="basic" && ARTIST_REFS[sdConfig.preset] && (
        <div>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>
            Artista de referencia <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.2)"}}> — click para agregar al prompt</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ARTIST_REFS[sdConfig.preset].map(artist=>{
              const tag = `by ${artist}`;
              const active = sdConfig.prompt.includes(tag);
              return (
                <button key={artist} onClick={()=>{
                  if(active){
                    upd("prompt", sdConfig.prompt.replace(`, ${tag}`, "").replace(`${tag}, `, "").replace(tag, "").trim().replace(/^,|,$/g,"").trim());
                  } else {
                    upd("prompt", [sdConfig.prompt, tag].filter(Boolean).join(", "));
                  }
                }} style={{
                  padding:"4px 10px", border:"1px solid",
                  borderColor: active ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.1)",
                  borderRadius:20,
                  background: active ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                  color: active ? "#c084fc" : "rgba(255,255,255,0.45)",
                  cursor:"pointer", fontSize:11, fontWeight: active ? 600 : 400,
                  transition:"all 0.15s",
                }}>{active ? "✓ " : ""}{artist}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* LoRAs */}
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.5,textTransform:"uppercase"}}>
            LoRAs <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.2)"}}> — estilos adicionales</span>
          </div>
          <button onClick={onFetchModels} title="Buscar LoRAs en SD" style={{
            padding:"3px 8px", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:5, background:"rgba(255,255,255,0.03)",
            color:"rgba(255,255,255,0.35)", cursor:"pointer", fontSize:10,
          }}>↻ Cargar</button>
        </div>
        {sdLoras.length===0 ? (
          <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",lineHeight:1.5}}>
            Sin LoRAs detectados. Pulsa <b style={{color:"rgba(255,255,255,0.3)"}}>↻ Cargar</b> con SD corriendo.
          </div>
        ) : (
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {sdLoras.map(loraName=>{
              const active = (sdConfig.activeLoras||[]).find(l=>l.name===loraName);
              const shortName = loraName.length>22 ? loraName.slice(0,20)+"…" : loraName;
              return (
                <button key={loraName} onClick={()=>toggleLora(loraName)} style={{
                  padding:"4px 10px", border:"1px solid",
                  borderColor:active ? "rgba(251,191,36,0.6)" : "rgba(255,255,255,0.1)",
                  borderRadius:20,
                  background:active ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                  color:active ? "#fbbf24" : "rgba(255,255,255,0.45)",
                  cursor:"pointer", fontSize:11, fontWeight:active ? 600 : 400,
                  transition:"all 0.15s",
                }}>
                  {active ? "✓ " : ""}{shortName}{active ? ` (${active.weight.toFixed(1)})` : ""}
                </button>
              );
            })}
          </div>
        )}
        {(sdConfig.activeLoras||[]).length>0 && (
          <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:10}}>
            {(sdConfig.activeLoras||[]).map(lora=>(
              <div key={lora.name} style={{
                display:"flex",alignItems:"center",gap:8,
                padding:"6px 10px",borderRadius:7,
                background:"rgba(251,191,36,0.06)",
                border:"1px solid rgba(251,191,36,0.15)",
              }}>
                <span style={{
                  fontSize:11,color:"rgba(255,255,255,0.55)",
                  flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                }}>{lora.name}</span>
                <input type="range" min={1} max={15} step={1}
                  value={Math.round(lora.weight*10)}
                  onChange={e=>updateLoraWeight(lora.name,Number(e.target.value)/10)}
                  style={{width:70,accentColor:"#fbbf24",height:3,cursor:"pointer",flexShrink:0}}/>
                <span style={{fontSize:11,color:"#fbbf24",width:26,textAlign:"right",flexShrink:0}}>
                  {lora.weight.toFixed(1)}
                </span>
                <button onClick={()=>toggleLora(lora.name)} title="Quitar LoRA" style={{
                  padding:"2px 6px", border:"1px solid rgba(251,191,36,0.3)",
                  borderRadius:4, background:"rgba(251,191,36,0.08)",
                  color:"rgba(251,191,36,0.7)", cursor:"pointer", fontSize:11, flexShrink:0,
                }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>
          Tu prompt {sdConfig.mode==="basic" ? <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}> — se combina con el estilo</span> : ""}
        </label>
        <textarea value={sdConfig.prompt} onChange={e=>upd("prompt",e.target.value)}
          rows={3} placeholder="ej: ancient lich king, undead warrior, glowing eyes, crown of bones..."
          style={{
            width:"100%", padding:"10px 14px",
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:8, color:"#e8e4df",
            fontSize:13, fontFamily:"inherit",
            outline:"none", resize:"vertical", boxSizing:"border-box",
          }}
          onFocus={e=>e.target.style.borderColor="rgba(231,76,60,0.4)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
      </div>

      {/* Advanced options */}
      {sdConfig.mode==="advanced" && (
        <>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>
              Negative Prompt adicional
            </label>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginBottom:6,lineHeight:1.4}}>
              Los negativos de anatomía y calidad se aplican siempre. Agrega aquí extras específicos.
            </div>
            <textarea value={sdConfig.negativePrompt} onChange={e=>upd("negativePrompt",e.target.value)}
              rows={2} placeholder="ej: nsfw, violence, specific style to avoid..."
              style={{
                width:"100%", padding:"8px 14px",
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:8, color:"#e8e4df",
                fontSize:12, fontFamily:"inherit",
                outline:"none", resize:"vertical", boxSizing:"border-box",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(231,76,60,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <SliderField label="Steps" value={sdConfig.steps} onChange={v=>upd("steps",v)} min={5} max={60} suffix=""/>
            <SliderField label="CFG Scale" value={sdConfig.cfg} onChange={v=>upd("cfg",v)} min={1} max={20} suffix=""/>
            <SliderField label="Clip Skip" value={sdConfig.clipSkip} onChange={v=>upd("clipSkip",v)} min={1} max={4} suffix=""/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>Sampler</label>
            <select value={sdConfig.sampler} onChange={e=>upd("sampler",e.target.value)}
              style={{
                width:"100%", padding:"8px 10px",
                background:"#1a1a1a", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:8, color:"#e8e4df", fontSize:13, outline:"none",
              }}>
              {sdSamplers.map(s=><option key={s} value={s} style={{background:"#1a1a1a"}}>{s}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>Seed</label>
              <input type="number" value={sdConfig.seed} onChange={e=>upd("seed",Number(e.target.value))}
                style={{
                  width:"100%", padding:"8px 10px",
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:8, color:"#e8e4df", fontSize:13, outline:"none", boxSizing:"border-box",
                }}/>
            </div>
            <button onClick={()=>upd("seed",-1)} style={{
              padding:"8px 12px", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, background:"rgba(255,255,255,0.04)",
              color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, whiteSpace:"nowrap",
            }}>Aleatorio</button>
          </div>
          {/* Hires.fix */}
          <div style={{
            padding:"10px 12px", borderRadius:8,
            background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
          }}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom: sdConfig.hiresEnabled ? 12 : 0}}>
              <input type="checkbox" checked={sdConfig.hiresEnabled}
                onChange={e=>upd("hiresEnabled",e.target.checked)}
                style={{accentColor:"#e74c3c"}}/>
              <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.6)"}}>Hires.fix</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.25)"}}>— escalar tras generar</span>
            </label>
            {sdConfig.hiresEnabled && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={{display:"block",fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4,letterSpacing:0.5,textTransform:"uppercase"}}>Ancho final</label>
                    <input type="number" value={sdConfig.hiresWidth} onChange={e=>upd("hiresWidth",Number(e.target.value))}
                      step={64} min={512} max={2048}
                      style={{width:"100%",padding:"6px 8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#e8e4df",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4,letterSpacing:0.5,textTransform:"uppercase"}}>Alto final</label>
                    <input type="number" value={sdConfig.hiresHeight} onChange={e=>upd("hiresHeight",Number(e.target.value))}
                      step={64} min={512} max={2048}
                      style={{width:"100%",padding:"6px 8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#e8e4df",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <SliderField label="HR Steps" value={sdConfig.hiresSteps} onChange={v=>upd("hiresSteps",v)} min={5} max={40} suffix=""/>
                  <SliderField label="Denoise" value={Math.round(sdConfig.hiresDenoise*100)} onChange={v=>upd("hiresDenoise",v/100)} min={1} max={100} suffix="%"/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4,letterSpacing:0.5,textTransform:"uppercase"}}>Upscaler</label>
                  <select value={sdConfig.hiresUpscaler} onChange={e=>upd("hiresUpscaler",e.target.value)}
                    style={{width:"100%",padding:"6px 8px",background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#e8e4df",fontSize:12,outline:"none"}}>
                    {sdUpscalers.map(u=><option key={u} value={u} style={{background:"#1a1a1a"}}>{u}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {sdModels.length>0 && (
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>Modelo</label>
              <select value={sdConfig.model} onChange={e=>upd("model",e.target.value)}
                style={{
                  width:"100%", padding:"8px 10px",
                  background:"#1a1a1a", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:8, color:"#e8e4df", fontSize:12, outline:"none",
                }}>
                <option value="" style={{background:"#1a1a1a"}}>— Modelo actual de SD —</option>
                {sdModels.map(m=><option key={m} value={m} style={{background:"#1a1a1a"}}>{m}</option>)}
              </select>
            </div>
          )}
          <button onClick={onFetchModels} style={{
            padding:"6px 12px", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:6, background:"rgba(255,255,255,0.03)",
            color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:11,
          }}>↻ Cargar modelos, samplers y LoRAs desde SD</button>

          {/* Model recommendation */}
          <div style={{
            padding:"10px 12px", borderRadius:8,
            background:"rgba(168,85,247,0.06)", border:"1px solid rgba(168,85,247,0.2)",
            fontSize:11, color:"rgba(200,180,230,0.7)", lineHeight:1.6,
          }}>
            💡 {MODEL_TIPS}
          </div>
        </>
      )}

      {/* Size presets */}
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:8,letterSpacing:0.5,textTransform:"uppercase"}}>Resolución</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
          {SIZE_PRESETS.map(sz=>{
            const active = sdConfig.width===sz.w && sdConfig.height===sz.h;
            const orientIcon = sz.orient==="landscape" ? "⬜" : sz.orient==="portrait" ? "▭" : "□";
            return (
              <button key={sz.label} onClick={()=>setSdConfig(p=>({...p,width:sz.w,height:sz.h}))} style={{
                padding:"7px 4px", border:"1px solid",
                borderColor:active ? "rgba(231,76,60,0.5)" : "rgba(255,255,255,0.07)",
                borderRadius:7,
                background:active ? "rgba(231,76,60,0.12)" : "rgba(255,255,255,0.02)",
                color:active ? "#e74c3c" : "rgba(255,255,255,0.45)",
                cursor:"pointer", fontSize:10, fontWeight:active ? 700 : 400,
                transition:"all 0.15s",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              }}>
                <span style={{fontSize:13}}>{orientIcon}</span>
                <span>{sz.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:6,lineHeight:1.5}}>
          Horizontal reduce alucinaciones en SD 1.5 — recomendado para arte de carta.
        </div>
      </div>

      {/* API hint (basic mode) */}
      {sdConfig.mode==="basic" && (
        <div style={{fontSize:10,color:"rgba(255,255,255,0.18)",lineHeight:1.6}}>
          Conecta a <span style={{color:"rgba(255,255,255,0.35)"}}>{sdConfig.url}</span><br/>
          SD debe correr con: <code style={{color:"rgba(255,200,100,0.45)"}}>--api --cors-allow-origins=*</code>
        </div>
      )}

      {/* Generate button */}
      <button onClick={onGenerate} disabled={sdGenerating} style={{
        padding:"11px", border:"none", borderRadius:8,
        background:sdGenerating ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#6d28d9,#a855f7)",
        color:"#fff", fontSize:14, fontWeight:600, cursor:sdGenerating ? "wait" : "pointer",
        letterSpacing:0.5,
        boxShadow:sdGenerating ? "none" : "0 2px 10px rgba(109,40,217,0.4)",
        transition:"all 0.2s",
      }}>
        {sdGenerating ? "Generando..." : "✦  Generar imagen"}
      </button>

      {/* Error */}
      {sdError && (
        <div style={{
          padding:"10px 14px", borderRadius:8,
          background: sdError.startsWith("⚠") ? "rgba(234,179,8,0.08)" : "rgba(192,57,43,0.1)",
          border: sdError.startsWith("⚠") ? "1px solid rgba(234,179,8,0.3)" : "1px solid rgba(192,57,43,0.3)",
          fontSize:12,
          color: sdError.startsWith("⚠") ? "#fbbf24" : "#e87060",
          lineHeight:1.6, whiteSpace:"pre-line",
        }}>
          {sdError}
        </div>
      )}

      {/* Generated preview */}
      {sdPreview && !sdError && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)"}}>
            <img src={sdPreview} alt="Generado" style={{width:"100%",display:"block"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onUseAsArt} style={{
              flex:1, padding:"9px", border:"none", borderRadius:8,
              background:"linear-gradient(135deg,#c0392b,#e74c3c)",
              color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
              boxShadow:"0 2px 6px rgba(192,57,43,0.4)",
            }}>
              Usar como arte de la carta
            </button>
            <button onClick={onGenerate} disabled={sdGenerating} title="Regenerar" style={{
              padding:"9px 14px", border:"1px solid rgba(109,40,217,0.35)",
              borderRadius:8, background:"rgba(109,40,217,0.1)",
              color:"#a78bfa", cursor:sdGenerating ? "wait" : "pointer", fontSize:16,
            }}>↻</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Generic field ── */
function Field({label,value,onChange,multiline,rows,placeholder,small}){
  const inputStyle={
    width:"100%", padding:small ? "8px 10px" : "10px 14px",
    background:"var(--input-bg)",
    border:"1px solid var(--input-border)",
    borderRadius:8, color:"var(--text)",
    fontSize:14, fontFamily:"inherit",
    outline:"none", resize:multiline ? "vertical" : "none",
    transition:"border-color 0.2s", boxSizing:"border-box",
  };
  return (
    <div style={{flex:small ? 1 : undefined}}>
      <label style={{
        display:"block", fontSize:11, fontWeight:600,
        color:"var(--text-3)", marginBottom:6,
        letterSpacing:0.5, textTransform:"uppercase",
      }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)}
          rows={rows||3} placeholder={placeholder}
          style={inputStyle}
          onFocus={e=>e.target.style.borderColor="var(--accent-border)"}
          onBlur={e=>e.target.style.borderColor="var(--input-border)"}/>
      ) : (
        <input value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e=>e.target.style.borderColor="var(--accent-border)"}
          onBlur={e=>e.target.style.borderColor="var(--input-border)"}/>
      )}
    </div>
  );
}

/* ── Slider field ── */
function SliderField({label,value,onChange,min,max,suffix}){
  return (
    <div style={{marginBottom:2}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <label style={{
          fontSize:11, fontWeight:600, color:"var(--text-3)",
          letterSpacing:0.4, textTransform:"uppercase",
        }}>{label}</label>
        <span style={{
          fontSize:11, fontWeight:600, color:"var(--accent)",
          background:"var(--accent-bg)", borderRadius:4,
          padding:"1px 6px", letterSpacing:0.3,
        }}>{value}{suffix||""}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e=>onChange(Number(e.target.value))}/>
    </div>
  );
}
