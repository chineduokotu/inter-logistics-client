import type { Point } from './contracts';
export function hasCoordinates(point: Point | null | undefined): point is Point & {lng:number;lat:number} {
  return !!point && typeof point.lng === 'number' && typeof point.lat === 'number'
    && Number.isFinite(point.lng) && Number.isFinite(point.lat)
    && point.lng >= -180 && point.lng <= 180
    && point.lat >= -85.051129 && point.lat <= 85.051129;
}
export function geographicPoint(lng:number,lat:number,label:string):Point {
  return {lng,lat,x:(lng+180)/360*100,y:(90-lat)/180*100,label};
}
