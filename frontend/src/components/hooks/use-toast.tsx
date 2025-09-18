import * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

/** API compatível com o antigo shadcn */
type ShadcnToastObject = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** use "destructive" para erro; também aceito success|info|warning */
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  /** conteúdo extra (ex: botões) */
  action?: React.ReactNode;
  /** duração em ms */
  duration?: number;
} & Omit<ExternalToast, "description">;

/** Union: aceita string/ReactNode ou o objeto acima */
type ToastInput =
  | React.ReactNode
  | ShadcnToastObject;

/** Implementação que mapeia para o Sonner */
function normalizeAndToast(arg: ToastInput, opts?: ExternalToast) {
  // Caso 1: string / ReactNode (uso nativo Sonner)
  if (typeof arg !== "object" || React.isValidElement(arg)) {
    return sonnerToast(arg as React.ReactNode, opts);
  }

  // Caso 2: objeto estilo shadcn
  const { title, description, variant, action, duration, ...rest } = arg;

  const content = (
    <div className="flex flex-col gap-1">
      {title && <div className="font-medium">{title}</div>}
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
      {action}
    </div>
  );

  const common = { duration, ...rest, ...opts };

  switch (variant) {
    case "destructive":
      return sonnerToast.error(content, common);
    case "success":
      return sonnerToast.success(content, common);
    case "info":
      return sonnerToast.info(content, common);
    case "warning":
      return sonnerToast(content, { ...common, icon: "⚠️" });
    default:
      return sonnerToast(content, common);
  }
}

/** Hook com helpers convenientes */
export function useToast() {
  return {
    toast: normalizeAndToast,
    dismiss: sonnerToast.dismiss,
    success: (msg: React.ReactNode, opts?: ExternalToast) =>
      sonnerToast.success(msg, opts),
    error: (msg: React.ReactNode, opts?: ExternalToast) =>
      sonnerToast.error(msg, opts),
    info: (msg: React.ReactNode, opts?: ExternalToast) =>
      sonnerToast.info(msg, opts),
    warning: (msg: React.ReactNode, opts?: ExternalToast) =>
      sonnerToast(msg, { icon: "⚠️", ...opts }),
  };
}

/** Export nomeado para `import { toast } ...` */
export const toast = normalizeAndToast;
