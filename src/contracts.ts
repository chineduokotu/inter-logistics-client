import { z } from "zod";
export const statuses = [
  "Processing",
  "Dispatched",
  "Shipment Received",
  "Awaiting Pickup",
  "Picked Up",
  "At Sorting Facility",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Delivery Attempted",
  "Returned to Sender",
  "Cancelled",
] as const;
export const text = (max = 200) => z.string().trim().min(1).max(max);
export const email = z.string().trim().toLowerCase().email().max(254);
export const party = z
  .object({
    name: text(100),
    phone: text(40),
    email: email.optional().or(z.literal("")),
    address: text(500),
  })
  .strict();
export const bookingSchema = z
  .object({
    sender: party.extend({ email }),
    recipient: party,
    description: text(1000),
    quantity: z.coerce.number().int().min(1).max(10000),
    weight: z.coerce.number().positive().max(100000),
    dimensions: z.string().max(100).default(""),
    type: z.enum(["Ocean Freight", "Air Freight", "Ground Transport"]),
    preferences: z.string().max(1000).default(""),
    photoIds: z.array(text(100)).max(5).default([]),
    uploadToken: text(200),
  })
  .strict();
export const pointSchema = z
  .object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    label: text(120),
    lng: z.number().min(-180).max(180).optional(),
    lat: z.number().min(-85.051129).max(85.051129).optional(),
  })
  .strict()
  .refine(p => (p.lng === undefined) === (p.lat === undefined), {message: "Provide both longitude and latitude."});
export const mapSchema = z
  .object({
    current: pointSchema.nullable().default(null),
    destination: pointSchema.nullable().default(null),
    mode: z.enum(["default", "hidden", "planned"]).default("default"),
    waypoints: z.array(pointSchema).max(20).default([]),
    travelled: z.boolean().default(false),
    caption: z.string().max(500).default(""),
    visible: z.boolean().default(true),
  })
  .strict();
export const eventSchema = z
  .object({
    status: z.enum(statuses),
    location: z.string().trim().max(150).default(""),
    note: z.string().trim().max(2000).default(""),
    internalNote: z.string().max(2000).default(""),
    position: pointSchema.optional(),
    estimatedDelivery: z.string().datetime().optional(),
    photoIds: z.array(text(100)).max(10).default([]),
    requestId: z.string().uuid(),
  })
  .strict();
export const contactSchema = z
  .object({
    name: text(100),
    email,
    phone: z.string().max(40).default(""),
    subject: text(200),
    body: text(10000),
    trackingCode: z.string().max(80).default(""),
    website: z.string().max(200).default(""),
  })
  .strict();
export const composeSchema = z
  .object({
    subject: text(200),
    body: text(10000),
    trackingCode: z.string().max(80).default(""),
  })
  .strict();
export type Booking = z.infer<typeof bookingSchema>;
export type MapState = z.infer<typeof mapSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Status = (typeof statuses)[number];
const isoDate = z.union([
  z.string().datetime(),
  z.date().transform((d) => d.toISOString()),
]);
export const trackingResponseSchema = z.object({
  code: text(100),
  status: z.enum(statuses),
  type: text(100),
  description: text(1000),
  quantity: z.number(),
  weight: z.number(),
  origin: text(500),
  destination: text(500),
  createdAt: isoDate,
  statusUpdatedAt: isoDate,
  deliveredAt: isoDate.nullish(),
  estimatedDelivery: isoDate.nullish(),
  map: mapSchema.extend({
    updatedAt: isoDate.nullish(),
    positions: z.array(pointSchema),
    lineLabel: z.string(),
    drawLine: z.boolean(),
  }),
  events: z.array(
    z.object({
      id: z.string(),
      status: z.enum(statuses),
      location: z.string(),
      note: z.string().default(""),
      createdAt: isoDate,
    }),
  ),
  photos: z.array(
    z.object({
      id: z.string(),
      event: z.string().optional(),
      caption: z.string(),
      visible: z.boolean(),
      url: z.string().url().optional(),
      thumbnail: z.string().url().optional(),
    }),
  ),
});
export type TrackingResponse = z.infer<typeof trackingResponseSchema>;
export function publicMap(
  state: MapState,
  status: string,
  positions: Point[] = [],
) {
  const s = structuredClone(state);
  if (status === "Delivered" && s.destination) s.current = s.destination;
  return {
    ...s,
    positions: s.travelled ? positions : positions.map((p) => ({ ...p })),
    lineLabel:
      s.mode === "planned"
        ? "Planned route set by CARGOA. Indicative only."
        : "Straight line to destination. Indicative only, not the actual route.",
    drawLine:
      !!s.current &&
      !!s.destination &&
      s.mode !== "hidden" &&
      status !== "Delivered",
  };
}
