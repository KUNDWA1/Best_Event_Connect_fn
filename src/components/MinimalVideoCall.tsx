import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';

export default function MinimalVideoCall() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCall = async () => {
    try {
      setError('');
      console.log('Starting call...');
      
      // Request camera and microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('Got media stream:', mediaStream);
      setStream(mediaStream);
      
      // Display video in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element set');
      }
      
      setIsCallActive(true);
      console.log('Call started successfully');
      
    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(`Failed to start call: ${err.message}`);
    }
  };

  const endCall = () => {
    console.log('Ending call...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCallActive(false);
    setError('');
    console.log('Call ended');
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
        console.log('Video toggled:', !isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
        console.log('Audio toggled:', !isAudioOn);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!isCallActive) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📹 Simple Video Call Test
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click the button below to test your camera and microphone.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Your browser will ask for permission to access your camera and microphone.
            </p>
          </div>
          
          <button
            onClick={startCall}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faVideo} />
            Start Video Call Test
          </button>
          
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>✅ Works on Chrome, Firefox, Safari, Edge</p>
            <p>✅ Requires HTTPS in production (localhost is OK)</p>
            <p>✅ You must allow camera/microphone permissions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Video Call Test</h2>
          <p className="text-sm text-gray-300">Testing your camera and microphone</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm">Connected</span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!isVideoOn && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <FontAwesomeIcon icon={faVideoSlash} className="text-6xl mb-4 text-gray-400" />
              <p className="text-xl">Camera is off</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-80 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isAudioOn
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            <FontAwesomeIcon
              icon={isAudioOn ? faMicrophone : faMicrophoneSlash}
              className="text-xl"
            />
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isVideoOn
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            <FontAwesomeIcon
              icon={isVideoOn ? faVideo : faVideoSlash}
              className="text-xl"
            />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
            title="End call"
          >
            <FontAwesomeIcon icon={faPhone} className="text-xl rotate-135" />
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            {isVideoOn ? '📹' : '📷'} Camera: {isVideoOn ? 'ON' : 'OFF'} | 
            {isAudioOn ? '🎤' : '🔇'} Microphone: {isAudioOn ? 'ON' : 'OFF'}
          </p>
        </div>
      </div>
    </div>
  );
}