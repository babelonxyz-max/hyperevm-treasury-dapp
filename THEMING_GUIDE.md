# HyperEVM Treasury - Theming Guide

## Overview
This guide provides comprehensive documentation for the theming system used in the HyperEVM Treasury Protocol. The system supports both Mykonos-style light theme and Desert dark theme with a complete set of design tokens and component templates.

## Theme System Architecture

### 1. Design Tokens
The theming system is built on a comprehensive set of CSS custom properties (variables) that define:
- **Colors**: Primary, secondary, accent, success, warning, error, and neutral color palettes
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale based on 8px grid
- **Shadows**: Various shadow depths and glow effects
- **Transitions**: Smooth animations and state changes
- **Border Radius**: Consistent corner rounding
- **Z-Index**: Layering system for UI elements

### 2. Theme Variants

#### Desert Dark Theme (Default)
- **Background**: Deep desert earth tones (#0c0a09 to #1c1917)
- **Text**: Light desert colors (#fafaf9 to #78716c)
- **Accents**: Desert gold (#f5c842), Desert sand (#b89d73), Desert sky (#0ea5e9)
- **Cards**: Dark earth gradients with golden borders
- **Shadows**: Warm shadows with golden glows
- **Inspiration**: Desert landscapes, golden hour, earth tones

#### Mykonos Light Theme
- **Background**: Pure white and light grey (#ffffff to #f5f5f5)
- **Text**: Dark blue-grey (#171717 to #a3a3a3)
- **Accents**: Mykonos blue (#0ea5e9), Sky blue (#3b82f6), Pure white (#ffffff)
- **Cards**: Clean white gradients with blue borders
- **Shadows**: Subtle shadows with blue glows
- **Inspiration**: Greek islands, Mediterranean sea, white architecture

#### Light Theme
- **Background**: Light colors (#f8fafc to #ffffff)
- **Text**: Dark colors (#0f172a to #64748b)
- **Accents**: Same color palette, adjusted for light backgrounds
- **Cards**: Light gradients with subtle borders
- **Shadows**: Subtle shadows with reduced opacity

## Color System

### Primary Colors
```css
--color-primary-50: #fefce8;   /* Lightest */
--color-primary-500: #f59e0b;  /* Base */
--color-primary-950: #451a03;  /* Darkest */
```

### Semantic Color Mapping
```css
/* Dark Theme */
--color-background: var(--color-neutral-950);
--color-text-primary: var(--color-neutral-50);
--color-border-primary: rgba(255, 255, 255, 0.1);

/* Light Theme */
--color-background: var(--color-neutral-50);
--color-text-primary: var(--color-neutral-900);
--color-border-primary: rgba(0, 0, 0, 0.1);
```

## Component Templates

### Card Component
```css
.card-theme {
  background: var(--gradient-card);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-all);
}
```

### Button Component
```css
.btn-theme {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  font-family: var(--font-family-sans);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  transition: var(--transition-all);
}
```

### Button Variants
- `.btn-primary` - Primary brand color with gradient
- `.btn-secondary` - Secondary style with borders
- `.btn-accent` - Accent color with gradient

## Utility Classes

### Text Colors
- `.text-primary` - Primary text color
- `.text-secondary` - Secondary text color
- `.text-muted` - Muted text color
- `.text-accent` - Accent text color
- `.text-success` - Success state color
- `.text-warning` - Warning state color
- `.text-error` - Error state color

### Backgrounds
- `.bg-primary` - Primary background
- `.bg-secondary` - Secondary background
- `.bg-card` - Card background with gradient
- `.bg-elevated` - Elevated surface background

### Interactive States
- `.hover-lift` - Lift on hover
- `.hover-scale` - Scale on hover
- `.hover-glow` - Glow effect on hover
- `.focus-ring` - Focus ring for accessibility

### Animations
- `.animate-bounce` - Bounce animation
- `.animate-pulse` - Pulse animation
- `.animate-spin` - Spin animation
- `.animate-fade-in` - Fade in animation
- `.animate-slide-in-up` - Slide in from bottom
- `.animate-glow` - Glow animation

## Usage Examples

### Creating a Themed Card
```html
<div class="card-theme hover-lift">
  <h3 class="text-primary">Card Title</h3>
  <p class="text-secondary">Card description</p>
  <button class="btn-theme btn-primary">Action</button>
</div>
```

### Creating a Themed Button
```html
<button class="btn-theme btn-primary hover-scale focus-ring">
  Click Me
</button>
```

### Creating Themed Text
```html
<h1 class="text-primary gradient-text">Main Title</h1>
<p class="text-secondary">Subtitle text</p>
<span class="text-muted">Helper text</span>
```

## Theme Switching

The theme system automatically switches between dark and light themes based on the `data-theme` attribute on the document element:

```javascript
// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light');

// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark');
```

## Best Practices

### 1. Use Semantic Color Variables
Always use semantic color variables instead of hardcoded colors:
```css
/* Good */
color: var(--color-text-primary);
background: var(--color-background-card);

/* Bad */
color: #ffffff;
background: #1a1a26;
```

### 2. Use Component Templates
Use the provided component templates for consistency:
```css
/* Good */
.my-component {
  @extend .card-theme;
  /* Additional styles */
}

/* Bad */
.my-component {
  background: var(--gradient-card);
  border: 1px solid var(--color-border-primary);
  /* ... */
}
```

### 3. Use Utility Classes
Combine utility classes for quick styling:
```html
<div class="bg-card text-primary hover-lift animate-fade-in">
  Content
</div>
```

### 4. Maintain Accessibility
Always ensure proper contrast ratios and focus states:
```css
.my-button {
  @extend .btn-theme;
  @extend .focus-ring;
}
```

## Extending the Theme System

### Adding New Color Variants
1. Add new color variables to the theme definitions
2. Create semantic mappings for the new colors
3. Add utility classes if needed

### Adding New Component Templates
1. Create the base component class
2. Add variant classes
3. Include hover and focus states
4. Document the usage

### Adding New Animations
1. Define keyframes
2. Create animation utility classes
3. Test performance and accessibility
4. Document the usage

## Performance Considerations

- CSS custom properties are efficient and well-supported
- Animations use `transform` and `opacity` for better performance
- Transitions are kept short and smooth
- Heavy effects are optional and can be disabled

## Browser Support

The theming system supports all modern browsers:
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 16+

## Troubleshooting

### Theme Not Switching
- Check that `data-theme` attribute is set correctly
- Verify CSS custom properties are defined
- Check for CSS specificity issues

### Colors Not Updating
- Ensure you're using semantic color variables
- Check for hardcoded color values
- Verify theme-specific overrides

### Animations Not Working
- Check browser support for CSS animations
- Verify animation utility classes are applied
- Check for conflicting CSS rules

## Future Enhancements

- High contrast mode support
- Reduced motion preferences
- Custom theme creation
- Theme persistence
- Dynamic theme switching
- Component-level theme overrides
