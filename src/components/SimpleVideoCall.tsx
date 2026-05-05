import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faVolumeUp,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

interface SimpleVideoCallProps {
  isIncoming?: boolean;
  callerName: string;
  callerAvatar: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd: () => void;
  callType: 'video' | 'voice';
}

export default function SimpleVideoCall({
  isIncoming = false,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  onEnd,
  callType,
}: SimpleVideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Start call timer
  useEffect(() => {
    if (!isIncoming && connectionStatus === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isIncoming, connectionStatus]);

  // Get user media when call starts
  useEffect(() => {
    if (!isIncoming) {
      startLocalMedia();
    }
  }, [isIncoming]);

  const startLocalMedia = async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 }
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection after getting media
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error accessing media devices:', err);
      let errorMessage = 'Failed to access camera/microphone. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera/microphone is being used by another application.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setConnectionStatus('disconnected');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleAccept = async () => {
    await startLocalMedia();
    onAccept?.();
  };

  const handleEnd = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onEnd();
  };

  // Incoming call UI
  if (isIncoming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {callerName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Incoming {callType} call...
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={onDecline}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl rotate-135" />
            </button>
            <button
              onClick={handleAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call UI
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center gap-3">
          <img
            src={callerAvatar}
            alt={callerName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{callerName}</h3>
            <p className="text-sm text-gray-300">
              {connectionStatus === 'connecting' ? 'Connecting...' : formatDuration(callDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Video/Voice Area */}
      <div className="flex-1 relative">
        {error ? (
          /* Error Display */
          <div className="w-full h-full flex items-center justify-center bg-red-900">
            <div className="text-center text-white p-8">
              <FontAwesomeIcon icon={faTimes} className="text-6xl mb-4 text-red-400" />
              <h2 className="text-2xl font-bold mb-4">Call Failed</h2>
              <p className="text-lg mb-6">{error}</p>
              <button
                onClick={handleEnd}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : callType === 'video' && isVideoEnabled && localStream ? (
          /* Video Call */
          <div className="w-full h-full relative">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Overlay for remote video placeholder */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white">
                <img
                  src={callerAvatar}
                  alt={callerName}
                  className="w-32 h-32 rounded-full mx-auto mb-4 opacity-50"
                />
                <p className="text-xl">Waiting for {callerName} to join...</p>
              </div>
            </div>
          </div>
        ) : (
          /* Voice Call or Video Disabled */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="text-center text-white">
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold mb-2">{callerName}</h2>
              <p className="text-xl text-gray-300">
                {callType === 'voice' ? 'Voice Call' : 'Video Off'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-80 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            <FontAwesomeIcon
              icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash}
            />
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              <FontAwesomeIcon
                icon={isVideoEnabled ? faVideo : faVideoSlash}
              />
            </button>
          )}

          {/* Volume indicator */}
          <div className="flex items-center gap-2 text-white">
            <FontAwesomeIcon icon={faVolumeUp} />
            <div className="w-16 h-2 bg-gray-700 rounded-full">
              <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* End Call */}
          <button
            onClick={handleEnd}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
            title="End call"
          >
            <FontAwesomeIcon icon={faPhone} className="rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
}