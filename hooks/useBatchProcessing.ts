import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface BatchJobStatus {
  status: 'started' | 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  current_batch: number;
  total_batches: number;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

export function useBatchProcessing() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<BatchJobStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start batch processing
  const startProcessing = async (batchSize: number = 50, maxConcurrent: number = 5) => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/citations/process-batch-async`,
        null,
        {
          params: { batch_size: batchSize, max_concurrent: maxConcurrent }
        }
      );

      const newJobId = response.data.job_id;
      setJobId(newJobId);
      
      console.log('✅ Batch processing started:', newJobId);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
      setIsProcessing(false);
    }
  };

  // Poll for status updates
  useEffect(() => {
    if (!jobId || !isProcessing) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/citations/batch-status/${jobId}`
        );

        const newStatus: BatchJobStatus = response.data;
        setStatus(newStatus);

        // Check if completed or failed
        if (newStatus.status === 'completed' || newStatus.status === 'failed') {
          setIsProcessing(false);
          clearInterval(pollInterval);
          
          if (newStatus.status === 'failed') {
            setError(newStatus.error || 'Processing failed');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch status:', err);
        setError(err.response?.data?.detail || err.message);
        setIsProcessing(false);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, isProcessing]);

  const reset = useCallback(() => {
    setJobId(null);
    setStatus(null);
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    startProcessing,
    status,
    isProcessing,
    error,
    reset,
    progressPercentage: status ? Math.round((status.processed / status.total) * 100) : 0
  };
}
