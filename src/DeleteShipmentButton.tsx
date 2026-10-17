import {useState} from 'react';
import {api,send} from './api';
import {ErrorBox} from './components';

export function DeleteShipmentButton({code,onDeleted}:{code:string;onDeleted:()=>void|Promise<void>}){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 return <div className="shipment-delete-action">
  <button type="button" className="delete-request-button" disabled={busy} onClick={async()=>{
   if(!window.confirm(`Delete request ${code}? Customers will no longer be able to track this shipment.`))return;
   setBusy(true);setError('');
   try{await api('/admin/shipments/'+encodeURIComponent(code),send('DELETE',{}));await onDeleted();}
   catch(e){setError(e instanceof Error?e.message:'Could not delete this request. Please try again.');}
   finally{setBusy(false);}
  }}>{busy?'Deleting...':'Delete request'}</button>
  <ErrorBox error={error}/>
 </div>;
}
