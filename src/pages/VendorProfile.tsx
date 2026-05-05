import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Phone, Globe, Mail } from "lucide-react";

export default function VendorProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
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
    terms_accepted: false,
  });

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then((images) => {
        setFormData((prev) => ({
          ...prev,
          portfolio_images: [...prev.portfolio_images, ...images],
        }));
      });
    }
  };

  const removePortfolioImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolio_images: prev.portfolio_images.filter((_, i) => i !== index),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    console.log("Profile Data:", formData);
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">
              Create Your Vendor Profile
            </h1>
            <p className="text-gray-600 mb-8">
              Fill in your business details to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.profile_picture ? (
                      <img
                        src={formData.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicture}
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="business@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your business and services..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Services Offered
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="service_input"
                    value={formData.service_input}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Wedding Catering"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.services.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => removeService(i)}
                          className="text-blue-900 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Portfolio Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImages}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.portfolio_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
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

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-700">
                    Yes, I understand and agree to the Event Connector Terms of
                    Service, including the User Agreement and Privacy Policy. *
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48"></div>

      <div className="max-w-5xl mx-auto px-4 -mt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                {formData.profile_picture ? (
                  <img
                    src={formData.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  formData.business_name.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {formData.business_name}
                  </h1>
                </div>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> {formData.location}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-600">
                    {formData.experience_years} years experience
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">
              {formData.bio || "No bio provided yet."}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Completed Events</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Response Rate</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-6 h-6 mt-1 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <a
                  href={`tel:${formData.phone}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {formData.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 mt-1 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a
                  href={`mailto:${formData.email}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {formData.email}
                </a>
              </div>
            </div>
            {formData.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 mt-1 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {formData.website}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 mt-1 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{formData.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Services Offered</h2>
          {formData.services.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {formData.services.map((service, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                >
                  <p className="font-semibold">{service}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No services added yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          {formData.portfolio_images.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {formData.portfolio_images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Work ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No portfolio images yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
          <p className="text-gray-500">No reviews yet.</p>
        </div>

        <div className="text-center pb-8">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
