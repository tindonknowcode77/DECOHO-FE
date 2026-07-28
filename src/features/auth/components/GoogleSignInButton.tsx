"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { saveSessionUser } from "../services/session";

type GoogleCredentialResponse = {
  clientId?: string;
  credential?: string;
  select_by?: string;
};

type GoogleButtonConfiguration = {
  logo_alignment?: "left" | "center";
  shape?: "rectangular" | "pill" | "circle" | "square";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_blue" | "filled_black";
  type?: "standard" | "icon";
  width?: number;
};

type GoogleAccountId = {
  cancel: () => void;
  initialize: (configuration: {
    callback: (response: GoogleCredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
    client_id: string;
    context?: "signin" | "signup" | "use";
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    configuration: GoogleButtonConfiguration,
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountId;
      };
    };
  }
}

type GoogleProfileResponse = {
  avatar?: string;
  email?: string;
  error?: string;
  name?: string;
};

type GoogleSignInButtonProps = {
  onError: (message: string) => void;
  remember: boolean;
};

export default function GoogleSignInButton({
  onError,
  remember,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        onError("Google không trả về thông tin đăng nhập. Vui lòng thử lại.");
        return;
      }

      setIsVerifying(true);
      onError("");

      try {
        const verificationResponse = await fetch("/api/auth/google", {
          body: JSON.stringify({ credential: response.credential }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const profile =
          (await verificationResponse.json()) as GoogleProfileResponse;

        if (
          !verificationResponse.ok ||
          !profile.email ||
          !profile.name
        ) {
          throw new Error(
            profile.error ||
              "Không thể xác minh tài khoản Google. Vui lòng thử lại.",
          );
        }

        saveSessionUser({
          avatar: profile.avatar,
          email: profile.email,
          name: profile.name,
          registeredAt: new Date().toISOString(),
          remember,
          role: "customer",
        });
        router.replace("/");
        router.refresh();
      } catch (error) {
        setIsVerifying(false);
        onError(
          error instanceof Error
            ? error.message
            : "Đăng nhập Google không thành công.",
        );
      }
    },
    [onError, remember, router],
  );

  useEffect(() => {
    const container = buttonContainerRef.current;
    const googleIdentity = window.google?.accounts.id;

    if (!isScriptReady || !container) {
      return;
    }

    if (!clientId) {
      onError(
        "Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID trong cấu hình môi trường.",
      );
      return;
    }

    container.replaceChildren();
    googleIdentity?.initialize({
      callback: handleCredential,
      cancel_on_tap_outside: true,
      client_id: clientId,
      context: "signin",
      ux_mode: "popup",
    });
    googleIdentity?.renderButton(container, {
      logo_alignment: "left",
      shape: "rectangular",
      size: "large",
      text: "continue_with",
      theme: "outline",
      type: "standard",
      width: Math.min(Math.max(container.clientWidth, 280), 400),
    });

    return () => googleIdentity?.cancel();
  }, [clientId, handleCredential, isScriptReady, onError]);

  return (
    <>
      <Script
        onError={() =>
          onError(
            "Không tải được dịch vụ đăng nhập Google. Hãy kiểm tra kết nối mạng.",
          )
        }
        onReady={() => setIsScriptReady(true)}
        src="https://accounts.google.com/gsi/client?hl=vi"
        strategy="afterInteractive"
      />
      <div className="relative flex min-h-11 w-full justify-center overflow-hidden rounded-md bg-white">
        <div className="w-full" ref={buttonContainerRef} />
        {(!isScriptReady || isVerifying) && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 border border-[#ded6c9] bg-white text-sm font-bold text-[#51564f]">
            <LoaderCircle className="h-4 w-4 animate-spin text-[#2f6f5e]" />
            {isVerifying ? "Đang xác minh Google..." : "Đang tải Google..."}
          </div>
        )}
      </div>
    </>
  );
}
