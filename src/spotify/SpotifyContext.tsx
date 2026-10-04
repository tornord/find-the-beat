import React, { createContext, useContext, useEffect, useState } from "react";

import type { EmbedController, EmbedControllerData, EmbedControllerEvent, IFrameApi } from "./iframeApi";

// Re-exported so existing `import { ... } from "./SpotifyContext"` call sites keep working.
export type { EmbedController, EmbedControllerData, EmbedControllerEvent, IFrameApi };

interface SpotifyContextValue {
  iFrameAPI: IFrameApi | null;
}

const SpotifyContext = createContext<SpotifyContextValue | undefined>(undefined);

const SCRIPT_ID = "spotify-iframe-api";
const SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";

let resolvedApi: IFrameApi | null = null;
const pendingReady: ((api: IFrameApi) => void)[] = [];

/**
 * The embed script calls `window.onSpotifyIframeApiReady` exactly once, as soon as it
 * has loaded. Anything that reads the API must have installed that global *before* the
 * script runs, so install it at module scope rather than inside a `useEffect`: with the
 * script tag in `index.html`, the async script can otherwise finish loading before React
 * has mounted, the ready callback fires into the void, and the API is never handed to
 * the provider (leaving the widget permanently empty).
 */
function installReadyHook() {
  if (typeof window === "undefined") return;
  window.onSpotifyIframeApiReady ??= (api) => {
    const ready = pendingReady.shift();
    if (ready) {
      ready(api);
    } else {
      resolvedApi ??= api;
    }
  };
}

installReadyHook();

function getApi(): Promise<IFrameApi> {
  if (resolvedApi) return Promise.resolve(resolvedApi);
  return new Promise<IFrameApi>((resolve) => {
    pendingReady.push(resolve);
  });
}

export function useCreateApi() {
  const [iFrameAPI, setIFrameAPI] = useState<IFrameApi | null>(resolvedApi);
  useEffect(() => {
    let active = true;
    // The embed script may be loaded here or by a <script> tag in index.html.
    if (!document.getElementById(SCRIPT_ID) && !document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    getApi().then((api) => {
      if (active) setIFrameAPI(api);
    });
    return () => {
      active = false;
    };
  }, []);
  return iFrameAPI;
}

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const iFrameAPI = useCreateApi();
  return <SpotifyContext.Provider value={{ iFrameAPI }}>{children}</SpotifyContext.Provider>;
}

export function useSpotifyIFrameApi(): IFrameApi | null {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error("useSpotifyIFrameApi must be used within a SpotifyProvider");
  }
  return context.iFrameAPI;
}
