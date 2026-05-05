// API Configuration and helper functions
const REMOTE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = REMOTE_API_BASE_URL.replace(/\/+$/, '')

export type BackendUserRole = 'vendor' | 'planner' | 'admin' | 'event_planner'
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled' | 'active'
export type EventType = 'wedding' | 'conference' | 'birthday' | 'corporate' | 'concert' | 'other'
export type EventVisibility = 'public' | 'private'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role?: BackendUserRole
}

export interface AuthUserResponse extends User {
  userId: string
}

export interface AdminUserRecord extends User {
  role: BackendUserRole
  createdAt: string
  updatedAt: string
}

export interface UpdateAdminUserPayload {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: BackendUserRole
}

export interface Event {
  id: string
  userId: string
  title: string
  description: string
  eventType: EventType
  status: EventStatus
  visibility: EventVisibility
  startDate: string
  endDate: string
  location: string
  budget: number
  guestCount: number
  imageUrl: string
  createdAt: string
  updatedAt: string
  User: User
}

export interface EventInput {
  title: string
  description: string
  eventType: EventType
  startDate: string
  endDate: string
  location: string
  budget: number
  guestCount: number
  imageUrl?: string
  status?: EventStatus
  visibility?: EventVisibility
}

export interface EventCategory {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface EventCategoryPayload {
  name: string
}

export interface ServiceCategory {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ServiceCategoryPayload {
  name: string
}

export interface CreateEventPayload extends EventInput {
  userId: string
}

export interface EventService {
  id: string
  eventId: string
  category: string
  title?: string
  description?: string
  budget?: number
  quantity?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateEventServicePayload {
  category: string
  title?: string
  description?: string
  budget?: number
  quantity?: number
}

export interface ServiceCreationFailure {
  index: number
  service: CreateEventServicePayload
  error: string
}

export interface ServicesCreationResult {
  createdServices: EventService[]
  failedServices: ServiceCreationFailure[]
}

export interface CreateEventWithServicesResult extends ServicesCreationResult {
  event: Event
}

export interface VendorInfo {
  id: string
  userId: string
  businessName: string
  bio: string
  experienceYears: number
  location: string
  profileImage?: string
  portfolioImages?: string[]
  certifications?: string[]
  awards?: string[]
  isVerified?: boolean
  averageRating?: number
  createdAt?: string
  updatedAt?: string
  user?: User
}

export interface VendorServicePackage {
  id: string
  vendorId: string
  category: string
  title: string
  description: string
  minPrice: number
  maxPrice: number
  createdAt?: string
  updatedAt?: string
}

export interface VendorServicePackagePayload {
  category: string
  title: string
  description: string
  minPrice: number
  maxPrice: number
}

export interface Guest {
  id: string
  eventId: string
  fullNames: string
  phone: string
  email: string
  category: 'REGULAR' | 'VIP' | 'VVIP' | 'FAMILY' | 'FRIEND'
  tableNumber: number
  rsvpstatus: 'Pending' | 'Confirmed' | 'Declined'
  rsvpStatus?: 'Pending' | 'Confirmed' | 'Declined'
  createdAt?: string
  updatedAt?: string
}

export interface GuestPayload {
  eventId: string
  fullNames: string
  phone: string
  email: string
  category: 'REGULAR' | 'VIP' | 'VVIP' | 'FAMILY' | 'FRIEND'
  tableNumber: number
  rsvpstatus: 'Pending' | 'Confirmed' | 'Declined'
  rsvpStatus?: 'Pending' | 'Confirmed' | 'Declined'
}

export interface PaginationMeta {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export interface ApiResponse<T> {
  message: string
  data: T
  token?: string
  pagination?: PaginationMeta
}

// Error Classification and Utilities
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isRetryable: boolean,
    public readonly validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export type ErrorType = 'network' | 'timeout' | 'auth' | 'validation' | 'server' | 'unknown'

export function classifyError(error: unknown): ErrorType {
  if (error instanceof ApiError) {
    if (error.statusCode === 401 || error.statusCode === 403) return 'auth'
    if (error.statusCode === 422 || error.statusCode === 400) return 'validation'
    if (error.statusCode >= 500) return 'server'
    return 'server'
  }

  if (error instanceof TypeError) {
    const message = (error as Error).message
    if (message.includes('fetch') || message.includes('network')) return 'network'
    if (message.includes('timeout')) return 'timeout'
  }

  return 'unknown'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isRetryable
  }
  const errorType = classifyError(error)
  return errorType === 'network' || errorType === 'timeout' || errorType === 'server'
}

interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: unknown) => void
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: unknown
  let delayMs = initialDelayMs

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error
      }

