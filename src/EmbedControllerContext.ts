import { createContext, useContext } from "react";

const EmbedControllerContext = createContext<any>(null);

export const EmbedControllerProvider = EmbedControllerContext.Provider;

export const useEmbedController = () => {
  return useContext(EmbedControllerContext);
};
