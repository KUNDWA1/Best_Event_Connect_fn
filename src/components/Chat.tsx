import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faInbox,
  faTimes,
  faPaperclip,
  faPaperPlane,
  faPhone,
  faVideo,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { useVoiceCall } from '../hooks/useVoiceCall';
import VoiceCall from './VoiceCall';

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
  senderName: string;
  avatar: string;
  fileUrl?: string;
  fileName?: string;
  deletedLocally?: boolean; // Only deleted from current user's view
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
}

interface ChatProps {
  recipientName?: string; // Optional, used when opening single chat
  recipientRole: string;
  onClose: () => void;
  contacts?: Contact[];
  selectedContactId?: number;
  isModal?: boolean; // If false, displays inline instead of as modal
}

export default function Chat({
  recipientRole,
  onClose,
  contacts: propsContacts,
  selectedContactId,
  isModal = true,
}: ChatProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    callState,
    startVoiceCall,
    acceptVoiceCall,
    declineVoiceCall,
    endVoiceCall,
  } = useVoiceCall();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "other",
      text: "A creative brief is a short document that sums up marketing, advertising, or design project mission, goals, challenges, demographics, messaging, and other key details. It's often created by a consultant or creative project manager. The goal is a brief is to achieve stakeholder alignment on a project before it begins.",
      time: "8:05 AM",
      senderName: "Jacob Jones",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jacob",
    },
    {
      id: 2,
      sender: "other",
      text: "Sound interesting!",
      time: "8:00 AM",
      senderName: "Wade Warren",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wade",
    },
    {
      id: 3,
      sender: "other",
      text: "What should we do to start",
      time: "8:30am",
      senderName: "Cameron Williamson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cameron",
    },
    {
      id: 4,
      sender: "me",
      text: "Step 1. The teams who need assistance from the creative team will retrieve the creative brief template from a repository like OneDrive, Google Drive, or an online form.",
      time: "8:35am",
      senderName: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContactId, setActiveContactId] = useState<number>(
    selectedContactId ?? 1,
  );

  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteMode, setDeleteMode] = useState<
    "everyone" | "local" | "yourself"
  >("everyone");
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null,
  );
  const [restrictedContentWarning, setRestrictedContentWarning] =
    useState(false);
  const [warningMessage, setWarningMessage] = useState<
    "email" | "phone" | null
  >(null);



  const defaultContacts: Contact[] = [
    {
      id: 1,
      name: "Jerome Bell",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jerome",
      lastMessage: "Hello, how are you!",
      time: "Just Now",
      unread: 2,
    },
    {
      id: 2,
      name: "Guy Hawkins",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guy",
      lastMessage: "Thanks! Look great!",
      time: "1 min",
    },
    {
      id: 3,
      name: "Marvin McKinney",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marvin",
      lastMessage: "Can you find a house for...",
      time: "1 min",
    },
    {
      id: 4,
      name: "Darlene Robertson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=darlene",
      lastMessage: "Send me over the latest...",
      time: "2 mins",
    },
    {
      id: 5,
      name: "Darrell Steward",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=darrell",
      lastMessage: "I will give you a nice com...",
      time: "15 mins",
    },
  ];

  const contacts = propsContacts || defaultContacts;
  const currentContact =
    contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Regex patterns for phone and email detection
  const phonePattern =
    /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}|[0-9]{7,11}|\+[0-9]{1,3}\s?[0-9]{0,14}/g;
  const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

  const containsRestrictedContent = (
    text: string,
  ): "email" | "phone" | null => {
    if (emailPattern.test(text)) {
      return "email";
    }
    if (phonePattern.test(text)) {
      return "phone";
    }
    return null;
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Check for restricted content
      const restrictedType = containsRestrictedContent(newMessage);
      if (restrictedType) {
        setRestrictedContentWarning(true);
        setWarningMessage(restrictedType);
        return;
      }

      const now = new Date();
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "me",
          text: newMessage,
          time: now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          senderName: "You",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
        },
      ]);
      setNewMessage("");
      setRestrictedContentWarning(false);
      setWarningMessage(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const now = new Date();
      const fileUrl = URL.createObjectURL(file);
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "me",
          text: `📎 ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          time: now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          senderName: "You",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
          fileUrl,
          fileName: file.name,
        },
      ]);
    }
  };



  const deleteMessage = (
    messageId: number,
    mode: "everyone" | "local" | "yourself" = "everyone",
  ) => {
    const messageToDelete = messages.find((msg) => msg.id === messageId);
    if (!messageToDelete) return;

    if (mode === "local") {
      // Delete only from local view (for other people's messages)
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, deletedLocally: true } : msg,
        ),
      );
      // Store in localStorage for persistence
      const localDeleted = JSON.parse(
        localStorage.getItem("locallyDeletedMessages") || "[]",
      );
      if (!localDeleted.includes(messageId)) {
        localDeleted.push(messageId);
        localStorage.setItem(
          "locallyDeletedMessages",
          JSON.stringify(localDeleted),
        );
      }
    } else if (mode === "yourself") {
      // Delete only your own message from your view
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, deletedLocally: true } : msg,
        ),
      );
      // Store in localStorage for persistence
      const localDeleted = JSON.parse(
        localStorage.getItem("locallyDeletedMessages") || "[]",
      );
      if (!localDeleted.includes(messageId)) {
        localDeleted.push(messageId);
        localStorage.setItem(
          "locallyDeletedMessages",
          JSON.stringify(localDeleted),
        );
      }
    } else {
      // Delete for everyone (only allowed for own messages)
      if (messageToDelete.sender === "me") {
        setMessages(messages.filter((msg) => msg.id !== messageId));
        // In a real app, this would sync to backend and notify other user
        // For now, we'll store deleted message IDs in localStorage
        const deletedMessages = JSON.parse(
          localStorage.getItem("deletedMessages") || "[]",
        );
        deletedMessages.push(messageId);
        localStorage.setItem(
          "deletedMessages",
          JSON.stringify(deletedMessages),
        );
      }
    }
  };

  const handleVoiceCall = () => {
    console.log('Starting voice call with:', currentContact.name);
    startVoiceCall(currentContact.name, currentContact.avatar);
  };

  const handleVideoCall = () => {
    console.log('Video calls not available - camera not detected');
    alert('Video calls are not available. Your camera was not detected. Voice calls are available instead.');
  };

  return (
    <div
      className={`${
        isModal
          ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          : "w-full h-full min-h-[620px]"
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-900 ${isModal ? "rounded-xl shadow-2xl w-full max-w-7xl h-[90vh]" : "w-full h-full rounded-lg shadow"} flex flex-col lg:flex-row overflow-hidden min-h-0`}
      >
        {/* Left Sidebar - Messages */}
        <div className="hidden lg:flex lg:w-64 border-r border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-gray-800 min-h-0">
          <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Messages
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-gray-400 text-sm"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Inbox & Explore Tabs */}
          <div className="flex gap-4 px-4 pt-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button className="pb-2 text-sm font-semibold text-primary border-b-2 border-primary dark:text-primary">
              <FontAwesomeIcon icon={faInbox} className="mr-2" />
              Inbox{" "}
              <span className="bg-primary text-white text-xs rounded-full px-2 ml-1">
                2
              </span>
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 p-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    activeContactId === contact.id
                      ? "bg-blue-50 dark:bg-blue-900 border-primary"
                      : "border-transparent hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900">
                          {contact.name}
                        </p>
                        {contact.unread && (
                          <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {contact.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-3">
              Groups
            </h3>
            <div className="space-y-2">
              <div className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Design Team
                </p>
                <p className="text-xs text-gray-500">1 min</p>
              </div>
              <div className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Human Resource Department
                </p>
                <p className="text-xs text-gray-500">2 mins</p>
              </div>
              <div className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Campaigns
                </p>
                <p className="text-xs text-gray-500">10 mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 h-full min-h-0 bg-white dark:bg-gray-900">
          {/* Chat Header */}
          <div className="shrink-0 sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-4">
              <img
                src={currentContact.avatar}
                alt={currentContact.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {currentContact.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {recipientRole}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleVoiceCall}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-400"
                title="Voice call"
              >
                <FontAwesomeIcon icon={faPhone} />
              </button>
              <button 
                onClick={handleVideoCall}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-400"
                title="Video call"
              >
                <FontAwesomeIcon icon={faVideo} />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-400">
                <FontAwesomeIcon icon={faEllipsisH} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-400 lg:hidden"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white dark:bg-gray-900 space-y-4">
            {messages.map(
              (msg) =>
                !msg.deletedLocally && (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div
                      className={`flex gap-3 max-w-2xl relative group ${msg.sender === "me" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={msg.sender === "me" ? "text-right" : ""}>
                        <p className="text-xs text-gray-500 mb-1">
                          {msg.senderName}
                        </p>
                        <div className="relative">
                          <div
                            className={`rounded-xl px-4 py-3 ${
                              msg.sender === "me"
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            {msg.fileUrl && msg.fileName && (
                              <div className="mt-2 flex gap-2">
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs underline hover:no-underline"
                                >
                                  Open
                                </a>
                                <a
                                  href={msg.fileUrl}
                                  download={msg.fileName}
                                  className="text-xs underline hover:no-underline"
                                >
                                  Save As
                                </a>
                              </div>
                            )}
                          </div>
                          {hoveredMessageId === msg.id && (
                            <button
                              onClick={() => {
                                setSelectedMessageId(msg.id);
                                setShowDeleteOptions(true);
                              }}
                              className={`absolute top-0 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition ${
                                msg.sender === "me"
                                  ? "right-full mr-2"
                                  : "left-full ml-2"
                              }`}
                              title="Delete message"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>

          {/* Message Input */}
          <div className="shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            {restrictedContentWarning && warningMessage && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-400">
                        {warningMessage === "email"
                          ? "Email addresses not allowed"
                          : "Phone numbers not allowed"}
                      </p>
                      <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                        {warningMessage === "email"
                          ? "For security and privacy reasons, sharing email addresses is not permitted in this chat."
                          : "For security and privacy reasons, sharing phone numbers is not permitted in this chat."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRestrictedContentWarning(false);
                      setWarningMessage(null);
                    }}
                    className="flex-shrink-0 ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Attach file"
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={t("chat.typeMessage") || "Type a message..."}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition"
                title="Send message"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Options Modal */}
      {showDeleteOptions && selectedMessageId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Delete Message
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Choose how you want to delete this message:
              </p>
              <div className="space-y-3">
                {messages.find((msg) => msg.id === selectedMessageId)
                  ?.sender === "me" && (
                  <>
                    <button
                      onClick={() => {
                        setDeleteMode("everyone");
                        setDeleteConfirmId(selectedMessageId);
                        setShowDeleteOptions(false);
                      }}
                      className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Delete for Everyone
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        The message will be removed for all participants
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteMode("yourself");
                        setDeleteConfirmId(selectedMessageId);
                        setShowDeleteOptions(false);
                      }}
                      className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Delete for Yourself only
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Only you will see this message as deleted
                      </p>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setDeleteMode("local");
                    setDeleteConfirmId(selectedMessageId);
                    setShowDeleteOptions(false);
                  }}
                  className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Remove from Your Chat
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Hide this message from your view only
                  </p>
                </button>
              </div>
              <button
                onClick={() => setShowDeleteOptions(false)}
                className="w-full mt-4 px-6 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <svg
                  className="h-10 w-10 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {deleteMode === "everyone"
                  ? "Delete Message for Everyone?"
                  : deleteMode === "yourself"
                    ? "Delete Message for Yourself?"
                    : "Remove Message from Your Chat?"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {deleteMode === "everyone"
                  ? "This message will be removed for everyone. This action cannot be undone."
                  : deleteMode === "yourself"
                    ? "This message will only be removed from your view. It will remain visible to others."
                    : "This message will only be removed from your view. The other person will still see it."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmId !== null) {
                      deleteMessage(deleteConfirmId, deleteMode);
                    }
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {deleteMode === "everyone"
                    ? "Delete for Everyone"
                    : deleteMode === "yourself"
                      ? "Delete for Yourself"
                      : "Remove from My Chat"}
                </button>
              </div>
            </div>
          </div>
        </div>
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
