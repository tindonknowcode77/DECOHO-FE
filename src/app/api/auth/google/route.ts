import { NextResponse } from "next/server";
import { googleClientId } from "@/src/configs/auth";

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string;
  exp?: string;
  given_name?: string;
  iss?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { credential?: unknown };
    const credential =
      typeof body.credential === "string" ? body.credential.trim() : "";
    const clientId = googleClientId;

    if (!clientId) {
      return NextResponse.json(
        { error: "Google Client ID chưa được cấu hình trên server." },
        { status: 500 },
      );
    }

    if (!credential || credential.length > 6000) {
      return NextResponse.json(
        { error: "Google ID token không hợp lệ." },
        { status: 400 },
      );
    }

    const tokenResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Google không xác nhận được phiên đăng nhập này." },
        { status: 401 },
      );
    }

    const tokenInfo = (await tokenResponse.json()) as GoogleTokenInfo;
    const validIssuer =
      tokenInfo.iss === "accounts.google.com" ||
      tokenInfo.iss === "https://accounts.google.com";
    const expiresAt = Number(tokenInfo.exp ?? 0) * 1000;

    if (
      tokenInfo.aud !== clientId ||
      tokenInfo.email_verified !== "true" ||
      !tokenInfo.email ||
      !tokenInfo.sub ||
      !validIssuer ||
      expiresAt <= Date.now()
    ) {
      return NextResponse.json(
        { error: "Tài khoản Google chưa được xác minh hợp lệ." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      avatar: tokenInfo.picture,
      email: tokenInfo.email,
      name: tokenInfo.name || tokenInfo.given_name || tokenInfo.email,
    });
  } catch (error) {
    console.error("[Google auth] Token verification failed:", error);

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    const message = isTimeout
      ? "Google phản hồi quá chậm. Vui lòng thử lại."
      : "Máy chủ chưa thể kết nối tới Google. Vui lòng thử lại sau.";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
