import { failure, json, readRequest } from "../../_lib/http";
import { book, receipt } from "../../_lib/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = await readRequest(request), data = receipt(input.receipt);
    const result = await book(data, input);
    return json({ ok: true, ...result });
  } catch (error) { return failure(error); }
}
