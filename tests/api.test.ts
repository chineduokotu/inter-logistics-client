import {afterEach,expect,it,vi} from 'vitest';
import {api,apiUrl} from '../src/api';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.resetModules();});
it('uses the local backend in development and Render in production even with a local env override',async()=>{
 vi.stubEnv('VITE_API_URL','http://127.0.0.1:4000/api');
 vi.stubEnv('DEV',true);vi.resetModules();
 expect((await import('../src/api')).API_URL).toBe('http://127.0.0.1:4000/api');
 vi.stubEnv('DEV',false);vi.resetModules();
 expect((await import('../src/api')).API_URL).toBe('https://inter-logistics-server.onrender.com/api');
});
it('sends cookies and requests to the separately hosted API',async()=>{
 const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true})});vi.stubGlobal('fetch',fetch);
 await api('/health');expect(fetch).toHaveBeenCalledWith(apiUrl('/health'),expect.objectContaining({credentials:'include'}));expect(apiUrl('/tracking/ABC/receipt')).toMatch(/\/api\/tracking\/ABC\/receipt$/);
});
