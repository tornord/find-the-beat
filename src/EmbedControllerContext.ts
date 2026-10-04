import { createContext, useContext } from "react";

export interface EmbedController {
  addListener: (
    event: "playback_update",
    callback: (e: { data: { position: number; isPaused: boolean } }) => void
  ) => void;
  options: { uri: string };
}

const EmbedControllerContext = createContext<EmbedController | null>(null);

export const EmbedControllerProvider = EmbedControllerContext.Provider;

export const useEmbedController = () => {
  return useContext(EmbedControllerContext);
};
