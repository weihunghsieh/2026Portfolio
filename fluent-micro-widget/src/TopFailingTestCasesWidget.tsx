import {
  Card,
  CardHeader,
  makeStyles,
  mergeClasses,
  ProgressBar,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  CheckmarkCircleFilled,
  CheckmarkCircleRegular,
  DismissCircleFilled,
  DismissCircleRegular,
} from "@fluentui/react-icons";
import { Fragment, useEffect, useRef, useState } from "react";

type RunOutcome = "pass" | "fail";

const FINAL_DESIGN_LABEL = "Final design";
const iterationOption = (n: number) => `Iteration ${n}`;
const TEST_HISTORY_COLUMN_LABEL = "Test history";
const TEST_HISTORY_COLUMN_LABEL_OLD_TO_NEW = "Test history (Old -> New)";

function testHistoryColumnLabel(selectedIteration: string): string {
  const t = selectedIteration.trim();
  if (
    t === iterationOption(2) ||
    t === iterationOption(3) ||
    t === iterationOption(4) ||
    t === iterationOption(5) ||
    t === FINAL_DESIGN_LABEL
  ) {
    return TEST_HISTORY_COLUMN_LABEL_OLD_TO_NEW;
  }
  return TEST_HISTORY_COLUMN_LABEL;
}

/** Widget-specific pass/fail accent colors */
const HISTORY_FAIL = "#A80000";
const HISTORY_PASS = "#0F700F";

/** Failed/total Fluent ProgressBar: tune this one value — see root slot note in Fluent useProgressBarBase (root shorthand is filtered). */
const FAILED_TOTAL_BAR_HEIGHT_PX = 6;
const failedTotalBarBorderRadius = Math.min(2, Math.floor(FAILED_TOTAL_BAR_HEIGHT_PX / 4));

const historyIconBase = {
  width: 24,
  height: 24,
  fontSize: 24,
  lineHeight: 1,
  display: "inline-flex" as const,
};

const tableTextColor = "#242424";

/** Row dividers: fixed light gray so this card stays light on a dark-themed page (Fluent rows use `colorNeutralStroke2`). ~15% darker than #E5E5E5 (229×0.85 → #C3C3C3). */
const TABLE_DIVIDER_COLOR = "#C3C3C3";
/** ~15% darker than TABLE_DIVIDER_COLOR (195×0.85 → #A6A6A6): Iteration 2 dot, Iteration 3 line. */
const HISTORY_UNDERMARK_COLOR = "#A6A6A6";
/** ~15% darker than HISTORY_UNDERMARK_COLOR (166×0.85 → #8D8D8D): Iteration 4 ring outline only. */
const HISTORY_RING_COLOR = "#8D8D8D";
/** Fluent brand accent — Iteration 5 spark lines (unread / new item). */
const HISTORY_SPARK_COLOR = "#0078D4";
const HISTORY_SPARK_STROKE_PX = 1.5;
const HISTORY_SPARK_LINE_LENGTH_PX = 3;
/** Positive inset from 24×24 wrapper corner → ray origin ~2px outside Fluent circle glyph edge. */
const HISTORY_SPARK_ORIGIN_INSET_PX = 4;
/** Per-line offsets from shared origin (SVG +x right, +y down). “Up” = negative y. */
const HISTORY_SPARK_LINE_0_OFFSET_X_PX = 4;
const HISTORY_SPARK_LINE_45_OFFSET_X_PX = 3;
const HISTORY_SPARK_LINE_45_OFFSET_Y_PX = -3;
const HISTORY_SPARK_LINE_90_OFFSET_Y_PX = -4;

const useTableDividerStyles = makeStyles({
  root: {
    [`& .fui-TableRow`]: {
      borderBottom: `${tokens.strokeWidthThin} solid ${TABLE_DIVIDER_COLOR} !important` as never,
    },
  },
});

/** Force Fluent Card surface — filled appearance uses theme tokens; dark theme overrides neutral surface. */
const CARD_SURFACE = "#F3F3F3";

const useTopFailingCardSurfaceStyles = makeStyles({
  root: {
    // Same specificity as Card filled `.fxugw4r{ background-color: var(--colorNeutralBackground1) }`; win with !important.
    backgroundColor: `${CARD_SURFACE} !important` as never,
    "&::before": {
      backgroundColor: `${CARD_SURFACE} !important` as never,
    },
  },
});

