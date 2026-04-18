// components/shared/Can.tsx
import { useAuthStore } from "@/stores/authStore";
import { ReactNode } from "react";

type CanProps = {
  action: string; // actactionon e.g. "manage", "read", "create"
  subject: string; // subject e.g. "CellDetails", "all"
  children: ReactNode;
  fallback?: ReactNode;
};

export const Can = ({
  action,
  subject,
  children,
  fallback = null,
}: CanProps) => {
  const { ability } = useAuthStore();
  console.log("can ", { action }, { subject }, ability.can(action, subject));
  return ability.can(action, subject) ? <>{children}</> : <>{fallback}</>;
};
