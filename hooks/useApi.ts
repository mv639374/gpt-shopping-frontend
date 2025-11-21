import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";

const API_URL = 'https://gpt-shopping-backend-production.up.railway.app';

export function useBackendStatus() {
  const { setBackendConnected } = useAppStore();
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${API_URL}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setBackendConnected(true);
        return true;
      } else {
        setBackendConnected(false);
        return false;
      }
    } catch (error) {
      setBackendConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [setBackendConnected]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { isChecking, checkStatus };
}

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Auto-fetch on mount for certain endpoints
  useEffect(() => {
    if (endpoint.includes('/categories')) {
      fetchData();
    }
  }, [endpoint, fetchData]);

  return { data, loading, error, fetchData };
}
