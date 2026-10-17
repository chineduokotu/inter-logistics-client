import { Link, useLocation } from "react-router-dom";
import type { z } from "zod";
import type { Booking, contactSchema } from "./contracts";

type ShipmentDetails = Omit<Booking, "photoIds" | "uploadToken"> & { photoCount: number };
type ContactDetails = Omit<z.infer<typeof contactSchema>, "website">;
export type SubmissionReceipt = { reference: string; submittedAt: string } & (
  | { kind: "shipment"; details: ShipmentDetails }
  | { kind: "contact"; details: ContactDetails }
);
export type SubmissionConfirmation = {
  code?: string;
  accessCode?: string;
  reference?: string;
  receipt?: SubmissionReceipt;
};

function Detail({ label, value }: { label: string; value: string | number | undefined }) {
  return <div className="receipt-detail"><dt>{label}</dt><dd>{value === undefined || value === "" ? "Not provided" : value}</dd></div>;
}

export function SubmissionReceiptPage() {
  const location = useLocation();
  const confirmation = location.state?.confirmation as SubmissionConfirmation | undefined;
  const receipt = confirmation?.receipt;
  if (!receipt) return <main className="workspace"><section className="panel"><h1>Receipt unavailable</h1><p>Open your receipt using View Receipt on your submission confirmation screen.</p><Link className="button dark" to="/">Back to home</Link></section></main>;
  const booking = receipt.kind === "shipment";
  return <main className="workspace receipt-page">
    <div className="receipt-toolbar">
      <Link className="button outline" to={booking ? "/book" : "/contact"} state={{ confirmation }}>← Back to confirmation</Link>
      <button type="button" className="button orange-bg" onClick={() => window.print()}>Print Receipt</button>
    </div>
    <article className="receipt-card" aria-labelledby="receipt-title">
      <div className="receipt-heading"><div><div className="receipt-brand">/// CARGOA</div><p>Freight, without friction.</p></div><div><p className="eyebrow orange">SUBMISSION RECEIPT</p><h1 id="receipt-title">{booking ? "Shipment request" : "Contact inquiry"}</h1></div></div>
      <dl className="receipt-meta"><Detail label="Reference ID" value={receipt.reference}/><Detail label="Submitted on" value={new Date(receipt.submittedAt).toLocaleString()}/></dl>
      {receipt.kind === "shipment" ? <>
        <div className="receipt-parties">{(["sender", "recipient"] as const).map(key => <section key={key}><h2>{key === "sender" ? "Sender & pickup" : "Recipient & delivery"}</h2><dl><Detail label="Full name" value={receipt.details[key].name}/><Detail label="Phone number" value={receipt.details[key].phone}/><Detail label="Email address" value={receipt.details[key].email}/><Detail label={key === "sender" ? "Pickup address" : "Delivery address"} value={receipt.details[key].address}/></dl></section>)}</div>
        <section className="receipt-section"><h2>Shipment details</h2><dl className="receipt-details-grid"><Detail label="Freight service" value={receipt.details.type}/><Detail label="Number of parcels" value={receipt.details.quantity}/><Detail label="Total weight" value={`${receipt.details.weight} kg`}/><Detail label="Dimensions (L × W × H, cm)" value={receipt.details.dimensions}/><Detail label="Parcel description" value={receipt.details.description}/><Detail label="Delivery preferences" value={receipt.details.preferences}/><Detail label="Photos attached" value={receipt.details.photoCount}/></dl></section>
        <p className="receipt-footnote">This acknowledges your shipment request. It is not proof of payment or delivery. Your delivery receipt becomes available on the tracking page after delivery.</p>
      </> : <section className="receipt-section"><h2>Inquiry details</h2><dl className="receipt-details-grid"><Detail label="Full name" value={receipt.details.name}/><Detail label="Email address" value={receipt.details.email}/><Detail label="Phone number" value={receipt.details.phone}/><Detail label="Linked tracking code" value={receipt.details.trackingCode}/><Detail label="Subject" value={receipt.details.subject}/><Detail label="Message" value={receipt.details.body}/></dl></section>}
      <div className="receipt-endnote">CARGOA · hello@cargoa.com</div>
    </article>
  </main>;
}
