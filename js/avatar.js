// ── avatar.js ── SVG-basierter Avatar-Editor & Renderer

export const SKIN_COLORS  = ['#FDDBB4','#F5C89A','#E8A87C','#C68642','#8D5524','#4A2912'];
export const HAIR_COLORS  = ['#1a1008','#4a2c0a','#8B4513','#D4A017','#C0C0C0','#FF6B6B','#6B5CE7','#2C3E50'];
export const EYE_COLORS   = ['#3B5998','#4E9A4E','#8B4513','#555555','#2E2E2E','#5BA3C9'];
export const TOP_COLORS   = ['#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6'];
export const BOTTOM_COLORS= ['#2C3E50','#7F8C8D','#1ABC9C','#E67E22','#8E44AD'];
export const SHOE_COLORS  = ['#2C2C2C','#FFFFFF','#E74C3C','#3498DB','#8B4513'];

export const HAIR_STYLES   = ['Kurz','Lang','Lockig','Zopf','Seite','Glatze'];
export const GLASSES_STYLES= ['Keine','Rund','Eckig'];
export const TOP_STYLES    = ['T-Shirt','Pullover','Top','Kleid','Jacke'];
export const BOTTOM_STYLES = ['Hose','Short','Rock k.','Rock l.','Leggings'];
export const SHOE_STYLES   = ['Sneaker','Absätze','Flipflops','Stiefel','Ballerina'];

export const DEFAULT_AVATAR = {
  skin:'#F5C89A', hairStyle:0, hairColor:'#1a1008',
  eyeColor:'#3B5998', glasses:0,
  topStyle:0, topColor:'#3498DB',
  bottomStyle:0, bottomColor:'#2C3E50',
  shoeStyle:0, shoeColor:'#2C2C2C'
};

function darken(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)})`;
}
function lighten(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,r+50)},${Math.min(255,g+50)},${Math.min(255,b+50)})`;
}

function hairSVG(style, color){
  const C = color;
  const parts = [
    `<ellipse cx="70" cy="38" rx="26" ry="22" fill="${C}"/><rect x="44" y="38" width="52" height="12" rx="2" fill="${C}"/>`,
    `<ellipse cx="70" cy="38" rx="26" ry="22" fill="${C}"/><rect x="44" y="38" width="8" height="40" rx="4" fill="${C}"/><rect x="88" y="38" width="8" height="40" rx="4" fill="${C}"/>`,
    `<ellipse cx="70" cy="36" rx="28" ry="24" fill="${C}"/><circle cx="46" cy="42" r="8" fill="${C}"/><circle cx="94" cy="42" r="8" fill="${C}"/><circle cx="50" cy="52" r="7" fill="${C}"/><circle cx="90" cy="52" r="7" fill="${C}"/>`,
    `<ellipse cx="70" cy="38" rx="26" ry="22" fill="${C}"/><rect x="44" y="38" width="52" height="10" rx="2" fill="${C}"/><rect x="66" y="56" width="8" height="35" rx="4" fill="${C}"/>`,
    `<ellipse cx="70" cy="40" rx="26" ry="20" fill="${C}"/><rect x="44" y="36" width="30" height="14" rx="2" fill="${C}"/>`,
    ``
  ];
  return parts[style] || '';
}

function glassesSVG(style){
  if(style===1) return `<rect x="52" y="59" width="14" height="10" rx="5" fill="none" stroke="#333" stroke-width="1.5"/><rect x="74" y="59" width="14" height="10" rx="5" fill="none" stroke="#333" stroke-width="1.5"/><line x1="66" y1="64" x2="74" y2="64" stroke="#333" stroke-width="1.5"/>`;
  if(style===2) return `<rect x="50" y="57" width="16" height="12" rx="2" fill="none" stroke="#333" stroke-width="1.5"/><rect x="74" y="57" width="16" height="12" rx="2" fill="none" stroke="#333" stroke-width="1.5"/><line x1="66" y1="63" x2="74" y2="63" stroke="#333" stroke-width="1.5"/>`;
  return '';
}

