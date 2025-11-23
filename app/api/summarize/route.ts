import { NextRequest, NextResponse } from "next/server";
import { getSummaries } from "@/lib/storage";

export async function GET(_req: NextRequest) {
  return NextResponse.json(getSummaries());
}
