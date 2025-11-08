# AI Study Buddy - Design Guidelines

## Design Approach
**Educational Platform with Modern Minimalism** - Inspired by Linear's clean typography and Notion's intuitive content hierarchy, combined with vibrant accent colors for an engaging learning experience.

## Color System
- **Background**: `#1E1E2E` (deep charcoal)
- **Primary Accent**: `#4ADE80` (bright green) - for CTAs, correct answers, active states
- **Secondary Accent**: `#A78BFA` (soft purple) - for highlights, quiz elements, progress indicators
- **Text**: White/light gray for primary content, muted grays for secondary
- **Surface**: Lighter variations of background for cards and elevated elements

## Typography
- **Primary Font**: Inter or DM Sans via Google Fonts
- **Headings**: Bold (700), generous sizes (text-4xl to text-6xl for hero, text-2xl to text-3xl for page titles)
- **Body**: Regular (400), comfortable reading size (text-base to text-lg)
- **UI Elements**: Medium (500) for buttons and labels

## Layout System
**Spacing Units**: Tailwind units of 4, 6, 8, 12, 16, 20 (e.g., p-4, gap-8, space-y-12)

## Core Components

### Navigation & Headers
- **Landing Header**: Fixed top bar, logo left, Login/Signup buttons right with rounded corners and soft shadows
- **Authenticated Header**: Profile button top right, maintains consistent positioning across pages
- **Cards**: Rounded-lg (12px), subtle shadow-lg, background slightly lighter than page

### Search Interface
- **Search Bar**: Large, centered input with soft glow effect, rounded-full, generous padding (py-4 px-6)
- **Placeholder**: Subtle blur effect initially, smooth fade-out on typing
- **Width**: max-w-2xl centered for focus

### Topic & Subtopic Display
- **Subtopic Buttons**: Grid layout (grid-cols-2 md:grid-cols-3), rounded-xl cards with hover lift effect
- **Roadmap Sections**: Vertical flow with clear visual hierarchy - Explanation → Examples → Quiz
- **Section Navigation**: Previous/Next buttons at bottom with distinctive styling

### Quiz Components
- **Radio Options**: Large clickable areas with rounded borders, clear selected state using purple accent
- **Submit Button**: Prominent green accent, full-width on mobile, auto-width on desktop
- **Feedback**: Instant visual feedback - green for correct, red overlay for incorrect

### Profile Dashboard
- **Info Cards**: Grid layout for user details (grid-cols-1 md:grid-cols-2), consistent card styling
- **Donut Chart**: Large, centered visualization with purple/green segments, clear labels for attempted/correct/incorrect
- **History List**: Expandable cards showing topics, click to reveal attempted questions

## Page-Specific Layouts

### Landing Page
- **Hero Section**: 60vh minimum, centered search bar with subtle glow
- **No images needed** - focus on typography and the search experience

### Authentication Pages
- **Form Container**: max-w-md centered card with elevated shadow
- **Input Fields**: Full-width, consistent spacing (space-y-4), rounded-lg borders
- **Submit**: Full-width button with primary green accent

### Home Page
- **Search**: Prominent center placement, identical to landing
- **Topic Display**: Generated content in clean card layout, subtopics as interactive grid

### Subtopic Roadmap
- **Three-Section Layout**: Stacked vertically with clear section headers
- **Content Width**: max-w-4xl for optimal reading
- **Navigation**: Sticky bottom bar with prev/next buttons

### Profile Dashboard
- **Two-Column Split**: Stats/chart on left, history on right (stacks on mobile)
- **Chart Placement**: Top section with generous margin-bottom
- **History Cards**: Hover effects to indicate clickability

## Interactions
- **Transitions**: All interactive elements use transition-all duration-200
- **Hover States**: Subtle lift (translate-y-1) and shadow increase
- **Focus States**: Prominent ring-2 with purple accent
- **Button States**: Scale slightly on active, maintain blur backgrounds when over images

## Responsive Behavior
- **Mobile**: Single column layouts, full-width buttons, stacked navigation
- **Tablet**: 2-column grids where applicable, side-by-side forms
- **Desktop**: Multi-column layouts, optimal reading widths, spacious padding

## Animations
**Minimal and purposeful** - fade-ins for content loading, smooth transitions for navigation, subtle quiz result animations only.