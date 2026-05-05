import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faVideo,
  faPhoneSlash,
  faClock,
  faArrowUp,
  faArrowDown,
  faSearch,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';

interface CallRecord {
  id: string;
  contactName: string;
  contactAvatar: string;
  callType: 'video' | 'voice';
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'declined';
  duration: number; // in seconds
  timestamp: Date;
}

interface CallHistoryProps {
  onClose: () => void;
  onCallContact: (contactName: string, contactAvatar: string, callType: 'video' | 'voice') => void;
}

export default function CallHistory({ onClose, onCallContact }: CallHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'voice' | 'missed'>('all');

  // Mock call history data
  const [callHistory] = useState<CallRecord[]>([
    {
      id: '1',
      contactName: 'Jerome Bell',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jerome',
      callType: 'video',
      direction: 'outgoing',
      status: 'completed',
      duration: 1245, // 20:45
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '2',
      contactName: 'Guy Hawkins',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guy',
      callType: 'voice',
      direction: 'incoming',
      status: 'missed',
      duration: 0,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: '3',
      contactName: 'Marvin McKinney',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marvin',
      callType: 'video',
      direction: 'incoming',
      status: 'completed',
      duration: 892, // 14:52
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: '4',
      contactName: 'Darlene Robertson',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=darlene',
      callType: 'voice',
      direction: 'outgoing',
      status: 'declined',
      duration: 0,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: '5',
      contactName: 'Darrell Steward',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=darrell',
      callType: 'video',
      direction: 'outgoing',
      status: 'completed',
      duration: 2156, // 35:56
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ]);

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getStatusIcon = (record: CallRecord) => {
    if (record.status === 'missed') {
      return <FontAwesomeIcon icon={faPhoneSlash} className="text-red-500" />;
    }
    
    if (record.direction === 'incoming') {
      return <FontAwesomeIcon icon={faArrowDown} className="text-green-500" />;
    } else {
      return <FontAwesomeIcon icon={faArrowUp} className="text-blue-500" />;
    }
  };

  const getStatusColor = (record: CallRecord): string => {
    if (record.status === 'missed') return 'text-red-500';
    if (record.status === 'declined') return 'text-orange-500';
    return 'text-green-500';
  };

  const filteredHistory = callHistory.filter(record => {
    const matchesSearch = record.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'missed' && record.status === 'missed') ||
      (filterType !== 'missed' && record.callType === filterType);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Call History
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faPhoneSlash} />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <FontAwesomeIcon
                icon={faFilter}
                className="absolute left-3 top-3 text-gray-400 text-sm"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Calls</option>
                <option value="video">Video Calls</option>
                <option value="voice">Voice Calls</option>
                <option value="missed">Missed Calls</option>
              </select>
            </div>
          </div>
        </div>

        {/* Call List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faPhone}
                className="text-4xl text-gray-300 dark:text-gray-600 mb-4"
              />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'all' ? 'No calls match your search' : 'No call history yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  {/* Contact Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={record.contactAvatar}
                      alt={record.contactName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {record.contactName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {getStatusIcon(record)}
                        <span className={getStatusColor(record)}>
                          {record.status === 'completed' ? 'Completed' :
                           record.status === 'missed' ? 'Missed' : 'Declined'}
                        </span>
                        {record.status === 'completed' && (
                          <>
                            <span>•</span>
                            <FontAwesomeIcon icon={faClock} className="text-xs" />
                            <span>{formatDuration(record.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Call Type and Time */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <FontAwesomeIcon
                        icon={record.callType === 'video' ? faVideo : faPhone}
                        className={`text-sm ${
                          record.callType === 'video' ? 'text-green-500' : 'text-blue-500'
                        }`}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {record.callType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTimestamp(record.timestamp)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onCallContact(record.contactName, record.contactAvatar, 'voice')}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Voice call"
                    >
                      <FontAwesomeIcon icon={faPhone} />
                    </button>
                    <button
                      onClick={() => onCallContact(record.contactName, record.contactAvatar, 'video')}
                      className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Video call"
                    >
                      <FontAwesomeIcon icon={faVideo} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {callHistory.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-500">
                {callHistory.filter(r => r.status === 'missed').length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Missed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-500">
                {callHistory.filter(r => r.callType === 'video').length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Video</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-500">
                {callHistory.filter(r => r.callType === 'voice').length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Voice</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}