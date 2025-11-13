// react/src/shared/auth.js
// Cross-app auth store: uses localStorage and falls back to cookies (for cross-origin ports on localhost)

const KEYS = {
  user: "asr_user",
  tokens: "asr_tokens",
};

// Use a BroadcastChannel for instant cross-tab/app sync (Next listens on the same name)
const CHANNEL_NAME = "asr-auth";
let bc = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  bc = new BroadcastChannel(CHANNEL_NAME);
}

// ---- Cookie helpers (NO Domain on localhost; no Secure on HTTP) ----
const cookieSet = (name, value, days = 7) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    // NOTE: Do NOT set Domain on localhost; keep Path and SameSite so both ports (3000/3001) can read the cookie.
    document.cookie = `${name}=${encodeURIComponent(
      value
    )};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  } catch {}
};

const cookieDel = (name) => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  } catch {}
};

const cookieGet = (name) => {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((c) => c.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) {
      return decodeURIComponent(p.slice(name.length + 1));
    }
  }
  return null;
};

// If localStorage is empty (new origin/first visit), hydrate it from cookies so Next <-> React share session
function hydrateFromCookiesIfNeeded() {
  try {
    const lsUser = localStorage.getItem(KEYS.user);
    const lsTokens = localStorage.getItem(KEYS.tokens);
    if (!lsTokens) {
      const cTokens = cookieGet("asr_tokens");
      if (cTokens) localStorage.setItem(KEYS.tokens, cTokens);
    }
    if (!lsUser) {
      const cUser = cookieGet("asr_user");
      if (cUser) localStorage.setItem(KEYS.user, cUser);
    }
  } catch {}
}

export const AuthStore = {
  getUser() {
    try {
      hydrateFromCookiesIfNeeded();
      const raw = localStorage.getItem(KEYS.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      // fallback cookie-only parse
      try {
        const c = cookieGet("asr_user");
        return c ? JSON.parse(c) : null;
      } catch {
        return null;
      }
    }
  },

  getTokens() {
    try {
      hydrateFromCookiesIfNeeded();
      const raw = localStorage.getItem(KEYS.tokens);
      return raw ? JSON.parse(raw) : null;
    } catch {
      try {
        const c = cookieGet("asr_tokens");
        return c ? JSON.parse(c) : null;
      } catch {
        return null;
      }
    }
  },

  getAccessToken() {
    const t = this.getTokens();
    return t?.access || null;
  },

  isAuthenticated() {
    return !!this.getAccessToken();
  },

  // payload = { user, tokens: { access, refresh } }
  setAuth(payload) {
    try {
      const userStr = JSON.stringify(payload.user);
      const tokStr = JSON.stringify(payload.tokens);

      // localStorage mirrors
      localStorage.setItem(KEYS.user, userStr);
      localStorage.setItem(KEYS.tokens, tokStr);

      // cookies so the other app on a different port can hydrate immediately
      cookieSet("asr_user", userStr);
      cookieSet("asr_tokens", tokStr);

      // convenience cookies (Next can read access/refresh quickly on first render)
      cookieSet("asr_access", payload.tokens.access || "");
      cookieSet("asr_refresh", payload.tokens.refresh || "");

      // notify other tabs/apps
      bc?.postMessage({ type: "auth:set" });
      localStorage.setItem("__asr_auth_ping", String(Date.now()));
    } catch {}
  },

  clear() {
    try {
      localStorage.removeItem(KEYS.user);
      localStorage.removeItem(KEYS.tokens);
      cookieDel("asr_user");
      cookieDel("asr_tokens");
      cookieDel("asr_access");
      cookieDel("asr_refresh");

      bc?.postMessage({ type: "auth:clear" });
      localStorage.setItem("__asr_auth_ping", String(Date.now()));
    } catch {}
  },

  subscribe(callback) {
    const onStorage = (e) => {
      if (
        e.key === KEYS.user ||
        e.key === KEYS.tokens ||
        e.key === "__asr_auth_ping"
      ) {
        callback();
      }
    };
    const onBC = (e) => {
      if (e?.data?.type === "auth:set" || e?.data?.type === "auth:clear") {
        callback();
      }
    };
    window.addEventListener("storage", onStorage);
    bc?.addEventListener("message", onBC);
    return () => {
      window.removeEventListener("storage", onStorage);
      bc?.removeEventListener("message", onBC);
    };
  },
};