      onRetry?.(attempt, error)
      await delay(delayMs)
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs)
    }
  }

  throw lastError
}

/**
 * Generic fetch wrapper for API calls with retry logic
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  if (!retry) {
    return performApiCall<T>(endpoint, options)
  }
  return retryWithBackoff(
    async () => await performApiCall<T>(endpoint, options),
    {
      maxAttempts: 2,
      initialDelayMs: 500,
      maxDelayMs: 2000,
      backoffMultiplier: 2,
    }
  )
}

async function performApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('authToken')
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers: Record<string, string> = isFormDataBody
    ? {}
    : {
        'Content-Type': 'application/json',
      }

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      Object.assign(headers, options.headers)
    }
  }

  if (token) {
    // Attach bearer token for protected backend endpoints.
    headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 204) {
      return {
        message: 'Success',
        data: undefined as T,
      }
    }

    const rawText = await response.text()
    const hasBody = rawText.trim().length > 0
    let data: unknown = null

    if (hasBody) {
      try {
        data = JSON.parse(rawText)
      } catch {
        const nonJsonMessage = response.ok
          ? `Invalid JSON response from ${endpoint}`
          : `Server returned a non-JSON error (HTTP ${response.status}) for ${endpoint}`
        throw new ApiError(
          response.status,
          nonJsonMessage,
          response.status >= 500 || response.status === 408 || response.status === 429,
          undefined
        )
      }
    }

    if (!response.ok) {
      const validationDetails =
        typeof data === 'object' && data !== null && 'errors' in data
          ? (data as {
              errors?: Array<{
                field?: string
                message?: string
                path?: string | string[]
                param?: string
                context?: { key?: string }
              }>
            }).errors
          : undefined

      const validationSuffix =
        Array.isArray(validationDetails) && validationDetails.length > 0
          ? ` (${validationDetails
              .map((item) => {
                const resolvedField =
                  item.field ||
                  (Array.isArray(item.path) ? item.path.join('.') : item.path) ||
                  item.param ||
                  item.context?.key ||
                  'field'

                return `${resolvedField}: ${item.message || 'invalid value'}`
              })
              .join(', ')})`
          : ''

      const errorMessage =
        typeof data === 'object' && data !== null && 'message' in data
          ? String(
              `${(data as { message?: string }).message || `API Error: ${response.status}`}${validationSuffix}`
            )
          : `API Error: ${response.status}`

      const isRetryable =
        response.status >= 500 ||
        response.status === 408 ||
        response.status === 429 ||
        response.status === 503

      throw new ApiError(
        response.status,
        errorMessage,
        isRetryable,
        Array.isArray(validationDetails)
          ? validationDetails.map((item) => ({
              field:
                item.field ||
                (Array.isArray(item.path) ? item.path.join('.') : item.path?.toString() || 'field'),
              message: item.message || 'invalid value',
            }))
          : undefined
      )
    }

    if (typeof data === 'object' && data !== null && 'data' in data) {
      return data as ApiResponse<T>
    }

    return {
      message: 'Success',
      data: data as T,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout - server took too long to respond', true, undefined)
    }

    if (error instanceof TypeError) {
      const message = error.message
      if (message.includes('fetch') || message.includes('Failed to fetch') || message.includes('network')) {
        throw new ApiError(
          0,
          'Network error - please check your connection and try again',
          true,
          undefined
        )
      }
    }

    throw new ApiError(
      0,
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true,
      undefined
    )
  }
}

/**

/**
 * Login endpoint
 */
