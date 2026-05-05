import { useState, useEffect } from "react";
import { X, Check, ChevronDown, ChevronUp } from "lucide-react";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsAndConditionsModal({
  isOpen,
  onAccept,
  onDecline,
}: TermsAndConditionsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([1, 2, 3])
  );

  useEffect(() => {
    if (isOpen) {
      setAccepted(false);
    }
  }, [isOpen]);

  const toggleSection = (section: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!isOpen) return null;

  const sections = [
    {
      number: 1,
      title: "Acceptance of Terms",
      content: `By accessing or using the Event Connect platform ("Platform"), whether as an Event Organizer, Service Provider/Vendor, Attendee, or any other user type, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions ("Terms"). If you are registering on behalf of an organization, you represent and warrant that you have the authority to bind such organization to these Terms. If you do not agree, you must discontinue use of the Platform immediately.`,
    },
    {
      number: 2,
      title: "Platform Overview & Services",
      content: `Event Connect is an end-to-end event management ecosystem operating within Rwanda's MICE (Meetings, Incentives, Conferences, and Exhibitions) sector. Our services include: Smart Check-in technology and attendee management, Vendor/SME discovery, bidding, and booking tools, Budget tracking and project management dashboards, Secure escrow-based payment processing (Tranches 7.1 & 7.2), In-App Messaging for all professional communications, Data intelligence reporting for institutional partners (RDB, RCB), Rwanda Week and national event management protocols.`,
    },
    {
      number: 3,
      title: "In-App Messaging: Mandatory Communication Policy",
      content: `IMPORTANT NOTICE: All communications between Event Organizers and Service Providers/Vendors regarding bookings, proposals, pricing, deliverables, and disputes MUST be conducted exclusively through the Event Connect In-App Messaging system. Communications conducted outside the platform (WhatsApp, email, phone, etc.) are not recognized, protected, or enforceable under these Terms.`,
    },
    {
      number: 4,
      title: "Service Providers & Vendor Obligations",
      content: `Service Providers are strictly required to submit only proposals they have the verified capacity to fulfill. By submitting a proposal on Event Connect, a Vendor warrants that they possess the required licenses, equipment, personnel, and expertise to deliver all stated services. All quoted prices are accurate and will not be altered after acceptance without documented mutual agreement via In-App Messaging.`,
    },
    {
      number: 5,
      title: "Commission Structure & Payment Policy",
      content: `Event Connect charges a commission on the total value of every event booking confirmed through the Platform. The commission rate is tiered based on the overall size of the event: Small Event (Under $10,000) - 8%, Medium Event ($10,000 – $50,000) - 6.5%, Large Event ($50,000 – $150,000) - 5.5%, Enterprise / MICE (Above $150,000) - 5%. Commission bypass is strictly prohibited.`,
    },
    {
      number: 6,
      title: "Escrow-Based Payment System",
      content: `Event Connect uses a phased escrow payment model: Tranche 7.1 — Mobilization Payment: Up to 70% of the contracted amount is released to the Vendor upon booking confirmation. Tranche 7.2 — Completion Payment: The remaining 30% is held in escrow and released upon the Organizer's confirmation of satisfactory service delivery.`,
    },
    {
      number: 7,
      title: "Anti-Fraud & Anti-Scam Policy",
      content: `Event Connect has a ZERO TOLERANCE policy for fraud, misrepresentation, and scamming of any kind. Prohibited fraudulent conduct includes: Submitting fabricated portfolio work, false certifications, or fake references to win bids, Accepting payment without intent or capability to deliver services, Creating multiple accounts to manipulate review scores or bid processes, Misrepresenting the scope, size, or nature of an event to secure lower commission rates.`,
    },
    {
      number: 8,
      title: "Conflict Resolution & Dispute Mediation",
      content: `All disputes arising from bookings made through Event Connect must first be submitted to the Platform's internal mediation process before any external legal action is initiated. Step 1: The aggrieved party raises a dispute via In-App Messaging. Step 2: Event Connect's Operations Team reviews the case within 5 business days. Step 3: A binding mediation decision is issued within 10 business days. Step 4: If either party rejects the mediation outcome, they may escalate to Rwanda's formal dispute resolution mechanisms.`,
    },
    {
      number: 9,
      title: "Privacy & Data Protection",
      content: `Event Connect collects and processes personal data (Name, Email, National ID, Nationality, payment information) in strict compliance with Rwanda's Law No. 058/2021 on Personal Data Protection and Privacy. Data is collected solely for identity verification (KYC), operational event management, and anonymized tourism intelligence reporting.`,
    },
    {
      number: 10,
      title: "Account Suspension & Termination",
      content: `Event Connect reserves the right to suspend or permanently terminate any account for the following reasons: Fraudulent conduct, Commission bypass, Repeated failure to communicate via In-App Messaging, Persistent non-delivery of contracted services without notification, Any violation of Rwandan law.`,
    },
    {
      number: 11,
      title: "Limitation of Liability",
      content: `Event Connect acts as a facilitating platform and is not directly liable for the quality, safety, legality, or delivery of services provided by Vendors. Our aggregate liability for any single claim shall not exceed the total commission fees collected by Event Connect from the specific booking giving rise to the claim. Event Connect is not liable for losses arising from force majeure events.`,
    },
    {
      number: 12,
      title: "Governing Law & Jurisdiction",
      content: `These Terms are governed by the laws of the Republic of Rwanda. Any dispute not resolved through Platform mediation shall be submitted to the competent courts of Kigali, Rwanda. Event Connect operates in compliance with: Rwanda Law No. 058/2021 (Data Protection and Privacy), Rwanda Law No. 18/2010 (Electronic Transactions), and applicable NCSA regulatory requirements.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-soft p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Event Connect
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Platform Terms & Conditions
              </p>
            </div>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Effective Date:</strong> March 13, 2026 |{" "}
              <strong>Version</strong> 2.0
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              <strong>Rwanda MICE & Event Technology Platform</strong>
            </p>
          </div>

          {sections.map((section) => (
            <div
              key={section.number}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.number)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded">
                    {section.number}
                  </span>
                  {section.title}
                </span>
                {expandedSections.has(section.number) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSections.has(section.number) && (
                <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Contact Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              For questions, complaints, or legal notices, please contact:
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              <strong>Event Connect Ltd.</strong>, Kigali, Rwanda
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Legal: legal@eventconnect.rw | Privacy: privacy@eventconnect.rw
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              I have read and agree to the{" "}
              <span className="font-semibold text-primary">
                Terms and Conditions
              </span>{" "}
              of Event Connect. I understand that continued use of the
              Platform constitutes acceptance of these Terms.
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!accepted}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-soft text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Check className="w-5 h-5" />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
