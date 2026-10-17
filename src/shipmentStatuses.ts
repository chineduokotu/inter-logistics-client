export const customerStatuses = [
  "Processing",
  "Dispatched",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

const legacyStages: Record<string, string> = {
  "Shipment Received": "Processing",
  "Awaiting Pickup": "Processing",
  "Picked Up": "Dispatched",
  "At Sorting Facility": "Dispatched",
  "Delivery Attempted": "Out for Delivery",
};

export const statusStage = (status: string) => legacyStages[status] || status;
export function selectableStatus(status: string) {
  const stage = statusStage(status);
  return customerStatuses.some(option => option === stage) ? stage : "";
}
