import {expect,it} from 'vitest';
import {geographicPoint,hasCoordinates} from '../src/mapCoordinates';
import {pointSchema} from '../src/contracts';
it('keeps geographic coordinates without guessing old schematic positions',()=>{
 expect(hasCoordinates({x:50,y:50,label:'Old map point'})).toBe(false);
 expect(hasCoordinates(geographicPoint(3,100,'Invalid latitude'))).toBe(false);
 const p=geographicPoint(3.3792,6.5244,'Recorded Lagos hub');
 expect(hasCoordinates(p)).toBe(true);expect(pointSchema.parse(p).lng).toBe(3.3792);
 expect(pointSchema.safeParse({...p,lng:181}).success).toBe(false);
 expect(pointSchema.safeParse({...p,lat:90}).success).toBe(false);
 expect(pointSchema.safeParse({x:50,y:50,label:'Incomplete',lng:3}).success).toBe(false);
});
