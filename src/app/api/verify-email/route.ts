import { NextResponse } from "next/server";

export function GET(request: Request) {
  const source = new URL(request.url);
  const destination = new URL("/verify-email", source.origin);
  const token = source.searchParams.get("token");
  if (token) destination.searchParams.set("token", token);
  return NextResponse.redirect(destination);
}
