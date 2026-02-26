import { useEffect, useRef } from 'react';
import { sseURL } from '../api.js';

export function useSSE(teamId, token, handlers) {
  const eventSourceRef = useRef(null);
  const retriesRef = useRef(0);

  useEffect(() => {
    if (!teamId || !token) return;

    function connect() {
      const es = new EventSource(sseURL(teamId, token));
      eventSourceRef.current = es;

      es.onopen = () => {
        retriesRef.current = 0;
      };

      es.addEventListener('status_updated', (e) => {
        handlers.onStatusUpdated?.(JSON.parse(e.data));
      });
      es.addEventListener('join_requested', (e) => {
        handlers.onJoinRequested?.(JSON.parse(e.data));
      });
      es.addEventListener('join_approved', (e) => {
        handlers.onJoinApproved?.(JSON.parse(e.data));
      });
      es.addEventListener('join_rejected', (e) => {
        handlers.onJoinRejected?.(JSON.parse(e.data));
      });

      es.onerror = () => {
        es.close();
        // Exponential backoff reconnect
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
        retriesRef.current++;
        setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [teamId, token]);
}
