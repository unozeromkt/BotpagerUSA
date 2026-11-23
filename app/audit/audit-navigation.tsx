"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { BusinessContext, TrackingContext } from "@/lib/audit/types";

type AuditHandoff = { business: BusinessContext; tracking: TrackingContext };
const AuditNavigationContext = createContext<{
  handoff: AuditHandoff | null;
  setHandoff: Dispatch<SetStateAction<AuditHandoff | null>>;
} | null>(null);

// Keep the business draft in memory across these two routes. It does not belong
// in the URL, analytics page views, localStorage or server logs.
export function AuditNavigationProvider({ children }: { children: ReactNode }) {
  const [handoff, setHandoff] = useState<AuditHandoff | null>(null);
  return <AuditNavigationContext.Provider value={{ handoff, setHandoff }}>{children}</AuditNavigationContext.Provider>;
}

export function useAuditHandoff() {
  const context = useContext(AuditNavigationContext);
  if (!context) throw new Error("AuditExperience requires AuditNavigationProvider.");
  return context;
}
