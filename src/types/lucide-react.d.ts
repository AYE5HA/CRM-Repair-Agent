declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  export type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

  export const AlertTriangle: LucideIcon;
  export const BarChart3: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Gauge: LucideIcon;
  export const GitCompareArrows: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const History: LucideIcon;
  export const Inbox: LucideIcon;
  export const ListTodo: LucideIcon;
  export const Mail: LucideIcon;
  export const Network: LucideIcon;
  export const Settings: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const UploadCloud: LucideIcon;
}
