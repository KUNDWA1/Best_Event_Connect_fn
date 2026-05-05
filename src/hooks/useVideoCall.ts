import { useState, useEffect, useRef } from 'react';
import webrtcService, { CallData, WebRTCServiceCallbacks } from '../services/webrtc';
import demoCallService, { DemoCallbacks } from '../services/demoCall';

export interface CallState {
  isInCall: boolean;
  isIncomingCall: boolean;
  callData: CallData | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  callDuration: number;
}

export function useVideoCall() {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isIncomingCall: false,
    callData: null,
    connectionStatus: 'disconnected',
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    callDuration: 0,
  });

  const [useDemo, setUseDemo] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const callbacks: WebRTCServiceCallbacks & DemoCallbacks = {
      onIncomingCall: (callData: CallData) => {
        setCallState(prev => ({
          ...prev,
          isIncomingCall: true,
          callData,
        }));
      },

      onCallAccepted: () => {
        setCallState(prev => ({
          ...prev,
          isInCall: true,
          isIncomingCall: false,
          connectionStatus: 'connecting',
        }));
        startCallTimer();
      },

      onCallDeclined: () => {
        setCallState(prev => ({
          ...prev,
          isInCall: false,
          isIncomingCall: false,
          callData: null,
          connectionStatus: 'disconnected',
        }));
        stopCallTimer();
      },

      onCallEnded: () => {
        setCallState(prev => ({
          ...prev,
          isInCall: false,
          isIncomingCall: false,
          callData: null,
          connectionStatus: 'disconnected',
          localStream: null,
          remoteStream: null,
          callDuration: 0,
        }));
        stopCallTimer();
      },

      onRemoteStream: (stream: MediaStream) => {
        setCallState(prev => ({
          ...prev,
          remoteStream: stream,
        }));
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      },

      onConnectionStateChange: (status) => {
        setCallState(prev => ({
          ...prev,
          connectionStatus: status,
        }));
      },
    };

    // Try to use WebRTC service first, fallback to demo
    try {
      webrtcService.setCallbacks(callbacks);
    } catch (error) {
      console.warn('WebRTC service failed, using demo mode:', error);
      setUseDemo(true);
      demoCallService.setCallbacks(callbacks);
    }

    // Also set up demo service as fallback
    demoCallService.setCallbacks(callbacks);

    return () => {
      stopCallTimer();
    };
  }, []);

  // Update local video when stream changes
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallState(prev => ({
        ...prev,
        callDuration: prev.callDuration + 1,
      }));
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const initiateCall = async (
    recipientId: string,
    recipientName: string,
    recipientAvatar: string,
    callType: 'video' | 'voice'
  ) => {
    try {
      const service = useDemo ? demoCallService : webrtcService;
      await service.initiateCall(recipientId, recipientName, recipientAvatar, callType);
      
      const localStream = service.getLocalStream();
      setCallState(prev => ({
        ...prev,
        isInCall: true,
        callData: {
          callerId: 'current-user',
          callerName: recipientName,
          callerAvatar: recipientAvatar,
          callType,
          roomId: '',
        },
        localStream,
        connectionStatus: 'connecting',
        isVideoEnabled: callType === 'video',
      }));
    } catch (error) {
      console.error('Failed to initiate call:', error);
      // Fallback to demo mode
      if (!useDemo) {
        setUseDemo(true);
        return initiateCall(recipientId, recipientName, recipientAvatar, callType);
      }
      throw error;
    }
  };

  const acceptCall = async () => {
    if (!callState.callData) return;

    try {
      const service = useDemo ? demoCallService : webrtcService;
      await service.acceptCall(callState.callData);
      
      const localStream = service.getLocalStream();
      setCallState(prev => ({
        ...prev,
        isInCall: true,
        isIncomingCall: false,
        localStream,
        connectionStatus: 'connecting',
        isVideoEnabled: prev.callData?.callType === 'video',
      }));
    } catch (error) {
      console.error('Failed to accept call:', error);
      throw error;
    }
  };

  const declineCall = () => {
    if (callState.callData) {
      const service = useDemo ? demoCallService : webrtcService;
      service.declineCall(callState.callData.roomId);
    }
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      isIncomingCall: false,
      callData: null,
      connectionStatus: 'disconnected',
    }));
  };

  const endCall = () => {
    const service = useDemo ? demoCallService : webrtcService;
    service.endCall();
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      isIncomingCall: false,
      callData: null,
      connectionStatus: 'disconnected',
      localStream: null,
      remoteStream: null,
      callDuration: 0,
      isScreenSharing: false,
    }));
    stopCallTimer();
  };

  const toggleVideo = () => {
    const newVideoState = !callState.isVideoEnabled;
    const service = useDemo ? demoCallService : webrtcService;
    service.toggleVideo(newVideoState);
    setCallState(prev => ({
      ...prev,
      isVideoEnabled: newVideoState,
    }));
  };

  const toggleAudio = () => {
    const newAudioState = !callState.isAudioEnabled;
    const service = useDemo ? demoCallService : webrtcService;
    service.toggleAudio(newAudioState);
    setCallState(prev => ({
      ...prev,
      isAudioEnabled: newAudioState,
    }));
  };

  const startScreenShare = async () => {
    try {
      const service = useDemo ? demoCallService : webrtcService;
      await service.startScreenShare();
      setCallState(prev => ({
        ...prev,
        isScreenSharing: true,
      }));
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  };

  const stopScreenShare = async () => {
    try {
      const service = useDemo ? demoCallService : webrtcService;
      await service.stopScreenShare();
      setCallState(prev => ({
        ...prev,
        isScreenSharing: false,
      }));
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      throw error;
    }
  };

  // Demo-specific function
  const simulateIncomingCall = (callType: 'video' | 'voice' = 'video') => {
    demoCallService.simulateIncomingCall(callType);
  };

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    simulateIncomingCall,
    formatCallDuration,
    useDemo,
  };
}