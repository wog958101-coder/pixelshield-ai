# PixelShield AI

> **"Protect every pixel before you share it."**  
> AI-powered media privacy, content safety, and delivery optimization platform built for **HackIndia 2026: Pixels to Products — Cloudinary AI Hackathon**.

**Hackathon Track:** Track 1 — AI Media Pipelines  
**Live Demo:** [[https://pixelshield-ai.vercel.app/]]
**GitHub Repository:**[ (https://github.com/wog958101-coder/pixelshield-ai.git)]]
**License:** MIT

---

## 📖 Overview

Every day, billions of photos are captured and published across social media, blogs, forums, and workplace collaboration tools. Most users assume that an image only shares what is visible to the human eye. In reality, raw images silently leak massive quantities of sensitive personal data:

1. **Biometric Face Exposure:** Unblurred bystander faces, children, or private individuals can be automatically harvested and indexed by facial recognition scrapers without consent.
2. **Embedded Geolocation (GPS):** Modern smartphone cameras embed precise residential latitude, longitude, and altitude coordinates directly inside unstripped EXIF headers.
3. **Hardware Fingerprints:** Camera model numbers, unique serials, firmware versions, and timestamp markers expose personal device profiles.
4. **Media Payload Bloat:** Unprocessed camera captures (often 5 MB to 20 MB) consume excessive network bandwidth and slow down page load speeds without any perceptual visual gain.

**PixelShield AI** solves these challenges by transforming media ingestion from a passive storage bucket into an active, intelligent, privacy-preserving pipeline powered by **Cloudinary**. Users upload an image, and PixelShield AI automatically analyzes security risks, generates a transparent **Media Safety Report**, allows granular privacy transformations (face pixelation, EXIF sanitization, content-aware smart cropping, and format transcoding), and delivers lightweight, CDN-optimized assets to any screen.

---

## 🏆 Hackathon Track Alignment: Track 1 — AI Media Pipelines

PixelShield AI was engineered from the ground up for **Track 1: AI Media Pipelines**. Rather than treating Cloudinary merely as a passive static image host, the application implements an end-to-end media lifecycle where Cloudinary is the computational core:

- **Ingestion & AI Telemetry:** Server-side stream upload with real-time biometric face detection (`faces: true`), EXIF metadata extraction (`image_metadata: true`), and content moderation filters.
- **Dynamic Edge Transformations:** On-the-fly privacy redaction (`e_pixelate_faces`, `e_blur_faces`), profile sanitization (`fl_strip_profile`), and saliency-aware framing (`c_fill,g_auto`).
- **Performance & Delivery Optimization:** Dynamic format auto-negotiation (`f_auto`) and perceptual lossless quality tuning (`q_auto:good`) served globally through Cloudinary's multi-CDN edge network.

---

## ⚡ How Cloudinary is Used

Cloudinary is the central engine of PixelShield AI. The actual workflow passes directly through Cloudinary's APIs:

```
[User Image]
     │
     ▼ (1. Client Preflight & Validation)
[Next.js Server API: /api/cloudinary/upload]
     │
     ▼ (2. Stream Upload with Signed API Credentials)
[Cloudinary Upload API: folder 'pixelshield/uploads/']
     ├─ AI Face Coordinate Detection (faces: true)
     ├─ EXIF Geolocation & Device Extraction (image_metadata: true)
     ├─ Ingestion Moderation Evaluation (moderation: 'manual')
     ├─ Color & Quality Analysis (colors: true, quality_analysis: true)
     │
     ▼ (3. Safety Scoring & Telemetry Extraction)
[Media Safety Report View]
     ├─ Overall Safety Score (0-100) & Action Verdict
     ├─ Biometric Risk Breakdown & Unmasked Face Count
     ├─ Geolocation & Device Profile Exposure Warning
     │
     ▼ (4. User Protection Actions & Transformation Studio)
[Cloudinary Transformation Engine]
     ├─ AI Face Anonymization: e_pixelate_faces / e_blur_faces
     ├─ EXIF & GPS Scrubbing: fl_strip_profile
     ├─ Content-Aware Smart Crop: c_fill, g_auto (1:1, 4:5, 16:9)
     ├─ Format Transcoding: f_auto, f_webp, f_avif, f_png, f_jpg
     ├─ AI Background Removal: e_background_removal, f_png
     ├─ Perceptual Compression: q_auto:good / q_auto:eco
     │
     ▼ (5. Verified Multi-Result Before / After Viewer & Edge Delivery)
[Cloudinary Edge CDN Delivery & Direct Asset Download]
```

### Verified Cloudinary Features Implemented

| Cloudinary Capability | Implementation Code / URL Flag | Function in PixelShield AI |
|---|---|---|
| **Streaming Upload API** | `cloudinary.uploader.upload_stream` | Ingests raw uploads into `pixelshield/uploads/` with predictable IDs (`ps_<timestamp>_<hash>`). |
| **Biometric Face Detection** | `faces: true` | Scans for human facial bounding boxes and returns coordinates for privacy evaluation. |
| **Metadata & EXIF Audit** | `image_metadata: true` | Identifies GPS latitude/longitude, camera model, and device software signatures. |
| **Face Pixelation Redaction** | `e_pixelate_faces:<intensity>` | Obfuscates detected faces with customizable pixel block intensity (e.g. `15` or `40`). |
| **Gaussian Face Blur** | `e_blur_faces:600` | Applies smooth Gaussian blurring restricted to facial regions. |
| **Metadata Profile Scrubbing** | `fl_strip_profile` | Sanitizes all EXIF, GPS coordinates, camera serials, and timestamps from the delivered asset. |
| **Content-Aware Smart Crop** | `c_fill,g_auto,ar_<ratio>` | Uses Cloudinary AI gravity to crop media while keeping subjects and faces centered (`1:1`, `4:5`, `16:9`). |
| **Format Auto-Negotiation** | `f_auto` | Evaluates user browser support and delivers modern WebP or AVIF automatically. |
| **Perceptual Quality Tuning** | `q_auto:good` / `q_auto:eco` | Minimizes byte payload while maintaining visually lossless quality. |
| **AI Background Removal** | `e_background_removal,f_png` | Neural foreground cutout with alpha channel preservation (capability-probed). |
| **Dynamic Format Conversion** | `f_webp`, `f_avif`, `f_jpg`, `f_png` | Converts assets to target formats on-the-fly at the CDN edge. |

---

## ✨ Working Features

- ✅ **Secure Media Ingestion:** Drag-and-drop or browse files with client and server MIME/signature validation (`JPG`, `PNG`, `WEBP` up to 15 MB) and buffer magic bytes verification.
- ✅ **Automated Media Safety Report:** Real-time calculation of Safety Score (0–100), Content Status, Biometric Risk, and EXIF GPS disclosure.
- ✅ **Protect & Transform Panel:** Interactive matrix executing real Cloudinary operations for Optimization, Smart Cropping, Format Transcoding, Background Removal, and Face Masking.
- ✅ **Transformation Results Ledger:** Maintains a history of all generated assets displaying operations applied, verified file sizes, and percentage savings.
- ✅ **Multi-Result Before / After Comparison:** Split slider and side-by-side viewer allowing users to compare the original raw photo against any generated result.
- ✅ **Direct Asset Downloads:** Native client-side blob download (`downloadCloudinaryAsset`) triggering browser downloads of actual Cloudinary assets with correct extensions.
- ✅ **Instant Presets (Zero Credentials Required):** Evaluators can test the entire pipeline immediately using pre-configured scenarios (Portrait Face ID, Street Bystanders, Camera Bloat).
- ✅ **Alpha Transparency Guards:** Warns users when converting PNG/WebP assets to JPG to prevent unexpected background flattening.
- ✅ **Honest Capability Reporting:** Features requiring specific add-ons (such as `e_background_removal`) display a clear *"Not Configured"* notice rather than generating fake or mocked responses.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Client Browser                       │
│  - Drag & Drop Upload Zone (Empty / Loading / Success) │
│  - Interactive Before / After Split Slider & Side-by-Side│
│  - Transformation Results Ledger & Asset Download      │
└───────────────────────────┬────────────────────────────┘
                            │ FormData (Stream)
                            ▼
┌────────────────────────────────────────────────────────┐
│           Next.js 15 Server (App Router)               │
│  - /api/cloudinary/upload: Buffer magic bytes & MIME   │
│  - /api/cloudinary/transform: Zod-validated transform  │
│  - /api/health: Connection status & feature telemetry  │
│  - lib/cloudinary.ts: Client-safe URL builders         │
│  - lib/cloudinary/client.ts: Server-only SDK client   │
└───────────────────────────┬────────────────────────────┘
                            │ Signed Upload Stream & Edge Probes
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Cloudinary Cloud Engine                │
│  - Storage: pixelshield/uploads/ps_<timestamp>         │
│  - AI Ingestion: faces: true, image_metadata: true    │
│  - Edge Transformations: e_pixelate_faces, fl_strip    │
│  - CDN Optimization: f_auto, q_auto:good               │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

- **Framework:** Next.js 15 (App Router with Server Components & API route handlers)
- **Language:** TypeScript 5 (Strict type checking)
- **Styling:** Tailwind CSS v4 & PostCSS
- **Component Primitives:** Radix UI principles, Lucide React icons
- **Validation:** Zod (Server-side schema validation for transformation parameters)
- **Media Engine:** Cloudinary Node SDK (`cloudinary ^2.x`) & Cloudinary Dynamic Transformation CDN

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or 20+
- npm, pnpm, or bun
- A free or paid [Cloudinary account](https://cloudinary.com/console)

### 1. Clone the Repository

```bash
git clone https://github.com/wog958101-coder/pixelshield-ai.git
cd pixelshield-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Cloudinary API Credentials (Server-only secrets)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional connection string alternative
# CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

> **Security Note:** `CLOUDINARY_API_SECRET` is accessed solely inside server-side route handlers. It is never exposed to the client bundle or browser environment.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch PixelShield AI.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 🔧 Cloudinary Configuration Details

### Required Features (Available on all Cloudinary accounts)
- **Upload API & Storage:** Ability to upload images into folders.
- **Faces Detection (`faces: true`):** Standard face detection for coordinate analysis and pixelation (`e_pixelate_faces`).
- **Image Metadata (`image_metadata: true`):** Header inspection for EXIF and GPS tags.
- **Dynamic Delivery Transformations:** `f_auto`, `q_auto`, `c_fill,g_auto`, `fl_strip_profile`, format conversion.

### Optional Features
- **Cloudinary AI Background Removal (`e_background_removal`):** Requires activating the *Cloudinary AI Background Removal* add-on in the Cloudinary Console Add-ons marketplace. If unconfigured, PixelShield AI gracefully detects this and labels the capability as *"Not Configured"* without breaking.

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── cloudinary/
│   │   │   ├── upload/route.ts      # Secure stream upload, face/EXIF scan & validation
│   │   │   └── transform/route.ts   # Zod-validated transform dispatcher & edge probe
│   │   └── health/route.ts          # Backend configuration health check
│   ├── globals.css                  # Global Tailwind styles & typography
│   ├── layout.tsx                   # Root HTML layout with OpenGraph & Twitter metadata
│   └── page.tsx                     # Main interactive application & dashboard
├── components/
│   ├── Navbar.tsx                   # Sticky navigation, status indicator & mobile menu
│   ├── LandingHero.tsx              # Startup hero, pipeline diagram & feature cards
│   ├── ImageUploader.tsx            # Three-state upload dropzone, preview & retry actions
│   ├── MediaSafetyReportView.tsx    # Four-section accessible Media Safety Report
│   ├── ProtectAndTransformPanel.tsx # Action matrix & Transformation Results Ledger
│   ├── BeforeAfterViewer.tsx        # Split slider & side-by-side comparison studio
│   └── ResultExportBar.tsx          # Direct asset download & operations audit bar
├── lib/
│   ├── cloudinary.ts                # Client-safe URL builders, validators & blob downloader
│   ├── cloudinary/
│   │   ├── client.ts                # Server-only Cloudinary SDK client initialization
│   │   ├── presets.ts               # Offline demo presets for instant evaluation
│   │   └── transformations.ts       # Cloudinary transformation string assembler
│   └── image-compress.ts            # Gentle client preflight scaler for oversized uploads
├── types/
│   └── media.ts                     # TypeScript interfaces for reports, assets & results
├── .env.example                     # Safe environment variable placeholders
├── .gitignore                       # Strict git ignore protecting credentials
└── package.json                     # Project scripts and dependencies
```

---

## 🔒 Security & Privacy Auditing

PixelShield AI was audited against the Open Web Application Security Project (OWASP) guidelines for media processing applications:

1. **Zero Secret Leakage:** `CLOUDINARY_API_SECRET` is strictly restricted to server-side Node.js runtimes.
2. **Buffer Magic Byte Verification:** Ingestion verifies binary magic bytes (`JPEG: 0xFFD8`, `PNG: 0x89504E47`, `WebP: RIFF...WEBP`) to prevent executable file masking or extension spoofing.
3. **Prohibition of Scriptable Vectors:** `.svg`, `.html`, `.php`, and executable payloads are rejected to protect against stored Cross-Site Scripting (XSS).
4. **Zod Input Sanitization:** Transformation API endpoints enforce strict alphanumeric regular expressions on `publicId` parameters to mitigate path traversal risks.
5. **Sanitized Error Messaging:** Internal database connection strings and raw Cloudinary authorization tokens are caught and sanitized before reaching client responses.

---

## ⚠️ Known Limitations

- **Cloudinary AI Background Removal:** Requires an active subscription or add-on tier on the user's Cloudinary account.
- **Client Uplink Bandwidth:** On very slow network connections, raw 20 MB images may take several seconds to stream to the server; client preflight automatically optimizes files > 4 MB to prevent gateway timeouts.
- **Single-Asset Session:** In this MVP release, analysis is performed one image at a time (multi-file batch processing is planned for future milestones).

---

## 🔮 Future Roadmap

- 👥 **User Accounts & Teams:** Organization workspaces with shared media safety policies.
- 📦 **Batch Multi-Asset Ingestion:** Bulk folder uploads with asynchronous background processing.
- 🪪 **Sensitive Document OCR:** Automated detection and redaction of passport numbers, credit cards, and license plates.
- 🔔 **Webhook Web-Push Events:** Notification triggers when large video or high-resolution asset transforms complete.
- 📜 **Compliance Exporting:** One-click PDF audit certificates verifying GDPR / CCPA biometric sanitization compliance.

---

## 📄 License

PixelShield AI is licensed under the [MIT License](LICENSE).

---

Built with pride for the **HackIndia 2026: Pixels to Products — Cloudinary AI Hackathon**.
