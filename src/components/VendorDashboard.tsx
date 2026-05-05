import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Target,
  MessageCircle,
  Camera,
  User,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import BookingChatPanel from "./BookingChatPanel";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../hooks/useBookings";
import { type Booking } from "../services/api";
import {
  createVendorInfo,
  createVendorServicePackage,
  deleteVendorServicePackage,
  getVendorByUserId,
  getVendorInfo,
  getVendorServicePackages,
  uploadVendorMedia,
  updateVendorInfo,
  updateVendorServicePackage,
  type VendorServicePackage,
} from "../services/api";

interface BusinessInfo {
  businessName: string;
  bio: string;
  experienceYears: number;
  location: string;
  profileImage: string | null;
  portfolioImages: string[];
  certifications: string[];
  awards: string[];
}

interface ServicePackage {
  id: string;
  category: string;
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
}

const MAX_VENDOR_IMAGE_BYTES = 120 * 1024;
const MAX_VENDOR_PORTFOLIO_IMAGES = 3;

const byteLength = (value: string): number => new Blob([value]).size;

const isHttpUrl = (value: string): boolean =>
  /^https?:\/\//i.test(value.trim());

const isDataImageUrl = (value: string): boolean =>
  value.trim().startsWith("data:image/");

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error("Failed to prepare image for upload");
  }

  return response.blob();
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string) || "");
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const compressImageFile = async (file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) {
    return readFileAsDataUrl(file);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load selected image"));
      img.src = objectUrl;
    });

    const maxDimension = 800;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process selected image");
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Iteratively reduce quality until the data URL is under the target size.
    const TARGET_BYTES = 55 * 1024;
    for (const quality of [0.7, 0.55, 0.4, 0.28, 0.18]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (byteLength(dataUrl) <= TARGET_BYTES) {
        return dataUrl;
      }
    }
    return canvas.toDataURL("image/jpeg", 0.18);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const normalizeImageValue = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  // Always pass through HTTP/HTTPS URLs (e.g. Cloudinary).
  if (isHttpUrl(trimmed)) return trimmed;
  // Pass through data URLs only if small enough.
  if (
    trimmed.startsWith("data:image/") &&
    byteLength(trimmed) <= MAX_VENDOR_IMAGE_BYTES
  ) {
    return trimmed;
  }
  // Skip anything else silently so text-field saves always work.
  return "";
};

type VendorBusinessPayloadInput = {
  userId: string;
  businessName: string;
  bio: string;
  experienceYears: number;
  location: string;
  profileImage: string;
  portfolioImages: string[];
  certifications: string[];
  awards: string[];
};

const buildVendorBusinessPayload = (input: VendorBusinessPayloadInput) => {
  const profileImage = normalizeImageValue(input.profileImage);
  // Only include portfolio images that pass validation (HTTP URLs or small data URLs).
  // Silently skip oversized/invalid entries so text-field saves always succeed.
  const portfolioImages = input.portfolioImages
    .map((image) => normalizeImageValue(image))
    .filter(Boolean)
    .slice(0, MAX_VENDOR_PORTFOLIO_IMAGES);

  return {
    userId: input.userId,
    businessName: input.businessName.trim(),
    bio: input.bio.trim(),
    experienceYears: input.experienceYears,
    location: input.location.trim(),
    profileImage: profileImage || undefined,
    portfolioImages,
    certifications: input.certifications,
    awards: input.awards,
  };
};

const normalizeServicePackages = (raw: unknown): ServicePackage[] => {
  if (Array.isArray(raw)) {
    return raw.map((pkg) => ({
      id: String(pkg.id),
      category: pkg.category || "",
      title: pkg.title || "",
      description: pkg.description || "",
      minPrice: Number(pkg.minPrice || 0),
      maxPrice: Number(pkg.maxPrice || 0),
    }));
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { packages?: VendorServicePackage[] }).packages)
  ) {
    return normalizeServicePackages(
      (raw as { packages: VendorServicePackage[] }).packages,
    );
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { items?: VendorServicePackage[] }).items)
  ) {
    return normalizeServicePackages(
      (raw as { items: VendorServicePackage[] }).items,
    );
  }

  return [];
};

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord | null =>
  typeof value === "object" && value !== null ? (value as AnyRecord) : null;

const unwrapVendorRecord = (value: unknown): AnyRecord | null => {
  let current = asRecord(value);

  for (let depth = 0; depth < 3; depth += 1) {
    if (!current) {
      return null;
    }

    const nestedData = asRecord(current.data);
    if (nestedData) {
      current = nestedData;
      continue;
    }

    const nestedVendor = asRecord(current.vendor ?? current.Vendor);
    if (nestedVendor) {
      current = nestedVendor;
      continue;
    }

    return current;
  }

  return current;
};

const firstNonEmptyString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

const extractVendorRecordId = (vendor: unknown): string | null => {
  const vendorRecord = unwrapVendorRecord(vendor);
  if (!vendorRecord) {
    return null;
  }

  const id = vendorRecord.id;
  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  return null;
};

const normalizeVendorBusinessInfo = (
  vendor: unknown,
  fallbackName: string,
): BusinessInfo => {
  const vendorRecord = unwrapVendorRecord(vendor);
  const userRecord =
    asRecord(vendorRecord?.user) || asRecord(vendorRecord?.User);

  const displayNameFromUser =
    `${firstNonEmptyString(userRecord?.firstName)} ${firstNonEmptyString(userRecord?.lastName)}`.trim();

  return {
    businessName: firstNonEmptyString(
      vendorRecord?.businessName,
      vendorRecord?.business_name,
      displayNameFromUser,
      fallbackName,
    ),
    bio: firstNonEmptyString(vendorRecord?.bio),
    experienceYears: toNumber(
      vendorRecord?.experienceYears ?? vendorRecord?.experience_years,
    ),
    location: firstNonEmptyString(vendorRecord?.location),
    profileImage:
      firstNonEmptyString(
        vendorRecord?.profileImage,
        vendorRecord?.profile_image,
      ) || null,
    portfolioImages: toStringArray(
      vendorRecord?.portfolioImages ?? vendorRecord?.portfolio_images,
    ),
    certifications: toStringArray(vendorRecord?.certifications),
    awards: toStringArray(vendorRecord?.awards),
  };
};

