import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faVideo, 
  faHistory, 
  faComments, 
  faCog,
  faPlay,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useSimpleVideoCall } from '../hooks/useSimpleVideoCall';
import SimpleVideoCall from './SimpleVideoCall';
import CallHistory from './CallHistory';
import CallDiagnostics from './CallDiagnostics';
import Chat from './Chat';

export default function WorkingCallDemo() {
  const [showChat, setShowChat] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const {
    callState,
    startCall,
    simulateIncomingCall,
    acceptCall,
    declineCall,
    endCall,
  } = useSimpleVideoCall();

  const mockContact = {
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    id: '1',
  };

  const handleVoiceCall = () => {
    startCall(mockContact.name, mockContact.avatar, 'voice');
  };

  const handleVideoCall = () => {
    startCall(mockContact.name, mockContact.avatar, 'video');
  };

  const handleSimulateIncoming = () => {
    simulateIncomingCall(mockContact.name, mockContact.avatar, 'video');
  };

  const handleCallFromHistory = (contactName: string, contactAvatar: string, callType: 'video' | 'voice') => {
    setShowCallHistory(false);
    startCall(contactName, contactAvatar, callType);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🎥 Video & Voice Call Demo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Test video and voice calling functionality with camera/microphone access
            </p>
            
            {/* Browser Compatibility Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-3 text-blue-800 dark:text-blue-200">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span className="font-medium">
                  Camera access requires HTTPS in production. Works on localhost for development.
                </span>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <button
              onClick={handleVoiceCall}
              className="group flex flex-col items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-blue-500 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors">
                <FontAwesomeIcon icon={faPhone} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Voice Call</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Audio only</span>
              </div>
            </button>

            <button
              onClick={handleVideoCall}
              className="group flex flex-col items-center gap-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-green-500 group-hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors">
                <FontAwesomeIcon icon={faVideo} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Video Call</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Camera + Audio</span>
              </div>
            </button>

            <button
              onClick={handleSimulateIncoming}
              className="group flex flex-col items-center gap-4 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-orange-500 group-hover:bg-orange-600 rounded-full flex items-center justify-center text-white transition-colors">
                <FontAwesomeIcon icon={faPlay} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Incoming Call</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Test notification</span>
              </div>
            </button>

            <button
              onClick={() => setShowCallHistory(true)}
              className="group flex flex-col items-center gap-4 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-purple-500 group-hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors">
                <FontAwesomeIcon icon={faHistory} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Call History</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Past calls</span>
              </div>
            </button>

            <button
              onClick={() => setShowDiagnostics(true)}
              className="group flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-red-500 group-hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                <FontAwesomeIcon icon={faCog} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Diagnostics</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Troubleshoot</span>
              </div>
            </button>
          </div>

          {/* Chat Integration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Chat Integration
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Video/voice call buttons are integrated into the chat interface
                </p>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-3 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faComments} />
                Open Chat
              </button>
            </div>
          </div>

          {/* Call Status */}
          {(callState.isInCall || callState.isIncomingCall) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-lg">
                📞 Call Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Status</div>
                  <div className="text-blue-600 dark:text-blue-400">
                    {callState.isInCall ? '📞 In Call' : callState.isIncomingCall ? '📲 Incoming' : '❌ No Call'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Connection</div>
                  <div className={`${
                    callState.connectionStatus === 'connected' ? 'text-green-600' :
                    callState.connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {callState.connectionStatus === 'connected' ? '🟢 Connected' :
                     callState.connectionStatus === 'connecting' ? '🟡 Connecting' : '🔴 Disconnected'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Type</div>
                  <div className="text-purple-600 dark:text-purple-400">
                    {callState.callData?.callType === 'video' ? '🎥 Video' : 
                     callState.callData?.callType === 'voice' ? '🎤 Voice' : '❓ None'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Duration</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    ⏱️ {Math.floor(callState.callDuration / 60)}:{(callState.callDuration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
              {callState.error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <div className="text-red-800 dark:text-red-200 font-medium">❌ Error:</div>
                  <div className="text-red-700 dark:text-red-300 text-sm">{callState.error}</div>
                </div>
              )}
            </div>
          )}

          {/* Features Overview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-lg">
                🎥 Video Call Features
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>✅ Real camera access with permission handling</li>
                <li>✅ Video on/off toggle during calls</li>
                <li>✅ Audio mute/unmute controls</li>
                <li>✅ Call duration tracking</li>
                <li>✅ Connection status indicators</li>
                <li>✅ Error handling and user feedback</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
              <h3 className="font-bold text-green-900 dark:text-green-100 mb-4 text-lg">
                🎤 Voice Call Features
              </h3>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>✅ Microphone access with permission handling</li>
                <li>✅ Audio-only interface for voice calls</li>
                <li>✅ Mute/unmute functionality</li>
                <li>✅ Visual call status indicators</li>
                <li>✅ Incoming call notifications</li>
                <li>✅ Call history integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChat && (
        <Chat
          recipientRole="Event Vendor"
          onClose={() => setShowChat(false)}
          isModal={true}
        />
      )}

      {showCallHistory && (
        <CallHistory
          onClose={() => setShowCallHistory(false)}
          onCallContact={handleCallFromHistory}
        />
      )}

      {showDiagnostics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Call Diagnostics</h2>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <CallDiagnostics />
            </div>
          </div>
        </div>
      )}

      {/* Video Call Component */}
      {(callState.isInCall || callState.isIncomingCall) && callState.callData && (
        <SimpleVideoCall
          isIncoming={callState.isIncomingCall}
          callerName={callState.callData.callerName}
          callerAvatar={callState.callData.callerAvatar}
          callType={callState.callData.callType}
          onAccept={acceptCall}
          onDecline={declineCall}
          onEnd={endCall}
        />
      )}
    </div>
  );
}