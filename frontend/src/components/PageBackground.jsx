const VARIANTS = {
  // Admin dashboard — soft purple ambient
  purple:
    'radial-gradient(circle at top left, rgba(109,93,246,0.10), transparent 45%), ' +
    'radial-gradient(circle at bottom right, rgba(79,70,229,0.08), transparent 50%), ' +
    'linear-gradient(160deg, #fbfaff 0%, #fafbfc 45%, #f8f7ff 100%)',
  // Users / Stores admin tables — neutral, barely-there warmth
  neutral:
    'radial-gradient(circle at top right, rgba(109,93,246,0.05), transparent 40%), ' +
    'linear-gradient(180deg, #fbfbfd 0%, #fafbfc 100%)',
  // Store owner dashboard — warm orange + lavender
  warm:
    'radial-gradient(circle at top left, rgba(249,115,22,0.12), transparent 45%), ' +
    'radial-gradient(circle at top right, rgba(109,93,246,0.12), transparent 45%), ' +
    'linear-gradient(135deg, #fff7f3 0%, #fffdfc 40%, #f8f7ff 70%, #f4f3ff 100%)',
  // Shopper stores page — orange + purple glow
  orangePurple:
    'radial-gradient(circle at top left, rgba(249,115,22,0.09), transparent 45%), ' +
    'radial-gradient(circle at bottom right, rgba(109,93,246,0.10), transparent 45%), ' +
    'linear-gradient(160deg, #fffaf7 0%, #fafbfc 50%, #faf9ff 100%)',
  // Profile / settings-adjacent pages — quiet lavender
  lavender:
    'radial-gradient(circle at top right, rgba(109,93,246,0.08), transparent 45%), ' +
    'linear-gradient(160deg, #fafaff 0%, #fafbfc 100%)',
};

export default function PageBackground({ variant = 'neutral' }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: VARIANTS[variant] || VARIANTS.neutral }}
    />
  );
}
