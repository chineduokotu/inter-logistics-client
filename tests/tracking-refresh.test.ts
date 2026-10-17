// @vitest-environment happy-dom
import {act} from 'react';
import {expect,it,vi} from 'vitest';
vi.mock('../src/InteractiveMap',()=>({InteractiveMap:()=>null}));
it('refreshes persisted tracking data in place, keeps history and shows the saved update time',async()=>{
 document.body.innerHTML='<div id="root"></div>';window.history.replaceState({},'', '/track/CG-REFRESH');
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
 let status='Processing',updated='2026-10-17T12:00:00.000Z';
 const fetch=vi.fn().mockImplementation(async()=>({ok:true,json:async()=>({code:'CG-REFRESH',status,type:'Air Freight',description:'Saved shipment',quantity:1,weight:2,origin:'Pickup',destination:'Delivery',createdAt:'2026-10-17T11:00:00.000Z',statusUpdatedAt:updated,map:{current:null,destination:null,mode:'default',waypoints:[],travelled:false,caption:'',visible:true,positions:[],lineLabel:'Indicative only',drawLine:false},events:status==='Processing'?[]:[{id:'event-1',status,location:'Recorded hub',note:'Saved by administrator',createdAt:updated}],photos:[]})}));
 vi.stubGlobal('fetch',fetch);
 try{
  await act(async()=>{await import('../src/main');});
  expect(document.querySelector('.tracking-banner h2')?.textContent).toBe('Processing');
  const count=fetch.mock.calls.length;
  status='Dispatched';updated='2026-10-17T13:45:00.000Z';
  const refresh=Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Refresh Status')!;
  await act(async()=>{refresh.click();});
  expect(window.location.pathname).toBe('/track/CG-REFRESH');
  expect(document.querySelector('.tracking-banner h2')?.textContent).toBe('Dispatched');
  expect(document.querySelector('.status-update-time time')?.getAttribute('dateTime')).toBe(updated);
  expect(document.querySelector('[aria-current="step"]')?.textContent).toContain('Dispatched');
  expect(document.querySelector('.timeline')?.textContent).toContain('Saved by administrator');
  expect(fetch.mock.calls.length).toBe(count+1);
  expect(fetch.mock.calls.every(call=>!call[1]?.method||call[1].method==='GET')).toBe(true);
 }finally{vi.restoreAllMocks();vi.unstubAllGlobals();}
});
