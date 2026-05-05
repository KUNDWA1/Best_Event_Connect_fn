import { MediaPermissionChecker } from '../services/mediaPermissions';

// Simplified demo service for testing video/voice calls without backend
export interface CallData {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callType: 'video' | 'voice';
  roomId: string;
}

export interface DemoCallbacks {
  onIncomingCall: (callData: CallData) => void;
  onCallAccepted: () => void;
  onCallDeclined: () => void;
  onCallEnded: () => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: 'connecting' | 'connected' | 'disconnected') => void;
}

class DemoCallService {
  private callbacks: DemoCallbacks | null = null;
  private localStream: MediaStream | null = null;

  setCallbacks(callbacks: DemoCallbacks) {
    this.callbacks = callbacks;
  }

  async initiateCall(
    _recipientId: string,
    _recipientName: string,
    _recipientAvatar: string,
    callType: 'video' | 'voice'
  ) {
    try {
      // Get user media
      await this.getUserMedia(callType);
      
      this.callbacks?.onConnectionStateChange('connecting');
      
      // Simulate connection delay
      setTimeout(() => {
        this.callbacks?.onConnectionStateChange('connected');
        
        // Simulate remote stream (mirror local stream for demo)
        if (this.localStream) {
          this.callbacks?.onRemoteStream(this.localStream);
        }
      }, 2000);

    } catch (error) {
      console.error('Error initiating demo call:', error);
      this.callbacks?.onConnectionStateChange('disconnected');
      throw error;
    }
  }

  async acceptCall(callData: CallData) {
    try {
      // Get user media
      await this.getUserMedia(callData.callType);
      
      this.callbacks?.onConnectionStateChange('connecting');
      
      // Simulate connection
      setTimeout(() => {
        this.callbacks?.onConnectionStateChange('connected');
        
        // Simulate remote stream
        if (this.localStream) {
          this.callbacks?.onRemoteStream(this.localStream);
        }
      }, 1000);

    } catch (error) {
      console.error('Error accepting demo call:', error);
      throw error;
    }
  }

  declineCall(_roomId: string) {
    this.cleanup();
  }

  endCall() {
    this.cleanup();
  }

  private async getUserMedia(callType: 'video' | 'voice'): Promise<MediaStream> {
    try {
      const stream = await MediaPermissionChecker.requestPermissions(
        callType === 'video',
        true
      );
      
      if (!stream) {
        throw new Error('Failed to get media stream');
      }
      
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    // In a real implementation, this would switch back to camera
    console.log('Screen share stopped');
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Simulate incoming call for demo
  simulateIncomingCall(callType: 'video' | 'voice' = 'video') {
    const callData: CallData = {
      callerId: 'demo-caller',
      callerName: 'Demo Caller',
      callerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      callType,
      roomId: 'demo-room-' + Date.now(),
    };

    setTimeout(() => {
      this.callbacks?.onIncomingCall(callData);
    }, 1000);
  }

  private cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.callbacks?.onConnectionStateChange('disconnected');
  }

  disconnect() {
    this.cleanup();
  }
}

export default new DemoCallService();