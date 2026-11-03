const { chromium } = require("playwright"); const fs = require("fs");
(async () => {
  const S = process.env.S; const b64 = f => "data:image/webp;base64," + fs.readFileSync(f).toString("base64"); const art = b64(process.env.ART), av = b64(process.env.AV);
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 775, height: 1657 }, deviceScaleFactor: 1 })).newPage();
  const icon = (d, w = 44) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const heart = icon('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>');
  const send = icon('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>');
  const x = icon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 40);
  const artH = Math.round(775 * 16 / 9), top = Math.round((1657 - artH) / 2);
  const html = `<html><body style="margin:0;width:775px;height:1657px;background:#000;position:relative;overflow:hidden;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#fff">
   <img src="${art}" style="position:absolute;left:0;top:${top}px;width:775px;height:${artH}px">
   <div style="position:absolute;left:0;right:0;top:${top}px;height:230px;background:linear-gradient(rgba(0,0,0,.5),transparent)"></div>
   <div style="position:absolute;left:0;right:0;bottom:${top}px;height:210px;background:linear-gradient(transparent,rgba(0,0,0,.55))"></div>
   <div style="position:absolute;left:62px;top:50px;font-weight:600;font-size:34px">9:41</div>
   <div style="position:absolute;right:62px;top:56px;display:flex;gap:12px;align-items:center"><svg width="40" height="24" viewBox="0 0 20 12" fill="white"><rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="5" y="5" width="3" height="7" rx=".6"/><rect x="10" y="2.5" width="3" height="9.5" rx=".6"/><rect x="15" y="0" width="3" height="12" rx=".6"/></svg><svg width="38" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"><path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/></svg><div style="width:62px;height:28px;border:2.5px solid rgba(255,255,255,.6);border-radius:9px;padding:2.5px"><div style="width:100%;height:100%;background:#fff;border-radius:4px"></div></div></div>
   <div style="position:absolute;left:34px;right:34px;top:${top + 44}px;display:flex;gap:8px"><i style="flex:1;height:5px;border-radius:3px;background:#fff"></i><i style="flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.4)"></i><i style="flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.4)"></i></div>
   <div style="position:absolute;left:34px;right:34px;top:${top + 78}px;display:flex;align-items:center;gap:18px"><img src="${av}" style="width:64px;height:64px;border-radius:50%"><b style="font-size:30px;font-weight:600">nomadwheels</b><span style="font-size:27px;opacity:.85">Sponsored</span><span style="margin-left:auto">${x}</span></div>
   <div style="position:absolute;left:34px;right:34px;bottom:${top + 40}px;display:flex;align-items:center;gap:26px"><div style="flex:1;border:2.5px solid rgba(255,255,255,.85);border-radius:60px;padding:22px 32px;font-size:30px">Send message</div>${heart}${send}</div>
  </body></html>`;
  await page.setContent(html); await page.waitForTimeout(600); await page.screenshot({ path: `${S}/mock/screen-story.png` }); await b.close(); })();
