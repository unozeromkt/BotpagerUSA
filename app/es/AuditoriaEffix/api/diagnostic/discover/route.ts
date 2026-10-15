import {discoverBusiness} from '../../../../AuditoríaEffix/diagnostic/server';
import {readRequest,limited,jsonError,clean} from '../../../../AuditoríaEffix/diagnostic/http';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){try{const body=await readRequest(request);return Response.json(await limited(()=>discoverBusiness(clean(body.query,241),request.signal)),{headers:{'Cache-Control':'no-store'}});}catch(error){return jsonError(error);}}
