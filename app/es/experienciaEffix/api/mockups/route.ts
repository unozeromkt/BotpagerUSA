import { generateMockup, MockupError, readMockupRequest } from "../../generation";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(request: Request) {
  try {
    return Response.json(await generateMockup(await readMockupRequest(request), request.signal), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known = error instanceof MockupError;
    return Response.json({ message: known ? error.message : "No pudimos preparar la propuesta. Inténtalo otra vez." }, { status: known ? error.status : 400, headers: { "Cache-Control": "no-store" } });
  }
}
