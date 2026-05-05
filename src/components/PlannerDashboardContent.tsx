import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Calendar,
  MapPin,
  Target,
  Check,
  Plus,
  Loader,
  Clock,
} from "lucide-react";
import Chat from "./Chat";
import BookingChatPanel from "./BookingChatPanel";
import PaymentModal from "./PaymentModal";
import VendorProfileModal from "./VendorProfileModal";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import AddGuestModal from "./AddGuestModal";
import EventDetailsModal from "./EventDetailsModal";
import BookingModal from "./BookingModal";
import SuccessModal from "./SuccessModal";
import BookingDetailsModal from "./BookingDetailsModal";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../hooks/useEvents";
import { useBookings } from "../hooks/useBookings";
import {
  getEventDisplayType,
  stripCustomEventTypePrefix,
} from "../utils/eventCategories";
import {
  CreateBookingPayload,
  Event,
  EventService,
  Guest,
  VendorInfo,
  VendorServicePackage,
  deleteGuest,
  getEventGuests,
  getEventById,
  getEventServices,
  deleteEvent,
  getVendors,
  getVendorInfo,
  getVendorServicePackages,
  updateGuest,
} from "../services/api";

const normalizeEventServices = (raw: unknown): EventService[] => {
  if (Array.isArray(raw)) {
    return raw as EventService[];
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { services?: EventService[] }).services)
  ) {
    return (raw as { services: EventService[] }).services;
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { items?: EventService[] }).items)
  ) {
    return (raw as { items: EventService[] }).items;
  }

  return [];
};

const normalizeVendors = (raw: unknown): VendorInfo[] => {
  if (Array.isArray(raw)) {
    return raw as VendorInfo[];
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { vendors?: VendorInfo[] }).vendors)
  ) {
    return (raw as { vendors: VendorInfo[] }).vendors;
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { items?: VendorInfo[] }).items)
  ) {
    return (raw as { items: VendorInfo[] }).items;
  }

  return [];
};

const normalizeVendorPackages = (raw: unknown): VendorServicePackage[] => {
  if (Array.isArray(raw)) {
    return raw as VendorServicePackage[];
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { packages?: VendorServicePackage[] }).packages)
  ) {
    return (raw as { packages: VendorServicePackage[] }).packages;
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { items?: VendorServicePackage[] }).items)
  ) {
    return (raw as { items: VendorServicePackage[] }).items;
  }

  return [];
};

const normalizeGuests = (raw: unknown): Guest[] => {
  const normalizeGuestList = (items: unknown[]): Guest[] =>
    items.map((item) => {
      const guest = item as Guest & { rsvpStatus?: Guest["rsvpstatus"] };
      return {
        ...guest,
        rsvpstatus: guest.rsvpstatus || guest.rsvpStatus || "Pending",
      };
    });

  if (Array.isArray(raw)) {
    return normalizeGuestList(raw);
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { guests?: Guest[] }).guests)
  ) {
    return normalizeGuestList((raw as { guests: Guest[] }).guests);
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { items?: Guest[] }).items)
  ) {
    return normalizeGuestList((raw as { items: Guest[] }).items);
  }

  return [];
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

type MatchedVendorSummary = {
  id: string;
  userId: string;
  businessName: string;
  verified: boolean;
  location: string;
  rating: number;
  experience: number;
  packages: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    minPrice: number;
    maxPrice: number;
  }>;
};

type VendorProfileDetails = {
  id: string;
  userId: string;
  name: string;
  service: string;
  rating: number;
  minPrice: number;
  maxPrice: number;
  location: string;
  verified: boolean;
  experience: number;
  completedEvents: number;
  bio: string;
  services: string[];
  portfolioImages: string[];
  certifications: string[];
  awards: string[];
  packages: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    minPrice: number;
    maxPrice: number;
  }>;
};

