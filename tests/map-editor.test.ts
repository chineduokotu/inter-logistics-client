// @vitest-environment happy-dom
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
import * as API from '../src/api';
vi.mock('../src/components',async importOriginal=>{
 const original=await importOriginal<typeof import('../src/components')>();
 return {...original,ShipmentMap:({onPoint}:{onPoint?:(x:number,y:number,geo:{lng:number;lat:number})=>void})=>React.createElement('button',{onClick:()=>onPoint?.(55,45,{lng:18,lat:9})},'Place location on map')};
});
import {MapEditor} from '../src/management';

it('keeps the everyday editor simple and preserves hidden advanced settings when saving',async()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
 const original={current:{x:50,y:50,lng:0,lat:0,label:'Current hub'},destination:{x:60,y:40,lng:36,lat:18,label:'Delivery hub'},mode:'planned',waypoints:[{x:55,y:45,lng:18,lat:9,label:'Transfer hub'}],travelled:true,caption:'Existing customer caption',visible:false};
 const api=vi.spyOn(API,'api').mockImplementation(async()=>({locations:[]}) as any);
 const container=document.createElement('div');document.body.appendChild(container);const root=createRoot(container);
 try{
  await act(async()=>root.render(React.createElement(MapEditor,{code:'CG-MAP',data:{status:'In Transit',map:original},onSaved:vi.fn().mockResolvedValue(undefined)})));
  const advanced=container.querySelector<HTMLDetailsElement>('.map-advanced')!;
  expect(advanced.open).toBe(false);
  const mainControls=container.querySelector('.map-controls')!;
  expect(Array.from(mainControls.querySelectorAll('option')).map(o=>o.value)).toEqual(['current','destination']);
  expect(container.querySelector('[name="caption"]')).toBeNull();
  expect(Array.from(advanced.querySelectorAll('textarea')).length).toBeGreaterThan(0);
  const place=Array.from(container.querySelectorAll('button')).find(b=>b.textContent==='Place location on map')!;
  await act(async()=>place.click());
  const save=Array.from(container.querySelectorAll('button')).find(b=>b.textContent==='Save map')!;
  expect(save.closest('details')).toBeNull();
  await act(async()=>save.click());
  const request=api.mock.calls.find(([,options])=>options?.method==='PUT')!;
  expect(request[0]).toBe('/admin/shipments/CG-MAP/map');
  const body=JSON.parse(request[1]!.body as string);
  expect(body.state).toEqual({...original,current:{x:55,y:45,lng:18,lat:9,label:'Current hub'}});
  expect(body.notify).toBe(false);
  await act(async()=>{advanced.open=true;advanced.dispatchEvent(new Event('toggle'));});
  expect(mainControls.querySelector('option[value="waypoint"]')).not.toBeNull();
 }finally{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();}
});
