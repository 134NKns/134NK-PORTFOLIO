// Run with the local preview on :4321 and a dedicated headless Chrome with CDP on :9227.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
const pending = new Map();
const errors = [];
let id = 0;
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (message.id) {
    const call = pending.get(message.id);
    pending.delete(message.id);
    message.error ? call.reject(message.error) : call.resolve(message.result);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id;
    pending.set(key, { resolve, reject });
    socket.send(JSON.stringify({ id: key, method, params }));
  });
}
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const [width, height] of [[1440, 900], [390, 844], [320, 640]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await send('Page.navigate', { url: 'http://127.0.0.1:4321' });
    for (let i = 0; i < 50 && !await evaluate('Boolean(document.querySelector(".retro[data-ready]"))'); i++) await delay(100);
    assert.equal(await evaluate('Boolean(document.querySelector(".retro[data-ready]"))'), true);
    assert.equal(await evaluate('document.querySelectorAll(".dock-items a").length'), 5);
    assert.equal(await evaluate('(() => {const r=document.querySelector(".dock").getBoundingClientRect(); return r.left===0 && r.right===innerWidth && r.bottom===innerHeight && r.height===40;})()'), true, '40px taskbar spans the viewport and touches the bottom edge');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'No horizontal overflow');
    for (const section of ['home', 'about', 'experience', 'skills', 'contact']) {
      await evaluate(`document.querySelector('.dock-items a[href="#${section}"]').click()`);
      await delay(150);
      assert.equal(await evaluate('document.querySelector(".dock-items a[aria-current]").hash'), `#${section}`, `${width}px dock tracks ${section}`);
      assert.equal(await evaluate(`(() => {const r=document.querySelector('.dock').getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.bottom<=innerHeight;})()`), true, 'Dock stays in viewport');
    }
    assert.equal(await evaluate('document.querySelectorAll("[aria-controls=attachment-dialog]").length'), 11);
    for (let index = 0; index < 11; index++) {
      await evaluate(`(() => { const link=document.querySelectorAll('[aria-controls=attachment-dialog]')[${index}];link.focus();link.click(); })()`);
      assert.equal(await evaluate('document.querySelector("#attachment-dialog").open'), true, 'Attachment opens in dialog');
      assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'), 'Close attachment', 'Close button receives focus');
      for (let i = 0; i < 30 && !await evaluate('document.querySelector(".attachment-preview img").naturalWidth > 0'); i++) await delay(100);
      assert.equal(await evaluate('document.querySelector(".attachment-preview img").naturalWidth > 0'), true, 'Original attachment loads');
      assert.equal(await evaluate('(() => {const r=document.querySelector("#attachment-dialog").getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight;})()'), true, 'Dialog fits viewport');
      if (index === 0) await evaluate('document.querySelector("#attachment-dialog button").click()');
      else {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      }
      await delay(50);
      assert.equal(await evaluate('document.querySelector("#attachment-dialog").open'), false, 'Button/Escape closes dialog');
      assert.equal(await evaluate(`document.activeElement === document.querySelectorAll('[aria-controls=attachment-dialog]')[${index}]`), true, 'Focus returns to attachment');
    }
    await evaluate('document.querySelector(".attachment").click()');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 2, y: 2, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 2, y: 2, button: 'left', clickCount: 1 });
    assert.equal(await evaluate('document.querySelector("#attachment-dialog").open'), false, 'Backdrop click closes dialog');
    await evaluate('scrollTo(0, 0)');
    await delay(100);
    assert.equal(await evaluate('document.querySelector(".dock-items a[aria-current]").hash'), '#home', 'Manual scroll updates active item');
    await evaluate('document.querySelector(".dock-items a").focus()');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.equal(await evaluate('document.activeElement.hash'), '#about', 'Keyboard navigation');
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`/private/tmp/portfolio-dock-${width}.png`, Buffer.from(screenshot.data, 'base64'));
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Page.navigate', { url: 'http://127.0.0.1:4321/#home' });
  for (let i = 0; i < 50 && !await evaluate('Boolean(document.querySelector(".retro[data-ready]"))'); i++) await delay(100);
  await evaluate('scrollTo({top: document.querySelector("#skills").offsetTop - 40, behavior: "instant"})');
  await delay(100);
  assert.equal(await evaluate('document.getAnimations().some(animation => animation.effect.target.closest("#skills"))'), true, 'Visible content animates on arrival');
  assert.equal(await evaluate('Number(document.querySelector(".dock").style.getPropertyValue("--reading-progress")) > 0'), true, 'Taskbar tracks reading progress');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await delay(50);
  assert.equal(await evaluate('document.getAnimations().length'), 0, 'Reduced motion stops active reveals and CSS motion');
  await evaluate('scrollTo({top: document.documentElement.scrollHeight, behavior: "instant"})');
  await delay(100);
  assert.equal(await evaluate('Number(document.querySelector(".dock").style.getPropertyValue("--reading-progress"))'), 1, 'Reading progress reaches the end');
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:4321/#skills' });
  await delay(500);
  assert.equal(await evaluate('(() => {const h=document.querySelector("#restaurant-heading");return h.textContent.includes("QuinR") && getComputedStyle(h).opacity === "1" && h.getBoundingClientRect().height > 0;})()'), true, 'Project content remains visible without JavaScript');
  assert.equal(await evaluate('document.querySelector(".attachment").getAttribute("href").startsWith("/_astro/")'), true, 'Attachments retain native fallback links');
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  assert.deepEqual(errors, [], 'No browser exceptions');
  console.log('PASS: desktop/mobile navigation and dialogs; scroll reveals, reading progress, reduced motion and no-JS content.');
} finally {
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  socket.close();
  await fetch(`http://127.0.0.1:9227/json/close/${target.id}`);
}
