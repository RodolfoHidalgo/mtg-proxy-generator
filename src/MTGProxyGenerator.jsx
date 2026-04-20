import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";

const ALL_MANA = ["W","U","B","R","G","C","X","0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];

const DEFAULT_MANA_IMAGES = {
  W: "/symbols/W.png",
  U: "/symbols/U.png",
  B: "/symbols/B.png",
  R: "/symbols/R.png",
  G: "/symbols/G.png",
  C: "/symbols/C.png",
  T: "/symbols/T.png",
};

const MANA_BG = {
  W:"#F9F5E3",U:"#0E68AB",B:"#2B2522",R:"#D3202A",G:"#00733E",
  C:"#CAC5C0",X:"#CAC5C0",
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
  // Priority: customImages → DEFAULT_MANA_IMAGES → SVG
  const resolvedImg = customImages?.[symbol] ?? DEFAULT_MANA_IMAGES[symbol] ?? null;
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
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__)/g;
  const parts=[];
  let last=0, m, idx=0;
  while((m=regex.exec(text))!==null){
    if(m.index>last) parts.push(<span key={`${keyPrefix}-t${idx++}`}>{text.slice(last,m.index)}</span>);
    if(m[0].startsWith("**")) parts.push(<strong key={`${keyPrefix}-b${idx++}`}>{m[2]}</strong>);
    else if(m[0].startsWith("*")) parts.push(<em key={`${keyPrefix}-i${idx++}`}>{m[3]}</em>);
    else parts.push(<span key={`${keyPrefix}-u${idx++}`} style={{textDecoration:"underline"}}>{m[4]}</span>);
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
    const sym=m[1].toUpperCase();
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
const BLEED=24; // ~3mm at card scale (500px / 63mm ≈ 7.94 px/mm)

/* ── Color identity gradient for separator ── */
const IDENTITY_COLORS = {W:"#F9F5E3",U:"#0E68AB",B:"#4B3D36",R:"#D3202A",G:"#00733E"};
function getSeparatorGradient(manaCost){
  if(!manaCost||manaCost.length===0) return "linear-gradient(to right, #888, #666, transparent)";
  const colors = [...new Set(manaCost.filter(s=>["W","U","B","R","G"].includes(s)))];
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
function CardPreview({cardData,artImage,artPosition,customImages,exporting=false,showProxyLabel=true}){
  const{name,typeLine,rulesText,flavorText,power,toughness,manaCost,isCreature,artistName,hasRulesText,rulesJustify}=cardData;

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
      {/* Art — edge to edge, no bleed inset */}
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden"}}>
        {artImage?(
          <div style={{
            position:"absolute",
            top:0,left:0,right:0,bottom:0,
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
            <span style={{color:"rgba(255,255,255,0.15)",fontSize:64,fontWeight:300}}>ART</span>
          </div>
        )}
      </div>

      {/* Gradient overlay — edge to edge like art */}
      <div style={{
        position:"absolute",bottom:0,left:0,right:0,height:"100%",
        background:getOverlayGradient(artPosition.overlayStart ?? 20, artPosition.overlayOpacity ?? 1, artPosition.overlayTransition ?? 50),
        pointerEvents:"none",
      }}/>

      {/* ── Text block — inset by bleed ── */}
      <div style={{
        position:"absolute",bottom: (isCreature ? 56 : 28) + BLEED, left:BLEED, right:BLEED,
        padding:"0 24px", zIndex:5,
        display:"flex", flexDirection:"column",
      }}>
        {/* Mana cost */}
        {manaCost && manaCost.length>0 && (
          <div style={{marginBottom:5}}>
            <ManaCostDisplay manaCost={manaCost} size={26} customImages={customImages}/>
          </div>
        )}

        {/* Name */}
        <div style={{
          fontSize:28, fontWeight:700, color:"#fff",
          textShadow:"0 2px 8px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)",
          letterSpacing:0.5, lineHeight:1.15,
          fontFamily:"'Palatino Linotype','Palatino',serif",
        }}>
          {name || "Card Name"}
        </div>

        {/* Type line */}
        <div style={{
          fontSize:15, color:"#e8a838", fontWeight:400,
          textShadow:"0 1px 4px rgba(0,0,0,0.9)",
          letterSpacing:1.8, marginTop:2,
          fontFamily:"'Palatino Linotype','Palatino',serif",
          fontVariant:"small-caps",
        }}>
          {typeLine || "Type Line"}
        </div>

        {/* Separator bar — color identity */}
        <div style={{
          height:1.5, marginTop:6, marginBottom:10,
          background:getSeparatorGradient(manaCost),
          borderRadius:1,
        }}/>

        {/* Rules text */}
        {hasRulesText !== false && (
        <div style={{maxHeight:200, overflow:"hidden"}}>
          <div style={{
            fontSize:16, color:"#f0ede8", lineHeight:1.55,
            textShadow:"0 1px 3px rgba(0,0,0,0.8)",
            textAlign: rulesJustify ? "justify" : "left",
          }}>
            <RulesTextRender text={rulesText||""} customImages={customImages}/>
          </div>
          {flavorText && (
            <div style={{
              fontSize:14.5, color:"rgba(240,237,232,0.65)", lineHeight:1.4,
              fontStyle:"italic", marginTop:8,
              textShadow:"0 1px 3px rgba(0,0,0,0.8)",
            }}>
              {flavorText}
            </div>
          )}
        </div>
        )}
      </div>

      {/* P/T — inset by bleed */}
      {isCreature && (
        <div style={{
          position:"absolute", bottom:16+BLEED, right:20+BLEED, zIndex:10,
          display:"flex", alignItems:"center", gap:10,
        }}>
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

      {/* Artist — inset by bleed */}
      <div style={{
        position:"absolute", bottom:16+BLEED, left:20+BLEED, zIndex:10,
        fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:0.5,
      }}>
        {artistName ? `Art: ${artistName}` : ""}{showProxyLabel ? " • Custom Proxy" : ""}
      </div>

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
    return matches.map(m=>m.replace(/[{}]/g,"").toUpperCase()).filter(s=>ALL_MANA.includes(s));
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
    {id:"text",label:"Textos"},
    {id:"art",label:"Arte"},
    {id:"stats",label:"Stats"},
    {id:"symbols",label:"Símbolos"},
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"#0d0d0d", color:"#e8e4df",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
      display:"flex", flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{
        padding:"16px 24px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", gap:12,
        background:"rgba(15,15,15,0.95)",
      }}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:"linear-gradient(135deg,#c0392b,#e74c3c)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, fontWeight:700,
        }}>P</div>
        <div>
          <div style={{fontSize:16,fontWeight:600,letterSpacing:0.3}}>MTG Proxy Generator</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>Custom proxy cards</div>
        </div>
      </div>

      <div style={{flex:1, display:"flex", gap:0, flexDirection:"row", overflow:"hidden"}}>
        {/* Editor Panel */}
        <div style={{
          width:380, flexShrink:0,
          borderRight:"1px solid rgba(255,255,255,0.06)",
          display:"flex", flexDirection:"column", overflow:"hidden",
          background:"#111",
        }}>
          {/* Tabs */}
          <div style={{display:"flex", borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                flex:1, padding:"12px 0", border:"none", cursor:"pointer",
                background:activeTab===t.id ? "rgba(192,57,43,0.15)" : "transparent",
                color:activeTab===t.id ? "#e74c3c" : "rgba(255,255,255,0.4)",
                fontSize:12, fontWeight:600, letterSpacing:0.5,
                borderBottom:activeTab===t.id ? "2px solid #e74c3c" : "2px solid transparent",
                transition:"all 0.2s",
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{flex:1, overflow:"auto", padding:20}}>
            {/* ── TAB: Textos ── */}
            {activeTab==="text" && (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {/* Scryfall import */}
                <div style={{position:"relative"}}>
                  <label style={{
                    display:"block",fontSize:11,fontWeight:600,
                    color:"rgba(255,255,255,0.35)",marginBottom:6,
                    letterSpacing:0.5,textTransform:"uppercase",
                  }}>Importar desde Scryfall</label>
                  <div style={{position:"relative"}}>
                    <input value={searchQuery}
                      onChange={e=>handleSearchInput(e.target.value)}
                      placeholder="Buscar carta por nombre..."
                      style={{
                        width:"100%",padding:"10px 14px 10px 36px",
                        background:"rgba(231,76,60,0.06)",
                        border:"1px solid rgba(231,76,60,0.2)",
                        borderRadius:8,color:"#e8e4df",
                        fontSize:14,fontFamily:"inherit",
                        outline:"none",boxSizing:"border-box",
                        transition:"border-color 0.2s",
                      }}
                      onFocus={e=>e.target.style.borderColor="rgba(231,76,60,0.5)"}
                      onBlur={e=>{
                        e.target.style.borderColor="rgba(231,76,60,0.2)";
                        setTimeout(()=>setSearchResults([]),200);
                      }}
                    />
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{
                      position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
                      opacity:0.35,
                    }}>
                      <circle cx="6.5" cy="6.5" r="5.5" fill="none" stroke="#fff" strokeWidth="1.5"/>
                      <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {searchLoading && (
                      <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                        fontSize:11,color:"rgba(231,76,60,0.7)"}}>Buscando...</div>
                    )}
                  </div>
                  {searchResults.length>0 && (
                    <div style={{
                      position:"absolute",top:"100%",left:0,right:0,zIndex:50,
                      marginTop:4,borderRadius:8,overflow:"hidden",
                      background:"#1a1a1a",
                      border:"1px solid rgba(231,76,60,0.2)",
                      boxShadow:"0 8px 24px rgba(0,0,0,0.6)",
                      maxHeight:240,overflowY:"auto",
                    }}>
                      {searchResults.map((name,i)=>(
                        <div key={i}
                          onMouseDown={()=>importCard(name)}
                          style={{
                            padding:"10px 14px",fontSize:13,
                            color:"rgba(255,255,255,0.8)",cursor:"pointer",
                            borderBottom:"1px solid rgba(255,255,255,0.04)",
                            transition:"background 0.15s",
                          }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(231,76,60,0.12)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  )}
                  {searchError && (
                    <div style={{fontSize:11,color:"#e74c3c",marginTop:4}}>{searchError}</div>
                  )}
                </div>

                <div style={{height:1,background:"rgba(255,255,255,0.06)"}}/>

                <Field label="Nombre de la carta" value={cardData.name}
                  onChange={v=>updateField("name",v)}/>
                <Field label="Línea de tipo" value={cardData.typeLine}
                  onChange={v=>updateField("typeLine",v)}/>
                <div>
                  {/* Rules text toggle + justify */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                    <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:0.5,textTransform:"uppercase"}}>
                      <input type="checkbox" checked={cardData.hasRulesText!==false}
                        onChange={e=>updateField("hasRulesText",e.target.checked)}
                        style={{accentColor:"#e74c3c"}}/>
                      Texto de reglas
                    </label>
                    {cardData.hasRulesText!==false && (
                      <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11,color:"rgba(255,255,255,0.3)"}}>
                        <input type="checkbox" checked={!!cardData.rulesJustify}
                          onChange={e=>updateField("rulesJustify",e.target.checked)}
                          style={{accentColor:"#e74c3c"}}/>
                        Justificado
                      </label>
                    )}
                  </div>
                  {cardData.hasRulesText!==false && (<>
                    {/* Formatting toolbar */}
                    <div style={{display:"flex",gap:4,marginBottom:6}}>
                      {[["B","**","**","bold"],["I","*","*","italic"],["U","__","__","underline"]].map(([lbl,before,after,title])=>(
                        <button key={lbl} title={title} onClick={()=>wrapSelection(before,after)} style={{
                          width:28,height:26,border:"1px solid rgba(255,255,255,0.1)",
                          borderRadius:5,background:"rgba(255,255,255,0.04)",
                          color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:12,
                          fontWeight:lbl==="B"?"700":"400",
                          fontStyle:lbl==="I"?"italic":"normal",
                          textDecoration:lbl==="U"?"underline":"none",
                        }}>{lbl}</button>
                      ))}
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginLeft:4,alignSelf:"center"}}>
                        Selecciona texto y pulsa
                      </div>
                    </div>
                    <textarea ref={rulesTextareaRef} value={cardData.rulesText}
                      onChange={e=>updateField("rulesText",e.target.value)}
                      rows={6} placeholder="Texto de reglas..."
                      style={{
                        width:"100%",padding:"10px 14px",
                        background:"rgba(255,255,255,0.04)",
                        border:"1px solid rgba(255,255,255,0.08)",
                        borderRadius:8,color:"#e8e4df",
                        fontSize:14,fontFamily:"inherit",
                        outline:"none",resize:"vertical",boxSizing:"border-box",
                        transition:"border-color 0.2s",
                      }}
                      onFocus={e=>e.target.style.borderColor="rgba(231,76,60,0.4)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6,lineHeight:1.5}}>
                      Usa <b style={{color:"rgba(255,255,255,0.5)"}}>{"{W} {U} {B} {R} {G} {2} {T}"}</b> para símbolos · <b style={{color:"rgba(255,255,255,0.5)"}}>**negrita**</b> · <b style={{color:"rgba(255,255,255,0.5)"}}>*cursiva*</b> · <b style={{color:"rgba(255,255,255,0.5)"}}>__subrayado__</b>
                    </div>
                  </>)}
                </div>
                <Field label="Texto de ambientación (itálica)" value={cardData.flavorText}
                  onChange={v=>updateField("flavorText",v)} multiline rows={2}/>
                <Field label="Artista" value={cardData.artistName}
                  onChange={v=>updateField("artistName",v)} placeholder="Nombre del artista"/>
              </div>
            )}

            {/* ── TAB: Arte ── */}
            {activeTab==="art" && (
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {/* Art subtabs */}
                <div style={{display:"flex",marginBottom:16,borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
                  {[{id:"upload",label:"Cargar imagen"},{id:"generate",label:"Generar con IA"}].map(t=>(
                    <button key={t.id} onClick={()=>setArtSubTab(t.id)} style={{
                      flex:1, padding:"9px 0", border:"none", cursor:"pointer",
                      background:artSubTab===t.id ? "rgba(192,57,43,0.2)" : "rgba(255,255,255,0.02)",
                      color:artSubTab===t.id ? "#e74c3c" : "rgba(255,255,255,0.4)",
                      fontSize:12, fontWeight:600, letterSpacing:0.4,
                      borderRight:t.id==="upload" ? "1px solid rgba(255,255,255,0.08)" : "none",
                      transition:"all 0.2s",
                    }}>{t.label}</button>
                  ))}
                </div>

                {/* Subtab: Cargar imagen */}
                {artSubTab==="upload" && (
                  <div style={{display:"flex",flexDirection:"column",gap:16}}>
                    <div
                      onClick={()=>fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={e=>e.preventDefault()}
                      style={{
                        border:"2px dashed rgba(255,255,255,0.15)",
                        borderRadius:12, padding:32,
                        textAlign:"center", cursor:"pointer",
                        transition:"border-color 0.2s",
                        background:"rgba(255,255,255,0.02)",
                      }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(231,76,60,0.5)"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"}
                    >
                      <div style={{fontSize:32,marginBottom:8}}>🎨</div>
                      <div style={{fontSize:14,color:"rgba(255,255,255,0.5)"}}>
                        Click o arrastra una imagen
                      </div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:4}}>
                        JPG, PNG, WebP
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*"
                        onChange={handleArtUpload} style={{display:"none"}}/>
                    </div>
                    {artImage && (
                      <>
                        <div style={{
                          width:"100%", height:180, borderRadius:10, overflow:"hidden",
                          border:"1px solid rgba(255,255,255,0.08)", position:"relative",
                        }}>
                          <div style={{
                            position:"absolute",
                            width:"100%", height:"100%",
                            backgroundImage:`url(${artImage})`,
                            backgroundSize:`${artPosition.zoom*100}%`,
                            backgroundPosition:`${artPosition.x}% ${artPosition.y}%`,
                            backgroundRepeat:"no-repeat",
                          }}/>
                        </div>
                        <SliderField label="Escala" value={Math.round(artPosition.zoom*100)}
                          onChange={v=>setArtPosition(p=>({...p,zoom:v/100}))} min={50} max={300} suffix="%"/>
                        <SliderField label="Posición horizontal" value={artPosition.x}
                          onChange={v=>setArtPosition(p=>({...p,x:v}))} min={0} max={100}/>
                        <SliderField label="Posición vertical" value={artPosition.y}
                          onChange={v=>setArtPosition(p=>({...p,y:v}))} min={0} max={100}/>
                        <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"4px 0"}}/>
                        <SliderField label="Inicio del oscurecido" value={artPosition.overlayStart ?? 20}
                          onChange={v=>setArtPosition(p=>({...p,overlayStart:v}))} min={0} max={85} suffix="%"/>
                        <SliderField label="Zona de transición" value={artPosition.overlayTransition ?? 50}
                          onChange={v=>setArtPosition(p=>({...p,overlayTransition:v}))} min={2} max={80} suffix="%"/>
                        <SliderField label="Intensidad del oscurecido" value={Math.round(artPosition.overlayOpacity*100)}
                          onChange={v=>setArtPosition(p=>({...p,overlayOpacity:v/100}))} min={0} max={100} suffix="%"/>
                        <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"4px 0"}}/>
                        <SliderField label="Brillo" value={artPosition.brightness}
                          onChange={v=>setArtPosition(p=>({...p,brightness:v}))} min={50} max={200} suffix="%"/>
                        <SliderField label="Contraste" value={artPosition.contrast}
                          onChange={v=>setArtPosition(p=>({...p,contrast:v}))} min={50} max={200} suffix="%"/>
                        <SliderField label="Saturación" value={artPosition.saturate}
                          onChange={v=>setArtPosition(p=>({...p,saturate:v}))} min={0} max={300} suffix="%"/>
                        <button onClick={()=>{setArtImage(null);setArtPosition({x:50,y:50,zoom:1.5,overlayOpacity:1,overlayStart:20,overlayTransition:50,brightness:105,contrast:105,saturate:110,sharpness:0});}}
                          style={{
                            padding:"8px 16px", border:"1px solid rgba(255,255,255,0.1)",
                            borderRadius:8, background:"rgba(255,255,255,0.04)",
                            color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:13,
                          }}>
                          Quitar imagen
                        </button>
                      </>
                    )}
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
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <Field label="Costo de maná (separado por comas)"
                  value={manaInput} onChange={handleManaChange}
                  placeholder="Ej: 2, U, R"/>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:-8}}>
                  Símbolos: W U B R G C X 0-16
                </div>
                {cardData.manaCost.length>0 && (
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <ManaCostDisplay manaCost={cardData.manaCost} size={28} customImages={customImages}/>
                  </div>
                )}
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
                  <label style={{
                    display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                    fontSize:13, color:"rgba(255,255,255,0.6)",
                  }}>
                    <input type="checkbox" checked={cardData.isCreature}
                      onChange={e=>updateField("isCreature",e.target.checked)}
                      style={{accentColor:"#e74c3c"}}/>
                    Es criatura (mostrar P/T)
                  </label>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:4}}>
                  <label style={{
                    display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                    fontSize:13, color:"rgba(255,255,255,0.6)",
                  }}>
                    <input type="checkbox" checked={showProxyLabel}
                      onChange={e=>setShowProxyLabel(e.target.checked)}
                      style={{accentColor:"#e74c3c"}}/>
                    Mostrar "Custom Proxy"
                  </label>
                </div>
                {cardData.isCreature && (
                  <div style={{display:"flex",gap:12}}>
                    <Field label="Fuerza" value={cardData.power}
                      onChange={v=>updateField("power",v)} small/>
                    <Field label="Resistencia" value={cardData.toughness}
                      onChange={v=>updateField("toughness",v)} small/>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Símbolos (custom mana images) ── */}
            {activeTab==="symbols" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:8,lineHeight:1.5}}>
                  Sube imágenes para reemplazar cualquier símbolo de maná. Se usarán tanto en el costo de la carta como en el texto de reglas.
                </div>
                {["W","U","B","R","G","C","X","T"].map(sym=>(
                  <ManaImageRow key={sym} symbol={sym}
                    customImg={customImages[sym]}
                    onUpload={(e)=>handleManaImageUpload(sym,e)}
                    onRemove={()=>removeManaImage(sym)}
                    customImages={customImages}
                  />
                ))}
                <div style={{
                  height:1, background:"rgba(255,255,255,0.06)", margin:"8px 0",
                }}/>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:4}}>
                  Genéricos (números)
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {Array.from({length:17},(_,i)=>String(i)).map(sym=>(
                    <ManaImageMini key={sym} symbol={sym}
                      customImg={customImages[sym]}
                      onUpload={(e)=>handleManaImageUpload(sym,e)}
                      onRemove={()=>removeManaImage(sym)}
                      customImages={customImages}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          background:"radial-gradient(ellipse at center,#1a1a1a 0%,#0d0d0d 100%)",
          padding:24, overflow:"auto", minWidth:0,
          flexDirection:"column", gap:20,
        }}>
          <div ref={cardRef} style={{transform:"scale(0.85)",transformOrigin:"center"}}>
            <CardPreview cardData={cardData} artImage={artImage} artPosition={artPosition} customImages={customImages} showProxyLabel={showProxyLabel}/>
          </div>
          <button onClick={saveCard} disabled={exporting} style={{
            padding:"10px 28px", border:"none", borderRadius:8,
            background: exporting ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c0392b,#e74c3c)",
            color:"#fff", fontSize:14, fontWeight:600, cursor: exporting?"wait":"pointer",
            letterSpacing:0.5,
            boxShadow: exporting ? "none" : "0 2px 8px rgba(192,57,43,0.4)",
            transition:"all 0.2s",
          }}>
            {exporting ? "Exportando..." : "Guardar como PNG"}
          </button>

          {/* Hidden export card (no border-radius, full scale) */}
          <div style={{position:"fixed",left:"-9999px",top:0}}>
            <div ref={exportRef}>
              <CardPreview cardData={cardData} artImage={artImage} artPosition={artPosition} customImages={customImages} exporting={true} showProxyLabel={showProxyLabel}/>
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
  const LABELS={W:"Blanco (W)",U:"Azul (U)",B:"Negro (B)",R:"Rojo (R)",G:"Verde (G)",C:"Incoloro (C)",X:"Variable (X)",T:"Tap (T)"};
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
    background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:8, color:"#e8e4df",
    fontSize:14, fontFamily:"inherit",
    outline:"none", resize:multiline ? "vertical" : "none",
    transition:"border-color 0.2s", boxSizing:"border-box",
  };
  return (
    <div style={{flex:small ? 1 : undefined}}>
      <label style={{
        display:"block", fontSize:11, fontWeight:600,
        color:"rgba(255,255,255,0.35)", marginBottom:6,
        letterSpacing:0.5, textTransform:"uppercase",
      }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)}
          rows={rows||3} placeholder={placeholder}
          style={inputStyle}
          onFocus={e=>e.target.style.borderColor="rgba(231,76,60,0.4)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
      ) : (
        <input value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e=>e.target.style.borderColor="rgba(231,76,60,0.4)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
      )}
    </div>
  );
}

/* ── Slider field ── */
function SliderField({label,value,onChange,min,max,suffix}){
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <label style={{
          fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.35)",
          letterSpacing:0.5, textTransform:"uppercase",
        }}>{label}</label>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>{value}{suffix||"%"}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",accentColor:"#e74c3c",height:4,cursor:"pointer"}}/>
    </div>
  );
}
