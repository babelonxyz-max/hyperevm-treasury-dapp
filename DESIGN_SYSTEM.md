# Babelon Protocol - Design System Specification

## 🎨 Brand Identity

### Primary Colors
- **Primary Blue**: `#3B82F6` (Blue-500)
- **Primary Dark**: `#1E40AF` (Blue-700)
- **Accent Purple**: `#8B5CF6` (Violet-500)
- **Success Green**: `#10B981` (Emerald-500)
- **Warning Orange**: `#F59E0B` (Amber-500)
- **Error Red**: `#EF4444` (Red-500)

### Neutral Colors
- **Background**: `#FFFFFF` (White)
- **Surface**: `#F8FAFC` (Slate-50)
- **Surface Elevated**: `#F1F5F9` (Slate-100)
- **Border**: `#E2E8F0` (Slate-200)
- **Text Primary**: `#0F172A` (Slate-900)
- **Text Secondary**: `#64748B` (Slate-500)
- **Text Muted**: `#94A3B8` (Slate-400)

### Dark Mode Colors
- **Background Dark**: `#0F172A` (Slate-900)
- **Surface Dark**: `#1E293B` (Slate-800)
- **Surface Elevated Dark**: `#334155` (Slate-700)
- **Border Dark**: `#475569` (Slate-600)
- **Text Primary Dark**: `#F8FAFC` (Slate-50)
- **Text Secondary Dark**: `#CBD5E1` (Slate-300)

## 📝 Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for addresses, numbers)

### Font Sizes
- **Display Large**: 48px / 56px line height
- **Display Medium**: 36px / 44px line height
- **Heading 1**: 32px / 40px line height
- **Heading 2**: 24px / 32px line height
- **Heading 3**: 20px / 28px line height
- **Body Large**: 18px / 28px line height
- **Body Medium**: 16px / 24px line height
- **Body Small**: 14px / 20px line height
- **Caption**: 12px / 16px line height
- **Code**: 14px / 20px line height (JetBrains Mono)

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## 📐 Spacing System

### Base Unit: 4px
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px
- **4xl**: 64px
- **5xl**: 80px

## 🧩 Component Specifications

### Buttons

