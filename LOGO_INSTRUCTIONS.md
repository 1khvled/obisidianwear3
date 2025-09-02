# How to Add Your Logo

## Step 1: Add Your Logo File
1. Place your logo file in the `public` folder
2. Supported formats: PNG, JPG, JPEG, SVG
3. Recommended size: 48x48 pixels or larger
4. Name your file something like `logo.png` or `obsidian-logo.svg`

## Step 2: Update the Logo Component
1. Open `src/components/Logo.tsx`
2. Uncomment the Image component lines
3. Replace `/your-logo.png` with your actual logo path
4. Comment out or remove the placeholder div

## Example:
```tsx
// Replace this placeholder:
<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
  <span className="text-black font-bold text-2xl">O</span>
</div>

// With this (uncomment and update path):
<Image
  src="/your-logo.png"  // Change this to your logo file name
  alt="OBSIDIAN WEAR"
  width={48}
  height={48}
  className="w-12 h-12"
/>
```

## Step 3: Test
1. Run `npm run dev`
2. Check that your logo appears in the header
3. Make sure it looks good on both desktop and mobile

Your logo will automatically appear in:
- Header navigation
- Footer
- All pages throughout the site
