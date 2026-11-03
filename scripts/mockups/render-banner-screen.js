// Renders a video-site-style banner ad (775x1657, the iPhone mockup's screen), light mode,
// for 16:9 artwork: the art sits in the player at the top, the ad details underneath.
//   ART=art.webp AV=avatar.webp NAME="Möbelwagen" TITLE="..." DOMAIN=mobelwagen.com CTA="Visit site" OUT=screen.png node render-banner-screen.js
const { chromium } = require("playwright");
const fs = require("fs");
const b64 = (f) => "data:image/webp;base64," + fs.readFileSync(f).toString("base64");
(async () => {
  const art = b64(process.env.ART), av = b64(process.env.AV);
  const W = 775, H = 1657, artH = Math.round((W * 9) / 16);
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const ic = (d, w = 40) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const like = ic('<path d="M7 11v9H3v-9zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9H20a1.5 1.5 0 0 1 1.5 1.8l-1.6 8A2 2 0 0 1 18 20.5H7"/>');
  const share = ic('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>');
  const dl = ic('<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16"/>');
  const ghost = (w) => `<div style="display:flex;gap:18px;padding:0 24px 28px"><div style="width:250px;height:140px;border-radius:14px;background:#ececec;flex:none"></div><div style="flex:1;padding-top:6px"><div style="height:20px;width:${w}%;background:#e4e4e4;border-radius:6px"></div><div style="height:16px;width:60%;background:#efefef;border-radius:6px;margin-top:14px"></div></div></div>`;
  const html = `<html><body style="margin:0;width:${W}px;height:${H}px;background:#fff;position:relative;overflow:hidden;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0f0f0f">
   <div style="position:absolute;left:62px;top:50px;font-weight:600;font-size:34px">9:41</div>
   <div style="position:absolute;right:62px;top:56px;display:flex;gap:12px;align-items:center"><svg width="40" height="24" viewBox="0 0 20 12" fill="#111"><rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="5" y="5" width="3" height="7" rx=".6"/><rect x="10" y="2.5" width="3" height="9.5" rx=".6"/><rect x="15" y="0" width="3" height="12" rx=".6"/></svg><div style="width:62px;height:28px;border:2.5px solid rgba(0,0,0,.45);border-radius:9px;padding:2.5px"><div style="width:100%;height:100%;background:#111;border-radius:4px"></div></div></div>
   <div style="position:absolute;left:0;top:130px;width:${W}px">
    <div style="position:relative;width:${W}px;height:${artH}px;background:#000"><img src="${art}" style="width:${W}px;height:${artH}px;display:block">
     <div style="position:absolute;left:18px;bottom:16px;background:rgba(0,0,0,.7);color:#fff;font-size:22px;padding:7px 12px;border-radius:6px">Ad · 0:05</div>
     <div style="position:absolute;right:0;bottom:16px;background:rgba(0,0,0,.7);color:#fff;font-size:24px;padding:12px 22px;border-radius:6px 0 0 6px">Skip ›</div>
     <div style="position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(255,255,255,.3)"><div style="width:34%;height:100%;background:#f03"></div></div></div>
    <div style="padding:22px 24px 6px;font-size:31px;font-weight:600;line-height:1.25">${process.env.TITLE}</div>
    <div style="padding:0 24px 18px;font-size:23px;color:#606060">Ad · ${process.env.DOMAIN}</div>
    <div style="display:flex;align-items:center;gap:16px;padding:6px 24px 22px"><img src="${av}" style="width:64px;height:64px;border-radius:50%"><div style="flex:1;font-size:27px;font-weight:600">${process.env.NAME}</div><div style="background:#0f0f0f;color:#fff;border-radius:40px;padding:15px 30px;font-size:25px;font-weight:600">${process.env.CTA}</div></div>
    <div style="display:flex;gap:14px;padding:0 24px 28px;font-size:24px"><span style="display:flex;gap:10px;align-items:center;background:#f2f2f2;border-radius:40px;padding:13px 26px">${like}12</span><span style="display:flex;gap:10px;align-items:center;background:#f2f2f2;border-radius:40px;padding:13px 26px">${share}Share</span><span style="display:flex;gap:10px;align-items:center;background:#f2f2f2;border-radius:40px;padding:13px 26px">${dl}Save</span></div>
    ${ghost(80)}${ghost(65)}${ghost(75)}
   </div></body></html>`;
  await page.setContent(html); await page.waitForTimeout(500);
  await page.screenshot({ path: process.env.OUT }); await b.close();
})();
