import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);

  const checkMode = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsDemoMode(false);
        return session;
      }
      
      // If no supabase session, check if we have a demo user logged in
      const savedUser = localStorage.getItem('velora_user');
      if (savedUser) {
        setIsDemoMode(true);
      } else {
        setIsDemoMode(false);
      }
      return null;
    } catch (e) {
      setIsDemoMode(true); // Fallback to demo in case of any error
      return null;
    }
  };

  const fetchStatus = async () => {
    try {
      const session = await checkMode();
      if (!session) {
        // Demo Mode status
        const demoConnected = localStorage.getItem('velora_demo_calendar_connected') === 'true';
        setIsConnected(demoConnected);
        return;
      }

      const response = await fetch('/api/calendar/status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Failed to fetch calendar status:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const connect = async () => {
    setIsLoading(true);
    try {
      const session = await checkMode();
      if (!session) {
        // Demo Mode connection simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        localStorage.setItem('velora_demo_calendar_connected', 'true');
        setIsConnected(true);
        // Redirect with success parameter to match real redirect behavior
        const url = new URL(window.location.href);
        url.searchParams.set('calendar_success', 'true');
        window.location.href = url.toString();
        return;
      }

      const response = await fetch('/api/calendar/auth', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Failed to get auth URL');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      const session = await checkMode();
      if (!session) {
        // Demo Mode disconnect simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.setItem('velora_demo_calendar_connected', 'false');
        setIsConnected(false);
        return;
      }

      const response = await fetch('/api/calendar/disconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = async (event: { title: string, description: string, startTime: string }) => {
    setIsLoading(true);
    try {
      const session = await checkMode();
      if (!session) {
        // Demo Mode event simulation
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, eventId: 'demo-event-' + Math.random().toString(36).substr(2, 9) };
      }

      const response = await fetch('/api/calendar/add-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(event)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error: any) {
      console.error('Add event error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncAll = async (deadlines: any[]) => {
    setIsLoading(true);
    try {
      const session = await checkMode();
      if (!session) {
        // Demo Mode sync all simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { 
          success: true, 
          results: deadlines.map(d => ({ success: true, title: d.title, id: 'demo-event-' + Math.random().toString(36).substr(2, 9) })) 
        };
      }

      const response = await fetch('/api/calendar/sync-deadlines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ deadlines })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error: any) {
      console.error('Sync all error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isConnected, isLoading, connect, disconnect, addEvent, syncAll };
};
