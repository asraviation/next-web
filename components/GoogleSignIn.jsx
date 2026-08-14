"use client";

// Ported from New-ASR-Client/src/pages/GoogleSignIn.jsx.
// The GSI script lived in the Vite index.html; here it loads via next/script,
// and `onAuthSuccess` receives the raw ID token so callers can authorize
// later API calls with it.

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import PropTypes from "prop-types";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "301746401915-5u22scfem88dqr28f208g3ehu52knmr5.apps.googleusercontent.com";

export default function GoogleSignIn({
  onAuthSuccess,
  onAuthError,
  /** Where to exchange the ID token. Admin gate by default; customers use
   *  /api/auth/customer, which has no allowlist. */
  endpoint = "/api/auth/google",
}) {
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);

  const handleGoogleSignIn = useCallback(
    async (response) => {
      // The credential is forwarded to the server and deliberately not stored
      // anywhere on the client. The server replies with an httpOnly session
      // cookie; nothing sensitive comes back into JS.
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json().catch(() => ({}));

        // `authorized` is the admin gate's field, `authenticated` the customer's.
        if (res.ok && (data.authorized || data.authenticated)) {
          onAuthSuccess?.(data);
        } else if (res.status === 403 && data.email) {
          // Valid Google account, but not on the allowlist.
          onAuthSuccess?.({ ...data, authorized: false });
        } else if (res.status === 429) {
          onAuthError?.(data.error || "Too many attempts. Please try again later.");
        } else {
          onAuthError?.(data.error || "Authentication failed");
        }
      } catch (error) {
        console.error("Google sign in error:", error);
        onAuthError?.("Could not reach the authentication server");
      }
    },
    [onAuthSuccess, onAuthError, endpoint]
  );

  useEffect(() => {
    if (!scriptReady || !window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
    });
  }, [scriptReady, handleGoogleSignIn]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={buttonRef} id="googleSignIn" className="w-full" />
    </>
  );
}

GoogleSignIn.propTypes = {
  onAuthSuccess: PropTypes.func,
  onAuthError: PropTypes.func,
  endpoint: PropTypes.string,
};