export default function VendorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    name: string;
    eventName: string;
    bookingId: string;
    contactId: number;
  } | null>(null);
  const [editingBusinessInfo, setEditingBusinessInfo] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(
    null,
  );
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [vendorRecordId, setVendorRecordId] = useState<string | null>(null);
  const [loadingVendorData, setLoadingVendorData] = useState(true);
  const [vendorDataError, setVendorDataError] = useState<string | null>(null);
  const [savingBusinessInfo, setSavingBusinessInfo] = useState(false);
  const [savingPackage, setSavingPackage] = useState(false);
  // Business Information State
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: "",
    bio: "",
    experienceYears: 0,
    location: "",
    profileImage: null,
    portfolioImages: [],
    certifications: [],
    awards: [],
  });

  // Service Packages State
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);

  // Temp state for editing
  const [tempBusinessInfo, setTempBusinessInfo] =
    useState<BusinessInfo>(businessInfo);
  const [tempCertificationInput, setTempCertificationInput] = useState("");
  const [tempAwardInput, setTempAwardInput] = useState("");
  const [tempPackage, setTempPackage] = useState<ServicePackage>({
    id: "",
    category: "",
    title: "",
    description: "",
    minPrice: 0,
    maxPrice: 0,
  });
  const [formData, setFormData] = useState({
    business_name: "",
    bio: "",
    experience_years: 0,
    location: "",
    profile_picture: null as string | null,
    portfolio_images: [] as string[],
    phone: "",
    email: "",
    website: "",
    services: [] as string[],
    service_input: "",
    certifications: [] as string[],
    awards: [] as string[],
    certification_input: "",
    award_input: "",
    terms_accepted: false,
  });

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    setBookingStatus,
  } = useBookings({
    vendorId: vendorRecordId || undefined,
    enabled: Boolean(vendorRecordId),
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      email: prev.email || user.email,
      phone: prev.phone || user.phone || "",
      business_name:
        prev.business_name || `${user.firstName} ${user.lastName}`.trim(),
    }));
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadVendorData = async () => {
      try {
        setLoadingVendorData(true);
        setVendorDataError(null);

        const vendor = await getVendorByUserId(user.userId);
        const resolvedVendorId = vendor ? extractVendorRecordId(vendor) : null;
        let nextServicePackages: ServicePackage[] = [];

        if (resolvedVendorId) {
          try {
            const packageOwnerCandidates = getPackageOwnerCandidates(
              user.userId,
            );
            let packagesResponse;
            let lastError: unknown;

            for (const ownerId of packageOwnerCandidates) {
              try {
                packagesResponse = await getVendorServicePackages(ownerId);
                break;
              } catch (error) {
                lastError = error;
                if (!shouldRetryPackageRequest(error)) {
                  throw error;
                }
              }
            }

            if (!packagesResponse) {
              throw lastError instanceof Error
                ? lastError
                : new Error("Failed to load service packages");
            }

            nextServicePackages = normalizeServicePackages(
              packagesResponse.data || [],
            );
          } catch {
            nextServicePackages = [];
          }
        }

        if (cancelled) {
          return;
        }

        if (vendor) {
          const nextBusinessInfo = normalizeVendorBusinessInfo(
            vendor,
            `${user.firstName} ${user.lastName}`.trim(),
          );

          setVendorRecordId(resolvedVendorId);
          setBusinessInfo(nextBusinessInfo);
          setTempBusinessInfo(nextBusinessInfo);
          setFormData((prev) => ({
            ...prev,
            business_name: nextBusinessInfo.businessName,
            bio: nextBusinessInfo.bio,
            experience_years: nextBusinessInfo.experienceYears,
            location: nextBusinessInfo.location,
            profile_picture: nextBusinessInfo.profileImage,
            portfolio_images: nextBusinessInfo.portfolioImages,
            certifications: nextBusinessInfo.certifications,
            awards: nextBusinessInfo.awards,
            certification_input: "",
            award_input: "",
          }));
        } else {
          setVendorRecordId(null);
          const emptyBusinessInfo = {
            businessName: `${user.firstName} ${user.lastName}`.trim(),
            bio: "",
            experienceYears: 0,
            location: "",
            profileImage: null,
            portfolioImages: [],
            certifications: [],
            awards: [],
          };
          setBusinessInfo(emptyBusinessInfo);
          setTempBusinessInfo(emptyBusinessInfo);
        }

        if (cancelled) {
          return;
        }

        setServicePackages(nextServicePackages);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load vendor dashboard data";
        setVendorDataError(message);
      } finally {
        if (!cancelled) {
          setLoadingVendorData(false);
        }
      }
    };

    loadVendorData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName =
    businessInfo.businessName ||
    (user ? `${user.firstName} ${user.lastName}`.trim() : "Vendor");
  const userInitials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "V";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "experience_years"
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    compressImageFile(file)
      .then((image) => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: image,
        }));
      })
      .catch((error) => {
        setVendorDataError(
          error instanceof Error
            ? error.message
            : "Failed to process profile image",
        );
      });
  };

  const handlePortfolioImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }

    Promise.all(Array.from(files).map((file) => compressImageFile(file)))
      .then((images) => {
        setFormData((prev) => ({
          ...prev,
          portfolio_images: [...prev.portfolio_images, ...images],
        }));
      })
      .catch((error) => {
        setVendorDataError(
          error instanceof Error
            ? error.message
            : "Failed to process selected portfolio images",
        );
      });
  };

  const removePortfolioImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolio_images: prev.portfolio_images.filter((_, i) => i !== index),
    }));
  };

  const addTagToFormData = (
    valuesField: "certifications" | "awards",
    inputField: "certification_input" | "award_input",
  ) => {
    const nextValue = formData[inputField].trim();
    if (!nextValue) {
      return;
    }

    setFormData((prev) => {
      if (prev[valuesField].some((item) => item === nextValue)) {
        return {
          ...prev,
          [inputField]: "",
        };
      }

      return {
        ...prev,
        [valuesField]: [...prev[valuesField], nextValue],
        [inputField]: "",
      };
    });
  };

  const removeTagFromFormData = (
    valuesField: "certifications" | "awards",
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [valuesField]: prev[valuesField].filter((_, i) => i !== index),
    }));
  };

  const addService = () => {
    if (formData.service_input.trim()) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, prev.service_input.trim()],
        service_input: "",
      }));
    }
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const uploadPendingVendorImages = async (
    vendorId: string,
    profileImage: string | null,
    portfolioImages: string[],
  ) => {
    const pendingProfileImage =
      profileImage && isDataImageUrl(profileImage) ? profileImage : null;
    const pendingPortfolioImages = portfolioImages
      .filter(isDataImageUrl)
      .slice(0, MAX_VENDOR_PORTFOLIO_IMAGES);

    if (!pendingProfileImage && pendingPortfolioImages.length === 0) {
      return;
    }

    const [profileBlob, portfolioBlobs] = await Promise.all([
      pendingProfileImage
        ? dataUrlToBlob(pendingProfileImage)
        : Promise.resolve<Blob | undefined>(undefined),
      Promise.all(pendingPortfolioImages.map((image) => dataUrlToBlob(image))),
    ]);

    await uploadVendorMedia(vendorId, {
      profileImage: profileBlob,
      portfolioImages: portfolioBlobs,
    });
  };

  const shouldRetryPackageRequest = (error: unknown): boolean => {
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();
    return message.includes("404") || message.includes("not found");
  };

  const getPackageOwnerCandidates = (
    preferredOwnerId?: string | null,
  ): string[] => {
    const candidates = [preferredOwnerId, user?.userId, vendorRecordId]
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      )
      .map((value) => value.trim());

    return Array.from(new Set(candidates));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    try {
      setSavingBusinessInfo(true);
      setVendorDataError(null);

      const fullPayload = buildVendorBusinessPayload({
        userId: user.userId,
        businessName: formData.business_name,
        bio: formData.bio,
        experienceYears: formData.experience_years,
        location: formData.location,
        // Keep only persisted URLs in JSON payload; upload local files separately.
        profileImage: isHttpUrl(formData.profile_picture || "")
          ? formData.profile_picture || ""
          : "",
        portfolioImages: formData.portfolio_images.filter(isHttpUrl),
        certifications: formData.certifications,
        awards: formData.awards,
      });

      let savedVendorData: unknown;
      let resolvedVendorId = vendorRecordId;

      if (vendorRecordId) {
        // PUT must not include userId in the body
        const { userId: _omit, ...updatePayload } = fullPayload;
        console.log(
          "[VendorDashboard] PUT /vendors/" + vendorRecordId,
          updatePayload,
        );
        await updateVendorInfo(vendorRecordId, updatePayload);
      } else {
        console.log("[VendorDashboard] POST /vendors", fullPayload);
        const createResponse = await createVendorInfo(fullPayload);
        savedVendorData = createResponse.data;
        resolvedVendorId = extractVendorRecordId(createResponse.data);
      }

      if (!resolvedVendorId) {
        throw new Error("Vendor profile ID was not found after saving");
      }

      await uploadPendingVendorImages(
        resolvedVendorId,
        formData.profile_picture,
        formData.portfolio_images,
      );

      const freshResponse = await getVendorInfo(resolvedVendorId);
      savedVendorData = freshResponse.data;

      const nextBusinessInfo = normalizeVendorBusinessInfo(
        savedVendorData,
        fullPayload.businessName,
      );

      setVendorRecordId(resolvedVendorId);
      setBusinessInfo(nextBusinessInfo);
      setTempBusinessInfo(nextBusinessInfo);
      setFormData((prev) => ({
        ...prev,
        business_name: nextBusinessInfo.businessName,
        bio: nextBusinessInfo.bio,
        experience_years: nextBusinessInfo.experienceYears,
        location: nextBusinessInfo.location,
        profile_picture: nextBusinessInfo.profileImage,
        portfolio_images: nextBusinessInfo.portfolioImages,
        certifications: nextBusinessInfo.certifications,
        awards: nextBusinessInfo.awards,
      }));
      setIsEditing(false);
      setIsPending(false);
    } catch (error) {
      console.error("[VendorDashboard] handleSubmit error:", error);
      setVendorDataError(
        error instanceof Error
          ? error.message
          : "Failed to save vendor profile",
      );
    } finally {
      setSavingBusinessInfo(false);
    }
  };

  const handleBookingAction = async (
    id: string,
    action: "confirm" | "reject",
  ) => {
    try {
      await setBookingStatus(
        id,
        action === "confirm" ? "accepted" : "rejected",
      );
    } catch (error) {
      setVendorDataError(
        error instanceof Error
          ? error.message
          : "Failed to update booking status",
      );
    }
  };

  const resolvePlannerName = (booking: Booking) => {
    const plannerId = booking.userId || booking.plannerId;
    if (!plannerId) {
      return "Event Planner";
    }

    return `Planner ${plannerId.slice(0, 6)}`;
  };

  const openChat = (
    planner: string,
    eventName: string,
    bookingId: string,
    contactId: number,
  ) => {
    setSelectedChat({ name: planner, eventName, bookingId, contactId });
    setChatOpen(true);
  };

  const totalEarnings = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.price, 0);
  const pendingEarnings = bookings
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.price, 0);

  // Business Info CRUD Operations
  const saveBusinessInfo = async () => {
    if (!user) {
      return;
    }

    try {
      setSavingBusinessInfo(true);
      setVendorDataError(null);

      const fullPayload = buildVendorBusinessPayload({
        userId: user.userId,
        businessName: tempBusinessInfo.businessName,
        bio: tempBusinessInfo.bio,
        experienceYears: tempBusinessInfo.experienceYears,
        location: tempBusinessInfo.location,
        // Keep only persisted URLs in JSON payload; upload local files separately.
        profileImage: isHttpUrl(tempBusinessInfo.profileImage || "")
          ? tempBusinessInfo.profileImage || ""
          : "",
        portfolioImages: tempBusinessInfo.portfolioImages.filter(isHttpUrl),
        certifications: tempBusinessInfo.certifications,
        awards: tempBusinessInfo.awards,
      });

      let savedVendorData: unknown;
      let resolvedVendorId = vendorRecordId;

      if (vendorRecordId) {
        // PUT must not include userId in the body
        const { userId: _omit, ...updatePayload } = fullPayload;
        console.log(
          "[VendorDashboard] PUT /vendors/" + vendorRecordId,
          updatePayload,
        );
        await updateVendorInfo(vendorRecordId, updatePayload);
      } else {
        console.log("[VendorDashboard] POST /vendors", fullPayload);
        const createResponse = await createVendorInfo(fullPayload);
        savedVendorData = createResponse.data;
        resolvedVendorId = extractVendorRecordId(createResponse.data);
      }

      if (!resolvedVendorId) {
        throw new Error("Vendor profile ID was not found after saving");
      }

      await uploadPendingVendorImages(
        resolvedVendorId,
        tempBusinessInfo.profileImage,
        tempBusinessInfo.portfolioImages,
      );

      const freshResponse = await getVendorInfo(resolvedVendorId);
      savedVendorData = freshResponse.data;

      const nextBusinessInfo = normalizeVendorBusinessInfo(
        savedVendorData,
        fullPayload.businessName,
      );

      setVendorRecordId(resolvedVendorId);
      setBusinessInfo(nextBusinessInfo);
      setTempBusinessInfo(nextBusinessInfo);
      setFormData((prev) => ({
        ...prev,
        business_name: nextBusinessInfo.businessName,
        bio: nextBusinessInfo.bio,
        experience_years: nextBusinessInfo.experienceYears,
        location: nextBusinessInfo.location,
        profile_picture: nextBusinessInfo.profileImage,
        portfolio_images: nextBusinessInfo.portfolioImages,
        certifications: nextBusinessInfo.certifications,
        awards: nextBusinessInfo.awards,
      }));
      setEditingBusinessInfo(false);
    } catch (error) {
      console.error("[VendorDashboard] saveBusinessInfo error:", error);
      setVendorDataError(
        error instanceof Error
          ? error.message
          : "Failed to save business information",
      );
    } finally {
      setSavingBusinessInfo(false);
    }
  };

  const cancelEditBusinessInfo = () => {
    setTempBusinessInfo(businessInfo);
    setTempCertificationInput("");
    setTempAwardInput("");
    setEditingBusinessInfo(false);
  };

  const handleBusinessInfoChange = (
    field: keyof BusinessInfo,
    value: string | number,
  ) => {
    setTempBusinessInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    compressImageFile(file)
      .then((image) => {
        setTempBusinessInfo((prev) => ({
          ...prev,
          profileImage: image,
        }));
      })
      .catch((error) => {
        setVendorDataError(
          error instanceof Error
            ? error.message
            : "Failed to process profile image",
        );
      });
  };

  const handleBusinessPortfolioUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) {
      return;
    }

    Promise.all(Array.from(files).map((file) => compressImageFile(file)))
      .then((images) => {
        setTempBusinessInfo((prev) => ({
          ...prev,
          portfolioImages: [...prev.portfolioImages, ...images],
        }));
      })
      .catch((error) => {
        setVendorDataError(
          error instanceof Error
            ? error.message
            : "Failed to process selected portfolio images",
        );
      });
  };

  const removeBusinessPortfolioImage = (index: number) => {
    setTempBusinessInfo((prev) => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index),
    }));
  };

  const addTagToBusinessInfo = (
    field: "certifications" | "awards",
    value: string,
    resetInput: () => void,
  ) => {
    const nextValue = value.trim();
    if (!nextValue) {
      return;
    }

    setTempBusinessInfo((prev) => {
      if (prev[field].some((item) => item === nextValue)) {
        return prev;
      }

      return {
        ...prev,
        [field]: [...prev[field], nextValue],
      };
    });

    resetInput();
  };

  const removeTagFromBusinessInfo = (
    field: "certifications" | "awards",
    index: number,
  ) => {
    setTempBusinessInfo((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Service Package CRUD Operations
  const addServicePackage = async () => {
    if (!user) {
      return;
    }

    if (!vendorRecordId) {
      setVendorDataError(
        "Save your business profile first before adding packages.",
      );
      return;
    }

    try {
      setSavingPackage(true);
      setVendorDataError(null);

      const payload = {
        category: tempPackage.category.trim(),
        title: tempPackage.title.trim(),
        description: tempPackage.description.trim(),
        minPrice: tempPackage.minPrice,
        maxPrice: tempPackage.maxPrice,
      };

      const ownerCandidates = getPackageOwnerCandidates(user.userId);
      let response;
      let lastError: unknown;

      for (const ownerId of ownerCandidates) {
        try {
          response = await createVendorServicePackage(ownerId, payload);
          break;
        } catch (error) {
          lastError = error;
          if (!shouldRetryPackageRequest(error)) {
            throw error;
          }
        }
      }

      if (!response) {
        throw lastError instanceof Error
          ? lastError
          : new Error("Failed to add service package");
      }

      const nextPackage = normalizeServicePackages([response.data])[0];
      setServicePackages((prev) => [...prev, nextPackage]);
      setShowPackageForm(false);
      resetPackageForm();
    } catch (error) {
      setVendorDataError(
        error instanceof Error
          ? error.message
          : "Failed to add service package",
      );
    } finally {
      setSavingPackage(false);
    }
  };

  const updateServicePackage = async () => {
    if (!user || !tempPackage.id) {
      return;
    }

    try {
      setSavingPackage(true);
      setVendorDataError(null);

      const payload = {
        category: tempPackage.category.trim(),
        title: tempPackage.title.trim(),
        description: tempPackage.description.trim(),
        minPrice: tempPackage.minPrice,
        maxPrice: tempPackage.maxPrice,
      };

      const ownerCandidates = getPackageOwnerCandidates(user.userId);
      let response;
      let lastError: unknown;

      for (const ownerId of ownerCandidates) {
        try {
          response = await updateVendorServicePackage(
            ownerId,
            tempPackage.id,
            payload,
          );
          break;
        } catch (error) {
          lastError = error;
          if (!shouldRetryPackageRequest(error)) {
            throw error;
          }
        }
      }

      if (!response) {
        throw lastError instanceof Error
          ? lastError
          : new Error("Failed to update service package");
      }

      const updatedPackage = normalizeServicePackages([response.data])[0];
      setServicePackages((prev) =>
        prev.map((pkg) =>
          pkg.id === updatedPackage.id ? updatedPackage : pkg,
        ),
      );
      setEditingPackage(null);
      setShowPackageForm(false);
      resetPackageForm();
    } catch (error) {
      setVendorDataError(
        error instanceof Error
          ? error.message
          : "Failed to update service package",
      );
    } finally {
      setSavingPackage(false);
    }
  };

  const deleteServicePackage = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      setSavingPackage(true);
      setVendorDataError(null);

      const ownerCandidates = getPackageOwnerCandidates(user.userId);
      let deleted = false;
      let lastError: unknown;

      for (const ownerId of ownerCandidates) {
        try {
          await deleteVendorServicePackage(ownerId, id);
          deleted = true;
          break;
        } catch (error) {
          lastError = error;
          if (!shouldRetryPackageRequest(error)) {
            throw error;
          }
        }
      }

      if (!deleted) {
        throw lastError instanceof Error
          ? lastError
          : new Error("Failed to delete service package");
      }

      setServicePackages((prev) => prev.filter((pkg) => pkg.id !== id));
    } catch (error) {
      setVendorDataError(
        error instanceof Error
          ? error.message
          : "Failed to delete service package",
      );
    } finally {
      setSavingPackage(false);
    }
  };

  const startEditPackage = (pkg: ServicePackage) => {
    setTempPackage(pkg);
    setEditingPackage(pkg);
    setShowPackageForm(true);
  };

  const resetPackageForm = () => {
    setTempPackage({
      id: "",
      category: "",
      title: "",
      description: "",
      minPrice: 0,
      maxPrice: 0,
    });
  };

  const handlePackageChange = (
    field: keyof ServicePackage,
    value: string | number,
  ) => {
    setTempPackage((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <DashboardSidebar
        userType="vendor"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 lg:ml-[var(--dashboard-sidebar-width)] transition-all duration-300">
        <DashboardHeader
          title={t("vendor.dashboard")}
          subtitle={t("vendor.subtitle")}
          userName={displayName}
          userInitials={userInitials}
        />

        <main className="p-6">
          {vendorDataError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {vendorDataError}
            </div>
          )}

          {bookingsError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              Failed to load bookings: {bookingsError}
            </div>
          )}

          {loadingVendorData && !isEditing ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                {t("vendor.loading")}
              </span>
            </div>
          ) : isEditing ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-neutral dark:text-white">
                  {t("vendor.createProfileTitle")}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                  {t("vendor.createProfileSubtitle")}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Profile Picture
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {formData.profile_picture ? (
                          <img
                            src={formData.profile_picture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicture}
                        className="text-sm dark:text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="City, State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                        placeholder="business@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="https://www.yourbusiness.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Bio (Optional)
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="Tell us about your business and services..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Services Offered
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        name="service_input"
                        value={formData.service_input}
                        onChange={handleChange}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                        placeholder="e.g., Wedding Catering"
                      />
                      <button
                        type="button"
                        onClick={addService}
                        className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base font-semibold hover:bg-primary-soft"
                      >
                        Add
                      </button>
                    </div>
                    {formData.services.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.services.map((service, i) => (
                          <span
                            key={i}
                            className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-cyan-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(i)}
                              className="text-primary hover:text-red-600 dark:text-cyan-400 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Certifications
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        name="certification_input"
                        value={formData.certification_input}
                        onChange={handleChange}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                        placeholder="e.g., Certified Wedding Planner"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addTagToFormData(
                            "certifications",
                            "certification_input",
                          )
                        }
                        className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base font-semibold hover:bg-primary-soft"
                      >
                        Add
                      </button>
                    </div>
                    {formData.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.certifications.map((certification, i) => (
                          <span
                            key={`${certification}-${i}`}
                            className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-cyan-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {certification}
                            <button
                              type="button"
                              onClick={() =>
                                removeTagFromFormData("certifications", i)
                              }
                              className="text-primary hover:text-red-600 dark:text-cyan-400 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Awards
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        name="award_input"
                        value={formData.award_input}
                        onChange={handleChange}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                        placeholder="e.g., Best Event Stylist 2025"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addTagToFormData("awards", "award_input")
                        }
                        className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base font-semibold hover:bg-primary-soft"
                      >
                        Add
                      </button>
                    </div>
                    {formData.awards.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.awards.map((award, i) => (
                          <span
                            key={`${award}-${i}`}
                            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {award}
                            <button
                              type="button"
                              onClick={() => removeTagFromFormData("awards", i)}
                              className="text-yellow-700 hover:text-red-600 dark:text-yellow-300 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                      Portfolio Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioImages}
                      className="w-full px-3 sm:px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    {formData.portfolio_images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {formData.portfolio_images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img}
                              alt={`Portfolio ${i + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePortfolioImage(i)}
                              className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t dark:border-gray-700 pt-4 sm:pt-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <input
                        type="checkbox"
                        name="terms_accepted"
                        checked={formData.terms_accepted}
                        onChange={handleChange}
                        required
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Yes, I understand and agree to the Event Connect Terms of
                        Service, including the User Agreement and Privacy
                        Policy. *
                      </label>
                    </div>
                  </div>

                  {vendorDataError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                      {vendorDataError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingBusinessInfo}
                    className="w-full bg-accent text-neutral py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 text-sm sm:text-base disabled:opacity-60"
                  >
                    {savingBusinessInfo ? t("vendor.saving") : t("vendor.saveProfile")}
                  </button>
                </form>
              </div>
            </div>
          ) : isPending ? (
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center animate-scale-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/20 dark:bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl">⏳</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
                {t("vendor.profileSubmitted")}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                {t("vendor.pendingApprovalMsg")}
              </p>
              <div className="bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-neutral dark:text-yellow-300 font-semibold">
                  {t("vendor.pendingApprovalLabel")}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t("vendor.pendingApprovalTime")}
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary-soft transition-all duration-300 text-sm sm:text-base"
              >
                {t("vendor.backToHome")}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-neutral dark:text-white">
                    {t("vendor.myServices")}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {t("vendor.manageProfileBookings")}
                  </p>
                </div>
                <button
                  onClick={() => setEditingBusinessInfo(true)}
                  className="btn-primary w-full sm:w-auto"
                >
                  {t("vendor.editProfile")}
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="dashboard-stat dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                    {t("vendor.totalBookings")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-soft dark:text-cyan-400">
                    {bookings.length}
                  </p>
                </div>
                <div className="dashboard-stat dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                    {t("vendor.completedEvents")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {
                      bookings.filter(
                        (booking) => booking.status === "confirmed",
                      ).length
                    }
                  </p>
                </div>
                <div className="dashboard-stat dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                    {t("vendor.totalEarnings")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">
                    {totalEarnings.toLocaleString()} RWF
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 mb-6 sm:mb-8">
                <div className="border-b dark:border-gray-700 overflow-x-auto">
                  <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 min-w-max">
                    {["profile", "bookings", "messages", "earnings"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`tab-button ${
                            activeTab === tab
                              ? "tab-active"
                              : "tab-inactive dark:text-gray-400 dark:hover:text-gray-300"
                          }`}
                        >
                          {t(`vendor.tab_${tab}`)}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      {/* Business Information Section */}
                      <div className="border dark:border-gray-700 rounded-lg p-6 dark:bg-gray-900">
                        <div className="flex items-start justify-between mb-6">
                          <h3 className="text-xl font-bold text-neutral dark:text-white">
                            {t("vendor.basicBusinessInfo")}
                          </h3>
                          {!editingBusinessInfo && (
                            <button
                              onClick={() => setEditingBusinessInfo(true)}
                              className="flex items-center gap-2 text-primary hover:text-primary-soft dark:text-cyan-400 dark:hover:text-cyan-300 font-semibold"
                            >
                              <Edit className="w-4 h-4" /> {t("common.edit")}
                            </button>
                          )}
                        </div>

                        {editingBusinessInfo ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                {tempBusinessInfo.profileImage ? (
                                  <img
                                    src={tempBusinessInfo.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Camera className="w-10 h-10 text-gray-500" />
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBusinessImageUpload}
                                className="text-sm dark:text-gray-300"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                {t("vendor.businessName")} *
                              </label>
                              <input
                                type="text"
                                value={tempBusinessInfo.businessName}
                                onChange={(e) =>
                                  handleBusinessInfoChange(
                                    "businessName",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                placeholder="Enter business name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                {t("vendor.bioRequired")} *
                              </label>
                              <textarea
                                value={tempBusinessInfo.bio}
                                onChange={(e) =>
                                  handleBusinessInfoChange(
                                    "bio",
                                    e.target.value,
                                  )
                                }
                                rows={4}
                                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                placeholder="Tell us about your business..."
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  {t("vendor.experienceYears")} *
                                </label>
                                <input
                                  type="number"
                                  value={tempBusinessInfo.experienceYears}
                                  onChange={(e) =>
                                    handleBusinessInfoChange(
                                      "experienceYears",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  {t("vendor.locationCountry")} *
                                </label>
                                <input
                                  type="text"
                                  value={tempBusinessInfo.location}
                                  onChange={(e) =>
                                    handleBusinessInfoChange(
                                      "location",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  placeholder="City, Country"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                {t("vendor.certifications")}
                              </label>
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={tempCertificationInput}
                                  onChange={(e) =>
                                    setTempCertificationInput(e.target.value)
                                  }
                                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  placeholder="e.g., Certified Wedding Planner"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    addTagToBusinessInfo(
                                      "certifications",
                                      tempCertificationInput,
                                      () => setTempCertificationInput(""),
                                    )
                                  }
                                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                                >
                                  {t("vendor.add")}
                                </button>
                              </div>
                              {tempBusinessInfo.certifications.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {tempBusinessInfo.certifications.map(
                                    (certification, index) => (
                                      <span
                                        key={`${certification}-${index}`}
                                        className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-cyan-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                      >
                                        {certification}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeTagFromBusinessInfo(
                                              "certifications",
                                              index,
                                            )
                                          }
                                          className="text-primary hover:text-red-600 dark:text-cyan-400 font-bold"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                {t("vendor.awards")}
                              </label>
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={tempAwardInput}
                                  onChange={(e) =>
                                    setTempAwardInput(e.target.value)
                                  }
                                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  placeholder="e.g., Top Wedding Vendor Kigali"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    addTagToBusinessInfo(
                                      "awards",
                                      tempAwardInput,
                                      () => setTempAwardInput(""),
                                    )
                                  }
                                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                                >
                                  {t("vendor.add")}
                                </button>
                              </div>
                              {tempBusinessInfo.awards.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {tempBusinessInfo.awards.map(
                                    (award, index) => (
                                      <span
                                        key={`${award}-${index}`}
                                        className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                      >
                                        {award}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeTagFromBusinessInfo(
                                              "awards",
                                              index,
                                            )
                                          }
                                          className="text-yellow-700 hover:text-red-600 dark:text-yellow-300 font-bold"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                {t("vendor.portfolioImages")}
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleBusinessPortfolioUpload}
                                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                              />
                              {tempBusinessInfo.portfolioImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                  {tempBusinessInfo.portfolioImages.map(
                                    (image, index) => (
                                      <div
                                        key={`${image}-${index}`}
                                        className="relative group"
                                      >
                                        <img
                                          src={image}
                                          alt={`Portfolio ${index + 1}`}
                                          className="w-full h-28 object-cover rounded-lg"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeBusinessPortfolioImage(index)
                                          }
                                          className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>

                            {vendorDataError && (
                              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                {vendorDataError}
                              </div>
                            )}

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={saveBusinessInfo}
                                disabled={savingBusinessInfo}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-soft font-semibold disabled:opacity-60"
                              >
                                {savingBusinessInfo ? t("vendor.saving") : t("vendor.saveBusinessInfo")}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditBusinessInfo}
                                className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-neutral dark:text-gray-300 font-semibold"
                              >
                                {t("vendor.cancelEdit")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start gap-6 mb-6">
                              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                {businessInfo.profileImage ? (
                                  <img
                                    src={businessInfo.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Camera className="w-10 h-10 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-2xl font-bold mb-2 text-neutral dark:text-white">
                                  {businessInfo.businessName || t("vendor.notSet")}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <span>
                                    📍 {businessInfo.location || t("vendor.notSet")}
                                  </span>
                                  <span>
                                    ⭐ {businessInfo.experienceYears} {t("vendor.yearsExperience")}
                                  </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {businessInfo.bio || t("vendor.noBio")}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                              <div>
                                <h5 className="text-sm font-semibold text-neutral dark:text-white mb-2">
                                  {t("vendor.certifications")}
                                </h5>
                                {businessInfo.certifications.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {businessInfo.certifications.map(
                                      (certification, index) => (
                                        <span
                                          key={`${certification}-${index}`}
                                          className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-cyan-400 px-3 py-1 rounded-full text-sm"
                                        >
                                          {certification}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("vendor.noCertifications")}
                                  </p>
                                )}
                              </div>

                              <div>
                                <h5 className="text-sm font-semibold text-neutral dark:text-white mb-2">
                                  {t("vendor.awards")}
                                </h5>
                                {businessInfo.awards.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {businessInfo.awards.map((award, index) => (
                                      <span
                                        key={`${award}-${index}`}
                                        className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm"
                                      >
                                        {award}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("vendor.noAwards")}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-6">
                              <h5 className="text-sm font-semibold text-neutral dark:text-white mb-2">
                                {t("vendor.portfolio")}
                              </h5>
                              {businessInfo.portfolioImages.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {businessInfo.portfolioImages.map(
                                    (image, index) => (
                                      <img
                                        key={`${image}-${index}`}
                                        src={image}
                                        alt={`Portfolio ${index + 1}`}
                                        className="h-28 w-full rounded-lg object-cover"
                                      />
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {t("vendor.noPortfolio")}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Service Packages Section */}
                      <div className="border dark:border-gray-700 rounded-lg p-6 dark:bg-gray-900">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-neutral dark:text-white mb-1">
                              {t("vendor.servicePackages")}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("vendor.servicePackagesSubtitle")}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              resetPackageForm();
                              setEditingPackage(null);
                              setShowPackageForm(true);
                            }}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                          >
                            <Plus className="w-4 h-4" /> {t("vendor.addPackage")}
                          </button>
                        </div>

                        {showPackageForm && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6 border-2 border-primary/20">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-bold text-neutral dark:text-white">
                                {editingPackage
                                  ? t("vendor.editPackageTitle")
                                  : t("vendor.newPackageTitle")}
                              </h4>
                              <button
                                onClick={() => {
                                  setShowPackageForm(false);
                                  setEditingPackage(null);
                                  resetPackageForm();
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  {t("vendor.packageCategory")} *
                                </label>
                                <input
                                  type="text"
                                  value={tempPackage.category}
                                  onChange={(e) =>
                                    handlePackageChange(
                                      "category",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  placeholder="e.g., Photography, Catering, Decoration"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  {t("vendor.packageTitle")} *
                                </label>
                                <input
                                  type="text"
                                  value={tempPackage.title}
                                  onChange={(e) =>
                                    handlePackageChange("title", e.target.value)
                                  }
                                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  placeholder="e.g., Wedding photography full-day package"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                  {t("vendor.packageDescription")} *
                                </label>
                                <textarea
                                  value={tempPackage.description}
                                  onChange={(e) =>
                                    handlePackageChange(
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                  placeholder="Describe what's included in this package..."
                                />
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                    {t("vendor.minPrice")} *
                                  </label>
                                  <input
                                    type="number"
                                    value={tempPackage.minPrice}
                                    onChange={(e) =>
                                      handlePackageChange(
                                        "minPrice",
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-neutral dark:text-white">
                                    {t("vendor.maxPrice")} *
                                  </label>
                                  <input
                                    type="number"
                                    value={tempPackage.maxPrice}
                                    onChange={(e) =>
                                      handlePackageChange(
                                        "maxPrice",
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
                                    min="0"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={
                                    editingPackage
                                      ? updateServicePackage
                                      : addServicePackage
                                  }
                                  disabled={savingPackage}
                                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                                >
                                  {savingPackage
                                    ? t("vendor.saving")
                                    : editingPackage
                                      ? t("vendor.updatePackage")
                                      : t("vendor.addPackage")}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowPackageForm(false);
                                    setEditingPackage(null);
                                    resetPackageForm();
                                  }}
                                  className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-neutral dark:text-gray-300 font-semibold"
                                >
                                  {t("common.cancel")}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {servicePackages.length === 0 ? (
                          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-semibold mb-1">
                              {t("vendor.noPackages")}
                            </p>
                            <p className="text-sm">
                              {t("vendor.noPackagesHint")}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {servicePackages.map((pkg) => (
                              <div
                                key={pkg.id}
                                className="border dark:border-gray-700 rounded-lg p-6 hover:border-primary/50 dark:hover:border-primary/50 transition"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-cyan-400 rounded-full text-xs font-semibold">
                                        {pkg.category}
                                      </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-neutral dark:text-white mb-2">
                                      {pkg.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      {pkg.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-primary dark:text-white">
                                        {pkg.minPrice.toLocaleString()} RWF
                                      </span>
                                      <span className="text-gray-400">-</span>
                                      <span className="text-lg font-bold text-primary dark:text-white">
                                        {pkg.maxPrice.toLocaleString()} RWF
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEditPackage(pkg)}
                                      className="p-2 text-primary hover:bg-primary/10 dark:text-cyan-400 dark:hover:bg-cyan-900/20 rounded-lg transition"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            t("vendor.deletePackageConfirm"),
                                          )
                                        ) {
                                          void deleteServicePackage(pkg.id);
                                        }
                                      }}
                                      disabled={savingPackage}
                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "bookings" && (
                    <div>
                      {!chatOpen ? (
                        <>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {t("vendor.bookingsSubtitle")}
                          </p>
                          {bookingsLoading && (
                            <div className="mb-6 flex items-center justify-center py-10 text-gray-600 dark:text-gray-300">
                              <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                              <span className="ml-3">{t("vendor.loadingBookings")}</span>
                            </div>
                          )}
                          {!bookingsLoading && bookings.length === 0 && (
                            <div className="mb-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                              {t("vendor.noBookings")}
                            </div>
                          )}
                          <div className="space-y-4">
                            {bookings.map((booking, index) => (
                              <div
                                key={booking.id}
                                className="border dark:border-gray-700 dark:bg-gray-900 rounded-lg p-6 hover:border-purple-500 dark:hover:border-purple-600 transition"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h4 className="text-xl font-bold mb-2 text-neutral dark:text-white">
                                      {booking.eventName}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />{" "}
                                        {resolvePlannerName(booking)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />{" "}
                                        {new Date(
                                          booking.bookingDate,
                                        ).toLocaleDateString()}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Target className="w-4 h-4" />{" "}
                                        {booking.service}
                                      </span>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      booking.status === "confirmed"
                                        ? "bg-green-100 text-green-700"
                                        : booking.status === "cancelled"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {t(`vendor.status_${booking.status}`, { defaultValue: booking.status.charAt(0).toUpperCase() + booking.status.slice(1) })}
                                  </span>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg inline-block mb-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("vendor.bookingAmount")}
                                  </p>
                                  <p className="text-lg font-bold text-purple-600 dark:text-white">
                                    {booking.price.toLocaleString()} RWF
                                  </p>
                                </div>
                                <div className="flex gap-3">
                                  {booking.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          void handleBookingAction(
                                            booking.id,
                                            "confirm",
                                          );
                                        }}
                                        className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 font-semibold"
                                      >
                                        {t("vendor.confirm")}
                                      </button>
                                      <button
                                        onClick={() => {
                                          void handleBookingAction(
                                            booking.id,
                                            "reject",
                                          );
                                        }}
                                        className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 font-semibold"
                                      >
                                        {t("vendor.reject")}
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() =>
                                      openChat(
                                        resolvePlannerName(booking),
                                        booking.eventName,
                                        booking.id,
                                        index + 1,
                                      )
                                    }
                                    disabled={booking.status !== "confirmed"}
                                    className={`border-2 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                                      booking.status === "confirmed"
                                        ? "border-primary dark:border-cyan-400 text-primary dark:text-cyan-400 hover:bg-purple-50 dark:hover:bg-gray-700"
                                        : "border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                    }`}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    {booking.status === "confirmed"
                                      ? "Chat"
                                      : "Chat (Confirmed only)"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : selectedChat ? (
                        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[700px]">
                          <button
                            onClick={() => setChatOpen(false)}
                            className="mb-4 text-sm text-primary dark:text-primary hover:underline font-semibold"
                          >
                            {t("vendor.backToBookings")}
                          </button>
                          <div className="flex-1 border dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                            <BookingChatPanel
                              bookingId={selectedChat.bookingId}
                              currentUserId={user?.userId}
                              onClose={() => setChatOpen(false)}
                              isModal={false}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeTab === "messages" && (
                    <div>
                      {!chatOpen ? (
                        <>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Connect and communicate with event planners
                          </p>
                          {bookings.filter(
                            (booking) => booking.status === "confirmed",
                          ).length === 0 && (
                            <div className="mb-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                              No confirmed bookings yet. Chats appear here after
                              confirmation.
                            </div>
                          )}
                          <div className="space-y-4">
                            {Array.from(
                              new Map(
                                bookings
                                  .filter(
                                    (booking) => booking.status === "confirmed",
                                  )
                                  .map((booking, index) => [
                                    `${resolvePlannerName(booking)}-${booking.eventName}`,
                                    {
                                      id: index + 1,
                                      bookingId: booking.id,
                                      name: resolvePlannerName(booking),
                                      eventName: booking.eventName,
                                    },
                                  ]),
                              ).values(),
                            ).map((contact) => (
                              <div
                                key={contact.id}
                                className="border dark:border-gray-700 dark:bg-gray-900 rounded-lg p-6 hover:border-purple-500 dark:hover:border-purple-600 transition cursor-pointer"
                                onClick={() =>
                                  openChat(
                                    contact.name,
                                    contact.eventName,
                                    contact.bookingId,
                                    contact.id,
                                  )
                                }
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                      {contact.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-lg font-bold mb-1 text-neutral dark:text-white">
                                      {contact.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {contact.eventName}
                                    </p>
                                  </div>
                                  <MessageCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : selectedChat ? (
                        <div className="h-[calc(100vh-300px)] min-h-[600px]">
                          <button
                            onClick={() => setChatOpen(false)}
                            className="mb-4 text-sm text-primary dark:text-primary hover:underline font-semibold"
                          >
                            {t("vendor.backToMessages")}
                          </button>
                          <div className="h-full border dark:border-gray-700 rounded-lg overflow-hidden">
                            <BookingChatPanel
                              bookingId={selectedChat.bookingId}
                              currentUserId={user?.userId}
                              onClose={() => setChatOpen(false)}
                              isModal={false}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeTab === "earnings" && (
                    <div>
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 text-white p-6 rounded-lg">
                          <p className="text-green-100 dark:text-green-200 mb-2">
                            {t("vendor.totalConfirmedEarnings")}
                          </p>
                          <p className="text-4xl font-bold text-white">
                            {totalEarnings.toLocaleString()} RWF
                          </p>
                          <p className="text-sm text-green-100 dark:text-green-200 mt-2">
                            {
                              bookings.filter((b) => b.status === "confirmed")
                                .length
                            }{" "}
                            {t("vendor.confirmedBookings")}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800 text-white p-6 rounded-lg">
                          <p className="text-yellow-100 dark:text-yellow-200 mb-2">
                            {t("vendor.pendingEarnings")}
                          </p>
                          <p className="text-4xl font-bold text-white">
                            {pendingEarnings.toLocaleString()} RWF
                          </p>
                          <p className="text-sm text-yellow-100 dark:text-yellow-200 mt-2">
                            {
                              bookings.filter((b) => b.status === "pending")
                                .length
                            }{" "}
                            {t("vendor.pendingBookingsCount")}
                          </p>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-neutral dark:text-white">
                        {t("vendor.earningsBreakdown")}
                      </h3>
                      <div className="space-y-3">
                        {bookings
                          .filter((b) => b.status === "confirmed")
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="font-semibold text-neutral dark:text-white">
                                  {booking.eventName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(
                                    booking.bookingDate,
                                  ).toLocaleDateString()}{" "}
                                  • {booking.service}
                                </p>
                              </div>
                              <p className="text-lg font-bold text-green-600 dark:text-white">
                                +{booking.price.toLocaleString()} RWF
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
