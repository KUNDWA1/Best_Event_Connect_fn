import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faUser,
  faPhone,
  faCreditCard,
  faCalendarAlt,
  faDollarSign,
  faLock,
  faUsers,
  faPen,
  faTrash,
  faEye,
  faSearch,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  getEventDisplayType,
  stripCustomEventTypePrefix,
} from "../utils/eventCategories";
import {
  createEventCategory,
  createServiceCategory,
  deleteEvent,
  deleteEventCategory,
  deleteServiceCategory,
  deleteUser,
  getEventCategories,
  getEventsByAccess,
  getServiceCategories,
  getUsers,
  getVendors,
  type EventCategory,
  type ServiceCategory,
  updateVendorVerification,
  type AdminUserRecord,
  type Event,
  type EventInput,
  type EventStatus,
  type EventVisibility,
  type PaginationMeta,
  type UpdateAdminUserPayload,
  type VendorInfo,
  updateEvent,
  updateEventCategory,
  updateServiceCategory,
  updateUser,
} from "../services/api";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard-overview");
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Admin";
  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "A";

  const [escrowPayments, setEscrowPayments] = useState([
    {
      id: 1,
      eventName: "John & Mary Wedding",
      planner: "Sarah Johnson",
      vendor: "Elite Photography Studio",
      amount: 300000,
      status: "held",
      date: "June 20, 2024",
    },
    {
      id: 2,
      eventName: "Corporate Gala",
      planner: "Mike Peters",
      vendor: "Royal Catering Services",
      amount: 1500000,
      status: "held",
      date: "July 5, 2024",
    },
    {
      id: 3,
      eventName: "Birthday Party",
      planner: "Emma Wilson",
      vendor: "Perfect Decorations",
      amount: 200000,
      status: "released",
      date: "June 15, 2024",
    },
  ]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendorsPagination, setVendorsPagination] =
    useState<PaginationMeta | null>(null);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [vendorVerificationFilter, setVendorVerificationFilter] = useState<
    "verified" | "unverified"
  >("verified");
  const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null);
  const [vendorVerificationActionId, setVendorVerificationActionId] = useState<
    string | null
  >(null);
  const [transactionHistory] = useState([
    {
      id: "TXN-7801",
      eventName: "John & Mary Wedding",
      amount: 300000,
      status: "released",
      date: "Mar 03, 2026",
    },
    {
      id: "TXN-7802",
      eventName: "Corporate Gala",
      amount: 1500000,
      status: "held",
      date: "Mar 05, 2026",
    },
    {
      id: "TXN-7803",
      eventName: "Birthday Party",
      amount: 200000,
      status: "released",
      date: "Mar 08, 2026",
    },
    {
      id: "TXN-7804",
      eventName: "Design Expo",
      amount: 760000,
      status: "released",
      date: "Mar 10, 2026",
    },
  ]);
  const [refundCases, setRefundCases] = useState([
    {
      id: "DS-12",
      subject: "Catering no-show refund",
      amount: 420000,
      status: "under-review",
    },
    {
      id: "DS-13",
      subject: "Double payment dispute",
      amount: 180000,
      status: "awaiting-evidence",
    },
  ]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [newEventCategory, setNewEventCategory] = useState("");
  const [eventCategoriesLoading, setEventCategoriesLoading] = useState(false);
  const [eventCategoriesError, setEventCategoriesError] = useState<
    string | null
  >(null);
  const [creatingEventCategory, setCreatingEventCategory] = useState(false);
  const [eventCategoryActionId, setEventCategoryActionId] = useState<
    string | null
  >(null);
  const [editingEventCategoryId, setEditingEventCategoryId] = useState<
    string | null
  >(null);
  const [editingEventCategoryName, setEditingEventCategoryName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [serviceCategoriesLoading, setServiceCategoriesLoading] =
    useState(false);
  const [serviceCategoriesError, setServiceCategoriesError] = useState<
    string | null
  >(null);
  const [creatingServiceCategory, setCreatingServiceCategory] = useState(false);
  const [serviceCategoryActionId, setServiceCategoryActionId] = useState<
    string | null
  >(null);
  const [editingServiceCategoryId, setEditingServiceCategoryId] = useState<
    string | null
  >(null);
  const [editingServiceCategoryName, setEditingServiceCategoryName] =
    useState("");
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      messageKey: "adminDash.announcements.seedMessage",
      dateKey: "adminDash.announcements.seedDate",
      message: "",
      createdAt: "",
    },
  ]);
  const [announcementInput, setAnnouncementInput] = useState("");
  const [reports, setReports] = useState([
    {
      id: "RP-401", typeKey: "adminDash.reportsComplaints.typeVendor", titleKey: "adminDash.reportsComplaints.titleUnprofessional", type: "", title: "", status: "open",
    },
    {
      id: "RP-402", typeKey: "adminDash.reportsComplaints.typeEvent", titleKey: "adminDash.reportsComplaints.titleMisleading", type: "", title: "", status: "open",
    },
  ]);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      reviewer: "Diane U.",
      target: "Elite Photography Studio",
      rating: 2,
      status: "published",
    },
    {
      id: 2,
      reviewer: "Kevin M.",
      target: "Royal Catering Services",
      rating: 5,
      status: "published",
    },
  ]);
  const [auditSearch, setAuditSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<
    "all" | EventStatus
  >("all");
  const [eventVisibilityFilter, setEventVisibilityFilter] = useState<
    "all" | EventVisibility
  >("all");
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventActionError, setEventActionError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [editEventForm, setEditEventForm] = useState<Partial<EventInput>>({
    title: "",
    description: "",
    eventType: "wedding",
    status: "draft",
    visibility: "public",
    startDate: "",
    endDate: "",
    location: "",
    budget: 0,
    guestCount: 0,
  });
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPagination, setUsersPagination] = useState<PaginationMeta | null>(
    null,
  );
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(
    null,
  );
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(
    null,
  );
  const [usersPage, setUsersPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState<
    "all" | "vendor" | "planner" | "admin" | "event_planner"
  >("all");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [editUserForm, setEditUserForm] = useState<UpdateAdminUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "planner",
  });

  const loadUsers = async (page = usersPage) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      setUserActionError(null);
      const response = await getUsers({
        page,
        limit: 10,
        role: userRoleFilter === "all" ? undefined : userRoleFilter,
        search: userSearchQuery || undefined,
      });
      setUsers(response.data || []);
      setUsersPagination(response.pagination || null);
      setUsersPage(page);
    } catch (error) {
      setUsersError(
        error instanceof Error ? error.message : "Failed to retrieve users.",
      );
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAllEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const response = await getEventsByAccess({
        role: "admin",
      });

      setAllEvents(response.data || []);
    } catch (error) {
      setEventsError(
        error instanceof Error ? error.message : "Failed to retrieve events.",
      );
    } finally {
      setEventsLoading(false);
    }
  };

  const loadVendors = async (page = vendorsPage) => {
    try {
      setVendorsLoading(true);
      setVendorsError(null);

      const response = await getVendors({
        isVerified: vendorVerificationFilter === "verified",
        page,
        limit: 10,
      });

      setVendors(response.data || []);
      setVendorsPagination(response.pagination || null);
      setVendorsPage(page);
    } catch (error) {
      setVendorsError(
        error instanceof Error ? error.message : "Failed to retrieve vendors.",
      );
    } finally {
      setVendorsLoading(false);
    }
  };

  const normalizeCategoryName = (value: string) =>
    value.trim().replace(/\s+/g, " ");

  const hasDuplicateEventCategory = (name: string, excludedId?: string) => {
    const normalizedName = normalizeCategoryName(name).toLocaleLowerCase();

    return eventCategories.some(
      (category) =>
        category.id !== excludedId &&
        normalizeCategoryName(category.name).toLocaleLowerCase() ===
          normalizedName,
    );
  };

  const hasDuplicateServiceCategory = (name: string, excludedId?: string) => {
    const normalizedName = normalizeCategoryName(name).toLocaleLowerCase();

    return serviceCategories.some(
      (category) =>
        category.id !== excludedId &&
        normalizeCategoryName(category.name).toLocaleLowerCase() ===
          normalizedName,
    );
  };

  const loadEventCategories = async () => {
    try {
      setEventCategoriesLoading(true);
      setEventCategoriesError(null);

      const response = await getEventCategories();
      setEventCategories(response.data || []);
    } catch (error) {
      setEventCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to retrieve event categories.",
      );
    } finally {
      setEventCategoriesLoading(false);
    }
  };

  const loadServiceCategories = async () => {
    try {
      setServiceCategoriesLoading(true);
      setServiceCategoriesError(null);

      const response = await getServiceCategories();
      setServiceCategories(response.data || []);
    } catch (error) {
      setServiceCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to retrieve service categories.",
      );
    } finally {
      setServiceCategoriesLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTab === "manage-users") {
      void loadUsers(1);
    }
  }, [activeTab, userRoleFilter, userSearchQuery]);

  useEffect(() => {
    if (activeTab === "all-events" || activeTab === "dashboard-overview") {
      void loadAllEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "vendors") {
      void loadVendors(1);
    }
  }, [activeTab, vendorVerificationFilter]);

  useEffect(() => {
    if (activeTab === "event-categories") {
      void loadEventCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "service-categories") {
      void loadServiceCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "manage-users") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextQuery = userSearchInput.trim();
      setSelectedUser(null);
      setUserSearchQuery((prev) => (prev === nextQuery ? prev : nextQuery));
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, userSearchInput]);

  useEffect(() => {
    if (!userActionSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setUserActionSuccess(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [userActionSuccess]);

  const formatUserRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const formatUserDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatEventDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const toIsoDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid date format");
    }

    return parsed.toISOString();
  };

  const getVisiblePageNumbers = () => {
    const totalPages = usersPagination?.totalPages || 1;
    const startPage = Math.max(1, usersPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    const adjustedStartPage = Math.max(1, endPage - 4);

    return Array.from(
      { length: endPage - adjustedStartPage + 1 },
      (_, index) => adjustedStartPage + index,
    );
  };

  const getVisibleVendorPageNumbers = () => {
    const totalPages = vendorsPagination?.totalPages || 1;
    const startPage = Math.max(1, vendorsPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    const adjustedStartPage = Math.max(1, endPage - 4);

    return Array.from(
      { length: endPage - adjustedStartPage + 1 },
      (_, index) => adjustedStartPage + index,
    );
  };

  const adminTabMeta: Record<string, { title: string; description: string }> = {
    "dashboard-overview": {
      title: t("adminDash.tabs.dashboardOverview"),
      description: t("adminDash.tabs.dashboardOverviewDesc"),
    },
    "all-events": {
      title: t("adminDash.tabs.allEvents"),
      description: t("adminDash.tabs.allEventsDesc"),
    },
    "flagged-events": {
      title: t("adminDash.tabs.flaggedEvents"),
      description: t("adminDash.tabs.flaggedEventsDesc"),
    },
    vendors: {
      title: t("adminDash.tabs.vendors"),
      description: t("adminDash.tabs.vendorsDesc"),
    },
    "manage-users": {
      title: t("adminDash.tabs.manageUsers"),
      description: t("adminDash.tabs.manageUsersDesc"),
    },
    "escrow-payments": {
      title: t("adminDash.tabs.escrowPayments"),
      description: t("adminDash.tabs.escrowPaymentsDesc"),
    },
    "transaction-history": {
      title: t("adminDash.tabs.transactionHistory"),
      description: t("adminDash.tabs.transactionHistoryDesc"),
    },
    "refunds-disputes": {
      title: t("adminDash.tabs.refundsDisputes"),
      description: t("adminDash.tabs.refundsDisputesDesc"),
    },
    "event-categories": {
      title: t("adminDash.tabs.eventCategories"),
      description: t("adminDash.tabs.eventCategoriesDesc"),
    },
    "service-categories": {
      title: t("adminDash.tabs.serviceCategories"),
      description: t("adminDash.tabs.serviceCategoriesDesc"),
    },
    announcements: {
      title: t("adminDash.tabs.announcements"),
      description: t("adminDash.tabs.announcementsDesc"),
    },
    "reports-complaints": {
      title: t("adminDash.tabs.reportsComplaints"),
      description: t("adminDash.tabs.reportsComplaintsDesc"),
    },
    "reviews-management": {
      title: t("adminDash.tabs.reviewsManagement"),
      description: t("adminDash.tabs.reviewsManagementDesc"),
    },
    "audit-logs": {
      title: t("adminDash.tabs.auditLogs"),
      description: t("adminDash.tabs.auditLogsDesc"),
    },
  };

  const overviewMetrics = [
    {
      id: "manage-users",
      label: t("adminDash.stats.totalUsers"),
      value:
        usersPagination?.totalCount ?? (users.length > 0 ? users.length : 128),
      icon: faUsers,
      color: "text-primary",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "all-events",
      label: t("adminDash.stats.totalEvents"),
      value: allEvents.length,
      icon: faCalendarAlt,
      color: "text-primary-soft",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      id: "transaction-history",
      label: t("adminDash.stats.bookings"),
      value: 326,
      icon: faCheck,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "escrow-payments",
      label: t("adminDash.stats.revenue"),
      value: `${transactionHistory
        .reduce((sum, item) => sum + item.amount, 0)
        .toLocaleString()} RWF`,
      icon: faDollarSign,
      color: "text-accent",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "manage-users",
      label: t("adminDash.stats.newSignups"),
      value: 14,
      icon: faUser,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  const filteredEvents = allEvents.filter((eventRecord) => {
    const matchesStatus =
      eventStatusFilter === "all" || eventRecord.status === eventStatusFilter;
    const matchesVisibility =
      eventVisibilityFilter === "all" ||
      eventRecord.visibility === eventVisibilityFilter;

    return matchesStatus && matchesVisibility;
  });

  // Backend currently does not expose a dedicated flagged field for events.
  const flaggedEvents = allEvents.filter(
    (eventRecord) => eventRecord.status === "cancelled",
  );

  const auditLogKeys = [
    "adminDash.auditLogs.log1",
    "adminDash.auditLogs.log2",
    "adminDash.auditLogs.log3",
    "adminDash.auditLogs.log4",
  ];

  const auditLogs = auditLogKeys.filter((key) =>
    t(key).toLowerCase().includes(auditSearch.trim().toLowerCase()),
  );

  const handleResolveFlag = async (eventId: string) => {
    try {
      setEventActionError(null);
      const response = await updateEvent(eventId, {
        status: "published",
      });

      setAllEvents((prev) =>
        prev.map((eventRecord) =>
          eventRecord.id === eventId ? response.data : eventRecord,
        ),
      );
      setUserActionSuccess("Event moderation status updated.");
    } catch (error) {
      setEventActionError(
        error instanceof Error
          ? error.message
          : "Failed to update event moderation status.",
      );
    }
  };

  const handleVendorPageChange = (page: number) => {
    setSelectedVendor(null);
    void loadVendors(page);
  };

  const handleToggleVendorVerification = async (vendor: VendorInfo) => {
    const nextIsVerified = !Boolean(vendor.isVerified);

    try {
      setVendorVerificationActionId(vendor.id);
      setVendorsError(null);

      const response = await updateVendorVerification(
        vendor.id,
        nextIsVerified,
      );
      const updatedVendor = response.data;

      setVendors((prev) =>
        prev.map((item) =>
          item.id === vendor.id
            ? { ...item, ...updatedVendor, user: item.user }
            : item,
        ),
      );

      setSelectedVendor((prev) =>
        prev?.id === vendor.id
          ? { ...prev, ...updatedVendor, user: prev.user }
          : prev,
      );

      setUserActionSuccess(
        `Vendor verification updated to ${nextIsVerified ? "verified" : "unverified"}.`,
      );

      void loadVendors(vendorsPage);
    } catch (error) {
      setVendorsError(
        error instanceof Error
          ? error.message
          : "Failed to update vendor verification status.",
      );
    } finally {
      setVendorVerificationActionId(null);
    }
  };

  const handleViewEvent = (eventRecord: Event) => {
    setSelectedEvent(eventRecord);
    setEventActionError(null);
  };

  const handleEditEvent = (eventRecord: Event) => {
    setEditingEventId(eventRecord.id);
    setEventActionError(null);
    setEditEventForm({
      title: eventRecord.title,
      description: eventRecord.description,
      eventType: eventRecord.eventType,
      status: eventRecord.status,
      visibility: eventRecord.visibility,
      startDate: eventRecord.startDate.slice(0, 10),
      endDate: eventRecord.endDate.slice(0, 10),
      location: eventRecord.location,
      budget: eventRecord.budget,
      guestCount: eventRecord.guestCount,
    });
  };

  const handleCancelEditEvent = () => {
    setEditingEventId(null);
    setEditEventForm({
      title: "",
      description: "",
      eventType: "wedding",
      status: "draft",
      visibility: "public",
      startDate: "",
      endDate: "",
      location: "",
      budget: 0,
      guestCount: 0,
    });
  };

  const handleEditEventChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setEditEventForm((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "guestCount" ? Number(value) : value,
    }));
  };

  const handleSaveEvent = async () => {
    if (!editingEventId) {
      return;
    }

    if (!editEventForm.title?.trim()) {
      setEventActionError("Event title is required.");
      return;
    }

    if (!editEventForm.location?.trim()) {
      setEventActionError("Event location is required.");
      return;
    }

    if (!editEventForm.startDate || !editEventForm.endDate) {
      setEventActionError("Start date and end date are required.");
      return;
    }

    try {
      setIsSavingEvent(true);
      setEventActionError(null);

      const normalizedStartDate = toIsoDateTime(editEventForm.startDate);
      const normalizedEndDate = toIsoDateTime(editEventForm.endDate);

      const currentEvent = allEvents.find(
        (eventRecord) => eventRecord.id === editingEventId,
      );

      const basePayload: Partial<EventInput> = {
        title: editEventForm.title.trim(),
        description: editEventForm.description?.trim() || "",
        eventType: editEventForm.eventType,
        visibility: editEventForm.visibility,
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        location: editEventForm.location.trim(),
        budget: Number(editEventForm.budget || 0),
        guestCount: Number(editEventForm.guestCount || 0),
        ...(currentEvent?.imageUrl ? { imageUrl: currentEvent.imageUrl } : {}),
      };

      const payloadWithStatus: Partial<EventInput> = {
        ...basePayload,
        ...(editEventForm.status ? { status: editEventForm.status } : {}),
      };

      let response;
      try {
        response = await updateEvent(editingEventId, payloadWithStatus);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message.toLowerCase() : "";

        // Some backend validators reject status updates for PUT /events/:id.
        if (errorMessage.includes("status")) {
          response = await updateEvent(editingEventId, basePayload);
        } else {
          throw error;
        }
      }

      setAllEvents((prev) =>
        prev.map((eventRecord) =>
          eventRecord.id === editingEventId ? response.data : eventRecord,
        ),
      );
      setSelectedEvent((prev) =>
        prev?.id === editingEventId ? response.data : prev,
      );

      setUserActionSuccess("Event updated successfully.");
      handleCancelEditEvent();
    } catch (error) {
      setEventActionError(
        error instanceof Error ? error.message : "Failed to update event.",
      );
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this event?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingEventId(eventId);
      setEventActionError(null);

      await deleteEvent(eventId);

      setAllEvents((prev) =>
        prev.filter((eventRecord) => eventRecord.id !== eventId),
      );
      setSelectedEvent((prev) => (prev?.id === eventId ? null : prev));

      if (editingEventId === eventId) {
        handleCancelEditEvent();
      }

      setUserActionSuccess("Event deleted successfully.");
    } catch (error) {
      setEventActionError(
        error instanceof Error ? error.message : "Failed to delete event.",
      );
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleRefundStatusUpdate = (caseId: string, status: string) => {
    setRefundCases((prev) =>
      prev.map((item) => (item.id === caseId ? { ...item, status } : item)),
    );
  };

  const handleStartEditEventCategory = (category: EventCategory) => {
    setEventCategoriesError(null);
    setEditingEventCategoryId(category.id);
    setEditingEventCategoryName(category.name);
  };

  const handleCancelEditEventCategory = () => {
    setEditingEventCategoryId(null);
    setEditingEventCategoryName("");
  };

  const handleAddEventCategory = async () => {
    const value = normalizeCategoryName(newEventCategory);
    if (!value) {
      setEventCategoriesError("Event category name is required.");
      return;
    }

    if (hasDuplicateEventCategory(value)) {
      setEventCategoriesError("That event category already exists.");
      return;
    }

    try {
      setCreatingEventCategory(true);
      setEventCategoriesError(null);

      const response = await createEventCategory({ name: value });

      setEventCategories((prev) => [...prev, response.data]);
      setNewEventCategory("");
      setUserActionSuccess("Event category created successfully.");
    } catch (error) {
      setEventCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to create event category.",
      );
    } finally {
      setCreatingEventCategory(false);
    }
  };

  const handleUpdateEventCategory = async (categoryId: string) => {
    const value = normalizeCategoryName(editingEventCategoryName);

    if (!value) {
      setEventCategoriesError("Event category name is required.");
      return;
    }

    if (hasDuplicateEventCategory(value, categoryId)) {
      setEventCategoriesError("That event category already exists.");
      return;
    }

    try {
      setEventCategoryActionId(categoryId);
      setEventCategoriesError(null);

      const response = await updateEventCategory(categoryId, { name: value });

      setEventCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId ? response.data : category,
        ),
      );
      handleCancelEditEventCategory();
      setUserActionSuccess("Event category updated successfully.");
    } catch (error) {
      setEventCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to update event category.",
      );
    } finally {
      setEventCategoryActionId(null);
    }
  };

  const handleDeleteEventCategory = async (category: EventCategory) => {
    const shouldDelete = window.confirm(
      `Delete the event category \"${category.name}\"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setEventCategoryActionId(category.id);
      setEventCategoriesError(null);

      await deleteEventCategory(category.id);

      setEventCategories((prev) =>
        prev.filter((item) => item.id !== category.id),
      );

      if (editingEventCategoryId === category.id) {
        handleCancelEditEventCategory();
      }

      setUserActionSuccess("Event category deleted successfully.");
    } catch (error) {
      setEventCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to delete event category.",
      );
    } finally {
      setEventCategoryActionId(null);
    }
  };

  const handleAddServiceCategory = () => {
    const value = normalizeCategoryName(newServiceCategory);
    if (!value) {
      setServiceCategoriesError("Service category name is required.");
      return;
    }

    if (hasDuplicateServiceCategory(value)) {
      setServiceCategoriesError("That service category already exists.");
      return;
    }

    void (async () => {
      try {
        setCreatingServiceCategory(true);
        setServiceCategoriesError(null);

        const response = await createServiceCategory({ name: value });

        setServiceCategories((prev) => [...prev, response.data]);
        setNewServiceCategory("");
        setUserActionSuccess("Service category created successfully.");
      } catch (error) {
        setServiceCategoriesError(
          error instanceof Error
            ? error.message
            : "Failed to create service category.",
        );
      } finally {
        setCreatingServiceCategory(false);
      }
    })();
  };

  const handleStartEditServiceCategory = (category: ServiceCategory) => {
    setServiceCategoriesError(null);
    setEditingServiceCategoryId(category.id);
    setEditingServiceCategoryName(category.name);
  };

  const handleCancelEditServiceCategory = () => {
    setEditingServiceCategoryId(null);
    setEditingServiceCategoryName("");
  };

  const handleUpdateServiceCategory = async (categoryId: string) => {
    const value = normalizeCategoryName(editingServiceCategoryName);

    if (!value) {
      setServiceCategoriesError("Service category name is required.");
      return;
    }

    if (hasDuplicateServiceCategory(value, categoryId)) {
      setServiceCategoriesError("That service category already exists.");
      return;
    }

    try {
      setServiceCategoryActionId(categoryId);
      setServiceCategoriesError(null);

      const response = await updateServiceCategory(categoryId, { name: value });

      setServiceCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId ? response.data : category,
        ),
      );
      handleCancelEditServiceCategory();
      setUserActionSuccess("Service category updated successfully.");
    } catch (error) {
      setServiceCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to update service category.",
      );
    } finally {
      setServiceCategoryActionId(null);
    }
  };

  const handleDeleteServiceCategory = async (category: ServiceCategory) => {
    const shouldDelete = window.confirm(
      `Delete the service category \"${category.name}\"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setServiceCategoryActionId(category.id);
      setServiceCategoriesError(null);

      await deleteServiceCategory(category.id);

      setServiceCategories((prev) =>
        prev.filter((item) => item.id !== category.id),
      );

      if (editingServiceCategoryId === category.id) {
        handleCancelEditServiceCategory();
      }

      setUserActionSuccess("Service category deleted successfully.");
    } catch (error) {
      setServiceCategoriesError(
        error instanceof Error
          ? error.message
          : "Failed to delete service category.",
      );
    } finally {
      setServiceCategoryActionId(null);
    }
  };

  const handlePublishAnnouncement = () => {
    const value = announcementInput.trim();
    if (!value) {
      return;
    }

    setAnnouncements((prev) => [
      {
        id: Date.now(),
        messageKey: "",
        dateKey: "",
        message: value,
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      },
      ...prev,
    ]);
    setAnnouncementInput("");
  };

  const handleMarkReportResolved = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" } : report,
      ),
    );
  };

  const handleToggleReviewStatus = (reviewId: number) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: review.status === "published" ? "hidden" : "published",
            }
          : review,
      ),
    );
  };

  const handleSearchUsers = () => {
    const nextQuery = userSearchInput.trim();

    setSelectedUser(null);

    if (nextQuery === userSearchQuery) {
      void loadUsers(1);
      return;
    }

    setUserSearchQuery(nextQuery);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(null);
    setUserRoleFilter(
      e.target.value as
        | "all"
        | "vendor"
        | "planner"
        | "admin"
        | "event_planner",
    );
  };

  const handleViewUser = (managedUser: AdminUserRecord) => {
    setSelectedUser(managedUser);
    setUserActionError(null);
  };

  const handleUsersPageChange = (page: number) => {
    setSelectedUser(null);
    void loadUsers(page);
  };

  const handleEditUser = (managedUser: AdminUserRecord) => {
    setEditingUserId(managedUser.id);
    setUserActionError(null);
    setEditUserForm({
      firstName: managedUser.firstName,
      lastName: managedUser.lastName,
      email: managedUser.email,
      phone: managedUser.phone || "",
      role: managedUser.role,
    });
  };

  const handleEditUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setEditUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setUserActionError(null);
    setEditUserForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "planner",
    });
  };

  const handleSaveUser = async () => {
    if (!editingUserId) {
      return;
    }

    if (!editUserForm.firstName?.trim() || !editUserForm.lastName?.trim()) {
      setUserActionError("First name and last name are required.");
      return;
    }

    if (!editUserForm.email?.trim()) {
      setUserActionError("Email is required.");
      return;
    }

    try {
      setIsSavingUser(true);
      setUserActionError(null);

      const payload: UpdateAdminUserPayload = {
        firstName: editUserForm.firstName.trim(),
        lastName: editUserForm.lastName.trim(),
        email: editUserForm.email.trim(),
        phone: editUserForm.phone?.trim() || undefined,
        role: editUserForm.role,
      };

      const response = await updateUser(editingUserId, payload);

      setUsers((prev) =>
        prev.map((managedUser) =>
          managedUser.id === editingUserId ? response.data : managedUser,
        ),
      );
      setSelectedUser((prev) =>
        prev?.id === editingUserId ? response.data : prev,
      );
      setUserActionSuccess("User updated successfully.");
      handleCancelEditUser();
    } catch (error) {
      setUserActionError(
        error instanceof Error ? error.message : "Failed to update user.",
      );
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setActionUserId(userId);
      setUserActionError(null);
      await deleteUser(userId);
      setUsers((prev) =>
        prev.filter((managedUser) => managedUser.id !== userId),
      );
      setUsersPagination((prev) =>
        prev
          ? {
              ...prev,
              totalCount: Math.max(prev.totalCount - 1, 0),
            }
          : prev,
      );

      if (editingUserId === userId) {
        handleCancelEditUser();
      }

      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }

      setUserActionSuccess("User deleted successfully.");
    } catch (error) {
      setUserActionError(
        error instanceof Error ? error.message : "Failed to delete user.",
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handlePaymentRelease = (id: number) => {
    setEscrowPayments(
      escrowPayments.map((p) =>
        p.id === id ? { ...p, status: "released" } : p,
      ),
    );
  };

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <DashboardSidebar
        userType="admin"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 lg:ml-[var(--dashboard-sidebar-width)] transition-all duration-300">
        <DashboardHeader
          title={t("adminDash.title")}
          subtitle={t("adminDash.subtitle")}
          userName={displayName}
          userInitials={userInitials}
        />

        {userActionSuccess && (
          <div className="fixed top-6 right-6 z-50 max-w-sm rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faCheck}
                className="mt-0.5 w-4 h-4 text-green-600"
              />
              <div className="flex-1">
                <p className="font-semibold text-green-800">{t("adminDash.success")}</p>
                <p className="text-sm text-green-700">{userActionSuccess}</p>
              </div>
              <button
                type="button"
                onClick={() => setUserActionSuccess(null)}
                className="text-green-700 hover:text-green-900"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-5">
              <h3 className="text-2xl font-bold text-neutral dark:text-white">
                {adminTabMeta[activeTab]?.title || "Admin Workspace"}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {adminTabMeta[activeTab]?.description ||
                  "Select an admin section from the sidebar."}
              </p>
            </div>

            <div className="p-6">
              {activeTab === "dashboard-overview" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    {overviewMetrics.map((metric, index) => (
                      <button
                        key={`${metric.label}-${index}`}
                        type="button"
                        onClick={() => handleTabChange(metric.id)}
                        className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left transition hover:shadow-md hover:-translate-y-0.5 ${metric.bg}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {metric.label}
                          </p>
                          <FontAwesomeIcon
                            icon={metric.icon}
                            className={`w-4 h-4 ${metric.color}`}
                          />
                        </div>
                        <p
                          className={`mt-3 text-2xl font-bold ${metric.color}`}
                        >
                          {metric.value}
                        </p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {t("adminDash.clickToOpen")}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => handleTabChange("flagged-events")}
                      className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-5 text-left transition hover:shadow-md"
                    >
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        {t("adminDash.openModerationQueue")}
                      </p>
                      <p className="mt-2 text-xl font-bold text-amber-800 dark:text-amber-200">
                        {flaggedEvents.length} {t("adminDash.flaggedEvents")}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("refunds-disputes")}
                      className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-5 text-left transition hover:shadow-md"
                    >
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        {t("adminDash.pendingDisputes")}
                      </p>
                      <p className="mt-2 text-xl font-bold text-red-800 dark:text-red-200">
                        {refundCases.length} {t("adminDash.activeCases")}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("announcements")}
                      className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-5 text-left transition hover:shadow-md"
                    >
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {t("adminDash.latestAnnouncements")}
                      </p>
                      <p className="mt-2 text-xl font-bold text-blue-800 dark:text-blue-200">
                        {announcements.length} {t("adminDash.published")}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "all-events" && (
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {t("adminDash.events.statusLabel")}
                        </label>
                        <select
                          value={eventStatusFilter}
                          onChange={(e) =>
                            setEventStatusFilter(
                              e.target.value as "all" | EventStatus,
                            )
                          }
                          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                        >
                          <option value="all">{t("adminDash.events.filterAll")}</option>
                          <option value="draft">{t("adminDash.events.filterDraft")}</option>
                          <option value="active">{t("adminDash.events.filterActive")}</option>
                          <option value="completed">{t("adminDash.events.filterCompleted")}</option>
                          <option value="cancelled">{t("adminDash.events.filterCancelled")}</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {t("adminDash.events.visibilityLabel")}
                        </label>
                        <select
                          value={eventVisibilityFilter}
                          onChange={(e) =>
                            setEventVisibilityFilter(
                              e.target.value as "all" | EventVisibility,
                            )
                          }
                          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                        >
                          <option value="all">{t("adminDash.events.filterAll")}</option>
                          <option value="public">{t("adminDash.events.filterPublic")}</option>
                          <option value="private">{t("adminDash.events.filterPrivate")}</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("adminDash.events.showing", { count: filteredEvents.length, total: allEvents.length })}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadAllEvents()}
                        disabled={eventsLoading}
                        className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {eventsLoading ? t("common.loading") : t("adminDash.events.refresh")}
                      </button>
                    </div>
                  </div>

                  {eventsError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-700">{eventsError}</p>
                    </div>
                  )}

                  {eventActionError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-700">{eventActionError}</p>
                    </div>
                  )}

                  {eventsLoading && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Retrieving events...
                    </p>
                  )}

                  {!eventsLoading &&
                    !eventsError &&
                    filteredEvents.length === 0 && (
                      <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No events found with the selected filters.
                      </p>
                    )}

                  {!eventsLoading &&
                    !eventsError &&
                    filteredEvents.length > 0 && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/40">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {t("adminDash.events.colEvent")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {t("adminDash.events.colPlanner")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {t("adminDash.events.visibilityLabel")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {t("adminDash.events.statusLabel")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {t("adminDash.events.colDates")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {t("adminDash.events.colActions")}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                              {filteredEvents.map((eventRecord) => (
                                <tr
                                  key={eventRecord.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                                >
                                  <td className="px-4 py-3 text-sm font-semibold text-neutral dark:text-white">
                                    <p>{eventRecord.title}</p>
                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                      {eventRecord.location}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {eventRecord.User
                                      ? `${eventRecord.User.firstName} ${eventRecord.User.lastName}`
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span
                                      className={`inline-flex rounded-full px-3 py-1 font-semibold ${
                                        eventRecord.visibility === "public"
                                          ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                      }`}
                                    >
                                      {eventRecord.visibility}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span
                                      className={`inline-flex rounded-full px-3 py-1 font-semibold ${
                                        eventRecord.status === "completed"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                          : eventRecord.status === "cancelled"
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                            : eventRecord.status === "published"
                                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                      }`}
                                    >
                                      {eventRecord.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {formatEventDate(eventRecord.startDate)} -{" "}
                                    {formatEventDate(eventRecord.endDate)}
                                  </td>
                                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleViewEvent(eventRecord)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/50"
                                      >
                                        <FontAwesomeIcon
                                          icon={faEye}
                                          className="w-3 h-3"
                                        />
                                        {t("adminDash.events.view")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEditEvent(eventRecord)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 font-semibold text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      >
                                        <FontAwesomeIcon
                                          icon={faPen}
                                          className="w-3 h-3"
                                        />
                                        {t("adminDash.events.edit")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleDeleteEvent(eventRecord.id)
                                        }
                                        disabled={
                                          deletingEventId === eventRecord.id
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-600 px-3 py-2 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                      >
                                        <FontAwesomeIcon
                                          icon={faTrash}
                                          className="w-3 h-3"
                                        />
                                        {deletingEventId === eventRecord.id
                                          ? t("common.loading")
                                          : t("adminDash.events.delete")}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {selectedEvent && (
                          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6">
                            <div className="flex items-center justify-between gap-4 mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-neutral dark:text-white">
                                  Event Details
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Full details for {selectedEvent.title}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
                              >
                                Close
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 lg:col-span-2">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Title
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {selectedEvent.title}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Event Type
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {getEventDisplayType(
                                    selectedEvent.eventType,
                                    selectedEvent.description,
                                  )}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 lg:col-span-3">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Description
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {stripCustomEventTypePrefix(
                                    selectedEvent.description,
                                  ) || "-"}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Visibility
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white capitalize">
                                  {selectedEvent.visibility}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Status
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white capitalize">
                                  {selectedEvent.status}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Planner
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {selectedEvent.User
                                    ? `${selectedEvent.User.firstName} ${selectedEvent.User.lastName}`
                                    : "-"}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Start Date
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {formatEventDate(selectedEvent.startDate)}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  End Date
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {formatEventDate(selectedEvent.endDate)}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Budget
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {selectedEvent.budget.toLocaleString()} RWF
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Guest Count
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {selectedEvent.guestCount}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 lg:col-span-2">
                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  Location
                                </p>
                                <p className="mt-2 font-semibold text-neutral dark:text-white">
                                  {selectedEvent.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {editingEventId && (
                          <div className="rounded-lg border border-primary/20 bg-blue-50 dark:bg-gray-900/40 p-6">
                            <div className="flex items-center justify-between gap-4 mb-4">
                              <h4 className="text-lg font-bold text-neutral dark:text-white">
                                Edit Event
                              </h4>
                              <button
                                type="button"
                                onClick={handleCancelEditEvent}
                                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  name="title"
                                  value={editEventForm.title || ""}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Event Type
                                </label>
                                <select
                                  name="eventType"
                                  value={editEventForm.eventType || "wedding"}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                >
                                  {[
                                    "wedding",
                                    "conference",
                                    "birthday",
                                    "corporate",
                                    "festival",
                                    "charity",
                                    "other",
                                  ].map((eventTypeOption) => (
                                    <option
                                      key={eventTypeOption}
                                      value={eventTypeOption}
                                    >
                                      {eventTypeOption}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  name="startDate"
                                  value={editEventForm.startDate || ""}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  name="endDate"
                                  value={editEventForm.endDate || ""}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Visibility
                                </label>
                                <select
                                  name="visibility"
                                  value={editEventForm.visibility || "public"}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                >
                                  <option value="public">{t("adminDash.editEvent.optPublic")}</option>
                                  <option value="private">{t("adminDash.editEvent.optPrivate")}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Status
                                </label>
                                <select
                                  name="status"
                                  value={editEventForm.status || "draft"}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                >
                                  <option value="draft">{t("adminDash.editEvent.optDraft")}</option>
                                  <option value="active">{t("adminDash.editEvent.optActive")}</option>
                                  <option value="completed">{t("adminDash.editEvent.optCompleted")}</option>
                                  <option value="cancelled">{t("adminDash.editEvent.optCancelled")}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  name="location"
                                  value={editEventForm.location || ""}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Budget
                                </label>
                                <input
                                  type="number"
                                  name="budget"
                                  value={editEventForm.budget || 0}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Guest Count
                                </label>
                                <input
                                  type="number"
                                  name="guestCount"
                                  value={editEventForm.guestCount || 0}
                                  onChange={handleEditEventChange}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  Description
                                </label>
                                <textarea
                                  name="description"
                                  value={editEventForm.description || ""}
                                  onChange={handleEditEventChange}
                                  rows={4}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => void handleSaveEvent()}
                                disabled={isSavingEvent}
                                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isSavingEvent ? t("adminDash.editEvent.saving") : t("adminDash.editEvent.saveChanges")}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditEvent}
                                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}

              {activeTab === "flagged-events" && (
                <div className="space-y-4">
                  {flaggedEvents.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t("adminDash.editEvent.noFlagged")}
                    </p>
                  ) : (
                    flaggedEvents.map((eventRecord) => (
                      <div
                        key={eventRecord.id}
                        className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="font-bold text-neutral dark:text-white">
                              {eventRecord.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              Planner:{" "}
                              {eventRecord.User
                                ? `${eventRecord.User.firstName} ${eventRecord.User.lastName}`
                                : "-"}{" "}
                              • {formatEventDate(eventRecord.startDate)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              void handleResolveFlag(eventRecord.id)
                            }
                            className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-opacity-90"
                          >
                            {t("adminDash.editEvent.resolveFlag")}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "vendors" && (
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {t("adminDash.vendors.verificationStatus")}
                      </label>
                      <select
                        value={vendorVerificationFilter}
                        onChange={(e) =>
                          setVendorVerificationFilter(
                            e.target.value as "verified" | "unverified",
                          )
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                      >
                        <option value="verified">{t("adminDash.vendors.verifiedVendors")}</option>
                        <option value="unverified">{t("adminDash.vendors.unverifiedVendors")}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("adminDash.vendors.showingCount", { count: vendors.length })}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadVendors(1)}
                        disabled={vendorsLoading}
                        className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {vendorsLoading ? t("common.loading") : t("adminDash.events.refresh")}
                      </button>
                    </div>
                  </div>

                  {vendorsError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-700">{vendorsError}</p>
                    </div>
                  )}

                  {vendorsLoading && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t("adminDash.editEvent.retrievingVendors")}
                    </p>
                  )}

                  {!vendorsLoading && !vendorsError && vendors.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No {vendorVerificationFilter} vendors found.
                    </p>
                  )}

                  {!vendorsLoading && !vendorsError && vendors.length > 0 && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                {t("adminDash.vendors.colBusiness")}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                {t("adminDash.vendors.colOwner")}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                {t("adminDash.vendors.colLocation")}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                {t("adminDash.vendors.colExperience")}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                {t("adminDash.vendors.colStatus")}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                {t("adminDash.vendors.colActions")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {vendors.map((vendor) => (
                              <tr
                                key={vendor.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                              >
                                <td className="px-4 py-3 text-sm font-semibold text-neutral dark:text-white">
                                  <p>{vendor.businessName}</p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {vendor.bio || "No bio available"}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {vendor.user
                                    ? `${vendor.user.firstName} ${vendor.user.lastName}`
                                    : "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {vendor.location}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {vendor.experienceYears} years
                                </td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 font-semibold ${
                                      vendor.isVerified
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                    }`}
                                  >
                                    {vendor.isVerified
                                      ? t("adminDash.vendors.verified")
                                      : t("adminDash.vendors.unverified")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedVendor(vendor)}
                                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/50"
                                    >
                                      <FontAwesomeIcon
                                        icon={faEye}
                                        className="w-3 h-3"
                                      />
                                      {t("adminDash.vendors.view")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleToggleVendorVerification(
                                          vendor,
                                        )
                                      }
                                      disabled={
                                        vendorVerificationActionId === vendor.id
                                      }
                                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                                        vendor.isVerified
                                          ? "border border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-300 dark:hover:bg-amber-900/20"
                                          : "border border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900/20"
                                      }`}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          vendor.isVerified ? faTimes : faCheck
                                        }
                                        className="w-3 h-3"
                                      />
                                      {vendorVerificationActionId === vendor.id
                                        ? t("adminDash.vendors.updating")
                                        : vendor.isVerified
                                          ? t("adminDash.vendors.setUnverified")
                                          : t("adminDash.vendors.setVerified")}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {selectedVendor && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-neutral dark:text-white">
                                {t("adminDash.vendors.vendorDetails")}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.detailedInfoFor")}{" "}
                                {selectedVendor.businessName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleToggleVendorVerification(
                                    selectedVendor,
                                  )
                                }
                                disabled={
                                  vendorVerificationActionId ===
                                  selectedVendor.id
                                }
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                                  selectedVendor.isVerified
                                    ? "border border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-300 dark:hover:bg-amber-900/20"
                                    : "border border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900/20"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    selectedVendor.isVerified
                                      ? faTimes
                                      : faCheck
                                  }
                                  className="w-3 h-3"
                                />
                                {vendorVerificationActionId ===
                                selectedVendor.id
                                  ? t("adminDash.vendors.updating")
                                  : selectedVendor.isVerified
                                    ? t("adminDash.vendors.setUnverified")
                                    : t("adminDash.vendors.setVerified")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedVendor(null)}
                                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
                              >
                                {t("common.close")}
                              </button>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.colBusiness")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.businessName}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.verification")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.isVerified
                                  ? t("adminDash.vendors.verified")
                                  : t("adminDash.vendors.unverified")}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.averageRating")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.averageRating ?? 0}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 lg:col-span-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.bio")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.bio || t("adminDash.vendors.noBio")}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.colOwner")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.user
                                  ? `${selectedVendor.user.firstName} ${selectedVendor.user.lastName}`
                                  : "-"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.email")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white break-all">
                                {selectedVendor.user?.email || "-"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.colLocation")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.location}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.colExperience")}
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedVendor.experienceYears} years
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 lg:col-span-2">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("adminDash.vendors.vendorId")}
                              </p>
                              <p className="mt-2 font-mono text-sm text-neutral dark:text-white break-all">
                                {selectedVendor.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {vendorsPagination && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("adminDash.vendors.showingPage", {
                              page: vendorsPagination.page,
                              totalPages: vendorsPagination.totalPages,
                              count: vendorsPagination.totalCount,
                            })}
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleVendorPageChange(vendorsPage - 1)
                              }
                              disabled={vendorsLoading || vendorsPage <= 1}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              <FontAwesomeIcon
                                icon={faChevronLeft}
                                className="w-3 h-3"
                              />
                              {t("common.previous")}
                            </button>
                            <div className="flex items-center gap-2">
                              {getVisibleVendorPageNumbers().map(
                                (pageNumber) => (
                                  <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() =>
                                      handleVendorPageChange(pageNumber)
                                    }
                                    disabled={vendorsLoading}
                                    className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                      pageNumber === vendorsPage
                                        ? "bg-primary text-white"
                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    {pageNumber}
                                  </button>
                                ),
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleVendorPageChange(vendorsPage + 1)
                              }
                              disabled={
                                vendorsLoading ||
                                vendorsPage >= vendorsPagination.totalPages
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              {t("common.next")}
                              <FontAwesomeIcon
                                icon={faChevronRight}
                                className="w-3 h-3"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "transaction-history" && (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {t("adminDash.transactions.colReference")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {t("adminDash.transactions.colEvent")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {t("adminDash.transactions.colAmount")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {t("adminDash.transactions.colStatus")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {t("adminDash.transactions.colDate")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {transactionHistory.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-3 text-sm font-semibold text-neutral dark:text-white">
                            {transaction.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {transaction.eventName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {transaction.amount.toLocaleString()} RWF
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 font-semibold ${
                                transaction.status === "released"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {transaction.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "refunds-disputes" && (
                <div className="space-y-4">
                  {refundCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <p className="font-bold text-neutral dark:text-white">
                            {caseItem.id} • {caseItem.subject}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            Amount at stake: {caseItem.amount.toLocaleString()}{" "}
                            RWF
                          </p>
                        </div>
                        <select
                          value={caseItem.status}
                          onChange={(e) =>
                            handleRefundStatusUpdate(
                              caseItem.id,
                              e.target.value,
                            )
                          }
                          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-neutral dark:text-white"
                        >
                          <option value="under-review">{t("adminDash.refunds.underReview")}</option>
                          <option value="awaiting-evidence">{t("adminDash.refunds.awaitingEvidence")}</option>
                          <option value="resolved">{t("adminDash.refunds.resolved")}</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "event-categories" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleAddEventCategory();
                        }
                      }}
                      placeholder={t("adminDash.categories.addNewEventCategory")}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAddEventCategory()}
                      disabled={creatingEventCategory}
                      className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {creatingEventCategory ? t("adminDash.categories.adding") : t("adminDash.categories.addCategory")}
                    </button>
                  </div>
                  {eventCategoriesError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-700">
                        {eventCategoriesError}
                      </p>
                    </div>
                  )}
                  {eventCategoriesLoading ? (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("adminDash.categories.loadingEventCategories")}
                      </p>
                    </div>
                  ) : eventCategories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center bg-white dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("adminDash.categories.noEventCategories")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {eventCategories.map((category) => {
                        const isEditing =
                          editingEventCategoryId === category.id;
                        const isWorking = eventCategoryActionId === category.id;

                        return (
                          <div
                            key={category.id}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingEventCategoryName}
                                    onChange={(e) =>
                                      setEditingEventCategoryName(
                                        e.target.value,
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        void handleUpdateEventCategory(
                                          category.id,
                                        );
                                      }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-900 text-neutral dark:text-white"
                                  />
                                ) : (
                                  <>
                                    <p className="font-semibold text-neutral dark:text-white">
                                      {category.name}
                                    </p>
                                    {category.updatedAt && (
                                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t("adminDash.categories.updated")}{" "}
                                        {formatUserDate(category.updatedAt)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleUpdateEventCategory(
                                          category.id,
                                        )
                                      }
                                      disabled={isWorking}
                                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      {isWorking ? t("adminDash.categories.saving") : t("common.save")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEditEventCategory}
                                      disabled={isWorking}
                                      className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      {t("common.cancel")}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartEditEventCategory(category)
                                      }
                                      disabled={isWorking}
                                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <FontAwesomeIcon
                                        icon={faPen}
                                        className="w-3 h-3"
                                      />
                                      {t("common.edit")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDeleteEventCategory(category)
                                      }
                                      disabled={isWorking}
                                      className="inline-flex items-center gap-2 rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        className="w-3 h-3"
                                      />
                                      {isWorking ? t("adminDash.categories.deleting") : t("common.delete")}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "service-categories" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newServiceCategory}
                      onChange={(e) => setNewServiceCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddServiceCategory();
                        }
                      }}
                      placeholder={t("adminDash.categories.addNewServiceCategory")}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddServiceCategory}
                      disabled={creatingServiceCategory}
                      className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {creatingServiceCategory ? t("adminDash.categories.adding") : t("adminDash.categories.addCategory")}
                    </button>
                  </div>
                  {serviceCategoriesError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-700">
                        {serviceCategoriesError}
                      </p>
                    </div>
                  )}
                  {serviceCategoriesLoading ? (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("adminDash.categories.loadingServiceCategories")}
                      </p>
                    </div>
                  ) : serviceCategories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center bg-white dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("adminDash.categories.noServiceCategories")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {serviceCategories.map((category) => {
                        const isEditing =
                          editingServiceCategoryId === category.id;
                        const isWorking =
                          serviceCategoryActionId === category.id;

                        return (
                          <div
                            key={category.id}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingServiceCategoryName}
                                    onChange={(e) =>
                                      setEditingServiceCategoryName(
                                        e.target.value,
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        void handleUpdateServiceCategory(
                                          category.id,
                                        );
                                      }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-900 text-neutral dark:text-white"
                                  />
                                ) : (
                                  <>
                                    <p className="font-semibold text-neutral dark:text-white">
                                      {category.name}
                                    </p>
                                    {category.updatedAt && (
                                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t("adminDash.categories.updated")}{" "}
                                        {formatUserDate(category.updatedAt)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleUpdateServiceCategory(
                                          category.id,
                                        )
                                      }
                                      disabled={isWorking}
                                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      {isWorking ? t("adminDash.categories.saving") : t("common.save")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEditServiceCategory}
                                      disabled={isWorking}
                                      className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      {t("common.cancel")}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartEditServiceCategory(category)
                                      }
                                      disabled={isWorking}
                                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <FontAwesomeIcon
                                        icon={faPen}
                                        className="w-3 h-3"
                                      />
                                      {t("common.edit")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDeleteServiceCategory(
                                          category,
                                        )
                                      }
                                      disabled={isWorking}
                                      className="inline-flex items-center gap-2 rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        className="w-3 h-3"
                                      />
                                      {isWorking ? t("adminDash.categories.deleting") : t("common.delete")}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "announcements" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={announcementInput}
                      onChange={(e) => setAnnouncementInput(e.target.value)}
                      placeholder={t("adminDash.announcements.placeholder")}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handlePublishAnnouncement}
                      className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-opacity-90"
                    >{t("adminDash.announcements.publish")}</button>
                  </div>
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                      >
                        <p className="font-semibold text-neutral dark:text-white">
                          {announcement.messageKey ? t(announcement.messageKey) : announcement.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {announcement.dateKey ? t(announcement.dateKey) : announcement.createdAt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reports-complaints" && (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-bold text-neutral dark:text-white">
                            {report.id} • {report.titleKey ? t(report.titleKey) : report.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {t("adminDash.reportsComplaints.typeLabel")}: {report.typeKey ? t(report.typeKey) : report.type}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={report.status === "resolved"}
                          onClick={() => handleMarkReportResolved(report.id)}
                          className="rounded-lg border border-primary px-4 py-2 text-primary font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          {report.status === "resolved"
                            ? t("adminDash.reportsComplaints.resolved")
                            : t("adminDash.reportsComplaints.markAsResolved")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews-management" && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-bold text-neutral dark:text-white">
                            {review.reviewer}
                            {" -> "}
                            {review.target}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {t("adminDash.reviews.rating")}: {review.rating}/5 · {t("adminDash.reviews.statusLabel")}: {review.status === "published" ? t("adminDash.reviews.statusPublished") : t("adminDash.reviews.statusHidden")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleReviewStatus(review.id)}
                          className="rounded-lg border border-primary px-4 py-2 text-primary font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          {review.status === "published"
                            ? t("adminDash.announcements.hideReview")
                            : t("adminDash.announcements.publishReview")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "audit-logs" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder={t("adminDash.auditLogs.filterPlaceholder")}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white"
                  />
                  <div className="space-y-2">
                    {auditLogs.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("adminDash.auditLogs.noLogs")}
                      </p>
                    ) : (
                      auditLogs.map((logKey) => (
                        <div
                          key={logKey}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                        >
                          {t(logKey)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "manage-users" && (
                <div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral dark:text-white mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                        Manage Users
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t("adminDash.users.retrieveDesc")}
                      </p>
                    </div>
                    <button
                      onClick={() => void loadUsers()}
                      disabled={usersLoading}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                    >
                      {usersLoading ? "Loading..." : "Refresh Users"}
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-[minmax(0,1fr)_220px_auto] gap-4 mb-6">
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={userSearchInput}
                        onChange={(e) => setUserSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearchUsers();
                          }
                        }}
                        placeholder="Search by name, email or phone"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 pl-11 pr-4 py-3 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={handleRoleFilterChange}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {t("adminDash.manageUsers.allRoles")}
                      {t("adminDash.manageUsers.roleVendor")}
                      <option value="planner">Planner</option>
                      <option value="admin">Admin</option>
                      {t("adminDash.manageUsers.roleEventPlanner")}
                    </select>
                    <button
                      type="button"
                      onClick={handleSearchUsers}
                      className="rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-opacity-90"
                    >
                      Search Now
                    </button>
                  </div>

                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {t("adminDash.users.searchHint")}
                  </p>

                  {usersLoading && (
                    <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
                      Retrieving users...
                    </p>
                  )}

                  {usersError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700">{usersError}</p>
                    </div>
                  )}

                  {userActionError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700">{userActionError}</p>
                    </div>
                  )}

                  {!usersLoading && !usersError && users.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No users found.
                    </p>
                  )}

                  {!usersLoading && !usersError && users.length > 0 && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Email
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Phone
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Role
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Created
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Updated
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {users.map((managedUser) => (
                              <tr
                                key={managedUser.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="px-4 py-3 text-sm text-neutral dark:text-white font-medium whitespace-nowrap">
                                  {managedUser.firstName} {managedUser.lastName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {managedUser.email}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {managedUser.phone || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {formatUserRole(managedUser.role)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {formatUserDate(managedUser.createdAt)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {formatUserDate(managedUser.updatedAt)}
                                </td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleViewUser(managedUser)
                                      }
                                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/50"
                                    >
                                      <FontAwesomeIcon
                                        icon={faEye}
                                        className="w-3 h-3"
                                      />
                                      View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditUser(managedUser)
                                      }
                                      className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 font-semibold text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                      <FontAwesomeIcon
                                        icon={faPen}
                                        className="w-3 h-3"
                                      />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDeleteUser(managedUser.id)
                                      }
                                      disabled={actionUserId === managedUser.id}
                                      className="inline-flex items-center gap-2 rounded-lg border border-red-600 px-3 py-2 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        className="w-3 h-3"
                                      />
                                      {actionUserId === managedUser.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {selectedUser && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-neutral dark:text-white">
                                User Details
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Detailed information for{" "}
                                {selectedUser.firstName} {selectedUser.lastName}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedUser(null)}
                              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
                            >
                              Close
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Full Name
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedUser.firstName} {selectedUser.lastName}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Email
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white break-all">
                                {selectedUser.email}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Phone
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {selectedUser.phone || "-"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Role
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {formatUserRole(selectedUser.role)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Created At
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {formatUserDate(selectedUser.createdAt)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Updated At
                              </p>
                              <p className="mt-2 font-semibold text-neutral dark:text-white">
                                {formatUserDate(selectedUser.updatedAt)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 lg:col-span-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                User ID
                              </p>
                              <p className="mt-2 font-mono text-sm text-neutral dark:text-white break-all">
                                {selectedUser.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {editingUserId && (
                        <div className="rounded-lg border border-primary/20 bg-blue-50 dark:bg-gray-900/40 p-6">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <h4 className="text-lg font-bold text-neutral dark:text-white">
                              Edit User
                            </h4>
                            <button
                              type="button"
                              onClick={handleCancelEditUser}
                              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                First Name
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={editUserForm.firstName || ""}
                                onChange={handleEditUserChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                Last Name
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={editUserForm.lastName || ""}
                                onChange={handleEditUserChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={editUserForm.email || ""}
                                onChange={handleEditUserChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                Phone
                              </label>
                              <input
                                type="text"
                                name="phone"
                                value={editUserForm.phone || ""}
                                onChange={handleEditUserChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                Role
                              </label>
                              <select
                                name="role"
                                value={editUserForm.role || "planner"}
                                onChange={handleEditUserChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-neutral dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                {[
                                  "vendor",
                                  "planner",
                                  "admin",
                                  "event_planner",
                                ].map((roleOption) => (
                                  <option key={roleOption} value={roleOption}>
                                    {formatUserRole(roleOption)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => void handleSaveUser()}
                              disabled={isSavingUser}
                              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isSavingUser ? t("adminDash.manageUsers.saving") : t("adminDash.manageUsers.saveChanges")}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditUser}
                              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {usersPagination && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing page {usersPagination.page} of{" "}
                            {usersPagination.totalPages} • Total users:{" "}
                            {usersPagination.totalCount}
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleUsersPageChange(usersPage - 1)
                              }
                              disabled={usersLoading || usersPage <= 1}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              <FontAwesomeIcon
                                icon={faChevronLeft}
                                className="w-3 h-3"
                              />
                              Previous
                            </button>
                            <div className="flex items-center gap-2">
                              {getVisiblePageNumbers().map((pageNumber) => (
                                <button
                                  key={pageNumber}
                                  type="button"
                                  onClick={() =>
                                    handleUsersPageChange(pageNumber)
                                  }
                                  disabled={usersLoading}
                                  className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                    pageNumber === usersPage
                                      ? "bg-primary text-white"
                                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {pageNumber}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleUsersPageChange(usersPage + 1)
                              }
                              disabled={
                                usersLoading ||
                                usersPage >= usersPagination.totalPages
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Next
                              <FontAwesomeIcon
                                icon={faChevronRight}
                                className="w-3 h-3"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "escrow-payments" && (
                <div>
                  <h3 className="text-2xl font-bold text-neutral dark:text-white mb-2">
                    Escrow Payment Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t("adminDash.escrow.subtitle")}
                  </p>
                  <div className="space-y-4">
                    {escrowPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                          payment.status === "held"
                            ? "border-primary-soft bg-blue-50 dark:bg-gray-700"
                            : "border-primary bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-neutral dark:text-white mb-2">
                              {payment.eventName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <span className="flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="w-4 h-4 text-primary"
                                />{" "}
                                {t("adminDash.escrow.planner")}: {payment.planner}
                              </span>
                              <span className="flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="w-4 h-4 text-primary"
                                />{" "}
                                {t("adminDash.escrow.vendor")}: {payment.vendor}
                              </span>
                              <span className="flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  className="w-4 h-4 text-primary"
                                />{" "}
                                {payment.date}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit whitespace-nowrap ${
                              payment.status === "held"
                                ? "bg-primary-soft text-white"
                                : "bg-primary text-white"
                            }`}
                          >
                            {payment.status === "held" ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faLock}
                                  className="w-4 h-4"
                                />{" "}
                                {t("adminDash.escrow.heldInEscrow")}
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="w-4 h-4"
                                />{" "}
                                {t("adminDash.escrow.released")}
                              </>
                            )}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg inline-block mb-4 border-l-4 border-accent flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faDollarSign}
                            className="w-5 h-5 text-accent"
                          />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Payment Amount
                            </p>
                            <p className="text-2xl font-bold text-accent">
                              {payment.amount.toLocaleString()} RWF
                            </p>
                          </div>
                        </div>
                        {payment.status === "held" && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handlePaymentRelease(payment.id)}
                              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 font-semibold flex items-center gap-2 transition-all"
                            >
                              <FontAwesomeIcon
                                icon={faCreditCard}
                                className="w-4 h-4"
                              />{" "}
                              Release Payment to Vendor
                            </button>
                            <button className="border-2 border-primary-soft text-primary-soft px-6 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold flex items-center gap-2 transition-all">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="w-4 h-4"
                              />{" "}
                              Contact Planner
                            </button>
                          </div>
                        )}
                        {payment.status === "released" && (
                          <p className="text-primary-soft font-semibold flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="w-4 h-4"
                            />{" "}
                            Payment successfully released to vendor
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
