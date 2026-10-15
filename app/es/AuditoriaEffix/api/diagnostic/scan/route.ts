import {scanBusiness,parseCandidate} from '../../../../AuditoríaEffix/diagnostic/server';
import {readRequest,limited,jsonError} from '../../../../AuditoríaEffix/diagnostic/http';
export const runtime='nodejs';
export const maxDuration=90;
export async function POST(request:Request){try{const body=await readRequest(request);const candidate=parseCandidate(body.candidate);return Response.json(await limited(()=>scanBusiness(candidate,request.signal)),{headers:{'Cache-Control':'no-store'}});}catch(error){return jsonError(error);}}
