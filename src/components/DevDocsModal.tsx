import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Code,
  Terminal,
  Server,
  Shield,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Upload,
  UserCheck,
  CreditCard,
  Lock,
  Smartphone
} from 'lucide-react';

const DOC_SECTIONS = [
  { id: 'install', label: '1 & 2. Installation & Dev Setup', icon: Terminal },
  { id: 'firebase', label: '3 & 4. Firebase Setup & Config', icon: Server },
  { id: 'rules', label: '5. Firestore Security Rules', icon: Shield },
  { id: 'env', label: '6. Environment Variables', icon: FileCode },
  { id: 'vercel', label: '7. Vercel Deployment Guide', icon: Globe },
  { id: 'catalog', label: '8 & 9. Product & Admin Guide', icon: Upload },
  { id: 'payment', label: '10 & 11. Payment & Download Security', icon: Lock },
  { id: 'testing', label: '12. Mobile & Desktop Checklist', icon: Smartphone },
];

export const DevDocsModal: React.FC = () => {
  const { isDevDocsOpen, setIsDevDocsOpen, showToast } = useApp();
  const [activeDoc, setActiveDoc] = useState('install');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isDevDocsOpen) return null;

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    showToast('Code snippet copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-4xl my-8 bg-[#090d16] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Sairah Labs — Production &amp; Architecture Deliverables
              </h3>
              <p className="text-xs text-slate-400">
                Developer: Swampod • Version: 1.0.0 • Master Project Specification Deliverables (Items 1–12)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDevDocsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          {DOC_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeDoc === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveDoc(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content View */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* SECTION 1 & 2 */}
          {activeDoc === 'install' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>1. Project Source &amp; 2. Installation &amp; Local Dev Setup</span>
              </h4>
              <p>
                Sairah Labs is engineered with <strong>React 19 + TypeScript + Vite + Tailwind CSS v4</strong>.
                Follow the standard commands below to run locally or inspect dependencies:
              </p>

              <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                <button
                  onClick={() =>
                    copySnippet(
                      'install-cmd',
                      '# 1. Clone or extract repository\ngit clone <repo-url>\ncd srs-web-studio\n\n# 2. Install dependencies\nnpm install\n\n# 3. Start local development server on port 3000\nnpm run dev\n\n# 4. Production build\nnpm run build'
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'install-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre>{`# 1. Clone or extract repository
git clone <repo-url>
cd srs-web-studio

# 2. Install dependencies
npm install

# 3. Start local development server on port 3000
npm run dev

# 4. Production build
npm run build`}</pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <strong className="text-white block">Key Directories:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><code>/src/context/AppContext.tsx</code> — Global State, Firebase auth, Firestore listener &amp; Cart</li>
                  <li><code>/src/data/initialProducts.ts</code> — Initial 20+ Digital Products, Guides &amp; Services</li>
                  <li><code>/src/firebase/config.ts</code> — Firebase Client initialization with databaseId &amp; error handler</li>
                  <li><code>/src/components/RtdbAdminPanel.tsx</code> — Admin Order Review, Product CRUD &amp; Settings (Realtime Database)</li>
                  <li><code>/firestore.rules</code> — Hardened Firestore security rules with ABAC &amp; RBAC protection</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 3 & 4 */}
          {activeDoc === 'firebase' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span>3. Firebase Setup &amp; Configuration Guide</span>
              </h4>
              <p>
                The app connects to Google Cloud Firebase for Firestore and Authentication.
                The configuration is loaded automatically from <code>firebase-applet-config.json</code>:
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                <pre>{`{
  "projectId": "liquid-gizmo-v4tm7",
  "appId": "1:101829971795:web:fc95edf44bbb77af861ba6",
  "authDomain": "liquid-gizmo-v4tm7.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-4679b66b-3fd1-4f79-8611-4a2cba239dec"
}`}</pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <strong className="text-white block">Connecting your own custom Firebase project:</strong>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Go to <code>https://console.firebase.google.com</code> and create a project.</li>
                  <li>Enable <strong>Firestore Database</strong> in production mode.</li>
                  <li>Enable <strong>Authentication</strong> with Google Sign-in provider.</li>
                  <li>Replace the credentials in <code>firebase-applet-config.json</code>.</li>
                  <li>Deploy <code>firestore.rules</code> using the Firebase CLI (<code>firebase deploy --only firestore:rules</code>).</li>
                </ol>
              </div>
            </div>
          )}

          {/* SECTION 5: RULES */}
          {activeDoc === 'rules' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>5. Firestore Security Rules Specification</span>
              </h4>
              <p>
                Deployed live to Cloud Firestore. Implements Attribute-Based Access Control (ABAC),
                disallows client-side role elevation, isolates customer orders, and blocks unverified payment alterations.
              </p>

              <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300">
                <button
                  onClick={() =>
                    copySnippet(
                      'rules-view',
                      `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    function isSignedIn() { return request.auth != null; }\n    function isAdmin() { return isSignedIn() && request.auth.token.email == 'mdswampodsarkar007@gmail.com'; }\n    match /products/{productId} {\n      allow get, list: if resource.data.isPublished == true || isAdmin();\n      allow create, update, delete: if isAdmin();\n    }\n    match /orders/{orderId} {\n      allow get: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);\n      allow create: if request.resource.data.paymentStatus in ['Pending', 'Awaiting Payment', 'Payment Under Review'];\n      allow update, delete: if isAdmin();\n    }\n  }\n}`
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'rules-view' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre>{`// Protection Highlights:
1. Customers cannot set paymentStatus = 'Paid' (Blocked by rules).
2. Users cannot grant themselves role = 'admin'.
3. Public users only read isPublished == true products.
4. Orders require ownership or admin identity to read.`}</pre>
              </div>
            </div>
          )}

          {/* SECTION 6: ENV */}
          {activeDoc === 'env' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>6. Environment Variable Example (.env.example)</span>
              </h4>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                <pre>{`# Server runtime environment
PORT=3000
NODE_ENV=production

# Applet Public URL
APP_URL="https://ais-dev-jy3cdtrsclz4nvi6xxxwxu-37796443137.asia-southeast1.run.app"

# Optional Gemini API key for server AI extensions
GEMINI_API_KEY="MY_GEMINI_API_KEY"`}</pre>
              </div>
            </div>
          )}

          {/* SECTION 7: VERCEL */}
          {activeDoc === 'vercel' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>7. Vercel Deployment Instructions</span>
              </h4>
              <p>
                Deploying Sairah Labs to Vercel takes under 2 minutes:
              </p>
              <ol className="list-decimal list-inside space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                <li>Push code to a GitHub repository (e.g. <code>github.com/swampod/srs-web-studio</code>).</li>
                <li>Log in to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Vercel</a> and click <strong>Add New &gt; Project</strong>.</li>
                <li>Select the GitHub repository. Vercel automatically detects <strong>Vite</strong> framework.</li>
                <li>Build Command: <code>npm run build</code></li>
                <li>Output Directory: <code>dist</code></li>
                <li>Install Command: <code>npm install</code></li>
                <li>Click <strong>Deploy</strong>. Vercel generates an SSL-secured custom domain in ~45 seconds.</li>
              </ol>
            </div>
          )}

          {/* SECTION 8 & 9 */}
          {activeDoc === 'catalog' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>8. Product Upload Guide &amp; 9. Admin Account Setup</span>
              </h4>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <strong className="text-white block">How to Upload New Products:</strong>
                  <p>
                    Open the <strong>Admin Panel</strong> in the top navigation bar (or click Admin Demo). Switch to the
                    <strong>Products</strong> tab, click <strong>+ Add New Product</strong>, set the BDT price, category,
                    bullet features, and download URL, then click Save. The item immediately renders on the storefront!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <strong className="text-white block">How Admin Access is Enforced:</strong>
                  <p>
                    The authorized master administrator is hardcoded to <code>mdswampodsarkar007@gmail.com</code> (Swampod).
                    When logged in with this Google account, the Admin Panel unlocks full permissions. For evaluation, the
                    <strong>Admin Demo</strong> toggle allows reviewing all verification screens without signing in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10 & 11 */}
          {activeDoc === 'payment' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>10. Manual Payment Testing &amp; 11. Download Security Testing</span>
              </h4>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <strong className="text-white block">Manual Payment Verification Test Flow:</strong>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Add any product to Cart and click Proceed to Checkout.</li>
                    <li>Select bKash or Nagad. Enter phone and a sample TrxID (e.g. <code>BK9X87KLM</code>).</li>
                    <li>Submit order. Notice the status is immediately <strong>Payment Under Review</strong> (no fake instant success).</li>
                    <li>Open <strong>Admin Panel &gt; Orders</strong>. Find the order.</li>
                    <li>Click <strong>Verify &amp; Fulfill</strong>. Change status to <strong>Paid</strong>, attach download URL/keys, and save.</li>
                    <li>Open <strong>Track Order</strong> portal as customer with the Order ID. Digital downloads and keys are now unlocked!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12 */}
          {activeDoc === 'testing' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>12. Mobile &amp; Desktop Testing Checklist</span>
              </h4>
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                {[
                  'Viewport responsiveness verified on 375px (iPhone SE), 414px (Android), 768px (iPad), and 1440px desktop.',
                  'bKash / Nagad number 1-click clipboard copy tested.',
                  'Interactive Chatbot Simulator bilingual responses in Bangla & English tested.',
                  'Shopping cart quantity stepper and total calculation in BDT verified.',
                  'Order status progression (Payment Under Review -> Paid -> Completed) verified.',
                  'Protected digital asset gating prevents unverified TrxID download access.',
                  'Admin Catalog CRUD and site settings updates verified.',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
