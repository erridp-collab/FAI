import { NextResponse } from "next/server";

export function getAdminSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)fai_admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function requireAdmin(request: Request): NextResponse | null {
  const session = getAdminSessionFromRequest(request);
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  return null;
}
