import { failure, json, readRequest } from "../../_lib/http";
import { coordinate, receipt } from "../../_lib/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { const input = await readRequest(request); return json({ ok: true, ...await coordinate(receipt(input.receipt)) }); }
  catch (error) { return failure(error); }
}
