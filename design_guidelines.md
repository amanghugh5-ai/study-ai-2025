# StudyAI Design Guidelines

## Design Approach
**Selected Approach**: Reference-Based with Premium Productivity Aesthetic
Drawing inspiration from Linear's typography sophistication, Notion's interface elegance, and Stripe's refined visual language. This creates a cutting-edge study platform that feels both powerful and approachable.

**Core Principles**: Premium clarity, intentional hierarchy, sophisticated glassmorphism, purposeful motion

---

## Typography System

**Font Families** (via Google Fonts CDN):
- Primary: 'Inter' - All UI elements, body text
- Display: 'Sora' - Headlines, hero titles, section headers

**Type Scale**:
- Hero Display: text-6xl/text-7xl (Sora, font-semibold)
- Section Headers: text-4xl/text-5xl (Sora, font-semibold)
- Card Titles: text-xl/text-2xl (Inter, font-semibold)
- Body Text: text-base/text-lg (Inter, font-normal)
- Supporting Text: text-sm (Inter, font-medium)
- Micro Copy: text-xs (Inter, font-medium)

**Line Heights**: Use relaxed leading for readability (leading-relaxed for body, leading-tight for headlines)

---

## Layout & Spacing System

**Tailwind Spacing Primitives**: 4, 6, 8, 12, 16, 24, 32
- Component padding: p-6, p-8
- Section spacing: py-24, py-32
- Card gaps: gap-6, gap-8
- Element margins: mb-4, mb-6, mb-8

**Container Strategy**:
- Hero: Full-width with inner max-w-7xl
- Content sections: max-w-6xl mx-auto
- Text-heavy areas: max-w-4xl

**Grid System**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for feature cards

---

## Core Components

### Glassmorphic Cards
- Backdrop blur with semi-transparent backgrounds
- Subtle border (border border-white/10)
- Rounded corners: rounded-2xl
- Inner padding: p-8
- Shadow: shadow-2xl with colored glow effect

### Navigation
- Sticky top navigation with glass effect
- Logo left, primary CTA right
- Navigation links centered with hover underline animations
- Mobile: Hamburger menu with full-screen overlay

### Hero Section (Image-Based)
- Full viewport height (min-h-screen)
- Large background image with gradient overlay
- Centered content with max-w-4xl
- Primary headline + supporting text + dual CTA buttons
- Buttons with blurred backgrounds (backdrop-blur-md)

### Feature Cards (3-column grid)
- Icon at top (Heroicons via CDN)
- Title (text-2xl)
- Description (text-base, text-gray-300)
- Glassmorphic treatment
- Subtle hover lift effect

### Study Tools Showcase
- 2-column layout alternating image/content
- Large screenshots/mockups
- Descriptive text with feature highlights
- Accent gradient borders

### Testimonials
- Single-column centered cards with max-w-3xl
- User photo (rounded-full)
- Quote text (text-xl italic)
- Name and role (text-sm)

### CTA Section
- Full-width with gradient background
- Centered content
- Large headline + subtext + primary button

### Footer
- Dark background with glass overlay
- 4-column grid: Product, Resources, Company, Newsletter signup
- Social icons
- Copyright notice

---

## Animations (Minimal & Purposeful)

- Fade-in on scroll for sections (opacity transition)
- Subtle card hover lift (transform translateY)
- Button scale on press
- Smooth page transitions
- NO excessive scroll-triggered animations

---

## Images Section

**Hero Image**: 
Large, high-quality photograph depicting a modern study environment or abstract AI visualization with purple/blue tones. Should be inspirational and aspirational. Position: Full-width background with dark gradient overlay (top-to-bottom, opacity 40%).

**Feature Screenshots** (3-4 images):
Clean UI mockups showing AI features in action - chat interface, flashcard generation, study analytics dashboard. Position: Right/left alternating in feature sections, max-width 600px.

**Testimonial Photos** (3 images):
Professional headshots, 80x80px circular crops, positioned above testimonial text.

**Background Accents**:
Subtle gradient orbs/blobs in purple and blue as decorative elements in empty space areas.

---

## Visual Treatment Notes

- Dark base (#0a0a0f to #1a1a2e range)
- Purple accents (#8b5cf6, #a78bfa)
- Blue accents (#3b82f6, #60a5fa)
- Text: white/gray-100 for primary, gray-400 for secondary
- Glass effect: bg-white/5 to bg-white/10 with backdrop-blur
- All buttons on images use backdrop-blur-md backgrounds
- Consistent border-radius: rounded-xl for small, rounded-2xl for large elements