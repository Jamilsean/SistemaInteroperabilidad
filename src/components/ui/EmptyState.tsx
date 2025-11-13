import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type Action = { label: string; onClick: () => void; variant?: "default" | "outline" | "ghost" };

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: Action;
  secondaryAction?: Action;
  className?: string;
};

export function EmptyState({
  title = "Sin elementos",
  description = "No encontramos resultados. Ajusta los filtros o crea un nuevo registro.",
  icon,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn(" bg-white/80 border-dashed shadow-none w-full", className)}>
      <CardContent className="flex flex-col items-center text-center gap-3 py-12">
        <div className="grid place-items-center rounded-2xl border bg-gradient-to-br from-muted/40 to-background p-4">
          {icon ?? <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden />}
        </div>

        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {primaryAction && (
              <Button onClick={primaryAction.onClick} variant={primaryAction.variant ?? "default"}>
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button onClick={secondaryAction.onClick} variant={secondaryAction.variant ?? "outline"}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
