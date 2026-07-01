import { createContext, useContext } from 'react';

export const AuthRouteContext = createContext({ isRouteSwitch: false });

export function useAuthRouteSwitch() {
  return useContext(AuthRouteContext).isRouteSwitch;
}
