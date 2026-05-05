import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import {
  BookingChatThread,
  ChatMessage,
  getBookingChatThread,
  sendBookingChatMessage,
} from "../services/api";

interface BookingChatPanelProps {
  bookingId: string;
  currentUserId?: string;
  onClose: () => void;
  isModal?: boolean;
}

const refreshIntervalMs = 12000;

export default function BookingChatPanel({
  bookingId,
  currentUserId,
  onClose,
  isModal = true,
}: BookingChatPanelProps) {
  const [thread, setThread] = useState<BookingChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const loadThread = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await getBookingChatThread(bookingId);
        setThread(response.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load chat messages.",
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [bookingId],
  );

  useEffect(() => {
    void loadThread();

    const intervalId = window.setInterval(() => {
      void loadThread(true);
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadThread]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  const roomLabel = useMemo(() => {
    if (!thread?.room) {
      return "Booking Chat";
    }

    return thread.room.counterpartName;
  }, [thread]);

  const roomSubtitle = useMemo(() => {
    if (!thread?.room) {
      return "";
    }

    return thread.room.viewerRole === "planner"
      ? `Vendor: ${thread.room.vendorBusinessName}`
      : `Event: ${thread.room.eventName}`;
  }, [thread]);

  const getSenderName = (message: ChatMessage) => {
    if (message.senderId === currentUserId) {
      return "You";
    }

    if (thread?.room.counterpartName) {
      return thread.room.counterpartName;
    }

    const fullName =
      `${message.sender.firstName} ${message.sender.lastName}`.trim();
    return fullName || "Participant";
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    const content = draft.trim();
    if (!content || sending) {
      return;
    }

    try {
      setSending(true);
      const response = await sendBookingChatMessage(bookingId, content);
      setThread((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          messages: [...previous.messages, response.data],
        };
      });
      setDraft("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const content = (
    <div className="flex h-full min-h-[540px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div>
          <h3 className="text-base font-semibold text-neutral dark:text-white">
            {roomLabel}
          </h3>
          {roomSubtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {roomSubtitle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading && !thread ? (
        <div className="flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">Loading chat...</span>
        </div>
      ) : error && !thread ? (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-semibold">Unable to open this chat.</p>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => void loadThread()}
            className="mt-3 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(thread?.messages.length || 0) === 0 && (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
                <MessageCircle className="mb-2 h-6 w-6" />
                <p>No messages yet.</p>
                <p>Start the conversation below.</p>
              </div>
            )}

            {thread?.messages.map((message) => {
              const isMine =
                Boolean(currentUserId) && message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      isMine
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <p
                      className={`mb-1 text-xs ${isMine ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {getSenderName(message)}
                    </p>
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={`mt-1 text-[11px] ${isMine ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={listEndRef} />
          </div>

          {error && thread && (
            <div className="mx-4 mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={sending || draft.trim().length === 0}
                className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="h-[88vh] w-full max-w-3xl">{content}</div>
    </div>
  );
}
