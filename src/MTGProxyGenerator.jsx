import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";

const ALL_MANA = ["W","U","B","R","G","C","X","0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];

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
  const customImg = customImages?.[symbol];
  const isColorIcon = ["W","U","B","R","G"].includes(symbol);
  const isColorless = symbol==="C" || symbol==="1";

  if(customImg){
    return (
      <span style={{
        display:"inline-flex",alignItems:"center",justifyContent:"center",
        width:size,height:size,borderRadius:"50%",
        border:"1.5px solid rgba(0,0,0,0.35)",
        boxShadow:"0 1px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25)",
        flexShrink:0,overflow:"hidden",
      }}>
        <img src={customImg} alt={symbol} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
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
          <span key={i} style={{
            display:"inline-flex",verticalAlign:"middle",margin:"0 1px",
            width:17,height:17,borderRadius:"50%",
            backgroundColor: customImages?.T ? "transparent" : "#CAC5C0",
            alignItems:"center",justifyContent:"center",
            border:"1.5px solid rgba(0,0,0,0.35)",
            boxShadow:"0 1px 2px rgba(0,0,0,0.4)",
            overflow:"hidden",
          }}>
            {customImages?.T ? (
              <img src={customImages.T} alt="T" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            ) : (
              <svg width={11} height={11} viewBox="0 0 12 12">
                <path d="M6,1 L6,6 L10,8" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="6" cy="6" r="5" fill="none" stroke="#111" strokeWidth="1"/>
              </svg>
            )}
          </span>
        );
        return <span key={i}>{p.value}</span>;
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

/* ══════════════════════ CARD PREVIEW ══════════════════════ */
function CardPreview({cardData,artImage,artPosition,customImages,exporting=false,showProxyLabel=true}){
  const{name,typeLine,rulesText,flavorText,power,toughness,manaCost,isCreature,artistName}=cardData;

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
        background:"linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.4) 48%, rgba(0,0,0,0.7) 58%, rgba(0,0,0,0.9) 68%, rgba(0,0,0,0.97) 78%, #000 90%)",
        opacity: artPosition.overlayOpacity ?? 1,
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
        <div style={{maxHeight:200, overflow:"hidden"}}>
          <div style={{
            fontSize:16, color:"#f0ede8", lineHeight:1.55,
            textShadow:"0 1px 3px rgba(0,0,0,0.8)",
          }}>
            <RulesTextRender text={rulesText || "Rules text goes here."} customImages={customImages}/>
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
  });

  const [artImage,setArtImage] = useState(null);
  const [artPosition,setArtPosition] = useState({x:50,y:50,zoom:1.5,overlayOpacity:1,brightness:105,contrast:105,saturate:110,sharpness:0});
  const [manaInput,setManaInput] = useState("1, R");
  const [activeTab,setActiveTab] = useState("text");
  const [customImages,setCustomImages] = useState({});
  const [searchQuery,setSearchQuery] = useState("");
  const [searchResults,setSearchResults] = useState([]);
  const [searchLoading,setSearchLoading] = useState(false);
  const [searchError,setSearchError] = useState("");
  const [exporting,setExporting] = useState(false);
  const [showProxyLabel,setShowProxyLabel] = useState(true);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const exportRef = useRef(null);
  const searchTimeout = useRef(null);

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
                  <Field label="Texto de reglas" value={cardData.rulesText}
                    onChange={v=>updateField("rulesText",v)} multiline rows={6}/>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6,lineHeight:1.5}}>
                    Usa <b style={{color:"rgba(255,255,255,0.5)"}}>{"{W} {U} {B} {R} {G} {2} {T}"}</b> para insertar símbolos inline. Los saltos de línea se respetan.
                  </div>
                </div>
                <Field label="Texto de ambientación (itálica)" value={cardData.flavorText}
                  onChange={v=>updateField("flavorText",v)} multiline rows={2}/>
                <Field label="Artista" value={cardData.artistName}
                  onChange={v=>updateField("artistName",v)} placeholder="Nombre del artista"/>
              </div>
            )}

            {/* ── TAB: Arte ── */}
            {activeTab==="art" && (
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
                    <SliderField label="Oscurecido inferior" value={Math.round(artPosition.overlayOpacity*100)}
                      onChange={v=>setArtPosition(p=>({...p,overlayOpacity:v/100}))} min={0} max={100} suffix="%"/>
                    <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"4px 0"}}/>
                    <SliderField label="Brillo" value={artPosition.brightness}
                      onChange={v=>setArtPosition(p=>({...p,brightness:v}))} min={50} max={200} suffix="%"/>
                    <SliderField label="Contraste" value={artPosition.contrast}
                      onChange={v=>setArtPosition(p=>({...p,contrast:v}))} min={50} max={200} suffix="%"/>
                    <SliderField label="Saturación" value={artPosition.saturate}
                      onChange={v=>setArtPosition(p=>({...p,saturate:v}))} min={0} max={300} suffix="%"/>
                    <button onClick={()=>{setArtImage(null);setArtPosition({x:50,y:50,zoom:1.5,overlayOpacity:1,brightness:105,contrast:105,saturate:110,sharpness:0});}}
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
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"8px 10px", borderRadius:8,
      background:"rgba(255,255,255,0.02)",
      border:"1px solid rgba(255,255,255,0.05)",
    }}>
      <ManaSymbol symbol={symbol} size={30} customImages={customImages}/>
      <div style={{flex:1}}>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{LABELS[symbol]||symbol}</div>
        {customImg && (
          <div style={{fontSize:10,color:"rgba(231,76,60,0.7)"}}>Custom cargado</div>
        )}
      </div>
      <button onClick={()=>ref.current?.click()} style={{
        padding:"5px 12px", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:6, background:"rgba(255,255,255,0.05)",
        color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:11,
      }}>
        {customImg ? "Cambiar" : "Subir"}
      </button>
      {customImg && (
        <button onClick={onRemove} style={{
          padding:"5px 8px", border:"1px solid rgba(192,57,43,0.3)",
          borderRadius:6, background:"rgba(192,57,43,0.1)",
          color:"#e74c3c", cursor:"pointer", fontSize:11,
        }}>✕</button>
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