export default function PlannerDashboardContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { events, loading, error, refetch } = useEvents({
    role: user?.role,
    userId: user?.userId,
    scopeToCurrentUser: Boolean(user),
  });
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    addBooking,
    removeBooking,
    deleteBooking,
    updateBooking,
  } = useBookings({
    userId: user?.userId,
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    name: string;
    role: string;
    bookingId?: string;
  } | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<{
    name: string;
    service: string;
    price: number;
  } | null>(null);
  const [selectedVendorProfile, setSelectedVendorProfile] =
    useState<VendorProfileDetails | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVendorForBooking, setSelectedVendorForBooking] = useState<{
    vendorId: string;
    name: string;
    packageId: string;
    service: string;
    category: string;
    price: number;
    rating: number;
    experience: number;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] =
    useState<any>(null);
  const [bookingToUpdate, setBookingToUpdate] = useState<any>(null);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [selectedEventForGuest, setSelectedEventForGuest] =
    useState<Event | null>(null);
  const [selectedGuestEventId, setSelectedGuestEventId] = useState("");
  const [eventGuests, setEventGuests] = useState<Guest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [guestsError, setGuestsError] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestEditForm, setGuestEditForm] = useState({
    fullNames: "",
    phone: "",
    email: "",
    category: "REGULAR" as Guest["category"],
    tableNumber: 0,
    rsvpstatus: "Pending" as Guest["rsvpstatus"],
  });
  const [guestActionLoading, setGuestActionLoading] = useState(false);
  const [deletingGuestId, setDeletingGuestId] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [detailEventServices, setDetailEventServices] = useState<
    EventService[]
  >([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [matchedLoading, setMatchedLoading] = useState(false);
  const [matchedError, setMatchedError] = useState<string | null>(null);
  const [matchedVendors, setMatchedVendors] = useState<MatchedVendorSummary[]>(
    [],
  );
  const [loadingVendorProfileId, setLoadingVendorProfileId] = useState<
    string | null
  >(null);

  const postedEvent = location.state?.newEvent;
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Event Planner";
  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "EP";

  const [eventServicesById, setEventServicesById] = useState<
    Record<string, EventService[]>
  >({});

  useEffect(() => {
    let cancelled = false;

    const loadEventServices = async () => {
      if (events.length === 0) {
        setEventServicesById({});
        return;
      }

      const settledResults = await Promise.allSettled(
        events.map((event) => getEventServices(event.id)),
      );

      if (cancelled) {
        return;
      }

      const nextServicesMap: Record<string, EventService[]> = {};

      settledResults.forEach((result, index) => {
        const eventId = events[index].id;

        if (result.status === "fulfilled") {
          nextServicesMap[eventId] = normalizeEventServices(result.value.data);
          return;
        }

        nextServicesMap[eventId] = [];
      });

      setEventServicesById(nextServicesMap);
    };

    loadEventServices();

    return () => {
      cancelled = true;
    };
  }, [events]);

  // Transform backend events to match component expectations
  const myEvents = events.map((event: Event) => ({
    id: event.id,
    name: event.title,
    date: new Date(event.startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    status: event.status.charAt(0).toUpperCase() + event.status.slice(1),
    description: stripCustomEventTypePrefix(event.description),
    budget: event.budget,
    guestCount: event.guestCount,
    imageUrl: event.imageUrl,
    eventType: getEventDisplayType(event.eventType, event.description),
    services: eventServicesById[event.id]?.length || 0,
    serviceList: eventServicesById[event.id] || [],
    matched_vendors: 0,
    total_budget: event.budget,
  }));

  // Include newly created event from navigation state
  if (postedEvent && !myEvents.some((e) => e.id === postedEvent.id)) {
    myEvents.unshift(postedEvent);
  }

  // Transform bookings to payment records
  const payments = bookings.map((booking) => ({
    id: booking.id,
    vendorName: booking.vendorName,
    service: booking.service,
    eventName: booking.eventName,
    date: new Date(booking.bookingDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    amount: booking.price,
    status: booking.status === "confirmed" ? "completed" : booking.status,
    paymentDate: booking.status === "confirmed" 
      ? new Date(booking.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-",
  }));

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed",
  );

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      if (bookingToUpdate) {
        await updateBooking({
          ...bookingData,
          id: bookingToUpdate.id,
          createdAt: bookingToUpdate.createdAt,
        });
        setSuccessMessage("Booking updated successfully!");
        setBookingToUpdate(null);
      } else {
        if (!bookingData.packageId || !bookingData.eventId) {
          throw new Error(
            "Please select a valid package and event before booking.",
          );
        }

        const createPayload: CreateBookingPayload = {
          packageId: bookingData.packageId,
          eventId: bookingData.eventId,
          priceOffered: Number(
            bookingData.priceOffered ?? bookingData.price ?? 0,
          ),
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          message: bookingData.message || bookingData.notes,
        };

        await addBooking(createPayload);
        setSuccessMessage("Booking confirmed successfully!");
      }
      setActiveTab("bookings");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process booking. Please try again.";
      alert(errorMessage);
      throw err;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await removeBooking(bookingId);
      setSuccessMessage("Booking cancelled successfully.");
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      setSuccessMessage("Booking deleted successfully.");
    } catch (err) {
      alert("Failed to delete booking.");
    }
  };

  const handleUpdateBooking = (booking: any) => {
    setBookingToUpdate(booking);
    setSelectedVendorForBooking({
      vendorId: booking.vendorId || "",
      name: booking.vendorName,
      packageId: booking.packageId || "",
      service: booking.service,
      category: booking.category || "General",
      price: booking.price,
      rating: 0,
      experience: 0,
    });
    setBookingModalOpen(true);
  };

  const plannerEventCount = myEvents.length;
  const plannerMatchedVendors = matchedVendors.length;
  const plannerTotalSpent = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const selectedGuestEvent =
    myEvents.find((event) => event.id === selectedGuestEventId) || null;

  // Calculate budget data from events and bookings
  const totalEventBudget = myEvents.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpentOnBookings = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
  
  // Split budget into categories (venue and logistics as examples)
  const venueBudgetRatio = 0.6; // 60% for venue-related
  const logisticsBudgetRatio = 0.4; // 40% for logistics
  
  const budgetData = [
    {
      labelKey: "stats.venueBudget",
      allocated: Math.round(totalEventBudget * venueBudgetRatio),
      used: Math.round(totalSpentOnBookings * venueBudgetRatio),
    },
    {
      labelKey: "stats.logisticBudget",
      allocated: Math.round(totalEventBudget * logisticsBudgetRatio),
      used: Math.round(totalSpentOnBookings * logisticsBudgetRatio),
    },
  ];

  // Calculate vendor spending by category from confirmed bookings
  const vendorSpendingMap = new Map<string, { value: number; count: number }>();
  
  confirmedBookings.forEach((booking) => {
    const category = booking.category || booking.service || "Other";
    const existing = vendorSpendingMap.get(category) || { value: 0, count: 0 };
    vendorSpendingMap.set(category, {
      value: existing.value + booking.price,
      count: existing.count + 1,
    });
  });

  const vendorSpendingData = Array.from(vendorSpendingMap.entries()).map(
    ([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
    })
  );

  const loadMatchedVendors = useCallback(async () => {
    setMatchedLoading(true);
    setMatchedError(null);

    try {
      const vendorsResponse = await getVendors({
        isVerified: true,
        page: 1,
        limit: 50,
      });

      const verifiedVendors = normalizeVendors(vendorsResponse.data);
      const vendorsWithPackages = await Promise.all(
        verifiedVendors.map(async (vendor) => {
          const packageOwnerId = vendor.userId || vendor.id;
          if (!packageOwnerId) {
            return null;
          }

          let packages: MatchedVendorSummary["packages"] = [];

          try {
            const packagesResponse = await getVendorServicePackages(
              String(packageOwnerId),
            );
            packages = normalizeVendorPackages(packagesResponse.data).map(
              (pkg) => ({
                id: String(pkg.id),
                title: pkg.title || "Service Package",
                category: pkg.category || "General",
                description:
                  pkg.description || "No package description available.",
                minPrice: Number(pkg.minPrice || 0),
                maxPrice: Number(pkg.maxPrice || 0),
              }),
            );
          } catch {
            packages = [];
          }

          return {
            id: String(vendor.id),
            userId: String(packageOwnerId),
            businessName:
              vendor.businessName ||
              `${vendor.user?.firstName || ""} ${vendor.user?.lastName || ""}`.trim() ||
              "Verified Vendor",
            verified: Boolean(vendor.isVerified),
            location: vendor.location || "N/A",
            rating: Number(vendor.averageRating || 0),
            experience: Number(vendor.experienceYears || 0),
            packages,
          } satisfies MatchedVendorSummary;
        }),
      );

      setMatchedVendors(
        vendorsWithPackages.filter((vendor): vendor is MatchedVendorSummary =>
          Boolean(vendor),
        ),
      );
    } catch (error: any) {
      console.error("Failed to load matched vendors", error);
      setMatchedError(error?.message || "Failed to load matched vendors");
      setMatchedVendors([]);
    } finally {
      setMatchedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatchedVendors();
  }, [loadMatchedVendors]);

  const handleViewVendorProfile = async (vendor: MatchedVendorSummary) => {
    try {
      setLoadingVendorProfileId(vendor.id);

      const [vendorInfoResult, packagesResult] = await Promise.allSettled([
        getVendorInfo(vendor.id),
        getVendorServicePackages(vendor.userId),
      ]);

      const vendorInfo =
        vendorInfoResult.status === "fulfilled"
          ? vendorInfoResult.value.data
          : null;
      const packages =
        packagesResult.status === "fulfilled"
          ? normalizeVendorPackages(packagesResult.value.data)
          : [];

      const serviceNames = packages
        .map((pkg) => pkg.title || pkg.category)
        .filter((value): value is string => Boolean(value));
      const minPrice = packages.length
        ? Math.min(...packages.map((pkg) => Number(pkg.minPrice || 0)))
        : 0;
      const maxPrice = packages.length
        ? Math.max(...packages.map((pkg) => Number(pkg.maxPrice || 0)))
        : 0;

      const profileDetails: VendorProfileDetails = {
        id: vendor.id,
        userId: vendor.userId,
        name:
          vendorInfo?.businessName ||
          vendor.businessName ||
          `${vendorInfo?.user?.firstName || ""} ${vendorInfo?.user?.lastName || ""}`.trim() ||
          "Verified Vendor",
        service: serviceNames[0] || "Vendor Services",
        rating: Number(vendorInfo?.averageRating || 0),
        minPrice,
        maxPrice,
        location: vendorInfo?.location || "N/A",
        verified: Boolean(vendorInfo?.isVerified ?? vendor.verified),
        experience: Number(vendorInfo?.experienceYears || 0),
        completedEvents: Number(
          (vendorInfo as (VendorInfo & { completedEvents?: number }) | null)
            ?.completedEvents || 0,
        ),
        bio: vendorInfo?.bio || "No business description available yet.",
        services: serviceNames,
        portfolioImages: toStringArray(vendorInfo?.portfolioImages),
        certifications: toStringArray(vendorInfo?.certifications),
        awards: toStringArray(vendorInfo?.awards),
        packages: packages.map((pkg) => ({
          id: String(pkg.id),
          title: pkg.title || "Service Package",
          category: pkg.category || "General",
          description: pkg.description || "No package description available.",
          minPrice: Number(pkg.minPrice || 0),
          maxPrice: Number(pkg.maxPrice || 0),
        })),
      };

      setSelectedVendorProfile(profileDetails);
    } catch (error) {
      console.error("Failed to load vendor profile", error);
      alert("Unable to load vendor details right now.");
    } finally {
      setLoadingVendorProfileId(null);
    }
  };

  const openChat = (name: string, role: string) => {
    setSelectedChat({ name, role });
    setChatOpen(true);
  };

  const openBookingChat = (booking: {
    id: string;
    vendorName: string;
    status: string;
  }) => {
    if (booking.status !== "confirmed") {
      alert("Chat becomes available after the booking is confirmed.");
      return;
    }

    setSelectedChat({
      name: booking.vendorName,
      role: "Vendor",
      bookingId: booking.id,
    });
    setChatOpen(true);
  };

  const openPayment = (vendor: {
    name: string;
    service: string;
    price: number;
  }) => {
    setSelectedVendor(vendor);
    setPaymentOpen(true);
  };

  const openBookingForPackage = (
    vendor: MatchedVendorSummary | VendorProfileDetails,
    pkg: {
      id: string;
      title: string;
      category: string;
      minPrice: number;
      maxPrice: number;
    },
  ) => {
    const vendorName =
      "businessName" in vendor ? vendor.businessName : vendor.name;

    setSelectedVendorForBooking({
      vendorId: vendor.id,
      name: vendorName,
      packageId: pkg.id,
      service: pkg.title,
      category: pkg.category,
      price: Number(pkg.minPrice || 0),
      rating: "rating" in vendor ? Number(vendor.rating || 0) : 0,
      experience: "experience" in vendor ? Number(vendor.experience || 0) : 0,
    });
    setBookingModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    alert("Payment successful! Booking confirmed.");
    setActiveTab("bookings");
  };

  const handleAddGuest = (event: any) => {
    setSelectedEventForGuest(event);
    setAddGuestOpen(true);
  };

  const loadGuestsByEvent = async (eventId: string) => {
    if (!eventId) {
      setEventGuests([]);
      return;
    }

    const isOwnEvent = events.some((event) => event.id === eventId);
    if (!isOwnEvent) {
      setGuestsError("You can only view guests for your own events.");
      setEventGuests([]);
      return;
    }

    setGuestsLoading(true);
    setGuestsError(null);

    try {
      const response = await getEventGuests({
        eventId,
        page: 1,
        limit: 100,
      });
      setEventGuests(normalizeGuests(response.data));
    } catch (err: any) {
      console.error("Failed to load guests", err);
      setGuestsError(err?.message || "Unable to load guests for this event.");
      setEventGuests([]);
    } finally {
      setGuestsLoading(false);
    }
  };

  const openGuestEditor = (guest: Guest) => {
    const isOwnEvent = events.some((event) => event.id === guest.eventId);
    if (!isOwnEvent) {
      alert("You can only edit guests for your own events.");
      return;
    }

    setEditingGuest(guest);
    setGuestEditForm({
      fullNames: guest.fullNames,
      phone: guest.phone,
      email: guest.email,
      category: guest.category,
      tableNumber: guest.tableNumber,
      rsvpstatus:
        guest.rsvpstatus ||
        ((guest as Guest & { rsvpStatus?: Guest["rsvpstatus"] }).rsvpStatus ??
          "Pending"),
    });
  };

  const handleGuestEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setGuestEditForm((prev) => ({
      ...prev,
      [name]: name === "tableNumber" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSaveGuestEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingGuest) {
      return;
    }

    const isOwnEvent = events.some(
      (event) => event.id === editingGuest.eventId,
    );
    if (!isOwnEvent) {
      alert("You can only edit guests for your own events.");
      return;
    }

    setGuestActionLoading(true);
    try {
      await updateGuest(editingGuest.id, {
        eventId: editingGuest.eventId,
        ...guestEditForm,
      });
      alert("Guest updated successfully.");
      const eventId = editingGuest.eventId;
      setEditingGuest(null);
      await loadGuestsByEvent(eventId);
    } catch (err: any) {
      console.error("Failed to update guest", err);
      alert(err?.message || "Failed to update guest.");
    } finally {
      setGuestActionLoading(false);
    }
  };

  const handleDeleteGuestRecord = async (guest: Guest) => {
    const isOwnEvent = events.some((event) => event.id === guest.eventId);
    if (!isOwnEvent) {
      alert("You can only delete guests for your own events.");
      return;
    }

    if (!window.confirm(`Delete guest ${guest.fullNames}?`)) {
      return;
    }

    setDeletingGuestId(guest.id);
    try {
      await deleteGuest(guest.id);
      alert("Guest deleted successfully.");

      if (editingGuest?.id === guest.id) {
        setEditingGuest(null);
      }

      await loadGuestsByEvent(guest.eventId);
    } catch (err: any) {
      console.error("Failed to delete guest", err);
      alert(err?.message || "Failed to delete guest.");
    } finally {
      setDeletingGuestId(null);
    }
  };

  const handleGuestSubmit = async (guestData: any) => {
    console.log("Guest Data:", guestData);

    if (guestData?.bulkImport) {
      const importedCount = Number(guestData.importedCount || 0);
      const failedCount = Number(guestData.failedCount || 0);
      alert(
        guestData.message ||
          `CSV processed: ${importedCount} guests imported, ${failedCount} failed.`,
      );
    } else {
      alert(`Guest ${guestData.fullNames} added successfully!`);
    }

    if (
      guestData?.eventId &&
      activeTab === "guests" &&
      guestData.eventId === selectedGuestEventId
    ) {
      await loadGuestsByEvent(guestData.eventId);
    }
  };

  useEffect(() => {
    if (activeTab !== "guests") {
      return;
    }

    if (events.length === 0) {
      setSelectedGuestEventId("");
      setEventGuests([]);
      return;
    }

    const selectedStillExists = events.some(
      (event) => event.id === selectedGuestEventId,
    );
    const eventIdToLoad = selectedStillExists
      ? selectedGuestEventId
      : events[0].id;

    if (eventIdToLoad !== selectedGuestEventId) {
      setSelectedGuestEventId(eventIdToLoad);
    }

    void loadGuestsByEvent(eventIdToLoad);
  }, [activeTab, events, selectedGuestEventId]);

  const handleViewDetails = async (eventId: string) => {
    try {
      setDetailLoading(true);

      const [eventResult, servicesResult] = await Promise.allSettled([
        getEventById(eventId),
        getEventServices(eventId),
      ]);

      if (eventResult.status === "fulfilled") {
        setDetailEvent(eventResult.value.data);
      } else {
        throw eventResult.reason;
      }

      if (servicesResult.status === "fulfilled") {
        setDetailEventServices(
          normalizeEventServices(servicesResult.value.data),
        );
      } else {
        setDetailEventServices([]);
      }
    } catch (err) {
      console.error("Failed to load event details", err);
      alert("Unable to fetch event details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      alert("Event deleted successfully.");
      await refetch();
      setDetailEvent(null);
      setDetailEventServices([]);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete event.");
    }
  };

  const handleEdit = (event: Event) => {
    navigate("/planner/create-event", { state: { editEvent: event } });
    setDetailEvent(null);
    setDetailEventServices([]);
  };

  const handleEditFromCard = (eventId: string) => {
    const rawEvent = events.find((e) => e.id === eventId);
    if (rawEvent) {
      navigate("/planner/create-event", { state: { editEvent: rawEvent } });
    }
  };

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <DashboardSidebar
        userType="planner"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 lg:ml-[var(--dashboard-sidebar-width)] transition-all duration-300">
        <DashboardHeader
          title={t("planner.dashboard")}
          subtitle={t("planner.postEventDesc")}
          userName={displayName}
          userInitials={userInitials}
        />

        <main className="p-6">
          {activeTab === "dashboard" && (
            <DashboardStats
              eventCount={plannerEventCount}
              budgetData={budgetData}
              vendorSpendingData={vendorSpendingData}
            />
          )}

          {activeTab === "dashboard" && (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {t("dashboard.myEvents")}
                  </p>
                  <p className="text-3xl font-bold text-primary dark:text-cyan-400">
                    {plannerEventCount}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {t("planner.findVendors")}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {plannerMatchedVendors}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {t("dashboard.totalSpent")}
                  </p>
                  <p className="text-3xl font-bold text-primary-soft dark:text-white">
                    {plannerTotalSpent.toLocaleString()} RWF
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "payments" ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-neutral dark:text-white mb-6">
                {t("dashboard.payments")}
              </h2>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-6 hover:border-primary transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2">
                          {payment.vendorName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" /> {payment.service}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {payment.eventName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>Event Date: {payment.date}</p>
                          <p>Payment Date: {payment.paymentDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.status === "completed" ? "Paid" : "Pending"}
                        </span>
                        <div className="bg-primary/10 px-4 py-2 rounded-lg mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Amount
                          </p>
                          <p className="text-xl font-bold text-primary dark:text-white">
                            {payment.amount.toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                      {payment.status === "pending" && (
                        <button
                          onClick={() =>
                            openPayment({
                              name: payment.vendorName,
                              service: payment.service,
                              price: payment.amount,
                            })
                          }
                          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                        >
                          {t("payment.payNow")}
                        </button>
                      )}
                      {payment.status === "completed" && (
                        <button className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold dark:text-gray-100">
                          View Receipt
                        </button>
                      )}
                      <button
                        onClick={() => openChat(payment.vendorName, "Vendor")}
                        className="border-2 border-primary text-primary dark:border-cyan-400 dark:text-cyan-400 px-6 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-cyan-900/20 font-semibold flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Contact Vendor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "messages" ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-neutral dark:text-white mb-2">
                {t("dashboard.messages")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Continue conversations with vendors from your confirmed
                bookings.
              </p>

              {chatOpen && selectedChat?.bookingId ? (
                <BookingChatPanel
                  bookingId={selectedChat.bookingId}
                  currentUserId={user?.userId}
                  onClose={() => setChatOpen(false)}
                  isModal={false}
                />
              ) : confirmedBookings.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No confirmed bookings yet. Chats will appear here once a
                  booking is confirmed.
                </div>
              ) : (
                <div className="space-y-4">
                  {confirmedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border-gray-200 p-5 dark:border-gray-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-semibold text-neutral dark:text-white">
                            {booking.vendorName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Event: {booking.eventName}
                          </p>
                        </div>
                        <button
                          onClick={() => openBookingChat(booking)}
                          className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
                        >
                          <MessageCircle className="h-4 w-4" /> Open Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "guests" ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral dark:text-white">
                    {t("dashboard.guests")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    View guests for your own event only.
                  </p>
                </div>
                {selectedGuestEvent && (
                  <button
                    onClick={() => handleAddGuest(selectedGuestEvent)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-soft flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Guest
                  </button>
                )}
              </div>

              {myEvents.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  Create an event first to manage your guests.
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Select Event
                    </label>
                    <select
                      value={selectedGuestEventId}
                      onChange={(e) => {
                        const eventId = e.target.value;
                        setSelectedGuestEventId(eventId);
                        void loadGuestsByEvent(eventId);
                      }}
                      className="w-full md:max-w-xl px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    >
                      {myEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} - {event.date}
                        </option>
                      ))}
                    </select>
                  </div>

                  {guestsLoading && (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="w-7 h-7 animate-spin text-primary" />
                      <span className="ml-3 text-gray-600 dark:text-gray-300">
                        Loading guests...
                      </span>
                    </div>
                  )}

                  {guestsError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-red-700 dark:text-red-200 font-semibold">
                          Error loading guests
                        </p>
                        <button
                          onClick={() =>
                            selectedEventForGuest &&
                            loadGuestsByEvent(selectedEventForGuest.id)
                          }
                          disabled={guestsLoading}
                          className="ml-2 px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {guestsLoading ? "Retrying..." : "Retry"}
                        </button>
                      </div>
                      <p className="text-red-600 dark:text-red-300 text-sm">
                        {guestsError}
                      </p>
                    </div>
                  )}

                  {!guestsLoading &&
                    !guestsError &&
                    eventGuests.length === 0 && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                        No guests found for this event.
                      </div>
                    )}

                  {!guestsLoading && !guestsError && eventGuests.length > 0 && (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-gray-700">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              Name
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              Phone
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              Email
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              Category
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              Table
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              RSVP
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventGuests.map((guest) => (
                            <tr
                              key={guest.id}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                                {guest.fullNames}
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                                {guest.phone}
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                                {guest.email}
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                                {guest.category}
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                                {guest.tableNumber}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    guest.rsvpstatus === "Confirmed"
                                      ? "bg-green-100 text-green-700"
                                      : guest.rsvpstatus === "Declined"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {guest.rsvpstatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openGuestEditor(guest)}
                                    className="rounded-md border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      void handleDeleteGuestRecord(guest)
                                    }
                                    disabled={deletingGuestId === guest.id}
                                    className="rounded-md border border-red-600 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-900/20"
                                  >
                                    {deletingGuestId === guest.id
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
                  )}

                  {editingGuest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <div className="mb-6 flex items-center justify-between">
                          <h3 className="text-xl font-bold text-neutral dark:text-white">
                            Edit Guest
                          </h3>
                          <button
                            onClick={() => setEditingGuest(null)}
                            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                            Close
                          </button>
                        </div>

                        <form
                          onSubmit={handleSaveGuestEdit}
                          className="space-y-4"
                        >
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="fullNames"
                              value={guestEditForm.fullNames}
                              onChange={handleGuestEditChange}
                              required
                              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Phone
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={guestEditForm.phone}
                                onChange={handleGuestEditChange}
                                required
                                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={guestEditForm.email}
                                onChange={handleGuestEditChange}
                                required
                                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Category
                              </label>
                              <select
                                name="category"
                                value={guestEditForm.category}
                                onChange={handleGuestEditChange}
                                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                              >
                                <option value="REGULAR">Regular</option>
                                <option value="VIP">VIP</option>
                                <option value="VVIP">VVIP</option>
                                <option value="FAMILY">Family</option>
                                <option value="FRIEND">Friend</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Table Number
                              </label>
                              <input
                                type="number"
                                name="tableNumber"
                                value={guestEditForm.tableNumber}
                                onChange={handleGuestEditChange}
                                min="0"
                                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                              RSVP Status
                            </label>
                            <select
                              name="rsvpstatus"
                              value={guestEditForm.rsvpstatus}
                              onChange={handleGuestEditChange}
                              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingGuest(null)}
                              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={guestActionLoading}
                              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {guestActionLoading ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-6 px-6">
                  {["my-events", "matched-vendors", "bookings"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-2 border-b-2 font-semibold capitalize ${
                        activeTab === tab
                          ? "border-primary text-primary dark:border-cyan-400 dark:text-cyan-400"
                          : "border-transparent text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {tab.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "my-events" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-neutral dark:text-white">
                        {t("dashboard.myEvents")}
                      </h2>
                      <button
                        onClick={() => navigate("/planner/create-event")}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-soft flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />{" "}
                        {t("dashboard.createEvent")}
                      </button>
                    </div>
                    {loading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary dark:text-cyan-400" />
                        <span className="ml-3 text-gray-600 dark:text-gray-300">
                          Loading your events...
                        </span>
                      </div>
                    )}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-lg mb-6">
                        <p className="text-red-800 dark:text-red-200">
                          Error loading events: {error}
                        </p>
                        <button
                          onClick={() => refetch()}
                          className="mt-2 text-red-600 dark:text-red-400 hover:underline font-semibold"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                    {!loading && myEvents.length === 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                          No events yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Create your first event to get started
                        </p>
                        <button
                          onClick={() => navigate("/planner/create-event")}
                          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-soft inline-flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Create Event
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition"
                        >
                          {/* Event Image Banner */}
                          <div className="relative h-40 bg-gradient-to-br from-primary to-primary-soft overflow-hidden">
                            {event.imageUrl ? (
                              <img
                                src={event.imageUrl}
                                alt={event.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-soft/20">
                                <Calendar className="w-16 h-16 text-primary/40" />
                              </div>
                            )}
                            <div className="absolute top-4 right-4">
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  event.status === "Published"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                              >
                                {event.status}
                              </span>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="p-6">
                            <h3 className="text-2xl font-bold text-neutral dark:text-white mb-2">
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> {event.date}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {event.location}
                              </span>
                            </div>

                            {event.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            {event.serviceList.length > 0 && (
                              <div className="mb-4">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
                                  Services
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {event.serviceList
                                    .slice(0, 4)
                                    .map((service) => (
                                      <span
                                        key={service.id}
                                        className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                      >
                                        {service.title || service.category}
                                      </span>
                                    ))}
                                  {event.serviceList.length > 4 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                      +{event.serviceList.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Event Stats Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                  Services Needed
                                </p>
                                <p className="font-bold text-indigo-600 text-lg mt-1">
                                  {event.services}
                                </p>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                  Event Type
                                </p>
                                <p className="font-bold text-neutral dark:text-white capitalize mt-1">
                                  {event.eventType}
                                </p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                  Guests
                                </p>
                                <p className="font-bold text-green-600 text-lg mt-1">
                                  {event.guestCount}
                                </p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                  Budget
                                </p>
                                <p className="font-bold text-neutral dark:text-white mt-1 text-sm">
                                  {event.total_budget.toLocaleString()} RWF
                                </p>
                              </div>
                              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                  Start Date
                                </p>
                                <p className="font-bold text-neutral dark:text-white mt-1 text-xs">
                                  {new Date(event.startDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                  End Date
                                </p>
                                <p className="font-bold text-neutral dark:text-white mt-1 text-xs">
                                  {new Date(event.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">
                              <button
                                onClick={() => handleViewDetails(event.id)}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-soft transition font-semibold text-sm"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleEditFromCard(event.id)}
                                className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition font-semibold text-sm"
                              >
                                Edit Event
                              </button>
                              <button
                                onClick={() => handleAddGuest(event)}
                                className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition font-semibold text-sm"
                              >
                                Add Guest
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "matched-vendors" && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {t("planner.matchedVendorsDesc")}
                    </p>
                    {matchedLoading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-gray-600 dark:text-gray-300">
                          Loading matched vendors...
                        </span>
                      </div>
                    )}
                    {matchedError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-lg mb-6">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-red-800 dark:text-red-200 font-semibold">
                            Error loading matched vendors
                          </p>
                          <button
                            onClick={loadMatchedVendors}
                            disabled={matchedLoading}
                            className="ml-2 px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {matchedLoading ? "Retrying..." : "Retry"}
                          </button>
                        </div>
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          {matchedError}
                        </p>
                      </div>
                    )}
                    {!matchedLoading &&
                      !matchedError &&
                      matchedVendors.length === 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-600 dark:text-gray-300">
                          No matched vendors available right now.
                        </div>
                      )}
                    <div className="space-y-4">
                      {matchedVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 transition"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-soft rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                                {vendor.businessName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xl font-bold truncate text-neutral dark:text-white">
                                    {vendor.businessName}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {vendor.location}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {vendor.packages.length} service package
                                  {vendor.packages.length === 1 ? "" : "s"}{" "}
                                  ready for booking.
                                </p>
                                {vendor.verified && (
                                  <span className="mt-3 inline-flex bg-blue-100 text-primary dark:bg-cyan-900/30 dark:text-cyan-400 text-xs px-2 py-1 rounded-full font-semibold items-center gap-1 w-fit">
                                    <Check className="w-3 h-3" /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => handleViewVendorProfile(vendor)}
                                className="border-2 border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold dark:text-gray-100"
                                disabled={loadingVendorProfileId === vendor.id}
                              >
                                {loadingVendorProfileId === vendor.id
                                  ? "Loading..."
                                  : "More"}
                              </button>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {vendor.packages.length > 0 ? (
                              vendor.packages.map((pkg) => (
                                <div
                                  key={pkg.id}
                                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary dark:bg-cyan-900/20 dark:text-cyan-300">
                                      {pkg.category}
                                    </span>
                                  </div>
                                  <h5 className="text-base font-semibold text-neutral dark:text-white">
                                    {pkg.title}
                                  </h5>
                                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                    {pkg.description}
                                  </p>
                                  <p className="mt-3 text-sm font-semibold text-green-600 dark:text-green-400">
                                    {pkg.minPrice.toLocaleString()} -{" "}
                                    {pkg.maxPrice.toLocaleString()} RWF
                                  </p>
                                  <button
                                    onClick={() =>
                                      openBookingForPackage(vendor, pkg)
                                    }
                                    className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-soft"
                                  >
                                    Book Package
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                No service packages published for this vendor
                                yet.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "bookings" && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {t("planner.bookingsDesc")}
                    </p>
                    {bookingsLoading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-gray-600 dark:text-gray-300">
                          Loading bookings...
                        </span>
                      </div>
                    )}
                    {bookingsError && (
                      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
                        Error loading bookings: {bookingsError}
                      </div>
                    )}
                    {!bookingsLoading &&
                      !bookingsError &&
                      bookings.length === 0 && (
                        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                          No bookings yet. Book a vendor package from Matched
                          Vendors.
                        </div>
                      )}
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-neutral dark:text-white mb-2">
                                {booking.vendorName}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />{" "}
                                  {booking.service}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />{" "}
                                  {new Date(
                                    booking.bookingDate,
                                  ).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />{" "}
                                  {booking.eventName}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg inline-block mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Booking Amount
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-white">
                              {booking.price.toLocaleString()} RWF
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setSelectedBookingDetails(booking)}
                              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => openBookingChat(booking)}
                              disabled={booking.status !== "confirmed"}
                              className={`border-2 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                                booking.status === "confirmed"
                                  ? "border-blue-600 text-blue-600 dark:border-cyan-400 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-cyan-900/20"
                                  : "border-gray-300 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-500"
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />{" "}
                              {t("planner.chatWithVendor")}
                            </button>
                            {booking.status === "confirmed" && (
                              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold cursor-default flex items-center gap-2">
                                <Check className="w-4 h-4" /> Confirmed
                              </button>
                            )}
                            {booking.status === "pending" && (
                              <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold cursor-default flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Pending
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {chatOpen && selectedChat?.bookingId && activeTab !== "messages" && (
            <BookingChatPanel
              bookingId={selectedChat.bookingId}
              currentUserId={user?.userId}
              onClose={() => setChatOpen(false)}
            />
          )}
          {chatOpen && selectedChat && !selectedChat.bookingId && (
            <Chat
              recipientName={selectedChat.name}
              recipientRole={selectedChat.role}
              onClose={() => setChatOpen(false)}
            />
          )}
          {paymentOpen && selectedVendor && (
            <PaymentModal
              vendor={selectedVendor}
              eventName="John & Mary Wedding"
              onClose={() => setPaymentOpen(false)}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
          {selectedVendorProfile && (
            <VendorProfileModal
              vendor={selectedVendorProfile}
              onClose={() => setSelectedVendorProfile(null)}
              onBookNow={() =>
                selectedVendorProfile.packages[0]
                  ? openBookingForPackage(
                      selectedVendorProfile,
                      selectedVendorProfile.packages[0],
                    )
                  : openPayment({
                      name: selectedVendorProfile.name,
                      service: selectedVendorProfile.service,
                      price: selectedVendorProfile.minPrice,
                    })
              }
              onBookPackage={(pkg) =>
                openBookingForPackage(selectedVendorProfile, pkg)
              }
              onSendMessage={() =>
                openChat(selectedVendorProfile.name, "Vendor")
              }
            />
          )}
          {addGuestOpen && selectedEventForGuest && (
            <AddGuestModal
              eventId={selectedEventForGuest.id}
              eventName={selectedEventForGuest.title}
              onClose={() => setAddGuestOpen(false)}
              onSubmit={handleGuestSubmit}
            />
          )}
          {detailLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {detailEvent && (
            <EventDetailsModal
              event={detailEvent}
              eventServices={detailEventServices}
              onClose={() => {
                setDetailEvent(null);
                setDetailEventServices([]);
              }}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          {bookingModalOpen && selectedVendorForBooking && (
            <BookingModal
              vendor={selectedVendorForBooking}
              events={myEvents}
              onClose={() => {
                setBookingModalOpen(false);
                setBookingToUpdate(null);
              }}
              onBookingSubmit={handleBookingSubmit}
            />
          )}
          {successMessage && (
            <SuccessModal
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
            />
          )}
          {selectedBookingDetails && (
            <BookingDetailsModal
              booking={selectedBookingDetails}
              onClose={() => setSelectedBookingDetails(null)}
              onCancel={handleCancelBooking}
              onDelete={handleDeleteBooking}
              onUpdate={handleUpdateBooking}
            />
          )}
        </main>
      </div>
    </div>
  );
}
