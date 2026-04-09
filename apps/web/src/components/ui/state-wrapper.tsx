"use client";

import * as React from "react";

interface StateWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}

export function StateWrapper({
  isLoading, isError, errorMessage, isEmpty, emptyMessage, skeleton, children,
}: StateWrapperProps) {
  if (isLoading) {
    return <>{skeleton ?? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>}</>;
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{errorMessage ?? "Something went wrong."}</p>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage ?? "No data found."}</p>
      </div>
    );
  }
  return <>{children}</>;
}
