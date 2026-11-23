import type { ReactNode } from "react";
import { AuditNavigationProvider } from "@/app/audit/audit-navigation";

export default function AuditLayout({ children }: { children: ReactNode }) {
  return <AuditNavigationProvider>{children}</AuditNavigationProvider>;
}