/** Light-only row hover for this embedded card; ignores outer webDarkTheme so rows stay visibly light on #F3F3F3. */
const ROW_HOVER_BACKGROUND = "#EAEAEA";
const useBodyTableRowStyles = makeStyles({
  row: {
    "&:hover": {
      // Override theme-driven TableRow hover (can be dark) with fixed light palette.
      backgroundColor: `${ROW_HOVER_BACKGROUND} !important` as never,
    },
    "&:hover .fui-TableCell": {
      backgroundColor: `${ROW_HOVER_BACKGROUND} !important` as never,
    },
  },
});

/** Applied during one-time scroll sweep; mirrors `:hover` without blocking real hover. */
export const HISTORY_ICON_SWEEP_HOVER_CLASS = "historyIcon--sweepHover";

/** Scroll-triggered history icon sweep: step interval and visibility threshold. */
const HISTORY_SWEEP_ICON_COUNT = 10;
const HISTORY_SWEEP_ROW_COUNT = 3;
const HISTORY_SWEEP_INTERSECTION_THRESHOLD = 0.4;

type SweepActive = { rowIndex: number; iconIndex: number };
/** Dissolve (opacity / filter) duration for sweep-only hover mimic. */
const HISTORY_SWEEP_DISSOLVE_MS = 250;
/**
 * Interval between sweep steps. 150ms (was 100ms) so each icon’s ~250ms dissolve
 * overlaps the next step slightly — readable crossfade without stalling the sequence.
 */
const HISTORY_SWEEP_STEP_MS = 150;

/** Solid icons (incl. Final design last): brighten glyph on hover. */
const useHistoryIconBrightenHoverStyles = makeStyles({
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    lineHeight: 1,
    cursor: "default",
    "& svg": {
      transition: `filter ${HISTORY_SWEEP_DISSOLVE_MS}ms ease`,
    },
    "&:hover svg": {
      filter: "brightness(1.3)",
      transition: "none",
    },
    [`&.${HISTORY_ICON_SWEEP_HOVER_CLASS} svg`]: {
      filter: "brightness(1.3)",
    },
  },
});

/**
 * Final design outline icons (indices 0–8): circular fill behind icon on hover.
 * Fill = icon color lightened 80% → 20% icon + 80% white (srgb mix).
 * Computed: pass #0F700F → #CFE2CF; fail #A80000 → #EECCCC.
 */
const HISTORY_PASS_HOVER_FILL = `color-mix(in srgb, ${HISTORY_PASS} 20%, white 80%)`;
const HISTORY_FAIL_HOVER_FILL = `color-mix(in srgb, ${HISTORY_FAIL} 20%, white 80%)`;

const historyIconOutlineBeforeBase = {
  content: '""',
  position: "absolute" as const,
  inset: "2.5px",
  width: 19,
  height: 19,
  borderRadius: "50%",
  zIndex: 0,
  pointerEvents: "none" as const,
  opacity: 0,
  transition: `opacity ${HISTORY_SWEEP_DISSOLVE_MS}ms ease`,
};

const useHistoryIconOutlineHoverStyles = makeStyles({
  passWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    lineHeight: 1,
    cursor: "default",
    position: "relative",
    isolation: "isolate",
    "& svg": {
      position: "relative",
      zIndex: 1,
      transition: "none",
    },
    "&::before": {
      ...historyIconOutlineBeforeBase,
      backgroundColor: HISTORY_PASS_HOVER_FILL,
    },
    "&:hover::before": {
      opacity: 1,
      transition: "none",
    },
    "&:hover svg": {
      transition: "none",
    },
    [`&.${HISTORY_ICON_SWEEP_HOVER_CLASS}::before`]: {
      opacity: 1,
    },
  },
  failWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    lineHeight: 1,
    cursor: "default",
    position: "relative",
    isolation: "isolate",
    "& svg": {
      position: "relative",
      zIndex: 1,
      transition: "none",
    },
    "&::before": {
      ...historyIconOutlineBeforeBase,
      backgroundColor: HISTORY_FAIL_HOVER_FILL,
    },
    "&:hover::before": {
      opacity: 1,
      transition: "none",
    },
    "&:hover svg": {
      transition: "none",
    },
    [`&.${HISTORY_ICON_SWEEP_HOVER_CLASS}::before`]: {
      opacity: 1,
    },
  },
});

const HISTORY_DOT_OFFSET_PX = 1;
const HISTORY_DOT_SIZE_PX = 4;
/** Iteration 3: horizontal bar under last icon (12×2px, rounded caps). */
const HISTORY_LINE_WIDTH_PX = 12;
const HISTORY_LINE_RENDER_HEIGHT_PX = 2;

