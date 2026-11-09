// Renders a Mail-style window (3410x2146, the MacBook mockup screen) showing an email.
//   EMAIL=email.png AV=avatar.webp FROM="Nomad Wheels" SUBJECT="..." OUT=screen.png node render-mail-screen.js
const { chromium } = require("playwright");
const fs = require("fs");
const b64 = (f, t) => `data:${t};base64,` + fs.readFileSync(f).toString("base64");
(async () => {
  const mail = b64(process.env.EMAIL, "image/png"), av = b64(process.env.AV, "image/webp");
  const W = 1705, H = 1073;
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
  const dot = (c) => `<i style="width:13px;height:13px;border-radius:50%;background:${c};display:inline-block"></i>`;
  const html = `<html><body style="margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:-apple-system,Helvetica,Arial,sans-serif;background:linear-gradient(160deg,#d9c9b0,#b7a58b 45%,#7d8b73);color:#1d1d1f">
   <div style="position:absolute;left:0;right:0;top:0;height:34px;background:rgba(255,255,255,.35);display:flex;align-items:center;gap:22px;padding:0 24px;font-size:14px"><b></b><b>Mail</b><span>File</span><span>Edit</span><span>View</span><span>Mailbox</span><span>Message</span><span>Window</span><span style="margin-left:auto;margin-right:380px">Mon 9:41</span></div>
   <div style="position:absolute;left:215px;top:70px;width:1275px;height:960px;background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden">
    <div style="height:56px;background:#f3f3f3;border-bottom:1px solid #ddd;display:flex;align-items:center;gap:8px;padding:0 20px">${dot("#ff5f57")}${dot("#febc2e")}${dot("#28c840")}<span style="margin-left:24px;font-size:15px;font-weight:600">${process.env.SUBJECT}</span></div>
    <div style="display:flex;align-items:center;gap:14px;padding:18px 28px;border-bottom:1px solid #e5e5e5"><img src="${av}" style="width:46px;height:46px;border-radius:50%"><div style="flex:1"><div style="font-size:16px;font-weight:600">${process.env.FROM}</div><div style="font-size:14px;color:#6e6e73;margin-top:3px">${process.env.SUBJECT}</div></div><div style="font-size:14px;color:#6e6e73">Today, 9:41</div></div>
    <div style="background:#efefef;height:100%;display:flex;justify-content:center;padding-top:26px"><img src="${mail}" style="width:640px;height:auto;display:block"></div>
   </div></body></html>`;
  await page.setContent(html); await page.waitForTimeout(500);
  await page.screenshot({ path: process.env.OUT }); await b.close();
})();
