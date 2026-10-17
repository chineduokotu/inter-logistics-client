import { useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap, Marker, GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapState, Point } from './contracts';
import { api } from './api';
import { hasCoordinates, geographicPoint } from './mapCoordinates';

type RouteCollection={type:'FeatureCollection';features:{type:'Feature';properties:Record<string,never>;geometry:{type:'LineString';coordinates:number[][]}}[]};
type Props={state:MapState & {positions?:Point[]}; status:string; onPoint?:(x:number,y:number,coordinates?:{lng:number;lat:number})=>void};
export function InteractiveMap({state,status,onPoint}:Props){
  const container=useRef<HTMLDivElement>(null);
  const map=useRef<MapboxMap|null>(null);
  const latest=useRef({state,status,onPoint});latest.current={state,status,onPoint};
  const paint=useRef<()=>void>(()=>{});
  const [error,setError]=useState('');
  const [ready,setReady]=useState(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let disposed=false;
    let markers:Marker[]=[];
    let resize:ResizeObserver|undefined;
    let lastBounds='';
    let lastPaint='';
    setReady(false);setError('');
    async function load(){
      try{
        const [{accessToken},module]=await Promise.all([api<{accessToken:string}>('/maps/config'),import('mapbox-gl')]);
        if(disposed||!container.current)return;
        const mb=module.default;
        if(!mb.supported())throw new Error('Interactive maps require WebGL. Try another browser or enable hardware acceleration.');
        const instance=new mb.Map({container:container.current,accessToken,style:'mapbox://styles/mapbox/streets-v12',center:[0,20],zoom:1.3,renderWorldCopies:false});
        map.current=instance;
        instance.addControl(new mb.NavigationControl({showCompass:false}),'top-right');
        resize=new ResizeObserver(()=>instance.resize());resize.observe(container.current);
        instance.on('click',e=>{
          const handler=latest.current.onPoint;if(!handler)return;
          const lng=Math.max(-180,Math.min(180,e.lngLat.lng));
          const lat=Math.max(-85.051129,Math.min(85.051129,e.lngLat.lat));
          const p=geographicPoint(lng,lat,'');handler(p.x,p.y,{lng,lat});
        });
        instance.on('error',()=>{if(!disposed)setError('Mapbox could not load all map data. Check your connection, public token and allowed website URLs.');});
        paint.current=()=>{
          if(disposed||!instance.isStyleLoaded())return;
          instance.getCanvas().style.cursor=latest.current.onPoint?'crosshair':'';
          const {state:s,status:shipmentStatus}=latest.current;
          const signature=JSON.stringify([s,shipmentStatus]);
          if(signature===lastPaint)return;
          lastPaint=signature;
          const current=shipmentStatus==='Delivered'&&s.destination?s.destination:s.current;
          const route=[current,...(s.mode==='planned'?s.waypoints:[]),s.destination];
          const canDraw=s.mode!=='hidden'&&shipmentStatus!=='Delivered'&&route.every(hasCoordinates);
          const routeData:RouteCollection={type:'FeatureCollection',features:canDraw?[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route.filter(hasCoordinates).map(p=>[p.lng,p.lat])}}]:[]};
          const travelled:RouteCollection={type:'FeatureCollection',features:[]};
          const past=s.positions||[];
          if(s.travelled)for(let i=1;i<past.length;i++){const a=past[i-1],b=past[i];if(hasCoordinates(a)&&hasCoordinates(b))travelled.features.push({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[[a.lng,a.lat],[b.lng,b.lat]]}});}
          for(const [id,data,color,dashed] of [['shipment-route',routeData,'#ff591c',true],['shipment-travelled',travelled,'#607782',false]] as const){
            const source=instance.getSource(id) as GeoJSONSource|undefined;
            if(source)source.setData(data);
            else{instance.addSource(id,{type:'geojson',data});instance.addLayer({id,type:'line',source:id,paint:{'line-color':color,'line-width':3,...(dashed?{'line-dasharray':[2,2]}:{})}});}
          }
          markers.forEach(m=>m.remove());markers=[];
          const points:[Point|null|undefined,string][]=[[current,'Current location'],[s.destination,'Destination'],...(s.mode==='planned'?s.waypoints.map((p,i)=>[p,`Waypoint ${i+1}`] as [Point,string]):[])];
          for(const [p,label] of points){
            if(!hasCoordinates(p))continue;
            const el=document.createElement('div');el.className='live-map-marker'+(label==='Destination'?' destination-marker':'');el.setAttribute('role','img');el.setAttribute('aria-label',`${label}: ${p.label}`);el.title=`${label}: ${p.label}`;
            const popup=new mb.Popup({offset:18}).setText(`${label}: ${p.label}`);
            markers.push(new mb.Marker({element:el}).setLngLat([p.lng,p.lat]).setPopup(popup).addTo(instance));
          }
          const geographic=points.flatMap(([p])=>hasCoordinates(p)?[p]:[]);
          const boundsKey=JSON.stringify(geographic.map(p=>[p.lng,p.lat]));
          if(boundsKey!==lastBounds&&geographic.length){lastBounds=boundsKey;const bounds=new mb.LngLatBounds();geographic.forEach(p=>bounds.extend([p.lng,p.lat]));instance.fitBounds(bounds,{padding:60,maxZoom:11,duration:0});}
          instance.getCanvas().style.cursor=latest.current.onPoint?'crosshair':'';
        };
        instance.on('load',()=>{if(disposed)return;paint.current();setReady(true);});
        instance.on('idle',()=>paint.current());
      }catch(e){if(!disposed)setError(e instanceof Error?e.message:'Map unavailable.');}
    }
    void load();
    return ()=>{disposed=true;resize?.disconnect();markers.forEach(m=>m.remove());map.current?.remove();map.current=null;paint.current=()=>{};};
  },[attempt]);
  useEffect(()=>{paint.current();},[state,status,onPoint]);
  const current=status==='Delivered'&&state.destination?state.destination:state.current;
  return <div className="live-map-wrapper">
    <div className="live-map-canvas" ref={container} aria-label={onPoint?'Interactive shipment map. Click to place a marker.':'Interactive shipment map showing saved locations.'}/>
    {!ready&&!error&&<div className="live-map-notice" role="status">Loading map…</div>}
    {ready&&!hasCoordinates(current)&&<div className="live-map-notice">Geographic location not yet recorded{onPoint?'. Click the map to set it.':'.'}</div>}
    {error&&<div className="error" role="alert">{error} <button type="button" onClick={()=>setAttempt(a=>a+1)}>Retry map</button></div>}
  </div>;
}
