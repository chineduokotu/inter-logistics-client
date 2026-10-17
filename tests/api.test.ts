import {afterEach,expect,it,vi} from 'vitest';
import {api,apiUrl} from '../src/api';
afterEach(()=>vi.unstubAllGlobals());
it('sends cookies and requests to the separately hosted API',async()=>{
 const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true})});vi.stubGlobal('fetch',fetch);
 await api('/health');expect(fetch).toHaveBeenCalledWith(apiUrl('/health'),expect.objectContaining({credentials:'include'}));expect(apiUrl('/tracking/ABC/receipt')).toMatch(/\/api\/tracking\/ABC\/receipt$/);
});
