import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { DateRange } from 'react-day-picker';

export interface UrlFilters {
  search?: string;
  status?: string;
  response_status?: string;
  action?: string;
  show_new_rfps?: boolean;
  page?: number;
  limit?: number;
  dateRange?: DateRange;
  budgetMin?: number;
  budgetMax?: number;
}

export const useUrlFilters = (defaultFilters: Partial<UrlFilters> = {}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize default filters to prevent recreation on every render
  const stableDefaultFilters = useMemo(() => defaultFilters, [
    defaultFilters.search,
    defaultFilters.status,
    defaultFilters.response_status,
    defaultFilters.action,
    defaultFilters.show_new_rfps,
    defaultFilters.page,
    defaultFilters.limit,
    defaultFilters.dateRange?.from?.getTime(),
    defaultFilters.dateRange?.to?.getTime(),
    defaultFilters.budgetMin,
    defaultFilters.budgetMax,
  ]);

  // Parse filters from URL
  const parseFiltersFromUrl = useCallback((): UrlFilters => {
    const filters: UrlFilters = { ...stableDefaultFilters };

    const getNumber = (key: string): number | undefined => {
      const val = searchParams.get(key);
      return val !== null ? parseInt(val, 10) : undefined;
    };

    // Parse string fields
    filters.search = searchParams.get('search') || filters.search;
    filters.status = searchParams.get('status') || filters.status;
    filters.response_status = searchParams.get('response_status') || filters.response_status;
    filters.action = searchParams.get('action') || filters.action;

    // Parse boolean
    filters.show_new_rfps = searchParams.get('show_new_rfps') === 'true';

    // Parse numbers
    const page = getNumber('page');
    if (page !== undefined) filters.page = page;

    const limit = getNumber('limit');
    if (limit !== undefined) filters.limit = limit;

    const budgetMin = getNumber('budgetMin');
    if (budgetMin !== undefined) filters.budgetMin = budgetMin;

    const budgetMax = getNumber('budgetMax');
    if (budgetMax !== undefined) filters.budgetMax = budgetMax;

    // Parse date range
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      filters.dateRange = {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      };
    }

    return filters;
  }, [searchParams, stableDefaultFilters]);

  // Update URL with filters
  const updateUrlFilters = useCallback(
    (newFilters: Partial<UrlFilters>, replace = false) => {
      const currentParams = new URLSearchParams(searchParams);

      const setParam = (key: string, value?: string | number | boolean, defaultValue?: any) => {
        if (value === undefined || value === defaultValue || value === '' || value === false) {
          currentParams.delete(key);
        } else {
          currentParams.set(key, String(value));
        }
      };

      setParam('search', newFilters.search);
      setParam('status', newFilters.status);
      setParam('response_status', newFilters.response_status);
      setParam('action', newFilters.action);
      setParam('show_new_rfps', newFilters.show_new_rfps ? 'true' : undefined);

      setParam('page', newFilters.page, stableDefaultFilters.page ?? 1);
      setParam('limit', newFilters.limit, stableDefaultFilters.limit ?? 15);

      setParam('budgetMin', newFilters.budgetMin, stableDefaultFilters.budgetMin ?? 0);
      setParam('budgetMax', newFilters.budgetMax, stableDefaultFilters.budgetMax);

      if (newFilters.dateRange !== undefined) {
        if (newFilters.dateRange?.from) {
          currentParams.set('dateFrom', newFilters.dateRange.from.toISOString());
        } else {
          currentParams.delete('dateFrom');
        }
        if (newFilters.dateRange?.to) {
          currentParams.set('dateTo', newFilters.dateRange.to.toISOString());
        } else {
          currentParams.delete('dateTo');
        }
      }

      const newUrl = `${location.pathname}${
        currentParams.toString() ? '?' + currentParams.toString() : ''
      }`;

      if (replace) {
        navigate(newUrl, { replace: true });
      } else {
        navigate(newUrl);
      }
    },
    [searchParams, navigate, location.pathname, stableDefaultFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    navigate(location.pathname);
  }, [navigate, location.pathname]);

  // State: current filters
  const [filters, setFilters] = useState<UrlFilters>(() => parseFiltersFromUrl());

  // Sync filters whenever URL changes
  useEffect(() => {
    setFilters(parseFiltersFromUrl());
  }, [parseFiltersFromUrl]);

  return {
    filters,
    updateUrlFilters,
    clearFilters,
    parseFiltersFromUrl,
  };
};