function topSVG(style, color){
  const C=color, D=darken(color);
  const tops = [
    `<path d="M42 100 L30 95 L35 115 L42 112Z" fill="${C}"/><path d="M98 100 L110 95 L105 115 L98 112Z" fill="${C}"/><rect x="42" y="98" width="56" height="40" rx="3" fill="${C}"/>`,
    `<path d="M42 100 L28 92 L33 118 L42 114Z" fill="${C}"/><path d="M98 100 L112 92 L107 118 L98 114Z" fill="${C}"/><rect x="42" y="96" width="56" height="44" rx="3" fill="${C}"/><rect x="55" y="96" width="30" height="8" rx="4" fill="${D}"/>`,
    `<rect x="50" y="98" width="40" height="36" rx="2" fill="${C}"/><rect x="52" y="96" width="6" height="14" rx="3" fill="${C}"/><rect x="82" y="96" width="6" height="14" rx="3" fill="${C}"/>`,
    `<path d="M42 100 L30 95 L35 115 L42 112Z" fill="${C}"/><path d="M98 100 L110 95 L105 115 L98 112Z" fill="${C}"/><path d="M42 98 L98 98 L106 152 L34 152Z" fill="${C}"/>`,
    `<path d="M42 100 L28 92 L33 118 L42 114Z" fill="${C}"/><path d="M98 100 L112 92 L107 118 L98 114Z" fill="${C}"/><rect x="42" y="96" width="56" height="44" rx="3" fill="${C}"/><rect x="68" y="96" width="4" height="44" fill="${D}"/><circle cx="70" cy="108" r="2" fill="${D}"/><circle cx="70" cy="118" r="2" fill="${D}"/>`
  ];
  return tops[style] || tops[0];
}

function bottomSVG(style, color, topStyle){
  const yS = topStyle===3 ? 152 : 138;
  const C=color;
  const bottoms = [
    `<rect x="46" y="${yS}" width="22" height="38" rx="3" fill="${C}"/><rect x="72" y="${yS}" width="22" height="38" rx="3" fill="${C}"/><rect x="46" y="${yS}" width="48" height="10" rx="2" fill="${C}"/>`,
    `<rect x="46" y="${yS}" width="22" height="20" rx="3" fill="${C}"/><rect x="72" y="${yS}" width="22" height="20" rx="3" fill="${C}"/><rect x="46" y="${yS}" width="48" height="8" rx="2" fill="${C}"/>`,
    `<path d="M46 ${yS} L94 ${yS} L98 ${yS+28} L42 ${yS+28}Z" fill="${C}"/>`,
    `<path d="M46 ${yS} L94 ${yS} L100 ${yS+38} L40 ${yS+38}Z" fill="${C}"/>`,
    `<rect x="48" y="${yS}" width="18" height="36" rx="8" fill="${C}"/><rect x="74" y="${yS}" width="18" height="36" rx="8" fill="${C}"/><rect x="48" y="${yS}" width="44" height="8" rx="2" fill="${C}"/>`
  ];
  return bottoms[style] || bottoms[0];
}

function shoeSVG(style, color, bottomStyle, topStyle){
  const isLongBottom = topStyle===3 || bottomStyle===3;
  const isShort = bottomStyle===1;
  const yB = isLongBottom ? 178 : (isShort ? 162 : 176);
  const C=color, L=lighten(color), D=darken(color);
  const shoes = [
    `<ellipse cx="56" cy="${yB}" rx="14" ry="7" fill="${C}"/><ellipse cx="84" cy="${yB}" rx="14" ry="7" fill="${C}"/><rect x="46" y="${yB-5}" width="20" height="5" rx="2" fill="${L}"/><rect x="74" y="${yB-5}" width="20" height="5" rx="2" fill="${L}"/>`,
    `<ellipse cx="56" cy="${yB}" rx="12" ry="5" fill="${C}"/><ellipse cx="84" cy="${yB}" rx="12" ry="5" fill="${C}"/><rect x="60" y="${yB-9}" width="4" height="10" rx="1" fill="${C}"/><rect x="88" y="${yB-9}" width="4" height="10" rx="1" fill="${C}"/>`,
    `<ellipse cx="56" cy="${yB}" rx="13" ry="5" fill="${C}"/><ellipse cx="84" cy="${yB}" rx="13" ry="5" fill="${C}"/><line x1="56" y1="${yB-4}" x2="64" y2="${yB-9}" stroke="${D}" stroke-width="2"/><line x1="56" y1="${yB-4}" x2="48" y2="${yB-9}" stroke="${D}" stroke-width="2"/><line x1="84" y1="${yB-4}" x2="92" y2="${yB-9}" stroke="${D}" stroke-width="2"/><line x1="84" y1="${yB-4}" x2="76" y2="${yB-9}" stroke="${D}" stroke-width="2"/>`,
    `<rect x="44" y="${yB-12}" width="22" height="13" rx="3" fill="${C}"/><ellipse cx="55" cy="${yB}" rx="14" ry="5" fill="${C}"/><rect x="74" y="${yB-12}" width="22" height="13" rx="3" fill="${C}"/><ellipse cx="85" cy="${yB}" rx="14" ry="5" fill="${C}"/>`,
    `<ellipse cx="56" cy="${yB}" rx="13" ry="5" fill="${C}"/><ellipse cx="84" cy="${yB}" rx="13" ry="5" fill="${C}"/><line x1="46" y1="${yB-3}" x2="66" y2="${yB-3}" stroke="${L}" stroke-width="1.5"/><line x1="74" y1="${yB-3}" x2="94" y2="${yB-3}" stroke="${L}" stroke-width="1.5"/>`
  ];
  return shoes[style] || shoes[0];
}

