import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  Loader,
  RotateCcw,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  createEventWithServices,
  createServicesForEvent,
  getEventCategories,
  getServiceCategories,
  updateEvent,
  deleteEventService,
  updateEventService,
  getEventServices,
  type CreateEventServicePayload,
  type EventInput,
  type EventType,
  type EventVisibility,
  type ServiceCreationFailure,
  type EventService,
} from "../services/api";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import { useAuth } from "../context/AuthContext";
import {
  buildEventDescription,
  DEFAULT_EVENT_CATEGORY_NAMES,
  dedupeEventCategoryNames,
  extractCustomEventType,
  getInitialEventCategory,
  resolveEventTypeSelection,
  stripCustomEventTypePrefix,
} from "../utils/eventCategories";

interface ServiceDraft {
  category: string;
  title: string;
  description: string;
  budget: number;
  quantity: number;
}

interface EventFormData {
  title: string;
  description: string;
  eventType: EventType | "";
  status: "draft" | "published";
  visibility: EventVisibility;
  startDate: string;
  endDate: string;
  location: string;
  guestCount: number;
  budget: number;
  imageUrl: string;
  services: ServiceDraft[];
}

const DEFAULT_SERVICE_CATEGORY_NAMES = [
  "Photography",
  "Videography",
  "Catering",
  "Venue",
  "Decoration",
  "Bride Dress",
  "Bridesmaids Dresses",
  "Groom Suit",
  "Makeup & Hair",
  "Music/DJ",
  "Protocol Service",
  "Transportation",
  "Invitations",
  "Flowers",
];

const toDateTimeLocal = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60 * 1000;
  const local = new Date(parsed.getTime() - timezoneOffsetMs);
  return local.toISOString().slice(0, 16);
};

const toIsoDateTime = (localDateTime: string) => {
  const parsed = new Date(localDateTime);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format");
  }

  return parsed.toISOString();
};

