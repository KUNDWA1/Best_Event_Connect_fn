import { io, Socket } from 'socket.io-client';

// Dynamic import for simple-peer to handle browser compatibility
let SimplePeer: any = null;

// Lazy load simple-peer
const loadSimplePeer = async () => {
  if (!SimplePeer) {
    try {
      const module = await import('simple-peer');
      SimplePeer = module.default || module;
    } catch (error) {
      console.error('Failed to load simple-peer:', error);
      throw new Error('WebRTC not supported in this browser');
    }
  }
  return SimplePeer;
};

export interface CallData {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callType: 'video' | 'voice';
  roomId: string;
}

export interface WebRTCServiceCallbacks {
  onIncomingCall: (callData: CallData) => void;
  onCallAccepted: () => void;
  onCallDeclined: () => void;
  onCallEnded: () => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: 'connecting' | 'connected' | 'disconnected') => void;
}

class WebRTCService {
  private socket: Socket | null = null;
  private peer: any | null = null;
  private localStream: MediaStream | null = null;
  private callbacks: WebRTCServiceCallbacks | null = null;
  private currentRoomId: string | null = null;
  private isInitiator = false;
  private socketConnectionFailed = false;
  private readonly socketUrl: string;

  constructor() {
    const envSocketUrl = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim();
    const envApiUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

    // Prefer explicit signaling URL, then API URL, then production backend.
    this.socketUrl = envSocketUrl || envApiUrl || 'https://event-konnect-limited-bn.onrender.com';
  }

  private initializeSocket() {
    if (this.socket || this.socketConnectionFailed) {
      return;
    }

    try {
      this.socket = io(this.socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false,
        reconnection: false,
        autoConnect: false,
      });

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
        this.socketConnectionFailed = false;
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error);
        this.socketConnectionFailed = true;
        this.callbacks?.onConnectionStateChange('disconnected');

        // Stop retry loops/noise when signaling server is unreachable.
        this.socket?.disconnect();
        this.socket = null;
      });

      this.socket.on('incoming-call', (callData: CallData) => {
        this.callbacks?.onIncomingCall(callData);
      });

      this.socket.on('call-accepted', () => {
        this.callbacks?.onCallAccepted();
      });

      this.socket.on('call-declined', () => {
        this.callbacks?.onCallDeclined();
        this.cleanup();
      });

      this.socket.on('call-ended', () => {
        this.callbacks?.onCallEnded();
        this.cleanup();
      });

      this.socket.on('signal', (data: any) => {
        if (this.peer) {
          this.peer.signal(data);
        }
      });

      this.socket.on('user-joined', () => {
        this.initiatePeerConnection();
      });
    } catch (error) {
      console.warn('Socket.io initialization failed:', error);
      this.socketConnectionFailed = true;
      this.callbacks?.onConnectionStateChange('disconnected');
      this.socket = null;
    }
  }

  private async ensureSocketConnected() {
    this.initializeSocket();

    if (!this.socket) {
      throw new Error('Signaling server is unavailable.');
    }

    if (this.socket.connected) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Signaling server is unavailable.'));
        return;
      }

      const timeoutId = window.setTimeout(() => {
        this.socket?.off('connect', handleConnect);
        this.socket?.off('connect_error', handleConnectError);
        reject(new Error('Timed out while connecting to signaling server.'));
      }, 8000);

      const handleConnect = () => {
        window.clearTimeout(timeoutId);
        this.socket?.off('connect_error', handleConnectError);
        resolve();
      };

      const handleConnectError = (error: unknown) => {
        window.clearTimeout(timeoutId);
        this.socket?.off('connect', handleConnect);
        reject(error instanceof Error ? error : new Error('Signaling server connection failed.'));
      };

      this.socket.once('connect', handleConnect);
      this.socket.once('connect_error', handleConnectError);
      this.socket.connect();
    });
  }

  setCallbacks(callbacks: WebRTCServiceCallbacks) {
    this.callbacks = callbacks;
  }

  async initiateCall(
    _recipientId: string,
    _recipientName: string,
    _recipientAvatar: string,
    callType: 'video' | 'voice'
  ) {
    try {
      await this.ensureSocketConnected();

      this.isInitiator = true;
      this.currentRoomId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get user media
      await this.getUserMedia(callType);
      
      // Join room and send call invitation
      this.socket?.emit('join-room', this.currentRoomId);
      this.socket?.emit('initiate-call', {
        recipientId: _recipientId,
        callData: {
          callerId: 'current-user-id', // Replace with actual user ID
          callerName: 'Current User', // Replace with actual user name
          callerAvatar: '/default-avatar.png', // Replace with actual avatar
          callType,
          roomId: this.currentRoomId,
        },
      });

      this.callbacks?.onConnectionStateChange('connecting');
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  async acceptCall(callData: CallData) {
    try {
      await this.ensureSocketConnected();

      this.isInitiator = false;
      this.currentRoomId = callData.roomId;
      
      // Get user media
      await this.getUserMedia(callData.callType);
      
      // Join room and accept call
      this.socket?.emit('join-room', this.currentRoomId);
      this.socket?.emit('accept-call', { roomId: this.currentRoomId });
      
      this.callbacks?.onConnectionStateChange('connecting');
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    }
  }

  declineCall(roomId: string) {
    this.socket?.emit('decline-call', { roomId });
    this.cleanup();
  }

  endCall() {
    if (this.currentRoomId) {
      this.socket?.emit('end-call', { roomId: this.currentRoomId });
    }
    this.cleanup();
  }

  private async getUserMedia(callType: 'video' | 'voice'): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: callType === 'video' ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } : false,
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera/microphone');
    }
  }

  private async initiatePeerConnection() {
    if (!this.localStream) return;

    try {
      const SimplePeerClass = await loadSimplePeer();
      
      this.peer = new SimplePeerClass({
        initiator: this.isInitiator,
        trickle: false,
        stream: this.localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('signal', (data: any) => {
        this.socket?.emit('signal', {
          roomId: this.currentRoomId,
          signal: data,
        });
      });

      this.peer.on('stream', (remoteStream: MediaStream) => {
        this.callbacks?.onRemoteStream(remoteStream);
        this.callbacks?.onConnectionStateChange('connected');
      });

      this.peer.on('connect', () => {
        console.log('Peer connection established');
        this.callbacks?.onConnectionStateChange('connected');
      });

      this.peer.on('error', (error: any) => {
        console.error('Peer connection error:', error);
        this.callbacks?.onConnectionStateChange('disconnected');
      });

      this.peer.on('close', () => {
        console.log('Peer connection closed');
        this.callbacks?.onConnectionStateChange('disconnected');
        this.cleanup();
      });
    } catch (error) {
      console.error('Failed to initialize peer connection:', error);
      this.callbacks?.onConnectionStateChange('disconnected');
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

      // Replace video track in peer connection
      if (this.peer && this.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peer._pc?.getSenders().find((s: any) => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack && this.peer) {
        const sender = this.peer._pc?.getSenders().find((s: any) => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  private cleanup() {
    // Close peer connection
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Leave room
    if (this.currentRoomId) {
      this.socket?.emit('leave-room', this.currentRoomId);
      this.currentRoomId = null;
    }

    this.isInitiator = false;
  }

  disconnect() {
    this.cleanup();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new WebRTCService();