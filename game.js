"use strict";
(function () {
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = "cookie-craze-save-v1";
  // Inline vector art, so the Cursor always works even when offline.
  const cursorArt = '<svg class="cursor-art" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5 L9 63 L23 49 L34 73 L46 68 L35 46 L55 46 Z" fill="#fff8e6" stroke="#472819" stroke-width="5" stroke-linejoin="round"/><path d="M15 18 L15 51 L23 43 L29 45" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".9"/></svg>';
  const buildings = [
    {id:"cursor",name:"Cursor",icon:cursorArt,desc:"A helpful automatic cookie tapper",base:15,cps:.1},
    {id:"grandma",name:"Grandma",icon:"👵",desc:"The secret recipe is love",base:100,cps:1},
    {id:"farm",name:"Cookie Farm",icon:"🌾",desc:"Freshly grown cookie dough",base:1100,cps:8},
    {id:"factory",name:"Cookie Factory",icon:"🏭",desc:"Bakes cookies all day and night",base:12000,cps:47},
    {id:"mine",name:"Chocolate Mine",icon:"⛏️",desc:"Dig for chocolatey treasures",base:130000,cps:260},
    {id:"bank",name:"Cookie Bank",icon:"🏦",desc:"Cookies earn cookie interest",base:1400000,cps:1400},
    {id:"temple",name:"Cookie Temple",icon:"🏛️",desc:"Ancient recipes of incredible power",base:20000000,cps:7800},
    {id:"tower",name:"Wizard Tower",icon:"🧙",desc:"Magic makes cookies appear",base:330000000,cps:44000},
    {id:"ship",name:"Space Shipment",icon:"🚀",desc:"Imports cookies from the stars",base:5100000000,cps:260000},
    {id:"alchemy",name:"Alchemy Lab",icon:"⚗️",desc:"Turns ordinary things into cookies",base:75000000000,cps:1600000},
    {id:"portal",name:"Cookie Portal",icon:"🌀",desc:"Pulls cookies from another universe",base:1000000000000,cps:10000000},
    {id:"time",name:"Time Machine",icon:"⏳",desc:"Brings cookies from the future",base:14000000000000,cps:65000000}
  ];
  const upgrades = [
    {id:"finger1",name:"Doughy Fingers",icon:"☝️",desc:"+1 cookie each click",cost:100,need:35,type:"clickAdd",value:1},
    {id:"finger2",name:"Double Tap",icon:"✌️",desc:"Double your clicking power",cost:500,need:180,type:"clickMult",value:2},
    {id:"cursor2",name:"Faster Fingers",icon:"🖱️",desc:"Cursors produce twice as much",cost:1000,need:250,type:"boost",target:"cursor",value:2},
    {id:"granny2",name:"Secret Recipe",icon:"📖",desc:"Grandmas produce twice as much",cost:5000,need:1000,type:"boost",target:"grandma",value:2},
    {id:"finger3",name:"Chocolate Thumb",icon:"🍫",desc:"+10 cookies each click",cost:5000,need:1500,type:"clickAdd",value:10},
    {id:"farm2",name:"Magic Fertilizer",icon:"🌱",desc:"Farms produce twice as much",cost:50000,need:10000,type:"boost",target:"farm",value:2},
    {id:"finger4",name:"Titanium Fingertips",icon:"💪",desc:"Triple your clicking power",cost:50000,need:20000,type:"clickMult",value:3},
    {id:"factory2",name:"Factory Overtime",icon:"⚙️",desc:"Factories produce twice as much",cost:400000,need:100000,type:"boost",target:"factory",value:2},
    {id:"finger5",name:"Sugar Rush",icon:"⚡",desc:"+250 cookies each click",cost:1000000,need:300000,type:"clickAdd",value:250},
    {id:"oven1",name:"Golden Ovens",icon:"🔥",desc:"All buildings produce 50% more",cost:3000000,need:1000000,type:"all",value:1.5},
    {id:"cosmic",name:"Cosmic Sprinkles",icon:"🌌",desc:"All buildings produce twice as much",cost:1000000000,need:100000000,type:"all",value:2}
  ];
  const achievements = [
    {id:"first",name:"First Bite",icon:"🍪",desc:"Click your cookie once",test:s=>s.clicks>=1},
    {id:"sweet",name:"Sweet Tooth",icon:"😋",desc:"Bake 100 cookies total",test:s=>s.total>=100},
    {id:"thousand",name:"Cookie Pile",icon:"🧁",desc:"Bake 1,000 cookies total",test:s=>s.total>=1000},
    {id:"mountain",name:"Cookie Mountain",icon:"⛰️",desc:"Bake 100,000 cookies",test:s=>s.total>=100000},
    {id:"kingdom",name:"Cookie Kingdom",icon:"👑",desc:"Bake 10 million cookies",test:s=>s.total>=10000000},
    {id:"galaxy",name:"Cookie Galaxy",icon:"🪐",desc:"Bake 10 billion cookies",test:s=>s.total>=10000000000},
    {id:"helper",name:"Helping Hand",icon:"🤝",desc:"Buy your first Cursor",test:s=>s.counts[0]>=1},
    {id:"grandma",name:"Grandma's House",icon:"🏡",desc:"Buy a Grandma",test:s=>s.counts[1]>=1},
    {id:"factory",name:"Industrial Baker",icon:"🏭",desc:"Buy a Cookie Factory",test:s=>s.counts[3]>=1},
    {id:"busy",name:"Busy Bakery",icon:"🥐",desc:"Own 50 buildings",test:s=>s.counts.reduce((a,b)=>a+b,0)>=50},
    {id:"tycoon",name:"Cookie Tycoon",icon:"💰",desc:"Own 100 buildings",test:s=>s.counts.reduce((a,b)=>a+b,0)>=100},
    {id:"champ",name:"Click Champion",icon:"🏅",desc:"Click 500 times",test:s=>s.clicks>=500}
  ];
  function fresh() {return {cookies:0,total:0,clicks:0,counts:buildings.map(()=>0),upgrades:[],awards:[],sound:true,lastSave:Date.now()};}
  function safeNumber(n) {return typeof n==="number" && Number.isFinite(n) && n>=0 ? Math.min(n,1e300) : 0;}
  function normalize(data) {
    let s=fresh(); if(!data || typeof data!=="object") return s;
    s.cookies=safeNumber(data.cookies);
    s.total=Math.max(s.cookies,safeNumber(data.total));
    s.clicks=Math.floor(safeNumber(data.clicks));
    if(Array.isArray(data.counts)) s.counts=buildings.map((_,i)=>Math.min(100000,Math.floor(safeNumber(data.counts[i]))));
    if(Array.isArray(data.upgrades)) s.upgrades=[...new Set(data.upgrades.filter(id=>upgrades.some(u=>u.id===id)))];
    if(Array.isArray(data.awards)) s.awards=[...new Set(data.awards.filter(id=>achievements.some(a=>a.id===id)))];
    s.sound=data.sound!==false;
    s.lastSave=safeNumber(data.lastSave)||Date.now();
    return s;
  }
  function load() {try{return normalize(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch(e){return fresh();}}
  let state=load(),buyAmount=1,lastUpdate=Date.now(),toastTimer=0,lastShop="",lastAchievements="",nextGolden=Date.now()+25000+Math.random()*35000,goldenEnds=0;
  function fmt(n) {
    if(!Number.isFinite(n)) return "∞";
    if(n<1000) return (n<10 && n%1!==0?n.toFixed(1):Math.floor(n).toLocaleString("en-US"));
    const units=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    const tier=Math.min(Math.floor(Math.log10(Math.max(n,1))/3),units.length-1);
    if(tier===0)return Math.floor(n).toLocaleString("en-US");
    const scaled=n/Math.pow(1000,tier);
    if(tier===units.length-1 && scaled>=1000) return n.toExponential(2);
    const value=scaled>=100?scaled.toFixed(0):scaled>=10?scaled.toFixed(1):scaled.toFixed(2);
    return (value.includes(".")?value.replace(/0+$/,"").replace(/\.$/,""):value)+units[tier];
  }
  function owned(id){return state.upgrades.includes(id);}
  function clickPower(){
    let p=1,m=1;
    for(const u of upgrades)if(owned(u.id)){if(u.type==="clickAdd")p+=u.value;else if(u.type==="clickMult")m*=u.value;}
    return p*m;
  }
  function cps(){
    let global=1,all=0;
    for(const u of upgrades)if(owned(u.id)&&u.type==="all")global*=u.value;
    buildings.forEach((b,i)=>{
      let boost=1;
      for(const u of upgrades)if(owned(u.id)&&u.type==="boost"&&u.target===b.id)boost*=u.value;
      all+=b.cps*state.counts[i]*boost;
    });
    return all*global;
  }
  function costFor(index,count){
    const b=buildings[index];let cost=0,one=b.base*Math.pow(1.15,state.counts[index]);
    for(let i=0;i<count;i++){cost+=Math.ceil(one);one*=1.15;if(!Number.isFinite(cost))return Infinity;}
    return Math.ceil(cost);
  }
  function addCookies(amount){if(!Number.isFinite(amount)||amount<=0)return;state.cookies+=amount;state.total+=amount;}
  function beep(freq=520,dur=.045){
    if(!state.sound)return;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      const ctx=beep.ctx||(beep.ctx=new Audio()),osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type="sine";osc.frequency.value=freq;gain.gain.setValueAtTime(.034,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);
      osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+dur);
    }catch(e){}
  }
  function toast(message) {const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400);}
  function floatNumber(text,x,y) {
    const area=$("cookieArea"),r=area.getBoundingClientRect(),el=document.createElement("div");
    el.className="float-text";el.textContent=text;el.style.left=(x-r.left)+"px";el.style.top=(y-r.top)+"px";area.appendChild(el);
    setTimeout(()=>el.remove(),1150);
  }
  function bake(e){
    const gain=clickPower();addCookies(gain);state.clicks++;
    const r=$("bigCookie").getBoundingClientRect();
    let x=e&&e.clientX>0?e.clientX:r.left+r.width/2+(Math.random()-.5)*80;
    let y=e&&e.clientY>0?e.clientY:r.top+r.height/2+(Math.random()-.5)*80;
    floatNumber("+"+fmt(gain),x,y);beep(550+Math.random()*80,.035);checkAchievements();renderNumbers();
  }
  function checkAchievements(){
    let newAward=null;
    for(const a of achievements)if(!state.awards.includes(a.id)&&a.test(state)){state.awards.push(a.id);newAward=a;}
    if(newAward){beep(800,.2);toast("🏆 Achievement unlocked: "+newAward.name);renderAchievements();}
  }
  function renderAchievements(){
    const html=achievements.map(a=>{const unlocked=state.awards.includes(a.id);
      return '<div class="achievement '+(unlocked?"":"locked")+'" title="'+a.name+": "+a.desc+'"><span class="a-icon">'+(unlocked?a.icon:"🔒")+'</span><span class="a-name">'+(unlocked?a.name:"Locked")+'</span><span class="a-desc">'+a.desc+'</span></div>';
    }).join("");
    if(html!==lastAchievements){$("achievements").innerHTML=html;lastAchievements=html;}
    $("achievementCount").textContent=state.awards.length+" / "+achievements.length;
    const percent=Math.round(state.awards.length/achievements.length*100);$("milkPercent").textContent=percent+"%";$("milkFill").style.width=percent+"%";
  }
  function renderNumbers(){
    $("cookieCount").textContent=fmt(state.cookies);
    $("perSecond").textContent=fmt(cps());
    $("leftCps").textContent=fmt(cps());
    $("perClick").textContent=fmt(clickPower());
    $("clicksStat").textContent=fmt(state.clicks);
    $("totalStat").textContent=fmt(state.total);
    $("buildingsStat").textContent=fmt(state.counts.reduce((a,b)=>a+b,0));
    $("upgradeCount").textContent=state.upgrades.length+" purchased";
  }
  function renderShop(){
    const visible=upgrades.filter(u=>!owned(u.id)&&state.total>=u.need);
    $("upgrades").innerHTML=visible.length?visible.map(u=>
      '<button class="upgrade-item" data-id="'+u.id+'" '+(state.cookies<u.cost?"disabled":"")+' title="'+u.name+" — "+u.desc+" — "+fmt(u.cost)+' cookies"><span class="emoji">'+u.icon+'</span><span class="price">🍪 '+fmt(u.cost)+'</span></button>'
    ).join(""):'<div class="shop-placeholder">Keep baking to discover new upgrades!</div>';
    const html=buildings.map((b,i)=>{
      const cost=costFor(i,buyAmount),afford=state.cookies>=cost;
      return '<button class="building" data-index="'+i+'" '+(afford?"":"disabled")+' title="'+b.desc+'"><span class="building-emoji '+(i===0?"cursor-shop-icon":"")+'">'+b.icon+'</span><span class="building-body"><span class="building-name">'+b.name+'</span><span class="building-desc">'+b.desc+'</span><span class="building-price">🍪 '+fmt(cost)+' · '+fmt(b.cps)+' / sec each</span></span><span class="owned '+(state.counts[i]===0?"zero":"")+'">'+state.counts[i]+'</span></button>';
    }).join("");
    if(html!==lastShop){$("buildings").innerHTML=html;lastShop=html;}
  }
  function buyBuilding(i){
    const price=costFor(i,buyAmount);if(state.cookies+1e-8<price)return;
    state.cookies=Math.max(0,state.cookies-price);state.counts[i]+=buyAmount;beep(660,.08);
    toast("Purchased "+buyAmount+" "+buildings[i].name+(buyAmount===1?"":"s")+"!");
    checkAchievements();renderAll();save(false);
  }
  function buyUpgrade(id){
    const u=upgrades.find(a=>a.id===id);if(!u||owned(id)||state.cookies+1e-8<u.cost)return;
    state.cookies=Math.max(0,state.cookies-u.cost);state.upgrades.push(id);beep(900,.14);
    toast("⚡ Upgrade unlocked: "+u.name);renderAll();save(false);
  }
  function renderCursors(){
    const layer=$("cursorLayer");
    if(!layer)return;
    const count=Math.min(state.counts[0],16);
    if(layer.children.length===count)return;
    layer.innerHTML=Array.from({length:count},(_,i)=>{
      const radians=(i/count)*Math.PI*2-Math.PI/2;
      const x=50+45*Math.cos(radians);
      const y=50+45*Math.sin(radians);
      const angle=(i/count)*360+45;
      return '<span class="cursor-baker" style="left:'+x+'%;top:'+y+'%;--rotation:'+angle+'deg;--delay:-'+(i*.17)+'s">'+cursorArt+'</span>';
    }).join("");
  }
  function renderAll(){renderNumbers();renderShop();renderAchievements();renderCursors();}
  function save(showMessage){
    try{state.lastSave=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      $("saveStatus").textContent="✓ Saved!";if(showMessage)toast("💾 Game saved!");setTimeout(()=>$("saveStatus").textContent="Progress saves automatically",1800);
    }catch(e){$("saveStatus").textContent="⚠ Could not save";if(showMessage)toast("Browser storage is blocked. Export your save.");}
  }
  function goldenSpawn(){
    $("goldenCookie").classList.remove("hidden");goldenEnds=Date.now()+12000;
    toast("🌟 A golden cookie appeared! Catch it!");
  }
  function goldenCatch(){
    if(!$("goldenCookie").classList.contains("hidden")){
      const bonus=Math.max(50,Math.ceil(cps()*120),Math.ceil(state.cookies*.06));
      addCookies(bonus);$("goldenCookie").classList.add("hidden");goldenEnds=0;
      nextGolden=Date.now()+35000+Math.random()*45000;
      beep(1000,.23);toast("🌟 GOLDEN BONUS! +"+fmt(bonus)+" cookies");checkAchievements();renderAll();save(false);
    }
  }
  function tick(){
    const now=Date.now();const elapsed=Math.max(0,Math.min((now-lastUpdate)/1000,60*60*8));lastUpdate=now;
    if(elapsed>0)addCookies(cps()*elapsed);
    if(now>=nextGolden&&goldenEnds===0)goldenSpawn();
    if(goldenEnds&&now>=goldenEnds){$("goldenCookie").classList.add("hidden");goldenEnds=0;nextGolden=now+30000+Math.random()*50000;}
    checkAchievements();renderNumbers();
  }
  // Let buildings earn cookies while the page has been closed (up to 8 hours).
  const away=Math.min(Math.max(0,Date.now()-state.lastSave)/1000,8*3600);
  if(away>=10&&cps()>0){const earned=cps()*away;addCookies(earned);setTimeout(()=>toast("🎁 Welcome back! Earned "+fmt(earned)+" cookies while away."),600);}
  $("bigCookie").addEventListener("click",bake);
  $("goldenCookie").classList.add("hidden");$("goldenCookie").addEventListener("click",goldenCatch);
  $("buildings").addEventListener("click",e=>{const btn=e.target.closest("button[data-index]");if(btn&&!btn.disabled)buyBuilding(Number(btn.dataset.index));});
  $("upgrades").addEventListener("click",e=>{const btn=e.target.closest("button[data-id]");if(btn&&!btn.disabled)buyUpgrade(btn.dataset.id);});
  document.querySelectorAll(".buy-mode").forEach(btn=>btn.addEventListener("click",()=>{
    buyAmount=Number(btn.dataset.amount);document.querySelectorAll(".buy-mode").forEach(b=>b.classList.toggle("active",b===btn));renderShop();
  }));
  $("soundButton").textContent=state.sound?"🔊":"🔇";
  $("soundButton").addEventListener("click",()=>{state.sound=!state.sound;$("soundButton").textContent=state.sound?"🔊":"🔇";save(false);});
  $("saveButton").addEventListener("click",()=>save(true));
  $("resetButton").addEventListener("click",()=>{
    if(confirm("Are you sure you want to erase ALL cookies, buildings, and achievements? This cannot be undone.")){
      state=fresh();lastShop="";lastAchievements="";lastUpdate=Date.now();nextGolden=Date.now()+45000;
      $("goldenCookie").classList.add("hidden");goldenEnds=0;renderAll();save(true);toast("Fresh bakery! Good luck!");
    }
  });
  $("exportButton").addEventListener("click",()=>{
    save(false);const code=btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    prompt("Copy this code somewhere safe. You can import it later:",code);
  });
  $("importButton").addEventListener("click",()=>{
    const code=prompt("Paste your Cookie Craze save code:");if(!code)return;
    try{const imported=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      if(!imported||typeof imported!=="object"||!Array.isArray(imported.counts))throw Error("Invalid code");
      if(!confirm("Replace your current bakery with this imported save?"))return;
      state=normalize(imported);lastShop="";lastAchievements="";lastUpdate=Date.now();renderAll();save(false);toast("✅ Save imported!");
    }catch(e){toast("❌ That save code wasn't recognized.");}
  });
  window.addEventListener("keydown",e=>{if(e.code==="Space"&&e.target.tagName!=="BUTTON"&&e.target.tagName!=="INPUT"){e.preventDefault();bake();}});
  window.addEventListener("beforeunload",()=>save(false));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")save(false);});
  renderAll();setInterval(tick,150);setInterval(renderShop,450);setInterval(()=>save(false),15000);
})();