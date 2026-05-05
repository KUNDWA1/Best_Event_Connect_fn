import { useState, useRef } from 'react';

export interface VoiceCallState {
  isInCall: boolean;
  isIncomingCall: boolean;
  callData: {
    callerName: string;
    callerAvatar: string;
  } | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  callDuration: number;
  error: string | null;
}

export function useVoiceCall() {
  const [callState, setCallState] = useState<VoiceCallState>({
    isInCall: false,
    isIncomingCall: false,
    callData: null,
    connectionStatus: 'disconnected',
    callDuration: 0,
    error: null,
  });

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startVoiceCall = (recipientName: string, recipientAvatar: string) => {
    console.log('Starting voice call with:', recipientName);
    
    setCallState({
      isInCall: true,
      isIncomingCall: false,
      callData: {
        callerName: recipientName,
        callerAvatar: recipientAvatar,
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

  const simulateIncomingVoiceCall = (callerName: string, callerAvatar: string) => {
    console.log('Simulating incoming voice call from:', callerName);
    
    setCallState({
      isInCall: false,
      isIncomingCall: true,
      callData: {
        callerName,
        callerAvatar,
      },
      connectionStatus: 'connecting',
      callDuration: 0,
      error: null,
    });
  };

  const acceptVoiceCall = () => {
    if (!callState.callData) return;

    console.log('Accepting voice call');
    
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

  const declineVoiceCall = () => {
    console.log('Declining voice call');
    endVoiceCall();
  };

  const endVoiceCall = () => {
    console.log('Ending voice call');
    
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
    startVoiceCall,
    simulateIncomingVoiceCall,
    acceptVoiceCall,
    declineVoiceCall,
    endVoiceCall,
    setError,
  };
}