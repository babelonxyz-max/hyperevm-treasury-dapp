# Figma Setup Guide for Babelon Protocol

## 🚀 Getting Started

### Step 1: Create New Figma File
1. Go to [Figma.com](https://figma.com)
2. Click "New file" or use the "+" button
3. Name your file: "Babelon Protocol - Design System"
4. Set up your team workspace if needed

### Step 2: Set Up File Structure

#### Create Pages (in order):
1. **🎨 Design System**
2. **🧩 Components**
3. **📱 Mobile Layouts**
4. **💻 Desktop Layouts**
5. **🌙 Dark Mode**
6. **🎭 Prototypes**
7. **📊 Assets**

## 🎨 Design System Page Setup

### Color Palette Setup
1. **Create Color Styles:**
   - Go to Design System page
   - Create a frame titled "Color Palette"
   - Add rectangles for each color
   - Select each rectangle → Right-click → "Create style"
   - Name them according to the specification

2. **Primary Colors:**
   ```
   Primary Blue: #3B82F6
   Primary Dark: #1E40AF
   Accent Purple: #8B5CF6
   Success Green: #10B981
   Warning Orange: #F59E0B
   Error Red: #EF4444
   ```

3. **Neutral Colors:**
   ```
   Background: #FFFFFF
   Surface: #F8FAFC
   Surface Elevated: #F1F5F9
   Border: #E2E8F0
   Text Primary: #0F172A
   Text Secondary: #64748B
   Text Muted: #94A3B8
   ```

4. **Dark Mode Colors:**
   ```
   Background Dark: #0F172A
   Surface Dark: #1E293B
   Surface Elevated Dark: #334155
   Border Dark: #475569
   Text Primary Dark: #F8FAFC
   Text Secondary Dark: #CBD5E1
   ```

### Typography Setup
1. **Create Text Styles:**
   - Add text elements with different sizes
   - Select each → Right-click → "Create style"
   - Use Inter font for primary text
   - Use JetBrains Mono for code/numbers

2. **Text Style Names:**
   ```
   Display/Large
   Display/Medium
   Heading/1
   Heading/2
   Heading/3
   Body/Large
   Body/Medium
   Body/Small
   Caption
   Code
   ```

### Spacing System
1. **Create Spacing Frame:**
   - Add rectangles with different sizes
   - Label each with the spacing value
   - Use 4px base unit (xs: 4px, sm: 8px, etc.)

## 🧩 Components Page Setup

### Button Components
1. **Primary Button:**
   - Rectangle: 120px × 44px
   - Background: Primary Blue
   - Border radius: 8px
   - Text: "Button" (Body Medium, Semibold, White)
   - Create component: Right-click → "Create component"

2. **Secondary Button:**
   - Rectangle: 120px × 44px
   - Background: Transparent
   - Border: 1px solid Border color
   - Text: "Button" (Body Medium, Medium, Text Primary)

3. **Floating Action Button:**
   - Circle: 56px × 56px
   - Background: Primary Blue
   - Icon: Plus (24px, White)
   - Shadow: 0 4px 12px rgba(59, 130, 246, 0.4)

### Card Components
1. **Standard Card:**
   - Rectangle: 300px × 200px
   - Background: Surface Elevated
   - Border: 1px solid Border
   - Border radius: 12px
   - Padding: 24px
   - Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

2. **Floating Stats Bar:**
   - Rectangle: 1200px × 80px
   - Background: Surface Elevated with backdrop blur
   - Border: 1px solid Border
   - Border radius: 16px
   - Shadow: 0 8px 32px rgba(0, 0, 0, 0.12)

### Input Components
1. **Text Input:**
   - Rectangle: 200px × 44px
   - Background: Background
   - Border: 1px solid Border
   - Border radius: 8px
   - Placeholder text: "Enter text"

2. **Number Input:**
   - Rectangle: 200px × 44px
   - Background: Background
   - Border: 1px solid Border
   - Border radius: 8px
   - Text: "0.00" (Code font, right-aligned)

## 📱 Mobile Layout Page

### Mobile Dashboard Layout
1. **Frame Setup:**
   - Create iPhone 14 frame (390px × 844px)
   - Add grid: 1 column, 16px margins

2. **Header:**
   - Height: 60px
   - Background: Surface Elevated
   - Logo left, wallet connect right
   - Theme toggle

3. **Main Content:**
   - Staking dashboard cards
   - Stack vertically
   - 16px spacing between cards

4. **Floating Stats Bar:**
   - Full width, bottom fixed
   - 2x2 grid layout
   - Smaller text and icons

### Mobile Components
- **Card Stack**: Vertical layout
- **Button Full Width**: 100% width
- **Input Full Width**: 100% width
- **Collapsible Sidebar**: Slide-out menu

## 💻 Desktop Layout Page

### Desktop Dashboard Layout
1. **Frame Setup:**
   - Create desktop frame (1440px × 1024px)
   - Add 12-column grid
   - 24px gutters

2. **Header:**
   - Full width, 80px height
   - Logo left, navigation center, wallet right

3. **Main Layout:**
   - Left: 8 columns (main content)
   - Right: 4 columns (sidebar)
   - Gap: 24px

4. **Floating Stats Bar:**
   - Full width, bottom fixed
   - 4-column grid layout
   - Larger text and icons

### Desktop Components
- **Grid Layout**: 12-column system
- **Sidebar**: Fixed width, scrollable
- **Cards**: Multiple sizes and layouts
- **Forms**: Multi-column layouts

## 🌙 Dark Mode Page

### Dark Mode Setup
1. **Duplicate Components:**
   - Copy all components from Components page
   - Apply dark mode color overrides
   - Update text colors
   - Adjust shadows and borders

2. **Dark Mode Specifics:**
   - Semi-transparent backgrounds
   - Lighter shadows
   - Adjusted contrast ratios
   - Glow effects for interactive elements

## 🎭 Prototypes Page

### Interactive Prototypes
1. **Button Interactions:**
   - Hover states
   - Click animations
   - Loading states

2. **Navigation Flow:**
   - Wallet connection flow
   - Staking process
   - Withdrawal process

3. **Responsive Behavior:**
   - Mobile to desktop transitions
   - Sidebar collapse/expand
   - Theme switching

## 📊 Assets Page

### Icon Library
1. **Import Lucide Icons:**
   - Download SVG icons from Lucide
   - Import to Figma
   - Create icon components
   - Size variants: 16px, 20px, 24px

2. **Key Icons:**
   - TrendingUp, Zap, Coins, Shield
   - Wallet, Settings, ArrowUp, ArrowDown
   - Check, X, Alert, Info

### Illustrations
1. **Empty States:**
   - No wallet connected
   - No staking positions
   - Error states

2. **Onboarding:**
   - Welcome screens
   - Feature explanations
   - Tutorial steps

## 🔧 Advanced Setup

### Auto Layout Setup
1. **Enable Auto Layout:**
   - Select component
   - Click "Auto Layout" in right panel
   - Set direction (vertical/horizontal)
   - Add padding and gaps

2. **Responsive Components:**
   - Use "Fill" for flexible widths
   - Set min/max widths
   - Use "Hug" for content-based sizing

### Component Variants
1. **Button Variants:**
   - Size: Small, Medium, Large
   - State: Default, Hover, Active, Disabled
   - Type: Primary, Secondary, Ghost

2. **Card Variants:**
   - Size: Small, Medium, Large
   - Type: Standard, Elevated, Outlined
   - Content: Stats, Action, Info

### Design Tokens
1. **Create Tokens:**
   - Use Figma Tokens plugin
   - Define color tokens
   - Define spacing tokens
   - Define typography tokens

2. **Token Organization:**
   - Group by category
   - Use consistent naming
   - Export for development

## 📋 Checklist for Figma Setup

### Design System ✅
- [ ] Color palette created
- [ ] Typography styles defined
- [ ] Spacing system documented
- [ ] Icon library imported

### Components ✅
- [ ] Button components (all variants)
- [ ] Card components
- [ ] Input components
- [ ] Navigation components
- [ ] Floating stats bar

### Layouts ✅
- [ ] Mobile dashboard layout
- [ ] Desktop dashboard layout
- [ ] Responsive breakpoints
- [ ] Dark mode layouts

### Prototypes ✅
- [ ] Interactive button states
- [ ] Navigation flows
- [ ] Responsive behavior
- [ ] Theme switching

### Assets ✅
- [ ] Icon library
- [ ] Illustrations
- [ ] Empty states
- [ ] Onboarding screens

## 🚀 Next Steps

1. **Start with Design System page** - Set up colors, typography, and spacing
2. **Create basic components** - Buttons, cards, inputs
3. **Build layout templates** - Mobile and desktop
4. **Add interactions** - Hover states, animations
5. **Test responsiveness** - Different screen sizes
6. **Create prototypes** - User flows and interactions

This guide provides everything you need to create a comprehensive Figma design system for the Babelon Protocol. Each step builds upon the previous one, creating a solid foundation for your design work.

Would you like me to create additional detailed specifications for any specific components or provide more detailed instructions for any particular section?