export function buildAvatarSVG(av, w=140, h=190){
  const isDress = av.topStyle===3;
  return `<svg viewBox="0 0 140 ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    ${hairSVG(av.hairStyle, av.hairColor)}
    <ellipse cx="70" cy="48" rx="24" ry="27" fill="${av.skin}"/>
    <ellipse cx="60" cy="50" r="4" fill="${av.eyeColor}" opacity=".85"/>
    <ellipse cx="80" cy="50" r="4" fill="${av.eyeColor}" opacity=".85"/>
    <ellipse cx="60" cy="51" r="2" fill="#111" opacity=".7"/>
    <ellipse cx="80" cy="51" r="2" fill="#111" opacity=".7"/>
    <path d="M63 62 Q70 68 77 62" stroke="#c0705a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    ${glassesSVG(av.glasses)}
    <rect x="57" y="74" width="26" height="8" rx="4" fill="${av.skin}"/>
    ${topSVG(av.topStyle, av.topColor)}
    ${isDress ? '' : bottomSVG(av.bottomStyle, av.bottomColor, av.topStyle)}
    ${shoeSVG(av.shoeStyle, av.shoeColor, av.bottomStyle, av.topStyle)}
  </svg>`;
}

export function buildAvatarEditor(container, avatarState, onChange){
  function makeOpts(parent, items, currentKey, isColor, onSelect){
    const d=document.createElement('div');
    d.className='av-opts';
    items.forEach((item,i)=>{
      const btn=document.createElement('button');
      const val = isColor ? item : i;
      const isSelected = isColor ? avatarState[currentKey]===item : avatarState[currentKey]===i;
      if(isColor){
        btn.className='av-swatch'+(isSelected?' av-sel':'');
        btn.style.background=item;
        btn.title=item;
      } else {
        btn.className='av-opt'+(isSelected?' av-sel':'');
        btn.textContent=item;
      }
      btn.onclick=()=>{ avatarState[currentKey]=val; refresh(); onChange(avatarState); };
      d.appendChild(btn);
    });
    parent.appendChild(d);
  }

  function refresh(){
    const svg = container.querySelector('.av-preview-svg');
    if(svg) svg.innerHTML = buildAvatarSVG(avatarState);
    container.querySelectorAll('.av-section').forEach(sec => {
      const key = sec.dataset.key;
      sec.querySelectorAll('.av-swatch, .av-opt').forEach((btn,i) => {
        const isColor = btn.classList.contains('av-swatch');
        const val = isColor ? btn.style.background : i;
        const cur = avatarState[key];
        const match = isColor ? (btn.style.background===cur||btn.style.background===rgbToHex(cur)) : cur===i;
        btn.classList.toggle('av-sel', match);
      });
    });
    const previewEl = container.querySelector('.av-preview-inner');
    if(previewEl) previewEl.innerHTML = buildAvatarSVG(avatarState);
  }

  function rgbToHex(rgb){ return rgb; }

  const style = document.createElement('style');
  style.textContent=`
    .av-shell{display:flex;gap:14px;align-items:flex-start;font-family:inherit}
    .av-left{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px}
    .av-preview-inner{width:130px;height:180px;display:flex;align-items:center;justify-content:center;background:#1a1d27;border-radius:50%;overflow:hidden;border:3px solid #6c63ff;box-shadow:0 0 18px rgba(108,99,255,.35)}
    .av-right{flex:1;min-width:0}
    .av-tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
    .av-tab{padding:4px 9px;border-radius:8px;font-size:12px;border:1.5px solid #2e3350;background:transparent;cursor:pointer;color:#8890b0;font-family:inherit}
    .av-tab.av-active{background:#22263a;color:#f0f0f8;border-color:#6c63ff}
    .av-section{display:none}.av-section.av-active{display:block}
    .av-label{font-size:10px;color:#8890b0;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;font-weight:700}
    .av-opts{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
    .av-opt{padding:4px 8px;border-radius:7px;border:1.5px solid #2e3350;background:#22263a;cursor:pointer;font-size:11px;color:#f0f0f8;font-family:inherit;transition:.15s}
    .av-opt:hover{border-color:#6c63ff}.av-opt.av-sel{border-color:#6c63ff;background:#1a1d27}
    .av-swatch{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:.15s;flex-shrink:0}
    .av-swatch:hover{transform:scale(1.12)}.av-swatch.av-sel{border-color:#fff;outline:2px solid #6c63ff;outline-offset:1px}
  `;
  container.appendChild(style);

  const shell = document.createElement('div');
  shell.className = 'av-shell';

  const left = document.createElement('div');
  left.className = 'av-left';
  const previewInner = document.createElement('div');
  previewInner.className = 'av-preview-inner';
  previewInner.innerHTML = buildAvatarSVG(avatarState);
  left.appendChild(previewInner);
  shell.appendChild(left);

  const right = document.createElement('div');
  right.className = 'av-right';

  const tabs = [
    {id:'skin',  label:'Haut'},
    {id:'hair',  label:'Haare'},
    {id:'eyes',  label:'Augen'},
    {id:'glasses',label:'Brille'},
    {id:'top',   label:'Oberteil'},
    {id:'bottom',label:'Hose/Rock'},
    {id:'shoes', label:'Schuhe'},
  ];

  const tabBar = document.createElement('div');
  tabBar.className = 'av-tabs';
  const sections = {};

  tabs.forEach((t,i)=>{
    const btn = document.createElement('button');
    btn.className = 'av-tab'+(i===0?' av-active':'');
    btn.textContent = t.label;
    btn.onclick=()=>{
      tabBar.querySelectorAll('.av-tab').forEach(b=>b.classList.remove('av-active'));
      btn.classList.add('av-active');
      Object.values(sections).forEach(s=>s.classList.remove('av-active'));
      sections[t.id].classList.add('av-active');
    };
    tabBar.appendChild(btn);

    const sec = document.createElement('div');
    sec.className='av-section'+(i===0?' av-active':'');
    sec.dataset.key = t.id==='skin'?'skin':t.id==='eyes'?'eyeColor':'';
    sections[t.id] = sec;
  });

  right.appendChild(tabBar);
  tabs.forEach(t=>right.appendChild(sections[t.id]));

  // Skin
  const skinSec = sections['skin'];
  const l1=document.createElement('div');l1.className='av-label';l1.textContent='Hautfarbe';
  skinSec.appendChild(l1);
  makeOpts(skinSec, SKIN_COLORS, 'skin', true, ()=>{});

  // Hair
  const hairSec = sections['hair'];
  const lh1=document.createElement('div');lh1.className='av-label';lh1.textContent='Frisur';
  hairSec.appendChild(lh1);
  makeOpts(hairSec, HAIR_STYLES, 'hairStyle', false, ()=>{});
  const lh2=document.createElement('div');lh2.className='av-label';lh2.textContent='Haarfarbe';
  hairSec.appendChild(lh2);
  makeOpts(hairSec, HAIR_COLORS, 'hairColor', true, ()=>{});

  // Eyes
  const eyeSec = sections['eyes'];
  const le1=document.createElement('div');le1.className='av-label';le1.textContent='Augenfarbe';
  eyeSec.appendChild(le1);
  makeOpts(eyeSec, EYE_COLORS, 'eyeColor', true, ()=>{});

  // Glasses
  const glassSec = sections['glasses'];
  const lg1=document.createElement('div');lg1.className='av-label';lg1.textContent='Brillenform';
  glassSec.appendChild(lg1);
  makeOpts(glassSec, GLASSES_STYLES, 'glasses', false, ()=>{});

  // Top
  const topSec = sections['top'];
  const lt1=document.createElement('div');lt1.className='av-label';lt1.textContent='Stil';
  topSec.appendChild(lt1);
  makeOpts(topSec, TOP_STYLES, 'topStyle', false, ()=>{});
  const lt2=document.createElement('div');lt2.className='av-label';lt2.textContent='Farbe';
  topSec.appendChild(lt2);
  makeOpts(topSec, TOP_COLORS, 'topColor', true, ()=>{});

  // Bottom
  const btmSec = sections['bottom'];
  const lb1=document.createElement('div');lb1.className='av-label';lb1.textContent='Stil';
  btmSec.appendChild(lb1);
  makeOpts(btmSec, BOTTOM_STYLES, 'bottomStyle', false, ()=>{});
  const lb2=document.createElement('div');lb2.className='av-label';lb2.textContent='Farbe';
  btmSec.appendChild(lb2);
  makeOpts(btmSec, BOTTOM_COLORS, 'bottomColor', true, ()=>{});

  // Shoes
  const shoeSec = sections['shoes'];
  const ls1=document.createElement('div');ls1.className='av-label';ls1.textContent='Stil';
  shoeSec.appendChild(ls1);
  makeOpts(shoeSec, SHOE_STYLES, 'shoeStyle', false, ()=>{});
  const ls2=document.createElement('div');ls2.className='av-label';ls2.textContent='Farbe';
  shoeSec.appendChild(ls2);
  makeOpts(shoeSec, SHOE_COLORS, 'shoeColor', true, ()=>{});

  shell.appendChild(right);
  container.appendChild(shell);

  return { refresh };
}

export function renderAvatarInElement(el, avatarData, size=50){
  el.innerHTML = buildAvatarSVG(avatarData, size, Math.round(size*1.35));
}
