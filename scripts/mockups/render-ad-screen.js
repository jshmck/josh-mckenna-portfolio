// Renders a Facebook-style feed ad (775x1657, the iPhone mockup's screen), light mode,
// for 1:1 artwork: page header, primary text, image, link bar with a call to action.
//   ART=art.webp AV=avatar.webp NAME="Nomad Wheel Co." TEXT="..." HEADLINE="..." DOMAIN=NOMADWHEEL.COM CTA="Shop now" OUT=screen.png node render-ad-screen.js
const { chromium } = require("playwright");
const fs = require("fs");
const b64 = (f) => "data:image/webp;base64," + fs.readFileSync(f).toString("base64");
(async () => {
  const art = b64(process.env.ART), av = b64(process.env.AV);
  const W = 775, H = 1657;
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const ic = (d, w = 40, c = "#555") => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const like = ic('<path d="M7 11v9H3v-9zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9H20a1.5 1.5 0 0 1 1.5 1.8l-1.6 8A2 2 0 0 1 18 20.5H7"/>');
  const comment = ic('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z"/>');
  const share = ic('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>');
  const html = `<html><body style="margin:0;width:${W}px;height:${H}px;background:#f0f2f5;position:relative;overflow:hidden;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1c1e21">
   <div style="position:absolute;left:62px;top:50px;font-weight:600;font-size:34px">9:41</div>
   <div style="position:absolute;right:62px;top:56px;display:flex;gap:12px;align-items:center"><svg width="40" height="24" viewBox="0 0 20 12" fill="#111"><rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="5" y="5" width="3" height="7" rx=".6"/><rect x="10" y="2.5" width="3" height="9.5" rx=".6"/><rect x="15" y="0" width="3" height="12" rx=".6"/></svg><div style="width:62px;height:28px;border:2.5px solid rgba(0,0,0,.45);border-radius:9px;padding:2.5px"><div style="width:100%;height:100%;background:#111;border-radius:4px"></div></div></div>
   <div style="position:absolute;left:0;right:0;top:150px;background:#fff;padding-bottom:6px">
    <div style="display:flex;align-items:center;gap:16px;padding:22px 24px 12px"><img src="${av}" style="width:72px;height:72px;border-radius:50%"><div style="flex:1;line-height:1.2"><b style="font-size:29px;font-weight:600">${process.env.NAME}</b><div style="font-size:23px;color:#65676b">Sponsored · ${ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', 20, "#65676b")}</div></div><b style="font-size:40px;letter-spacing:2px;color:#65676b">···</b></div>
    <div style="padding:6px 24px 18px;font-size:28px;line-height:1.35">${process.env.TEXT}</div>
    <img src="${art}" style="display:block;width:${W}px;height:${W}px">
    <div style="background:#f0f2f5;display:flex;align-items:center;gap:16px;padding:18px 24px"><div style="flex:1;line-height:1.3"><div style="font-size:22px;color:#65676b">${process.env.DOMAIN}</div><div style="font-size:27px;font-weight:600">${process.env.HEADLINE}</div></div><div style="background:#dfe1e5;border-radius:10px;padding:16px 26px;font-size:26px;font-weight:600">${process.env.CTA}</div></div>
    <div style="display:flex;justify-content:space-around;padding:20px 24px 10px;border-top:1px solid #e4e6eb;margin-top:4px;font-size:25px;color:#65676b">
     <span id="like" style="display:flex;gap:10px;align-items:center">${like}Like</span><span style="display:flex;gap:10px;align-items:center">${comment}Comment</span><span style="display:flex;gap:10px;align-items:center">${share}Share</span></div>
   </div>
  </body></html>`;
  await page.setContent(html); await page.waitForTimeout(500);
  await page.screenshot({ path: process.env.OUT });
  if (process.env.BBOX) {
    const bb = await page.evaluate(() => { const r = document.getElementById("like").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    fs.writeFileSync(process.env.BBOX, JSON.stringify(bb));
  }
  await b.close();
})();
