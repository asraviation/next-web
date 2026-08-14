'use client';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AuthCtx = createContext({ user: null, accessToken: null, authLoaded: false });

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.split('; ').find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.split('=')[1]) : '';
}

function readFromStorageAndCookies() {
  // 1) localStorage first
  let user = null;
  let tokens = null;
  try {
    const u = localStorage.getItem('asr_user');
    const t = localStorage.getItem('asr_tokens');
    if (u) user = JSON.parse(u);
    if (t) tokens = JSON.parse(t);
  } catch {}

  // 2) fallback to cookies
  if (!user) {
    try {
      const cu = getCookie('asr_user');
      if (cu) user = JSON.parse(cu);
    } catch {}
  }
  if (!tokens) {
    try {
      const ct = getCookie('asr_tokens');
      if (ct) tokens = JSON.parse(ct);
    } catch {}
  }

  // 3) access token (prefer tokens, fallback cookie)
  let accessToken = tokens?.access || null;
  if (!accessToken) {
    const ca = getCookie('asr_access');
    if (ca) accessToken = ca;
  }

  return { user, tokens, accessToken };
}

/**
 * Warn if a second provider mounts.
 *
 * This must run as an effect, not in the render body: React re-renders a
 * component many times, so a render-phase check flagged every re-render of the
 * SAME provider as a duplicate — that is where the "Duplicate provider
 * detected" spam came from (61 renders, one provider). The cleanup clears the
 * flag so remounts are not mistaken for duplicates either.
 */
function useSingleProviderInstance() {
  useEffect(() => {
    if (window.__ASR_AUTH_PROVIDER_MOUNTED__) {
      console.warn('[NEXT][AuthProvider] Duplicate provider detected.');
      return undefined;
    }

    window.__ASR_AUTH_PROVIDER_MOUNTED__ = true;
    return () => {
      window.__ASR_AUTH_PROVIDER_MOUNTED__ = false;
    };
  }, []);
}

/** Debug logging, kept out of production consoles. */
const debugLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args);
};

export function AuthProvider({ children, initialUser = null }) {
  useSingleProviderInstance();

  const [user, setUser] = useState(initialUser || null);
  const [accessToken, setAccessToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const didInitRef = useRef(false);

  // Initial hydrate — sets authLoaded=true exactly once
  useEffect(() => {
    const { user: u, accessToken: at } = readFromStorageAndCookies();
    setUser(u || initialUser || null);
    setAccessToken(at || null);
    setAuthLoaded(true);
    didInitRef.current = true;

    debugLog('[NEXT][AuthProvider:init]', {
      authLoaded: true,
      contextUser: u || initialUser || null,
      ls_asr_user: u || null,
      ls_asr_tokens: (() => {
        try {
          const t = localStorage.getItem('asr_tokens');
          return t ? JSON.parse(t) : null;
        } catch { return null; }
      })(),
      cookie_asr_user_preview: getCookie('asr_user')?.slice(0, 120) || null,
      cookie_asr_tokens_preview: getCookie('asr_tokens')?.slice(0, 120) || null,
    });
  }, [initialUser]);

  // Cross-tab/app updates — never flip authLoaded back to false
  useEffect(() => {
    const apply = (src) => {
      const { user: u, accessToken: at } = readFromStorageAndCookies();
      setUser(u || null);
      setAccessToken(at || null);
      // STICKY: once true, stays true
      setAuthLoaded((prev) => prev || true);

      debugLog('[NEXT][AuthProvider:change]', {
        from: src,
        authLoaded: true,
        contextUserNow: u || null,
        hasAccessToken: !!at,
        ls_asr_user_exists: !!localStorage.getItem('asr_user'),
        ls_asr_tokens_exists: !!localStorage.getItem('asr_tokens'),
      });
    };

    const onStorage = (e) => {
      if (e.key === '__asr_auth_ping' || e.key === 'asr_user' || e.key === 'asr_tokens') {
        apply('storage');
      }
    };
    window.addEventListener('storage', onStorage);

    let bc;
    try {
      bc = new BroadcastChannel('asr-auth');
      bc.onmessage = () => apply('BroadcastChannel');
    } catch {}

    const onVisibility = () => {
      if (document.visibilityState === 'visible') apply('visibility');
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
      if (bc) bc.close();
    };
  }, []);

  const value = useMemo(() => ({ user, accessToken, authLoaded }), [user, accessToken, authLoaded]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
