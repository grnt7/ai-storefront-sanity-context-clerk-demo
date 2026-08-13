import { cn } from "@/lib/utils";

/**
 * Topographic contour lines — the Trailhead signature motif.
 * Decorative only; hidden from assistive tech.
 */
export function TopoLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
      viewBox="0 0 1200 400"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M-20 320 C 150 260, 280 350, 430 300 S 700 190, 860 250 S 1100 340, 1230 280" />
        <path d="M-20 280 C 160 220, 300 310, 450 260 S 710 150, 870 210 S 1110 300, 1230 240" />
        <path d="M-20 240 C 170 180, 320 270, 470 220 S 720 110, 880 170 S 1120 260, 1230 200" />
        <path d="M-20 200 C 180 140, 340 230, 490 180 S 730 70, 890 130 S 1130 220, 1230 160" />
        <path d="M-20 160 C 190 100, 360 190, 510 140 S 740 30, 900 90 S 1140 180, 1230 120" />
        <path d="M-20 120 C 200 60, 380 150, 530 100 S 750 -10, 910 50 S 1150 140, 1230 80" />
      </g>
    </svg>
  );
}
