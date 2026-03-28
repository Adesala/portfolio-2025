import { motion, useTransform } from "framer-motion"
import Link from "next/link";

export const ScrollTimeline = ({
  scrollProgress,
  sections,
  side = "left"
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        transform: "translateY(-50%)",
        right: "40px",
        height: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pointerEvents: "none",
        zIndex: 100
      }}
    >
      {sections.map((section, i) => {
const isLast = i === sections.length - 1;
const isFirst = i === 0;

const localProgress = useTransform(
  scrollProgress,
  [section.start, section.end],
  [0, 1],
  { clamp: true }
);

const progress = useTransform(
  localProgress,
  [0, 0.5, 1],
  [1, 1, 0],
);

// calcule toujours l'opacité via useTransform
let outputRange;
if (isFirst) {
  outputRange = [1, 0.3, 0.3];              // premier reste à 1
} else if (isLast) {
  outputRange = [0.3, 0.3, 1];          // dernier s'anime vers 1        // descend dès qu’on quitte le header
} else {
  outputRange = [0.3, 1, 0.3];          // les autres
}

const numberOpacity = useTransform(localProgress, [0, 0.5, 1], outputRange);
console.log('section', section )

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              flex: 1
            }}
          >
            {/* Label */}
            <Link href={`#${section.link}`} style={{ textDecoration: 'none', cursor: 'pointer', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                opacity: numberOpacity,
                marginTop: "8px",
              }}
            >
              {section.link.split('#')[1] ?? String(i + 1).padStart(2, "0")}
            </motion.span>
            </Link>

            {/* Ligne sauf si dernière section */}
            {!isLast && (
              <svg
                width="6"
                height="100%"
                viewBox="0 0 6 100"
                preserveAspectRatio="none"
                style={{ flex: 1 }}
              >
         

                {/* Track */}
                <line
                  x1="3"
                  y1="0"
                  x2="3"
                  y2="100"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Liquid Fill */}
                <motion.line
                  x1="3"
                  y1="0"
                  x2="3"
                  y2="100"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  style={{
                    strokeDashoffset: progress
                  }}
                />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}