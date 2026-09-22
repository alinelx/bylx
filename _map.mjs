import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:3001/");
const scan = async (file, tests) => {
  return await p.evaluate(async ([file, tests]) => {
    const img = new Image(); img.src = "/assets/hero/"+file; await img.decode();
    const c = document.createElement("canvas"); c.width=img.naturalWidth; c.height=img.naturalHeight;
    const x=c.getContext("2d"); x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data;
    const at=(i,y)=>{const k=(y*c.width+i)*4; return [d[k],d[k+1],d[k+2],d[k+3]];};
    const out={size:`${c.width}x${c.height}`};
    for (const [name, test] of tests) {
      const f = new Function("r","g","b","a","return "+test);
      let mnX=1e9,mnY=1e9,mxX=-1,mxY=-1,n=0;
      for(let y=0;y<c.height;y++)for(let i=0;i<c.width;i++){const [r,g,bl,a]=at(i,y); if(f(r,g,bl,a)){n++; if(i<mnX)mnX=i; if(i>mxX)mxX=i; if(y<mnY)mnY=y; if(y>mxY)mxY=y;}}
      out[name]= n? {px:`${mnX}-${mxX} x ${mnY}-${mxY}`, pct:`left ${(100*mnX/c.width).toFixed(1)}% top ${(100*mnY/c.height).toFixed(1)}% w ${(100*(mxX-mnX+1)/c.width).toFixed(1)}% h ${(100*(mxY-mnY+1)/c.height).toFixed(1)}%`, n} : "nada";
    }
    return out;
  },[file,tests]);
};
// mp3: o disco branco à esquerda e a tira do seletor
console.log("mp3_player.png:", JSON.stringify(await scan("mp3_player.png", [
  ["dial_branco","a>200 && r>225 && g>225 && b>225 && i<120"],
]), null, 1));
await b.close();
