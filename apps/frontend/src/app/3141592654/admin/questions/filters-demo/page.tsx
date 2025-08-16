/**
 * Filters Demo Page
 * Trang demo để test comprehensive question filters
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { FilterDemo } from "@/components/admin/questions/filters/filter-demo";
import { ErrorBoundary } from "@/components/ui/feedback/error-boundary";

/**
 * Filters Demo Page
 * Trang demo cho comprehensive question filters system
 */
export default function FiltersDemo() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <FilterDemo />
      </div>
    </ErrorBoundary>
  );
}
