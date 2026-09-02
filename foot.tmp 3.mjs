import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:5199/landing',{waitUntil:'networkidle'});
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(900);
await p.locator('.footer').screenshot({path:'/private/tmp/claude-501/-Users-emile-Documents-subscription/9b57fea6-b9d9-42e9-9748-5f62975a424b/scratchpad/footer.png'});
await b.close();
