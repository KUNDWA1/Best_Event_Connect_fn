import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PlannerProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    location: '',
    terms_accepted: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    navigate('/planner/dashboard')
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">{t('profile.createAccount')}</h1>
            <p className="text-gray-600 mb-8">{t('profile.quickSetup')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.fullName')} *</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('publicEvents.fullNamePlaceholder')} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.phone')} *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+250 XXX XXX XXX" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.email')} *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('publicEvents.emailPlaceholder')} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('vendorProfile.location')} *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('profile.cityCountry')} />
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" name="terms_accepted" checked={formData.terms_accepted} onChange={handleChange} required className="mt-1" />
                  <label className="text-sm text-gray-700">{t('auth.termsAgreement')}</label>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                  {t('profile.createProfile')}
                </button>
                <button type="button" onClick={() => navigate('/')} className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return null
}