#### Primary Button
- **Background**: Primary Blue (#3B82F6)
- **Text**: White
- **Padding**: 12px 24px
- **Border Radius**: 8px
- **Font**: Body Medium, Semibold
- **Hover**: Darker blue (#2563EB)
- **Disabled**: 50% opacity

#### Secondary Button
- **Background**: Transparent
- **Border**: 1px solid Border color
- **Text**: Text Primary
- **Padding**: 12px 24px
- **Border Radius**: 8px
- **Font**: Body Medium, Medium

#### Floating Action Button
- **Background**: Primary Blue
- **Size**: 56px × 56px
- **Border Radius**: 50%
- **Shadow**: 0 4px 12px rgba(59, 130, 246, 0.4)
- **Icon**: 24px

### Cards

#### Standard Card
- **Background**: Surface Elevated
- **Border**: 1px solid Border
- **Border Radius**: 12px
- **Padding**: 24px
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)

#### Floating Stats Bar
- **Background**: Surface Elevated with backdrop blur
- **Border**: 1px solid Border
- **Border Radius**: 16px
- **Padding**: 16px 24px
- **Shadow**: 0 8px 32px rgba(0, 0, 0, 0.12)
- **Position**: Fixed bottom, centered

### Input Fields

#### Text Input
- **Background**: Background
- **Border**: 1px solid Border
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Font**: Body Medium
- **Focus**: 2px solid Primary Blue
- **Error**: 2px solid Error Red

#### Number Input
- **Background**: Background
- **Border**: 1px solid Border
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Font**: Code (JetBrains Mono)
- **Text Align**: Right

### Icons

#### Icon Library
- **Source**: Lucide React
- **Size**: 16px, 20px, 24px
- **Color**: Inherit from parent
- **Stroke Width**: 1.5px

#### Key Icons
- **TrendingUp**: APY indicators
- **Zap**: zHYPE related
- **Coins**: Token amounts
- **Shield**: Security features
- **Wallet**: Connection
- **Settings**: Configuration
- **ArrowUp**: Staking
- **ArrowDown**: Unstaking

## 📱 Layout Specifications

### Grid System
- **Container Max Width**: 1200px
- **Grid Columns**: 12
- **Gutter**: 24px
- **Breakpoints**:
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+

### Dashboard Layout
- **Main Content**: 8 columns
- **Sidebar**: 4 columns
- **Floating Stats Bar**: Full width, fixed bottom
- **Header**: Full width, fixed top

### Component Spacing
- **Section Spacing**: 48px
- **Card Spacing**: 24px
- **Element Spacing**: 16px
- **Text Spacing**: 8px

## 🎭 Interactive States

### Hover States
- **Buttons**: Darker background, scale 1.02
- **Cards**: Subtle shadow increase
- **Links**: Underline or color change
- **Icons**: Color change to primary

### Focus States
- **Inputs**: 2px solid primary border
- **Buttons**: 2px solid primary border
- **Cards**: 2px solid primary border

### Active States
- **Buttons**: Pressed down effect
- **Toggles**: Background color change
- **Tabs**: Underline or background change

### Loading States
- **Skeleton**: Animated placeholder
- **Spinner**: Rotating icon
- **Progress**: Animated progress bar

## 🌙 Dark Mode Specifications

### Dark Mode Overrides
- **Background**: Background Dark
- **Surface**: Surface Dark
- **Text**: Text Primary Dark
- **Borders**: Border Dark
- **Shadows**: Darker, more subtle

### Dark Mode Specific
- **Card Background**: Surface Dark
- **Input Background**: Surface Dark
- **Button Hover**: Lighter primary
- **Floating Stats Bar**: Semi-transparent dark

## 📊 Data Visualization

### Charts and Graphs
- **Primary Color**: Primary Blue
- **Secondary Color**: Accent Purple
- **Success Color**: Success Green
- **Warning Color**: Warning Orange
- **Error Color**: Error Red

### Progress Indicators
- **Background**: Surface
- **Fill**: Primary Blue
- **Border Radius**: 4px
- **Height**: 8px

### Status Indicators
- **Success**: Green dot with checkmark
- **Warning**: Orange dot with exclamation
- **Error**: Red dot with X
- **Pending**: Gray dot with spinner

## 🎨 Animation Specifications

### Transitions
- **Duration**: 200ms
- **Easing**: ease-in-out
- **Hover**: 150ms
- **Focus**: 100ms

### Micro-interactions
- **Button Press**: Scale 0.98
- **Card Hover**: Scale 1.02
- **Icon Hover**: Rotate 5deg
- **Loading**: Rotate 360deg

## 📱 Responsive Breakpoints

### Mobile (320px - 768px)
- **Grid**: 1 column
- **Sidebar**: Hidden, slide-out menu
- **Floating Stats Bar**: Full width, stacked
- **Typography**: Smaller sizes
- **Spacing**: Reduced padding

### Tablet (768px - 1024px)
- **Grid**: 2 columns
- **Sidebar**: Collapsible
- **Floating Stats Bar**: 2x2 grid
- **Typography**: Medium sizes

### Desktop (1024px+)
- **Grid**: 12 columns
- **Sidebar**: Always visible
- **Floating Stats Bar**: 4 columns
- **Typography**: Full sizes

## 🔧 Figma File Structure

### Pages
1. **Design System** - Colors, typography, spacing
2. **Components** - Reusable UI components
3. **Layouts** - Page layouts and templates
4. **Mobile** - Mobile-specific designs
5. **Desktop** - Desktop-specific designs
6. **Dark Mode** - Dark theme variations
7. **Prototypes** - Interactive prototypes

### Component Organization
- **Atoms**: Buttons, inputs, icons
- **Molecules**: Cards, form groups
- **Organisms**: Headers, sidebars, floating bars
- **Templates**: Page layouts
- **Pages**: Complete screens

This specification provides everything needed to create a comprehensive Figma design system for the Babelon Protocol. Would you like me to create additional detailed specifications for any specific components or sections?
