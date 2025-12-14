const catMap = {
  "load":"Window","unload":"Window","resize":"Window","scroll":"Window",
  "click":"Mouse","dblclick":"Mouse","mouse":"Mouse","key":"Keyboard",
  "input":"Form","change":"Form","submit":"Form","reset":"Form","select":"Form",
  "copy":"Clipboard","cut":"Clipboard","paste":"Clipboard",
  "drag":"Drag & Drop","drop":"Drag & Drop","touch":"Touch","pointer":"Pointer",
  "play":"Media","pause":"Media","ended":"Media",
  "animation":"Animation/Transition","transition":"Animation/Transition",
  "focus":"Focus","blur":"Focus","dom":"DOM"
};

const missingW3 = ["pointer","touch","animation","transition","wheel","volume"];

function getCategory(name){
  const n = name.toLowerCase().replace(/^on/,"");
  for(let k in catMap) if(n.includes(k)) return catMap[k];
  return "Other";
}

function supportedElements(name){
  const n = name.toLowerCase();
  if(n.includes("click")||n.includes("mouse")) return "Buttons, links, interactive elements";
  if(n.includes("key")) return "Input, textarea, document";
  if(n.includes("load")||n.includes("scroll")) return "body, img, iframe, window";
  if(n.includes("input")||n.includes("submit")) return "Form elements";
  if(n.includes("copy")||n.includes("paste")) return "Input, textarea, contenteditable";
  if(n.includes("drag")||n.includes("drop")) return "Draggable elements";
  if(n.includes("touch")) return "Touch-enabled elements";
  if(n.includes("pointer")) return "Pointer-sensitive elements";
  if(n.includes("play")||n.includes("pause")) return "Audio, Video elements";
  if(n.includes("animation")||n.includes("transition")) return "Elements with CSS animation or transition";
  if(n.includes("focus")||n.includes("blur")) return "Focusable elements";
  return "Any element";
}

function makeDocs(name){
  const n = name.toLowerCase().replace(/^on/,"");
  if(missingW3.some(x=>n.includes(x))) return {url:`https://developer.mozilla.org/en-US/docs/Web/API/Element/${n}_event`, note:"Not in W3Schools"};
  return {url:`https://www.w3schools.com/jsref/event_${name}.asp`, note:""};
}

function makeEvent(name){
  const n = name.toLowerCase().replace(/^on/,"");
  return {
    name: n,
    category: getCategory(name),
    description: "Triggered when "+n+" happens.",
    tags: supportedElements(n),
    doc: makeDocs(name)
  };
}

function collectEvents(){
  const events = [];
  for(let k in window) if(k.startsWith("on")) events.push(k);
  const el = document.createElement("div");
  for(let k in el) if(k.startsWith("on") && !events.includes(k)) events.push(k);
  return events.sort();
}

function fillCategories(events){
  const sel = document.getElementById("category");
  const cats = [];
  events.forEach(e=>{ const c=getCategory(e); if(!cats.includes(c)) cats.push(c); });
  cats.sort();
  cats.forEach(c=>{ const o=document.createElement("option"); o.value=c; o.textContent=c; sel.appendChild(o); });
}

function renderTable(){
  const searchVal = document.getElementById("search").value.toLowerCase();
  const categoryVal = document.getElementById("category").value;
  const list = document.getElementById("events-list");
  list.innerHTML = "";
  const all = collectEvents().map(makeEvent);
  all.forEach(ev=>{
    if(searchVal && !ev.name.includes(searchVal) && !ev.description.includes(searchVal)) return;
    if(categoryVal && ev.category!==categoryVal) return;
    const li = document.createElement("li");
    li.className = "topic-card";
    li.innerHTML = `
      <h3>${ev.name} <small style="font-weight:400;">(${ev.category})</small></h3>
      <p>${ev.description}</p>
      <p><strong>Supported tags:</strong> ${ev.tags}</p>
      <p><a href="${ev.doc.url}" target="_blank" rel="noopener">Docs</a>${ev.doc.note?" ("+ev.doc.note+")":""}</p>
    `;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  const evList = collectEvents();
  fillCategories(evList);
  renderTable();
  document.getElementById("search").addEventListener("input", renderTable);
  document.getElementById("category").addEventListener("change", renderTable);
  document.getElementById("clear-filter").addEventListener("click",()=>{
    document.getElementById("search").value="";
    document.getElementById("category").value="";
    renderTable();
  });
});
