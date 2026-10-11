import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  FileText,
  AlertTriangle,
  RotateCcw,
  Truck,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const PoliciesModal: React.FC = () => {
  const { isPoliciesOpen, setIsPoliciesOpen, policyTopic, setPolicyTopic } = useApp();

  if (!isPoliciesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-3xl my-8 bg-[#090d16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Trust, Terms &amp; Consumer Protection Policies
            </h3>
          </div>
          <button
            onClick={() => setIsPoliciesOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Topic Switcher Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'pc-disclaimer', label: 'PC Optimization Disclaimer', icon: AlertTriangle },
            { id: 'refund', label: 'Refund & Cancellation', icon: RotateCcw },
            { id: 'delivery', label: 'Digital Delivery Policy', icon: Truck },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = policyTopic === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPolicyTopic(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* TOPIC 1: PC OPTIMIZATION DISCLAIMER */}
          {(policyTopic === 'pc-disclaimer' || policyTopic === 'all') && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>PC Optimization &amp; System Tuning Legal Disclaimer</span>
              </h4>
              <p>
                <strong>1. No Arbitrary FPS Guarantees:</strong> Sairah Labs strictly does not advertise or promise guaranteed
                percentage or fixed number FPS increases. Actual framerate improvements, frame pacing, and temperature reductions
                are entirely contingent upon hardware silicon variance, cooling solutions, motherboard VRMs, GPU architecture, RAM speed,
                operating system version, and installed background software.
              </p>
              <p>
                <strong>2. Web Dashboard vs Installed Software:</strong> A web dashboard cannot directly alter Windows kernel, registry,
                or background service parameters without an explicitly installed native desktop executable granted administrative privileges.
                Web visitors are strictly informed that monitoring dashboards displayed in the browser represent cloud telemetry and catalog views.
              </p>
              <p>
                <strong>3. Compliance with Game &amp; Anti-Cheat Terms:</strong> All guides, configurations, and utilities provided by Sairah Labs
                strictly adhere to game terms of service. We <strong>never</strong> supply cheats, bots, injectors, or tools intended to bypass
                anti-cheat engines such as Vanguard, Easy Anti-Cheat, BattlEye, or Ricochet.
              </p>
            </div>
          )}

          {/* TOPIC 2: REFUND & CANCELLATION */}
          {(policyTopic === 'refund' || policyTopic === 'all') && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>Refund and Cancellation Policy</span>
              </h4>
              <p>
                <strong>1. Downloadable Digital Products:</strong> Due to the immediate irrevocable nature of digital software licenses,
                source code packages, and PDF optimization manuals, refunds are generally not permitted once a verified payment has released
                the download links, except in cases where a demonstrable technical file corruption cannot be remedied by our team within 48 hours.
              </p>
              <p>
                <strong>2. Remote Optimization Sessions:</strong> If an AnyDesk/Discord 1-on-1 session cannot be conducted due to a scheduling
                conflict, clients may request a reschedule or a full 100% refund in BDT prior to the session commencement.
              </p>
              <p>
                <strong>3. Custom Web Development:</strong> Custom development orders operate with milestone sign-offs. If a client terminates
                prior to initial UI approval, the unspent portion of the project deposit is refunded within 5 business days to the original payment channel.
              </p>
            </div>
          )}

          {/* TOPIC 3: DIGITAL DELIVERY POLICY */}
          {(policyTopic === 'delivery' || policyTopic === 'all') && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Digital Product Delivery Policy</span>
              </h4>
              <p>
                <strong>1. Order Confirmation:</strong> All orders are placed over WhatsApp. Each order is confirmed by our team in chat,
                and delivery details are shared directly in your inbox — no payment apps or forms needed from your side.
              </p>
              <p>
                <strong>2. Access Retrieval:</strong> Customers do not need an account to retrieve paid downloads. You can simply open the
                <strong>Track Order</strong> portal on our website, input your unique Order Reference (e.g. <code>SL-ORD-XXXX</code>), and
                access your download links and license keys immediately once verified.
              </p>
              <p>
                <strong>3. License Secrecy:</strong> Private keys and sensitive download links are never exposed to unauthorized public queries.
              </p>
            </div>
          )}

          {/* TOPIC 4: TERMS OF SERVICE */}
          {(policyTopic === 'terms' || policyTopic === 'all') && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Terms of Service</span>
              </h4>
              <p>
                By placing an order on Sairah Labs, you acknowledge that you are either the authorized owner of the payment account
                or have obtained explicit permission. All source code templates purchased are licensed for commercial deployment on individual
                or unlimited client sites as designated by the relevant tier. Redistribution or re-selling of raw templates as a competing template pack is prohibited.
              </p>
            </div>
          )}

          {/* TOPIC 5: PRIVACY POLICY */}
          {(policyTopic === 'privacy' || policyTopic === 'all') && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Privacy &amp; Data Protection</span>
              </h4>
              <p>
                We only collect your name, email, phone number, and transaction references to fulfill orders, verify manual payments, and
                provide technical customer support. We never share, sell, or disclose your contact details to third-party telemarketers.
                Your data is stored securely in Google Cloud Firestore and authenticated via Firebase Auth.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
