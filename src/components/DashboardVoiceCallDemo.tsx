import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faComments, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useVoiceCall } from '../hooks/useVoiceCall';
import VoiceCall from './VoiceCall';
import Chat from './Chat';

export default function DashboardVoiceCallDemo() {
  const [showChat, setShowChat] = useState(false);
  
  const {
    callState,
    startVoiceCall,
    simulateIncomingVoiceCall,
    acceptVoiceCall,
    declineVoiceCall,
    endVoiceCall,
  } = useVoiceCall();

  const mockContact = {
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  };

  const handleStartVoiceCall = () => {
    startVoiceCall(mockContact.name, mockContact.avatar);
  };

  const handleSimulateIncoming = () => {
    simulateIncomingVoiceCall(mockContact.name, mockContact.avatar);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              📞 Dashboard Voice Call Demo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Test voice calling functionality in the dashboard messages
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-3 text-green-800 dark:text-green-200">
                <FontAwesomeIcon icon={faPhone} />
                <span className="font-medium">
                  Voice calls work with microphone only - perfect for your setup!
                </span>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={handleStartVoiceCall}
              className="flex flex-col items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faPhone} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Start Voice Call</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Test microphone access</span>
              </div>
            </button>

            <button
              onClick={handleSimulateIncoming}
              className="flex flex-col items-center gap-4 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faPlay} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Incoming Call</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Test notification</span>
              </div>
            </button>

            <button
              onClick={() => setShowChat(true)}
              className="flex flex-col items-center gap-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faComments} className="text-2xl" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 dark:text-white block">Open Chat</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">With voice call button</span>
              </div>
            </button>
          </div>

          {/* Call Status */}
          {(callState.isInCall || callState.isIncomingCall) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-lg">
                📞 Voice Call Status
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
                  <div className="font-medium text-gray-900 dark:text-white">Contact</div>
                  <div className="text-purple-600 dark:text-purple-400">
                    {callState.callData?.callerName || 'None'}
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

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              🎯 How to Use Voice Calls in Dashboard
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Go to Dashboard Messages:</strong> Navigate to your dashboard and click on the "Messages" tab
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Select a Contact:</strong> Choose a vendor or event planner from your contacts list
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Click Phone Icon:</strong> Click the phone icon in the chat header to start a voice call
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Allow Microphone:</strong> When prompted, allow microphone access for voice calls
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                ✅ Working Features
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Voice calls with microphone access</li>
                <li>• Incoming call notifications</li>
                <li>• Mute/unmute during calls</li>
                <li>• Call duration tracking</li>
                <li>• Volume controls</li>
                <li>• Call status indicators</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-3">
                ⚠️ Note About Video Calls
              </h4>
              <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                <li>• Video calls disabled (no camera detected)</li>
                <li>• Voice calls work perfectly instead</li>
                <li>• All chat functionality preserved</li>
                <li>• Professional voice communication</li>
                <li>• Better for business calls anyway!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <Chat
          recipientRole="Event Vendor"
          onClose={() => setShowChat(false)}
          isModal={true}
        />
      )}

      {/* Voice Call Component */}
      {(callState.isInCall || callState.isIncomingCall) && callState.callData && (
        <VoiceCall
          isIncoming={callState.isIncomingCall}
          callerName={callState.callData.callerName}
          callerAvatar={callState.callData.callerAvatar}
          onAccept={acceptVoiceCall}
          onDecline={declineVoiceCall}
          onEnd={endVoiceCall}
        />
      )}
    </div>
  );
}