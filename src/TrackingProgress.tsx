import type {Status} from './contracts';
import {customerStatuses, statusStage as stageFor} from './shipmentStatuses';
const steps=customerStatuses.filter(status=>status!=='Cancelled'&&status!=='On Hold');
export function TrackingProgress({status,events}:{status:Status;events:{status:Status}[]}){
  const stopped=status==='Cancelled'||status==='Returned to Sender';
  const current=stageFor(status);
  const recorded=new Set(['Processing',...events.map(e=>stageFor(e.status))]);
  return <section className="panel shipment-progress" aria-label="Tracking progress">
    <h2>Tracking progress</h2>
    {stopped&&<p className="status-stopped">{status}. The shipment is no longer progressing toward delivery.</p>}
    {status==='On Hold'&&<p className="status-stopped">On Hold. Progress is paused. Check the latest tracking note for details.</p>}
    <ol>{steps.map(step=>{
      const active=!stopped&&current===step;
      const saved=recorded.has(step);
      return <li key={step} className={active?'current':saved?'recorded':''} aria-current={active?'step':undefined}>
        <span className="progress-dot" aria-hidden="true">{active?'●':saved?'✓':'—'}</span>
        <strong>{step}</strong><small>{active?'Current status':saved?'Recorded':'Not recorded'}</small>
      </li>;
    })}</ol>
    <p className="muted small">Milestones reflect saved updates. Unrecorded steps are not assumed complete.</p>
  </section>;
}