export async function loginUser(email: string, password: string) {
  return apiCall<AuthUserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * Register endpoint
 */
export async function registerUser(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  role: BackendUserRole
}) {
  return apiCall<AuthUserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  return apiCall('/auth/profile', {
    method: 'GET',
  })
}

/**
 * Get users for admin management.
 */
export async function getUsers(filters?: {
  page?: number
  limit?: number
  role?: BackendUserRole
  search?: string
}) {
  const query = new URLSearchParams()

  if (typeof filters?.page === 'number') {
    query.append('page', String(filters.page))
  }

  if (typeof filters?.limit === 'number') {
    query.append('limit', String(filters.limit))
  }

  if (filters?.role) {
    query.append('role', filters.role)
  }

  if (filters?.search?.trim()) {
    query.append('search', filters.search.trim())
  }

  return apiCall<AdminUserRecord[]>(`/users${query.toString() ? `?${query.toString()}` : ''}`, {
    method: 'GET',
  })
}

export async function updateUser(userId: string, data: UpdateAdminUserPayload) {
  return apiCall<AdminUserRecord>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteUser(userId: string) {
  return apiCall<{ success?: boolean }>(`/users/${userId}`, {
    method: 'DELETE',
  })
}

/**
 * Logout
 */
export async function logoutUser() {
  return apiCall('/auth/logout', {
    method: 'POST',
  })
}

/**
 * Get vendor details for the authenticated user.
 * Tries several common endpoint patterns until one succeeds.
 */
export async function getVendorProfile() {
  const candidates = ['/vendors/me', '/vendor/me', '/vendor/profile', '/vendors/profile']
  let lastError: unknown
  for (const endpoint of candidates) {
    try {
      return await apiCall<VendorInfo>(endpoint, { method: 'GET' })
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

/**
 * Update vendor profile
 */
export async function updateVendorProfile(data: Record<string, unknown>) {
  return apiCall('/vendor/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Create vendor business information
 */
export async function createVendorInfo(data: {
  userId: string
  businessName: string
  bio: string
  experienceYears: number
  location: string
  profileImage?: string
  portfolioImages?: string[]
  certifications?: string[]
  awards?: string[]
}) {
  return apiCall<VendorInfo>('/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Get vendor business information by vendorId
 */
export async function getVendorInfo(vendorId: string) {
  return apiCall<VendorInfo>(`/vendors/${vendorId}`, {
    method: 'GET',
  })
}

/**
 * List vendors
 */
export async function getVendors(filters?: {
  isVerified?: boolean
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()
  if (typeof filters?.isVerified === 'boolean') {
    query.append('isVerified', String(filters.isVerified))
  }
  if (typeof filters?.page === 'number') {
    query.append('page', String(filters.page))
  }
  if (typeof filters?.limit === 'number') {
    query.append('limit', String(filters.limit))
  }

  const endpoint = `/vendors${query.toString() ? `?${query.toString()}` : ''}`

  return apiCall<VendorInfo[]>(endpoint, {
    method: 'GET',
  })
}

/**
 * Get vendor business information by linked userId
 */
export async function getVendorByUserId(userId: string) {
  const normalizedUserId = String(userId).trim().toLowerCase()

  const isMatchingVendor = (vendor: VendorInfo | undefined | null) => {
    if (!vendor) {
      return false
    }

    const candidateIds = [
      vendor.userId,
      (vendor as unknown as { userID?: string }).userID,
      (vendor as unknown as { user_id?: string }).user_id,
      vendor.user?.id,
      (vendor.user as unknown as { userId?: string } | undefined)?.userId,
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim().toLowerCase())

    return candidateIds.includes(normalizedUserId)
  }

  const normalizeVendorList = (raw: unknown): VendorInfo[] => {
    if (Array.isArray(raw)) return raw

    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>
      // Nested array keys
      if (Array.isArray(obj.data)) return obj.data as VendorInfo[]
      if (Array.isArray(obj.vendors)) return obj.vendors as VendorInfo[]
      if (Array.isArray(obj.items)) return obj.items as VendorInfo[]
      // Single nested vendor object
      if (obj.vendor && typeof obj.vendor === 'object') return [obj.vendor as VendorInfo]
      // Single vendor record directly
      if (typeof obj.id === 'string' || typeof obj.userId === 'string') return [raw as VendorInfo]
    }

    return []
  }

  const findInVendorPages = async (filters?: { isVerified?: boolean }) => {
    let page = 1
    const limit = 100

    while (page <= 100) {
      const response = await getVendors({
        ...(filters || {}),
        page,
        limit,
      })

      const vendorsList = normalizeVendorList(response.data)
      const matchedVendor = vendorsList.find((vendor) => isMatchingVendor(vendor))

      if (matchedVendor) {
        return matchedVendor
      }

      // Pagination may live at top-level or nested inside response.data
      const nestedPagination = (response.data as unknown as { pagination?: PaginationMeta })?.pagination
      const totalPages = response.pagination?.totalPages ?? nestedPagination?.totalPages ?? 1
      if (vendorsList.length === 0 || page >= totalPages) {
        break
      }

      page += 1
    }

    return null
  }

  const lookupStrategies: Array<{ isVerified?: boolean } | undefined> = [
    undefined,
    { isVerified: false },
    { isVerified: true },
  ]

  const directQueryEndpoints = [
    `/vendors?userId=${encodeURIComponent(userId)}`,
    `/vendors?search=${encodeURIComponent(userId)}`,
  ]

  for (const endpoint of directQueryEndpoints) {
    try {
      const response = await apiCall<VendorInfo[] | VendorInfo>(endpoint, {
        method: 'GET',
      })

      const vendorsList = normalizeVendorList(response.data)
      const matchedVendor = vendorsList.find((vendor) => isMatchingVendor(vendor))

      if (matchedVendor) {
        if (matchedVendor.id) {
          try {
            const fullVendorResponse = await getVendorInfo(String(matchedVendor.id))
            return fullVendorResponse.data
          } catch {
            return matchedVendor
          }
        }

        return matchedVendor
      }
    } catch {
      continue
    }
  }

  for (const strategy of lookupStrategies) {
    try {
      const matchedVendor = await findInVendorPages(strategy)
      if (!matchedVendor) {
        continue
      }

      if (matchedVendor.id) {
        try {
          const fullVendorResponse = await getVendorInfo(String(matchedVendor.id))
          return fullVendorResponse.data
        } catch {
          return matchedVendor
        }
      }

      return matchedVendor
    } catch {
      continue
    }
  }

  return null
}

/**
 * Update vendor business information
 */
export async function updateVendorInfo(vendorId: string, data: {
  businessName?: string
  bio?: string
  experienceYears?: number
  location?: string
  profileImage?: string
  portfolioImages?: string[]
  certifications?: string[]
  awards?: string[]
  userId?: string
}) {
  return apiCall<VendorInfo>(`/vendors/${vendorId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Upload vendor profile/portfolio media files for Cloudinary storage.
 * Uses the same update endpoint with multipart form data.
 */
export async function uploadVendorMedia(
  vendorId: string,
  files: {
    profileImage?: Blob
    portfolioImages?: Blob[]
  }
) {
  const formData = new FormData()

  if (files.profileImage) {
    formData.append('profileImage', files.profileImage, 'vendor-profile.jpg')
  }

  if (Array.isArray(files.portfolioImages)) {
    files.portfolioImages.forEach((file, index) => {
      formData.append('portfolioImages', file, `vendor-portfolio-${index + 1}.jpg`)
    })
  }

  return apiCall<VendorInfo>(`/vendors/${vendorId}`, {
    method: 'PUT',
    body: formData,
  })
}

/**
 * Update vendor verification status (admin only)
 */
export async function updateVendorVerification(vendorId: string, isVerified: boolean) {
  return apiCall<VendorInfo>(`/vendors/${vendorId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ isVerified }),
  })
}

/**
 * Create vendor service package by logged-in userId
 */
export async function createVendorServicePackage(
  userId: string,
  data: VendorServicePackagePayload
) {
  return apiCall<VendorServicePackage>(`/vendors/${userId}/packages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Get vendor service packages by logged-in userId
 */
export async function getVendorServicePackages(userId: string) {
  return apiCall<VendorServicePackage[]>(`/vendors/${userId}/packages`, {
    method: 'GET',
  })
}

/**
 * Update vendor service package by logged-in userId
 */
export async function updateVendorServicePackage(
  userId: string,
  packageId: string,
  data: VendorServicePackagePayload
) {
  return apiCall<VendorServicePackage>(`/vendors/${userId}/packages/${packageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete vendor service package by logged-in userId
 */
export async function deleteVendorServicePackage(
  userId: string,
  packageId: string
) {
  return apiCall<{ success?: boolean }>(`/vendors/${userId}/packages/${packageId}`, {
    method: 'DELETE',
  })
}

/**
 * Get planner details
 */
export async function getPlannerProfile() {
  return apiCall('/planner/profile', {
    method: 'GET',
  })
}

/**
 * Get events
 */
export async function getEvents(filters?: Record<string, unknown>) {
  const query = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, String(value))
    })
  }
  return apiCall<Event[]>('/events' + (query.toString() ? `?${query}` : ''), {
    method: 'GET',
  })
}

/**
 * Get public events (does not require authentication)
 */
export async function getPublicEvents(filters?: Record<string, unknown>) {
  const query = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })
  }

  return apiCall<Event[]>('/events/public' + (query.toString() ? `?${query}` : ''), {
    method: 'GET',
  }, false)
}

/**
 * Create event
 */
export async function createEvent(data: CreateEventPayload) {
  return apiCall<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Create an event for the currently authenticated user.
 */
export async function createEventForUser(userId: string, data: EventInput) {
  return createEvent({
    ...data,
    userId,
  })
}

/**
 * Create a single service requirement for an event.
 */
export async function createEventService(
  eventId: string,
  data: CreateEventServicePayload
) {
  return apiCall<EventService>(`/events/${eventId}/services`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Fetch service requirements for an event.
 */
export async function getEventServices(eventId: string) {
  return apiCall<EventService[]>(`/events/${eventId}/services`, {
    method: 'GET',
  })
}

/**
 * Update a service requirement for an event.
 */
export async function updateEventService(
  eventId: string,
  serviceId: string,
  data: Partial<CreateEventServicePayload>
) {
  return apiCall<EventService>(`/events/${eventId}/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a service requirement from an event.
 */
export async function deleteEventService(eventId: string, serviceId: string) {
  return apiCall<{ success: boolean }>(`/events/${eventId}/services/${serviceId}`, {
    method: 'DELETE',
  })
}

/**
 * Create multiple event services and report partial failures.
 */
export async function createServicesForEvent(
  eventId: string,
  services: CreateEventServicePayload[]
): Promise<ServicesCreationResult> {
  if (services.length === 0) {
    return {
      createdServices: [],
      failedServices: [],
    }
  }

  const settled = await Promise.allSettled(
    services.map((service) => createEventService(eventId, service))
  )

  const createdServices: EventService[] = []
  const failedServices: ServiceCreationFailure[] = []

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      createdServices.push(result.value.data)
      return
    }

    failedServices.push({
      index,
      service: services[index],
      error: result.reason instanceof Error ? result.reason.message : 'Unknown service creation error',
    })
  })

  return {
    createdServices,
    failedServices,
  }
}

/**
 * Create event first, then create service requirements for that event.
 */
export async function createEventWithServices(
  userId: string,
  eventInput: EventInput,
  services: CreateEventServicePayload[]
): Promise<CreateEventWithServicesResult> {
  const eventResponse = await createEventForUser(userId, eventInput)
  const event = eventResponse.data
  const servicesResult = await createServicesForEvent(event.id, services)

  return {
    event,
    ...servicesResult,
  }
}

/**
 * Scope event read access by role: admins can read all, others are scoped to userId.
 */
export async function getEventsByAccess(filters: {
  role: 'vendor' | 'planner' | 'admin'
  userId?: string
  extraFilters?: Record<string, unknown>
}) {
  const scopedFilters: Record<string, unknown> = {
    ...(filters.extraFilters || {}),
  }

  if (filters.role !== 'admin') {
    if (!filters.userId) {
      throw new Error('User ID is required for non-admin event access')
    }

    scopedFilters.userId = filters.userId
  }

  return getEvents(scopedFilters)
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string) {
  return apiCall<Event>(`/events/${eventId}`, {
    method: 'GET',
  })
}

/**
 * Update event
 */
export async function updateEvent(eventId: string, data: Partial<EventInput>) {
  return apiCall<Event>(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string) {
  return apiCall<{ success: boolean }>(`/events/${eventId}`, {
    method: 'DELETE',
  })
}

function normalizeEventCategoryList(
  data: EventCategory[] | { categories?: EventCategory[]; eventCategories?: EventCategory[]; items?: EventCategory[] }
) {
  if (Array.isArray(data)) {
    return data
  }

  return data.categories || data.eventCategories || data.items || []
}

/**
 * Guest Management Endpoints
 */
function buildGuestPayload(
  data: GuestPayload | Partial<GuestPayload>
): GuestPayload | Partial<GuestPayload> {
  const resolvedRsvpStatus = data.rsvpStatus ?? data.rsvpstatus

  return {
    ...data,
    ...(resolvedRsvpStatus ? { rsvpStatus: resolvedRsvpStatus } : {}),
  }
}

export async function createGuest(data: GuestPayload) {
  return apiCall<Guest>('/guests', {
    method: 'POST',
    body: JSON.stringify(buildGuestPayload(data)),
  })
}

export async function importGuestsCsv(eventId: string, csvFile: File) {
  const formData = new FormData()
  formData.append('eventId', eventId)
  formData.append('csvFile', csvFile)

  return apiCall<{
    successful?: Guest[]
    failed?: Array<Record<string, unknown>>
  }>('/guests/bulk/import-csv', {
    method: 'POST',
    body: formData,
  })
}

export async function getEventGuests(filters: {
  eventId: string
  rsvpStatus?: 'Pending' | 'Confirmed' | 'Declined'
  category?: 'REGULAR' | 'VIP' | 'VVIP' | 'FAMILY' | 'FRIEND'
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  params.set('eventId', filters.eventId)

  if (filters.rsvpStatus) {
    params.set('rsvpStatus', filters.rsvpStatus)
  }

  if (filters.category) {
    params.set('category', filters.category)
  }

  if (typeof filters.page === 'number') {
    params.set('page', String(filters.page))
  }

  if (typeof filters.limit === 'number') {
    params.set('limit', String(filters.limit))
  }

  return apiCall<Guest[] | { guests?: Guest[]; items?: Guest[] }>(
    `/guests?${params.toString()}`,
    {
      method: 'GET',
    },
  )
}

export async function getGuest(guestId: string) {
  return apiCall<Guest>(`/guests/${guestId}`, {
    method: 'GET',
  })
}

export async function updateGuest(guestId: string, data: Partial<GuestPayload>) {
  return apiCall<Guest>(`/guests/${guestId}`, {
    method: 'PUT',
    body: JSON.stringify(buildGuestPayload(data)),
  })
}

export async function deleteGuest(guestId: string) {
  return apiCall<{ success: boolean }>(`/guests/${guestId}`, {
    method: 'DELETE',
  })
}

export async function getEventCategories() {
  const response = await apiCall<
    EventCategory[] | { categories?: EventCategory[]; eventCategories?: EventCategory[]; items?: EventCategory[] }
  >('/event-categories', {
    method: 'GET',
  })

  return {
    ...response,
    data: normalizeEventCategoryList(response.data),
  }
}

export async function createEventCategory(data: EventCategoryPayload) {
  return apiCall<EventCategory>('/event-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateEventCategory(
  categoryId: string,
  data: Partial<EventCategoryPayload>
) {
  return apiCall<EventCategory>(`/event-categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteEventCategory(categoryId: string) {
  return apiCall<{ success?: boolean }>(`/event-categories/${categoryId}`, {
    method: 'DELETE',
  })
}

function normalizeServiceCategoryList(
  data: ServiceCategory[] | { categories?: ServiceCategory[]; serviceCategories?: ServiceCategory[]; items?: ServiceCategory[] }
) {
  if (Array.isArray(data)) {
    return data
  }

  return data.categories || data.serviceCategories || data.items || []
}

export async function getServiceCategories() {
  const response = await apiCall<
    ServiceCategory[] | { categories?: ServiceCategory[]; serviceCategories?: ServiceCategory[]; items?: ServiceCategory[] }
  >('/service-categories', {
    method: 'GET',
  })

  return {
    ...response,
    data: normalizeServiceCategoryList(response.data),
  }
}

export async function createServiceCategory(data: ServiceCategoryPayload) {
  return apiCall<ServiceCategory>('/service-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateServiceCategory(
  categoryId: string,
  data: Partial<ServiceCategoryPayload>
) {
  return apiCall<ServiceCategory>(`/service-categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteServiceCategory(categoryId: string) {
  return apiCall<{ success?: boolean }>(`/service-categories/${categoryId}`, {
    method: 'DELETE',
  })
}

/**
 * Booking types and endpoints
 */
export interface Booking {
  id: string
  vendorId?: string
  packageId?: string
  plannerId?: string
  userId?: string
  vendorName: string
  service: string
  category?: string
  eventId?: string
  eventName: string
  bookingDate: string
  timeSlot: string
  price: number
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
  updatedAt?: string
  notes?: string
}

export type BackendBookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed'

export interface CreateBookingPayload {
  packageId: string
  eventId: string
  priceOffered: number
  startDate: string
  endDate: string
  message?: string
  vendorId?: string
  plannerId?: string
  userId?: string
  vendorName?: string
  service?: string
  category?: string
  eventName?: string
  bookingDate?: string
  timeSlot?: string
  price?: number
  status?: Booking['status']
  notes?: string
}

export interface UpdateBookingPayload {
  packageId?: string
  eventId?: string
  priceOffered?: number
  startDate?: string
  endDate?: string
  message?: string
  vendorId?: string
  plannerId?: string
  userId?: string
  vendorName?: string
  service?: string
  category?: string
  eventName?: string
  bookingDate?: string
  timeSlot?: string
  price?: number
  status?: Booking['status'] | BackendBookingStatus
  notes?: string
}

/**
 * Get bookings
 */
export async function getBookings(filters?: {
  plannerId?: string
  userId?: string
  vendorId?: string
  packageId?: string
  eventId?: string
  status?: Booking['status']
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })
  }

  return apiCall<Booking[]>('/api/bookings' + (query.toString() ? `?${query.toString()}` : ''), {
    method: 'GET',
  })
}

/**
 * Create booking
 */
export async function createBooking(data: CreateBookingPayload) {
  return apiCall<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update booking
 */
export async function updateBooking(bookingId: string, data: UpdateBookingPayload) {
  return apiCall<Booking>(`/api/bookings/${bookingId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Update only booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'] | BackendBookingStatus
) {
  const backendStatus =
    status === 'confirmed'
      ? 'accepted'
      : status

  return updateBooking(bookingId, { status: backendStatus })
}

/**
 * Delete booking
 */
export async function deleteBooking(bookingId: string) {
  return apiCall<{ success?: boolean }>(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
  })
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string) {
  return updateBookingStatus(bookingId, 'cancelled')
}

/**
 * Booking chat types and endpoints
 */
export interface ChatSender {
  id: string
  firstName: string
  lastName: string
  role: string
}

export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  createdAt: string
  sender: ChatSender
}

export interface BookingChatRoomSummary {
  id: string
  bookingId: string
  eventId: string
  eventName: string
  vendorBusinessName: string
  counterpartName: string
  viewerRole: 'planner' | 'vendor'
}

export interface BookingChatThread {
  room: BookingChatRoomSummary
  messages: ChatMessage[]
}

export async function getBookingChatThread(bookingId: string) {
  return apiCall<BookingChatThread>(`/api/chat/booking/${encodeURIComponent(bookingId)}`, {
    method: 'GET',
  })
}

export async function sendBookingChatMessage(bookingId: string, content: string) {
  return apiCall<ChatMessage>(`/api/chat/booking/${encodeURIComponent(bookingId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}