const isHttpUrl = (value: string) => {
  if (!value.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeServicePayload = (
  services: ServiceDraft[],
): CreateEventServicePayload[] => {
  return services.map((service) => ({
    category: service.category,
    title: service.title.trim() || undefined,
    description: service.description.trim() || undefined,
    budget: service.budget,
    quantity: service.quantity,
  }));
};

export default function CreateEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const editEvent = location.state?.editEvent as Record<string, unknown> | null;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "",
    status: "draft" as "draft" | "published",
    visibility: "public",
    startDate: "",
    endDate: "",
    location: "",
    guestCount: 0,
    budget: 0,
    imageUrl: "",
    services: [],
  });

  const [serviceForm, setServiceForm] = useState<ServiceDraft>({
    category: "",
    title: "",
    description: "",
    budget: 0,
    quantity: 1,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetryingServices, setIsRetryingServices] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [createdEventData, setCreatedEventData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [failedServices, setFailedServices] = useState<
    ServiceCreationFailure[]
  >([]);
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);
  const [existingServices, setExistingServices] = useState<EventService[]>([]);
  const [isDeletingService, setIsDeletingService] = useState<string | null>(
    null,
  );
  const [editingService, setEditingService] = useState<EventService | null>(
    null,
  );
  const [editServiceForm, setEditServiceForm] = useState<Partial<EventService>>(
    {},
  );
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [eventCategoriesLoading, setEventCategoriesLoading] = useState(false);
  const [eventCategoriesError, setEventCategoriesError] = useState<
    string | null
  >(null);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [serviceCategoriesLoading, setServiceCategoriesLoading] =
    useState(false);
  const [serviceCategoriesError, setServiceCategoriesError] = useState<
    string | null
  >(null);
  const [selectedEventCategory, setSelectedEventCategory] = useState("");
  const [customEventType, setCustomEventType] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    let isCancelled = false;

    const loadEventCategories = async () => {
      try {
        setEventCategoriesLoading(true);
        setEventCategoriesError(null);

        const response = await getEventCategories();
        const categoryNames = dedupeEventCategoryNames(
          response.data.map((category) => category.name),
        );

        if (!isCancelled) {
          setEventCategories(categoryNames);
        }
      } catch (error) {
        if (!isCancelled) {
          setEventCategoriesError(
            error instanceof Error
              ? error.message
              : "Failed to load event categories.",
          );
          setEventCategories([]);
        }
      } finally {
        if (!isCancelled) {
          setEventCategoriesLoading(false);
        }
      }
    };

    void loadEventCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadServiceCategories = async () => {
      try {
        setServiceCategoriesLoading(true);
        setServiceCategoriesError(null);

        const response = await getServiceCategories();
        const categoryNames = dedupeEventCategoryNames(
          response.data.map((category) => category.name),
        );

        if (!isCancelled) {
          setServiceCategories(categoryNames);
        }
      } catch (error) {
        if (!isCancelled) {
          setServiceCategoriesError(
            error instanceof Error
              ? error.message
              : "Failed to load service categories.",
          );
          setServiceCategories([]);
        }
      } finally {
        if (!isCancelled) {
          setServiceCategoriesLoading(false);
        }
      }
    };

    void loadServiceCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editEvent) {
      return;
    }

    const rawEventType = String(
      editEvent.eventType || editEvent.event_type || editEvent.type || "",
    ).toLowerCase() as EventType | "";
    const rawDescription = String(editEvent.description || "");
    const nextCustomEventType = extractCustomEventType(rawDescription) || "";

    setFormData({
      title: String(
        editEvent.title || editEvent.name || editEvent.event_name || "",
      ),
      description: stripCustomEventTypePrefix(rawDescription),
      eventType: rawEventType,
      status: (editEvent.status === "published" ? "published" : "draft") as "draft" | "published",
      startDate: toDateTimeLocal(
        String(editEvent.startDate || editEvent.date || ""),
      ),
      endDate: toDateTimeLocal(
        String(editEvent.endDate || editEvent.date || ""),
      ),
      location: String(editEvent.location || ""),
      guestCount: Number(editEvent.guestCount || editEvent.guest_count || 0),
      budget: Number(editEvent.budget || 0),
      imageUrl: String(editEvent.imageUrl || editEvent.image || ""),
      visibility: (editEvent.visibility as EventVisibility) || "public",
      services: Array.isArray(editEvent.services)
        ? (editEvent.services as ServiceDraft[])
        : [],
    });
    setCustomEventType(nextCustomEventType);
    setSelectedEventCategory(
      getInitialEventCategory(rawEventType, rawDescription),
    );

    const existingImage = String(editEvent.imageUrl || editEvent.image || "");
    if (existingImage) {
      setImagePreview(existingImage);
    }

    // Fetch existing services for the event
    const fetchExistingServices = async () => {
      try {
        const eventId = String(editEvent.id);
        const response = await getEventServices(eventId);
        setExistingServices(response.data || []);
      } catch (err) {
        console.error("Failed to fetch existing services", err);
        setExistingServices([]);
      }
    };

    fetchExistingServices();
  }, [editEvent]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "";

  const servicesBudget = useMemo(
    () =>
      formData.services.reduce(
        (sum, service) => sum + (service.budget || 0) * (service.quantity || 1),
        0,
      ),
    [formData.services],
  );

  const totalBudget = formData.budget > 0 ? formData.budget : servicesBudget;

  const eventCategoryOptions = useMemo(() => {
    const baseCategories =
      eventCategories.length > 0
        ? eventCategories
        : DEFAULT_EVENT_CATEGORY_NAMES;

    return dedupeEventCategoryNames([...baseCategories, selectedEventCategory]);
  }, [eventCategories, selectedEventCategory]);

  const serviceCategoryOptions = useMemo(() => {
    const baseCategories =
      serviceCategories.length > 0
        ? serviceCategories
        : DEFAULT_SERVICE_CATEGORY_NAMES;

    return dedupeEventCategoryNames(baseCategories);
  }, [serviceCategories]);

  const editServiceCategoryOptions = useMemo(() => {
    const currentEditCategory = String(editServiceForm.category || "").trim();

    return currentEditCategory
      ? dedupeEventCategoryNames([
          ...serviceCategoryOptions,
          currentEditCategory,
        ])
      : serviceCategoryOptions;
  }, [serviceCategoryOptions, editServiceForm.category]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "guestCount" || name === "budget" ? Number(value) || 0 : value,
    }));
  };

  const handleEventCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextCategory = e.target.value;

    setSelectedEventCategory(nextCategory);

    if (!nextCategory) {
      setFormData((prev) => ({ ...prev, eventType: "" }));
      setCustomEventType("");
      return;
    }

    const resolvedSelection = resolveEventTypeSelection(nextCategory);

    setFormData((prev) => ({
      ...prev,
      eventType: resolvedSelection.eventType,
    }));
    setCustomEventType(resolvedSelection.customEventType);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Preview is local-only; backend expects a public URL in imageUrl.
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setServiceForm((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "quantity" ? Number(value) || 0 : value,
    }));
  };

  const addService = () => {
    setServiceFormError(null);

    const resolvedCategory = serviceForm.category.trim();

    if (!resolvedCategory) {
      setServiceFormError("Service category is required");
      return;
    }

    if (serviceForm.budget < 0) {
      setServiceFormError("Service budget cannot be negative");
      return;
    }

    if (serviceForm.quantity < 1) {
      setServiceFormError("Service quantity must be at least 1");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { ...serviceForm, category: resolvedCategory },
      ],
    }));

    setServiceForm({
      category: "",
      title: "",
      description: "",
      budget: 0,
      quantity: 1,
    });
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter(
        (_, serviceIndex) => serviceIndex !== index,
      ),
    }));
  };

  const handleDeleteExistingService = async (serviceId: string) => {
    if (!editEvent?.id) {
      return;
    }

    if (!window.confirm(t("event.deleteConfirm"))) {
      return;
    }

    try {
      setIsDeletingService(serviceId);
      await deleteEventService(String(editEvent.id), serviceId);
      setExistingServices((prev) =>
        prev.filter((service) => service.id !== serviceId),
      );
      setSuccessMessage(t("common.success"));
    } catch (err) {
      console.error("Failed to delete service", err);
      setSubmitError(t("common.error"));
    } finally {
      setIsDeletingService(null);
    }
  };

  const openEditService = (service: EventService) => {
    setEditingService(service);
    setEditServiceForm({
      category: service.category,
      title: service.title,
      description: service.description,
      budget: service.budget,
      quantity: service.quantity,
    });
  };

  const handleEditServiceChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setEditServiceForm((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "quantity" ? Number(value) || 0 : value,
    }));
  };

  const handleUpdateExistingService = async () => {
    if (!editEvent?.id || !editingService) {
      return;
    }

    const resolvedEditCategory = String(editServiceForm.category || "").trim();

    if (!resolvedEditCategory) {
      setSubmitError("Service category is required");
      return;
    }

    try {
      setIsUpdatingService(true);
      const updatePayload: Partial<CreateEventServicePayload> = {
        category: resolvedEditCategory,
        title: editServiceForm.title,
        description: editServiceForm.description,
        budget: editServiceForm.budget,
        quantity: editServiceForm.quantity,
      };

      await updateEventService(
        String(editEvent.id),
        editingService.id,
        updatePayload,
      );

      // Update the local state
      setExistingServices((prev) =>
        prev.map((service) =>
          service.id === editingService.id
            ? { ...service, ...updatePayload }
            : service,
        ),
      );

      setSuccessMessage(t("common.success"));
      setEditingService(null);
      setEditServiceForm({});
    } catch (err) {
      console.error("Failed to update service", err);
      setSubmitError(t("common.error"));
    } finally {
      setIsUpdatingService(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Event title is required";
    }

    if (!formData.eventType) {
      return "Event type is required";
    }

    if (formData.eventType === "other" && !customEventType.trim()) {
      return "Please specify your event type";
    }

    if (!formData.startDate) {
      return "Start date is required";
    }

    if (!formData.endDate) {
      return "End date is required";
    }

    if (!formData.location.trim()) {
      return "Location is required";
    }

    if (!formData.description.trim()) {
      return "Event description is required";
    }

    if (formData.guestCount < 1) {
      return "Guest count must be at least 1";
    }

    if (totalBudget <= 0) {
      return "Budget must be greater than 0";
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start.getTime() > end.getTime()) {
      return "End date must be after start date";
    }

    return null;
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unexpected error. Please try again.";
  };

  const handleRetryFailedServices = async () => {
    if (!createdEventId || failedServices.length === 0) {
      return;
    }

    setIsRetryingServices(true);
    setSubmitError(null);
    setSuccessMessage(null);

    const servicesToRetry = failedServices.map((service) => service.service);

    try {
      const retryResult = await createServicesForEvent(
        createdEventId,
        servicesToRetry,
      );

      if (retryResult.failedServices.length > 0) {
        setFailedServices(retryResult.failedServices);
        setSubmitError(
          `${retryResult.failedServices.length} service(s) still failed. Please retry again.`,
        );
        return;
      }

      setFailedServices([]);
      setSuccessMessage(t("common.success"));

      if (createdEventData) {
        navigate("/dashboard", { state: { newEvent: createdEventData } });
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsRetryingServices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);
    setFailedServices([]);

    if (!user) {
      setSubmitError("You must be logged in to create an event");
      setIsSubmitting(false);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      setIsSubmitting(false);
      return;
    }

    let eventInput: EventInput;

    try {
      const trimmedImageUrl = formData.imageUrl.trim();
      if (trimmedImageUrl && !isHttpUrl(trimmedImageUrl)) {
        setSubmitError("Image URL must be a valid http(s) URL");
        setIsSubmitting(false);
        return;
      }

      const resolvedDescription = buildEventDescription(
        formData.description,
        formData.eventType,
        customEventType,
      );

      eventInput = {
        title: formData.title.trim(),
        description: resolvedDescription,
        eventType: formData.eventType as EventType,
        status: formData.status,
        startDate: toIsoDateTime(formData.startDate),
        endDate: toIsoDateTime(formData.endDate),
        location: formData.location.trim(),
        budget: totalBudget,
        guestCount: formData.guestCount,
        visibility: formData.visibility,

        ...(trimmedImageUrl ? { imageUrl: trimmedImageUrl } : {}),
      };
    } catch {
      setSubmitError("Please provide valid start and end date values");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editEvent && editEvent.id) {
        const updatePayload: Partial<EventInput> = {
          title: eventInput.title,
          description: eventInput.description,
          eventType: eventInput.eventType,
          status: eventInput.status,
          startDate: eventInput.startDate,
          endDate: eventInput.endDate,
          location: eventInput.location,
          budget: eventInput.budget,
          guestCount: eventInput.guestCount,
          visibility: eventInput.visibility,

          ...(eventInput.imageUrl ? { imageUrl: eventInput.imageUrl } : {}),
        };

        // Some backend validators reject status updates in PUT /events/:id.
        const updateResponse = await updateEvent(
          String(editEvent.id),
          updatePayload,
        );

        // Handle services for the edited event (if any services were added in the form)
        const servicesPayload = normalizeServicePayload(formData.services);
        if (servicesPayload.length > 0) {
          const serviceResult = await createServicesForEvent(
            String(editEvent.id),
            servicesPayload,
          );

          if (serviceResult.failedServices.length > 0) {
            setFailedServices(serviceResult.failedServices);
            setSubmitError(
              `Event updated, but ${serviceResult.failedServices.length} service(s) failed. Retry below.`,
            );
            return;
          }
        }

        setSuccessMessage(t("common.success"));
        navigate("/dashboard", { state: { newEvent: updateResponse.data } });
        return;
      }

      const servicesPayload = normalizeServicePayload(formData.services);

      // userId is always taken from the authenticated session, never from user-entered form data.
      const result = await createEventWithServices(
        user.userId,
        eventInput,
        servicesPayload,
      );

      setCreatedEventId(result.event.id);
      setCreatedEventData(result.event as unknown as Record<string, unknown>);

      if (result.failedServices.length > 0) {
        setFailedServices(result.failedServices);
        setSubmitError(
          `Event was created, but ${result.failedServices.length} service(s) failed. Retry below.`,
        );
        return;
      }

      setSuccessMessage(t("common.success"));
      navigate("/dashboard", { state: { newEvent: result.event } });
    } catch (error) {
      // If event creation fails, backend message is surfaced and service creation is skipped.
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">{t("event.checkingSession")}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <DashboardSidebar
        userType="planner"
        activeTab="my-events"
        onTabChange={(_tab) => {
          navigate("/dashboard");
        }}
      />
      <div className="flex-1 lg:ml-[var(--dashboard-sidebar-width)] transition-all duration-300">
        <DashboardHeader
          title={t(editEvent ? "event.edit" : "dashboard.createEvent")}
          subtitle={t("planner.postEventDesc")}
          userName={displayName}
          userInitials={userInitials}
        />
        <main className="p-6">
          <div className="min-h-screen bg-background py-12">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-2">
                  {editEvent ? t("event.edit") : t("event.create")}
                </h1>
                <p className="text-gray-600 mb-8">
                  {t("event.tellAboutEvent")}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                      {t("event.eventName")} *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., John & Mary's Wedding"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                      {t("event.eventImage")}
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {t("event.imageUrlLabel")}
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        OR
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {t("event.uploadImage")}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      {(imagePreview || formData.imageUrl) && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border dark:border-gray-600">
                          <img
                            src={imagePreview || formData.imageUrl}
                            alt="Event preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.eventCategory")} *
                      </label>
                      <select
                        name="eventCategory"
                        value={selectedEventCategory}
                        onChange={handleEventCategoryChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">{t("event.selectEventCategory")}</option>
                        {eventCategoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {eventCategoriesLoading && (
                        <p className="mt-2 text-xs text-gray-500">
                          {t("event.loadingEventCategories")}
                        </p>
                      )}
                      {eventCategoriesError && (
                        <p className="mt-2 text-xs text-amber-600">
                          {t("event.defaultEventCategories")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.status")} *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="draft">{t("event.draft")}</option>
                        <option value="published">{t("event.active")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.visibility")} *
                      </label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="public">{t("event.public")}</option>
                        <option value="private">{t("event.private")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.startDate")} *
                      </label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.endDate")} *
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.eventLocation")} *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Kigali Convention Center"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("event.expectedGuests")} *
                      </label>
                      <input
                        type="number"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="250"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("event.budgetRwf")} *
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="5000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("event.budgetHint")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("event.eventDescription")}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Describe your event and requirements..."
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold mb-4">{t("event.servicesNeeded")}</h3>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceCategory")} *
                          </label>
                          <select
                            name="category"
                            value={serviceForm.category}
                            onChange={handleServiceChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">{t("event.selectCategory")}</option>
                            {serviceCategoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          {serviceCategoriesLoading && (
                            <p className="mt-2 text-xs text-gray-500">
                              {t("event.loadingServiceCategories")}
                            </p>
                          )}
                          {serviceCategoriesError && (
                            <p className="mt-2 text-xs text-amber-600">
                              {t("event.defaultServiceCategories")}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceTitle")}
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={serviceForm.title}
                            onChange={handleServiceChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g., Buffet Service"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceDescription")}
                          </label>
                          <input
                            type="text"
                            name="description"
                            value={serviceForm.description}
                            onChange={handleServiceChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Food and drinks"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceBudget")}
                          </label>
                          <input
                            type="number"
                            name="budget"
                            value={serviceForm.budget}
                            onChange={handleServiceChange}
                            min="0"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="1200000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceQuantity")}
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            value={serviceForm.quantity}
                            onChange={handleServiceChange}
                            min="1"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {serviceFormError && (
                        <p className="text-sm text-red-700 mb-3">
                          {serviceFormError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={addService}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-soft"
                      >
                        {t("event.addService")}
                      </button>
                    </div>

                    {existingServices.length > 0 && (
                      <div className="space-y-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900">
                          {t("event.existingServices")}
                        </h4>
                        {existingServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between bg-white border border-indigo-100 rounded-lg p-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {service.category}
                              </p>
                              <p className="text-sm text-gray-600">
                                {service.title ? `${service.title} • ` : ""}
                                {service.description
                                  ? `${service.description} • `
                                  : ""}
                                {t("event.qty")}: {service.quantity || 1} • {t("event.budget")}:{" "}
                                {(service.budget || 0).toLocaleString()} RWF
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditService(service)}
                                disabled={editingService?.id === service.id}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                {t("common.edit")}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteExistingService(service.id)
                                }
                                disabled={isDeletingService === service.id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {isDeletingService === service.id ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    {t("event.deleting")}
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    {t("common.delete")}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingService && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold text-yellow-900">
                          {t("event.editServiceTitle")}: {editingService.category}
                        </h4>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceCategory")} *
                          </label>
                          <select
                            name="category"
                            value={editServiceForm.category || ""}
                            onChange={handleEditServiceChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">{t("event.selectCategory")}</option>
                            {editServiceCategoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceTitle")}
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={editServiceForm.title || ""}
                            onChange={handleEditServiceChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {t("event.serviceDescription")}
                          </label>
                          <textarea
                            name="description"
                            value={editServiceForm.description || ""}
                            onChange={handleEditServiceChange}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {t("event.serviceBudget")}
                            </label>
                            <input
                              type="number"
                              name="budget"
                              value={editServiceForm.budget || 0}
                              onChange={handleEditServiceChange}
                              min="0"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {t("event.serviceQuantity")}
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={editServiceForm.quantity || 1}
                              onChange={handleEditServiceChange}
                              min="1"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleUpdateExistingService}
                            disabled={isUpdatingService}
                            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdatingService
                              ? t("event.updating")
                              : t("event.updateService")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(null);
                              setEditServiceForm({});
                            }}
                            className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.services.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">{t("event.addedServices")}</h4>
                        {formData.services.map((service, index) => (
                          <div
                            key={`${service.category}-${service.title}-${index}`}
                            className="flex items-center justify-between bg-white border rounded-lg p-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {service.category}
                              </p>
                              <p className="text-sm text-gray-600">
                                {service.title ? `${service.title} • ` : ""}
                                {service.description
                                  ? `${service.description} • `
                                  : ""}
                                {t("event.qty")}: {service.quantity} • {t("event.budget")}:{" "}
                                {service.budget.toLocaleString()} RWF
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              {t("event.remove")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-blue-50 border border-primary rounded-lg p-4 mt-4">
                      <p className="text-lg font-bold text-primary">
                        {t("event.totalBudget")}: {totalBudget.toLocaleString()} RWF
                      </p>
                    </div>
                  </div>

                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5" />
                      <p>{successMessage}</p>
                    </div>
                  )}

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-semibold">{t("event.submissionError")}</p>
                        <p>{submitError}</p>
                      </div>
                    </div>
                  )}

                  {failedServices.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 space-y-3">
                      <p className="font-semibold">
                        {t("event.failedServices")} ({failedServices.length})
                      </p>
                      <ul className="space-y-2 text-sm">
                        {failedServices.map((failed, index) => (
                          <li
                            key={`${failed.service.category}-${index}`}
                            className="bg-white border border-amber-200 rounded p-3"
                          >
                            <p>
                              <span className="font-semibold">{t("event.category")}:</span>{" "}
                              {failed.service.category}
                            </p>
                            {failed.service.title && (
                              <p>
                                <span className="font-semibold">{t("event.serviceTitle")}:</span>{" "}
                                {failed.service.title}
                              </p>
                            )}
                            <p>
                              <span className="font-semibold">{t("event.reason")}:</span>{" "}
                              {failed.error}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={handleRetryFailedServices}
                        disabled={isRetryingServices}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        {isRetryingServices && (
                          <Loader className="w-4 h-4 animate-spin" />
                        )}
                        {!isRetryingServices && (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        {isRetryingServices
                          ? t("event.retrying")
                          : t("event.retryFailedServices")}
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || isRetryingServices}
                      className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting && (
                        <Loader className="w-5 h-5 animate-spin" />
                      )}
                      {isSubmitting
                        ? editEvent
                          ? t("event.updatingEvent")
                          : t("event.creatingEvent")
                        : editEvent
                          ? t("event.updateEvent")
                          : t("event.create")}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      disabled={isSubmitting || isRetryingServices}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
