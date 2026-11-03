// Renders a feed-post screen (775x1657, the iPhone mockup's screen) in light mode.
//   ART=art.webp AV=avatar.webp HANDLE=nomadwheel CAPTION="..." RATIO=4x5|1x1 OUT=screen.png node render-feed-screen.js
const { chromium } = require("playwright");
const fs = require("fs");
const b64 = (f) => "data:image/webp;base64," + fs.readFileSync(f).toString("base64");
(async () => {
  const art = b64(process.env.ART), av = b64(process.env.AV);
  const W = 775, H = 1657, tall = process.env.RATIO === "4x5";
  const imgH = tall ? Math.round((W * 5) / 4) : W;
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const ic = (d, w = 46) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const heart = ic('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>');
  const comment = ic('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z"/>');
  const send = ic('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>');
  const mark = ic('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>');
  const home = ic('<path d="M3 11l9-8 9 8v10H3z"/>', 44), search = ic('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>', 44), plus = ic('<rect x="3" y="3" width="18" height="18" rx="5"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>', 44), play = ic('<rect x="3" y="3" width="18" height="18" rx="5"/><polygon points="10 8 16 12 10 16 10 8"/>', 44), user = ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', 44);
  const html = `<html><body style="margin:0;width:${W}px;height:${H}px;background:#fff;position:relative;overflow:hidden;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#111">
   <div style="position:absolute;left:62px;top:50px;font-weight:600;font-size:34px">9:41</div>
   <div style="position:absolute;right:62px;top:56px;display:flex;gap:12px;align-items:center"><svg width="40" height="24" viewBox="0 0 20 12" fill="#111"><rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="5" y="5" width="3" height="7" rx=".6"/><rect x="10" y="2.5" width="3" height="9.5" rx=".6"/><rect x="15" y="0" width="3" height="12" rx=".6"/></svg><div style="width:62px;height:28px;border:2.5px solid rgba(0,0,0,.45);border-radius:9px;padding:2.5px"><div style="width:100%;height:100%;background:#111;border-radius:4px"></div></div></div>
   <div style="position:absolute;left:0;right:0;top:${tall ? 160 : 180}px">
    <div style="display:flex;align-items:center;gap:16px;padding:0 24px 14px"><img src="${av}" style="width:62px;height:62px;border-radius:50%"><div style="flex:1;line-height:1.15"><b style="font-size:28px;font-weight:600">${process.env.HANDLE}</b><div style="font-size:22px;color:#555">Sponsored</div></div><b style="font-size:38px;letter-spacing:2px">···</b></div>
    <img src="${art}" style="display:block;width:${W}px;height:${imgH}px">
    <div style="display:flex;align-items:center;gap:26px;padding:${tall ? 14 : 20}px 24px 6px">${heart}${comment}${send}<span style="margin-left:auto">${mark}</span></div>
    <div style="padding:2px 24px;font-size:26px;font-weight:600">1,284 likes</div>
    <div style="padding:6px 24px 0;font-size:26px;line-height:1.3"><b style="font-weight:600">${process.env.HANDLE}</b> ${process.env.CAPTION}</div>
    <div style="padding:8px 24px 0;font-size:25px;color:#777">View all 42 comments</div>
   </div>
   <div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:#fff;border-top:1px solid #ddd;display:flex;justify-content:space-around;align-items:flex-start;padding:26px 20px 0;box-sizing:border-box">${home}${search}${plus}${play}${user}</div>
  </body></html>`;
  await page.setContent(html); await page.waitForTimeout(500);
  await page.screenshot({ path: process.env.OUT }); await b.close();
})();