/** Iteration 5: three short rays from top-right of last icon (0°, 45°, 90°). */
function HistorySparkMark() {
  const len = HISTORY_SPARK_LINE_LENGTH_PX;
  const diag = len * Math.SQRT1_2;
  const pad = 2;
  const vbW = len + pad;
  const vbH = len + pad;
  const ox0 = HISTORY_SPARK_LINE_0_OFFSET_X_PX;
  const ox45 = HISTORY_SPARK_LINE_45_OFFSET_X_PX;
  const oy45 = HISTORY_SPARK_LINE_45_OFFSET_Y_PX;
  const oy90 = HISTORY_SPARK_LINE_90_OFFSET_Y_PX;
  const sparkStroke = {
    stroke: HISTORY_SPARK_COLOR,
    strokeWidth: HISTORY_SPARK_STROKE_PX,
    strokeLinecap: "round" as const,
  };
  return (
    <svg
      aria-hidden
      width={vbW}
      height={vbH}
      viewBox={`${-vbW} 0 ${vbW} ${vbH}`}
      style={{
        position: "absolute",
        top: HISTORY_SPARK_ORIGIN_INSET_PX,
        right: HISTORY_SPARK_ORIGIN_INSET_PX,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <line x1={ox0} y1={0} x2={ox0 + len} y2={0} {...sparkStroke} />
      <line x1={ox45} y1={oy45} x2={ox45 + diag} y2={oy45 - diag} {...sparkStroke} />
      <line x1={0} y1={oy90} x2={0} y2={oy90 - len} {...sparkStroke} />
    </svg>
  );
}

function TestHistory({
  sequence,
  selectedIteration,
  rowIndex,
  sweepActive,
}: {
  sequence: RunOutcome[];
  selectedIteration: string;
  rowIndex: number;
  sweepActive: SweepActive | null;
}) {
  const historyIconBrightenHoverClasses = useHistoryIconBrightenHoverStyles();
  const historyIconOutlineHoverClasses = useHistoryIconOutlineHoverStyles();
  const t = selectedIteration.trim();
  const showIteration2Dot = t === iterationOption(2);
  const showIteration3Line = t === iterationOption(3);
  const showIteration4Ring = t === iterationOption(4);
  const showIteration5Spark = t === iterationOption(5);
  const showFinalDesignOutline = t === FINAL_DESIGN_LABEL;
  const showLastIconMarker = showIteration2Dot || showIteration3Line;
  return (
    <div
      role="img"
      aria-label="Test run history, oldest to newest"
      style={{
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {sequence.map((outcome, index) => {
        const color = outcome === "pass" ? HISTORY_PASS : HISTORY_FAIL;
        const iconStyle = { ...historyIconBase, color };
        const isLast = index === sequence.length - 1;
        const markerBase = {
          position: "absolute" as const,
          left: "50%",
          top: "100%",
          marginTop: HISTORY_DOT_OFFSET_PX,
          transform: "translateX(-50%)",
          backgroundColor: HISTORY_UNDERMARK_COLOR,
          pointerEvents: "none" as const,
        };
        const wrapperStyle =
          (showLastIconMarker || showIteration5Spark) && isLast
            ? { position: "relative" as const, overflow: "visible" as const }
            : undefined;
        // Fluent circle SVGs keep transparent padding inside the 24×24 viewBox; negative outline offset pulls the ring inward. -1px ≈ 2px visual gap between ring and glyph (-2px ≈ 1px; -3px was flush).
        const iteration4RingPaint =
          showIteration4Ring && isLast
            ? {
                borderRadius: "50%" as const,
                outline: `2px solid ${HISTORY_RING_COLOR}`,
                outlineOffset: "-1px",
              }
            : undefined;
        const iconWrapperStyle =
          wrapperStyle || iteration4RingPaint
            ? { ...wrapperStyle, ...iteration4RingPaint }
            : undefined;
        const undermark =
          showIteration2Dot && isLast ? (
            <span
              aria-hidden
              style={{
                ...markerBase,
                width: HISTORY_DOT_SIZE_PX,
                height: HISTORY_DOT_SIZE_PX,
                borderRadius: "50%",
              }}
            />
          ) : showIteration3Line && isLast ? (
            <span
              aria-hidden
              style={{
                ...markerBase,
                width: HISTORY_LINE_WIDTH_PX,
                height: HISTORY_LINE_RENDER_HEIGHT_PX,
                minHeight: HISTORY_LINE_RENDER_HEIGHT_PX,
                boxSizing: "border-box",
                borderRadius: 1,
                display: "block",
                flexShrink: 0,
                overflow: "visible",
              }}
            />
          ) : null;
        const spark = showIteration5Spark && isLast ? <HistorySparkMark /> : null;
        const useOutline = showFinalDesignOutline && !isLast;
        const PassIcon = useOutline ? CheckmarkCircleRegular : CheckmarkCircleFilled;
        const FailIcon = useOutline ? DismissCircleRegular : DismissCircleFilled;
        const iconHoverWrapperClass = mergeClasses(
          useOutline
            ? outcome === "pass"
              ? historyIconOutlineHoverClasses.passWrapper
              : historyIconOutlineHoverClasses.failWrapper
            : historyIconBrightenHoverClasses.wrapper,
          sweepActive?.rowIndex === rowIndex &&
            sweepActive.iconIndex === index &&
            HISTORY_ICON_SWEEP_HOVER_CLASS,
        );
        if (outcome === "pass") {
          return (
            <Fragment key={index}>
              <span className={iconHoverWrapperClass} style={iconWrapperStyle}>
                <PassIcon style={iconStyle} aria-hidden />
                {spark}
                {undermark}
              </span>
            </Fragment>
          );
        }
        return (
          <Fragment key={index}>
            <span className={iconHoverWrapperClass} style={iconWrapperStyle}>
              <FailIcon style={iconStyle} aria-hidden />
              {spark}
              {undermark}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

const rows: {
  name: string;
  browser: string;
  os: string;
  failedPct: number;
  failed: number;
  total: number;
  history: RunOutcome[];
}[] = [
  {
    name: "persistence-test",
    browser: "Chromium",
    os: "Linux",
    failedPct: 100,
    failed: 27,
    total: 27,
    history: [
      "fail",
      "fail",
      "fail",
      "fail",
      "fail",
      "fail",
      "fail",
      "fail",
      "fail",
      "fail",
    ],
  },
  {
    name: "persistence-test",
    browser: "Firefox",
    os: "Linux",
    failedPct: 60,
    failed: 16,
    total: 27,
    history: ["fail", "fail", "pass", "fail", "fail", "pass", "fail", "fail", "fail", "fail"],
  },
  {
    name: "persistence-test",
    browser: "WebKit",
    os: "MacOS",
    failedPct: 30,
    failed: 9,
    total: 27,
    history: ["fail", "fail", "pass", "fail", "fail", "fail", "fail", "fail", "fail", "fail"],
  },
];

export function TopFailingTestCasesWidget() {
  const widgetRootRef = useRef<HTMLDivElement>(null);
  const historyTableRef = useRef<HTMLDivElement>(null);
  const hasPlayedSweepRef = useRef(false);
  const sweepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sweepActive, setSweepActive] = useState<SweepActive | null>(null);
  const [selectedIteration, setSelectedIteration] = useState(FINAL_DESIGN_LABEL);
  const surfaceClasses = useTopFailingCardSurfaceStyles();
  const bodyRowClasses = useBodyTableRowStyles();
  const tableDividerClasses = useTableDividerStyles();

  useEffect(() => {
    const el = widgetRootRef.current;
    if (!el) return;
    const stack = el.closest(".case-fluent-widget-stack");
    if (!stack) return;
    const read = () => (stack.getAttribute("data-selected-iteration") ?? FINAL_DESIGN_LABEL).trim();
    setSelectedIteration(read());
    const obs = new MutationObserver(() => {
      setSelectedIteration(read());
    });
    obs.observe(stack, { attributes: true, attributeFilter: ["data-selected-iteration"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = historyTableRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const clearSweepInterval = () => {
      if (sweepIntervalRef.current !== null) {
        clearInterval(sweepIntervalRef.current);
        sweepIntervalRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasPlayedSweepRef.current) return;
        hasPlayedSweepRef.current = true;
        observer.disconnect();

        const totalSweepSteps =
          HISTORY_SWEEP_ROW_COUNT * HISTORY_SWEEP_ICON_COUNT;
        let step = 0;
        setSweepActive({ rowIndex: 0, iconIndex: 0 });
        sweepIntervalRef.current = setInterval(() => {
          step += 1;
          if (step < totalSweepSteps) {
            setSweepActive({
              rowIndex: Math.floor(step / HISTORY_SWEEP_ICON_COUNT),
              iconIndex: step % HISTORY_SWEEP_ICON_COUNT,
            });
          } else {
            clearSweepInterval();
            setSweepActive(null);
          }
        }, HISTORY_SWEEP_STEP_MS);
      },
      { threshold: HISTORY_SWEEP_INTERSECTION_THRESHOLD },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearSweepInterval();
    };
  }, []);

  const t = selectedIteration.trim();
  const historyShowsLastIconUndermark =
    t === iterationOption(2) ||
    t === iterationOption(3) ||
    t === iterationOption(4) ||
    t === iterationOption(5);

  return (
    <div ref={widgetRootRef} style={{ width: "100%", maxWidth: "100%" }}>
    <Card
      className={mergeClasses(surfaceClasses.root)}
      style={{
        maxWidth: "100%",
        width: "100%",
        color: "#242424",
        backgroundColor: CARD_SURFACE,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        // Default Card (size medium) padding = 12px via --fui-Card--size; double → 24px (spacing XXL).
        padding: tokens.spacingHorizontalXXL,
      }}
    >
      <CardHeader
        header={
          <Text weight="semibold" size={400}>
            Top failing test cases
          </Text>
        }
      />
      <div ref={historyTableRef} style={{ overflowX: "auto", maxWidth: "100%" }}>
        <Table
          className={mergeClasses(tableDividerClasses.root)}
          style={{
            tableLayout: "fixed",
            width: "100%",
            overflow: historyShowsLastIconUndermark ? "visible" : undefined,
          }}
        >
        <TableHeader>
          <TableRow>
            <TableHeaderCell style={{ width: "18%" }}>
              <Text weight="semibold" style={{ color: tableTextColor }}>
                Name
              </Text>
            </TableHeaderCell>
            <TableHeaderCell style={{ width: "11%" }}>
              <Text weight="semibold" style={{ color: tableTextColor }}>
                Browser
              </Text>
            </TableHeaderCell>
            <TableHeaderCell style={{ width: "10%" }}>
              <Text weight="semibold" style={{ color: tableTextColor }}>
                OS
              </Text>
            </TableHeaderCell>
            <TableHeaderCell style={{ width: "9%" }}>
              <Text weight="semibold" style={{ color: tableTextColor }}>
                Failed %
              </Text>
            </TableHeaderCell>
            <TableHeaderCell style={{ width: "22%" }}>
              <Text weight="semibold" style={{ color: tableTextColor }}>
                Failed / total test runs
              </Text>
            </TableHeaderCell>
            <TableHeaderCell style={{ width: "30%" }}>
              <Text weight="semibold" style={{ color: tableTextColor }}>
                {testHistoryColumnLabel(selectedIteration)}
              </Text>
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, index) => (
            <TableRow key={index} className={bodyRowClasses.row}>
              <TableCell style={{ color: tableTextColor }}>
                <Text truncate wrap={false} title={r.name} style={{ color: tableTextColor }}>
                  {r.name}
                </Text>
              </TableCell>
              <TableCell style={{ color: tableTextColor }}>{r.browser}</TableCell>
              <TableCell style={{ color: tableTextColor }}>{r.os}</TableCell>
              <TableCell style={{ color: tableTextColor }}>{r.failedPct}%</TableCell>
              <TableCell style={{ color: tableTextColor, verticalAlign: "middle" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: tokens.spacingHorizontalS,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <div style={{ flex: "0 0 auto", width: 100, maxWidth: "40%", minWidth: 0 }}>
                    <ProgressBar
                      value={r.failed / r.total}
                      max={1}
                      thickness="large"
                      color="error"
                      style={{
                        backgroundColor: TABLE_DIVIDER_COLOR,
                        height: FAILED_TOTAL_BAR_HEIGHT_PX,
                        borderRadius: failedTotalBarBorderRadius,
                        alignSelf: "stretch",
                      }}
                      bar={{
                        style: {
                          height: FAILED_TOTAL_BAR_HEIGHT_PX,
                          borderRadius: failedTotalBarBorderRadius,
                          backgroundColor: HISTORY_FAIL,
                        },
                      }}
                    />
                  </div>
                  <Text
                    style={{
                      color: tableTextColor,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.failed} / {r.total}
                  </Text>
                </div>
              </TableCell>
              <TableCell style={{ overflow: "visible" }}>
                <TestHistory
                  sequence={r.history}
                  selectedIteration={selectedIteration}
                  rowIndex={index}
                  sweepActive={sweepActive}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Card>
    </div>
  );
}
