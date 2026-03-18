import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  // Log for development; replace with CRM webhook in production
  console.log("Pilot request received:", data);
  return NextResponse.json({ success: true });
}
