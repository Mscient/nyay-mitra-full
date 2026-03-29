import React from "react";
import { Skeleton } from "./skeleton";
import { AlertCircle, FileX } from "lucide-react";

interface StateWrapperProps {
  /**
   * State 1: Loading
   * When true, renders the `skeleton` prop (or default skeleton).
   * Takes precedence over all other states.
   */
  isLoading: boolean;

  /**
   * State 2: Error
   * When true (and not loading), renders the error view with `errorMessage`.
   */
  isError: boolean;

  /**
   * State 3: Empty
   * When true (and not loading/error), renders the empty view with `emptyMessage`.
   * Use this when data fetching returns zero results.
   */
  isEmpty: boolean;

  /**
   * State 4: Disabled
   * Applies opacity reduction and `pointer-events-none` to the children (Success state).
   * Does not replace the view, only modifies accessibility/interactivity.
   */
  isDisabled?: boolean;

  /**
   * Custom skeleton component to render during loading state.
   * Should match the layout of the success state content.
   */
  skeleton?: React.ReactNode;

  /**
   * Message to display in the Error state.
   * Default: "An unexpected error occurred. Please try again."
   */
  errorMessage?: string;

  /**
   * Message to display in the Empty state.
   * Default: "No data available at the moment."
   */
  emptyMessage?: string;

  /**
   * State 5: Success (Default)
   * The actual content to render when no other blocking states are active.
   */
  children: React.ReactNode;
}

/**
 * Enforces the 5 UI states mandated by the Frontend Engineering Guide:
 * 1. Loading - Displays skeleton loaders
 * 2. Error - Displays destructive alert with message
 * 3. Empty - Displays dashed border placeholder
 * 4. Disabled - Opacity reduced, interaction blocked
 * 5. Default (Success) - Renders children
 *
 * @example
 * <StateWrapper
 *   isLoading={query.isLoading}
 *   isError={query.isError}
 *   isEmpty={data.length === 0}
 *   skeleton={<CardSkeleton />}
 * >
 *   {data.map(item => <Item key={item.id} {...item} />)}
 * </StateWrapper>
 */
export function StateWrapper({
  isLoading,
  isError,
  isEmpty,
  isDisabled = false,
  skeleton,
  errorMessage = "An unexpected error occurred. Please try again.",
  emptyMessage = "No data available at the moment.",
  children,
}: StateWrapperProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3" role="status" aria-label="Loading content">
        {skeleton || (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="w-full p-6 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden"
        role="alert"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
        <AlertCircle className="h-8 w-8 text-destructive opacity-80" />
        <div className="space-y-1">
          <h3 className="font-medium text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className="w-full p-8 border border-dashed rounded-lg flex flex-col items-center justify-center text-center space-y-4 bg-muted/30"
      >
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <FileX className="h-6 w-6 text-muted-foreground opacity-60" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Nothing to see here</p>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full transition-opacity duration-200 ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
      aria-disabled={isDisabled}
    >
      {children}
    </div>
  );
}
