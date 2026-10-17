// @vitest-environment happy-dom
import { act } from 'react';
import { expect, it, vi } from 'vitest';

it('uses the saved booking data for a separate printable receipt and returns without resubmitting', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  window.history.replaceState({}, '', '/book');
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const print = vi.fn();
  vi.stubGlobal('print', print);
  const fetch = vi.fn().mockResolvedValue({ok:true,json:async()=>({code:'CG-ACTUAL-BOOKING',accessCode:'one-time-mailbox-code'})});
  vi.stubGlobal('fetch', fetch);
  try {
    await act(async()=>{ await import('../src/main'); });
    const form=document.querySelector<HTMLFormElement>('.booking-form')!;
    const fields={senderName:'Ada Sender',senderPhone:'1234567',senderEmail:'ada@example.com',senderAddress:'Actual pickup address',recipientName:'Ben Recipient',recipientPhone:'7654321',recipientEmail:'ben@example.com',recipientAddress:'Actual delivery address',description:'Actual submitted fragile cargo',quantity:'3',weight:'12.5',dimensions:'10 × 20 × 30',preferences:'Call before delivery'};
    for(const [name,value] of Object.entries(fields)) (form.elements.namedItem(name) as HTMLInputElement).value=value;
    await act(async()=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
    expect(document.querySelector('.confirmation')?.textContent).toContain('Shipment received');
    expect(document.querySelector('.confirmation')?.textContent).not.toContain(fields.senderAddress);
    const view=Array.from(document.querySelectorAll('a')).find(a=>a.textContent==='View Receipt')!;
    await act(async()=>{view.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0}));});
    const card=document.querySelector('.receipt-card')!;
    for(const value of Object.values(fields)) expect(card.textContent).toContain(value);
    expect(card.textContent).toContain('CG-ACTUAL-BOOKING');
    expect(card.textContent).not.toContain('one-time-mailbox-code');
    const printButton=Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Print Receipt')!;
    await act(async()=>{printButton.click();});expect(print).toHaveBeenCalledTimes(1);
    const back=Array.from(document.querySelectorAll('a')).find(a=>a.textContent?.includes('Back to confirmation'))!;
    await act(async()=>{back.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0}));});
    expect(document.querySelector('.confirmation')?.textContent).toContain('CG-ACTUAL-BOOKING');
    expect(document.querySelector('.confirmation')?.textContent).toContain('one-time-mailbox-code');
    expect(fetch).toHaveBeenCalledTimes(1);
  } finally { vi.restoreAllMocks();vi.unstubAllGlobals(); }
});
