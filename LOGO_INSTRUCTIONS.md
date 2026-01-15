# How to Replace the Felix Logo

## File Location
Save your logo file to: `public/felix-logo.png`

## Supported Formats
The code will automatically try these formats in order:
1. `/felix-logo.png` (preferred)
2. `/felix-logo.svg`
3. `/felix-logo.jpg`

## Steps to Replace

1. **Save your logo file** to the `public` folder with one of these names:
   - `felix-logo.png` (recommended)
   - `felix-logo.svg`
   - `felix-logo.jpg`

2. **File path**: `/Users/mark/hyperevm-treasury-dapp/public/felix-logo.png`

3. **After saving**, the logo will automatically appear on:
   - Main website header
   - Hypurr Terms page header

4. **To deploy**: Run `npm run hard-deploy` or commit and push

## Current Setup
- Code is configured to look for `/felix-logo.png` first
- Falls back to SVG, JPG, or text if PNG not found
- Logo displays at 32px height, auto width

## If You Can't Replace the File
If you're having trouble replacing the file, you can:
1. Delete the existing `public/felix-logo.svg` file
2. Copy your logo file to `public/felix-logo.png`
3. Or tell me the exact file path/name and I'll update the code to use it
