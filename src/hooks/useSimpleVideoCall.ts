import { useState, useRef } from 'react';

export interface SimpleCallState {
  isInCall: boolean;
  isIncomingCall: boolean;
  callData: {
    callerName: string;
    callerAvatar: string;
    callType: 'video' | 'voice';
  } | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  callDuration: number;
  error: string | null;
}

export function useSimpleVideoCall() {
  const [callState, setCallState] = useState<SimpleCallState>({
    isInCall: false,
    isIncomingCall: false,
    callData: null,
    connectionStatus: 'disconnected',
    callDuration: 0,
    error: null,
  });

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCall = (recipientName: string, recipientAvatar: string, callType: 'video' | 'voice') => {
    setCallState({
      isInCall: true,
      isIncomingCall: false,
      callData: {
        callerName: recipientName,
        callerAvatar: recipientAvatar,
        callType,
      },
      connectionStatus: 'connecting',
      callDuration: 0,
      error: null,
    });

    // Start call timer after connection
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        connectionStatus: 'connected',
      }));
      
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1,
        }));
      }, 1000);
    }, 2000);
  };

  const simulateIncomingCall = (callerName: string, callerAvatar: string, callType: 'video' | 'voice') => {
    setCallState({
      isInCall: false,
      isIncomingCall: true,
      callData: {
        callerName,
        callerAvatar,
        callType,
      },
      connectionStatus: 'connecting',
      callDuration: 0,
      error: null,
    });
  };

  const acceptCall = () => {
    if (!callState.callData) return;

    setCallState(prev => ({
      ...prev,
      isInCall: true,
      isIncomingCall: false,
      connectionStatus: 'connecting',
    }));

    // Simulate connection
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        connectionStatus: 'connected',
      }));
      
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1,
        }));
      }, 1000);
    }, 1500);
  };

  const declineCall = () => {
    endCall();
  };

  const endCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    setCallState({
      isInCall: false,
      isIncomingCall: false,
      callData: null,
      connectionStatus: 'disconnected',
      callDuration: 0,
      error: null,
    });
  };

  const setError = (error: string) => {
    setCallState(prev => ({
      ...prev,
      error,
      connectionStatus: 'disconnected',
    }));
  };

  return {
    callState,
    startCall,
    simulateIncomingCall,
    acceptCall,
    declineCall,
    endCall,
    setError,
  };
}