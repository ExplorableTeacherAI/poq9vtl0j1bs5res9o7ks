import { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp } from "@/lib/motion";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../../variables";

/* ------------------------------------------------------------------ */
/* Figure — "Land it on the target": swing the launch arrow            */
/* ------------------------------------------------------------------ */

const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 320;
const PAD = 24;

const GROUND_Y = 270;
const ORIGIN_X = 60;
const PIXELS_PER_METRE = 11.5;
const LAUNCH_SPEED = 20;
const GRAVITY = 10;
const TARGET_METRES = 30;
const HIT_TOLERANCE = 1.2;
const ARROW_LENGTH = 74;

const KICK_COLOR = "#62D0AD";
const TARGET_COLOR = "#F7B23B";
const HIT_COLOR = "#22c55e";
const INK = "#334155";
const STRUCTURE = "#64748B";
const DIM = 0.38;

const rangeFor = (angle: number) =>
    (LAUNCH_SPEED * LAUNCH_SPEED * Math.sin((2 * angle * Math.PI) / 180)) / GRAVITY;

const pathFor = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    const duration = (2 * LAUNCH_SPEED * Math.sin(radians)) / GRAVITY;
    return Array.from({ length: 49 }, (_, index) => {
        const time = (index / 48) * duration;
        const x = ORIGIN_X + LAUNCH_SPEED * Math.cos(radians) * time * PIXELS_PER_METRE;
        const y = GROUND_Y - (LAUNCH_SPEED * Math.sin(radians) * time - 0.5 * GRAVITY * time * time) * PIXELS_PER_METRE;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
};

const formatMetres = (value: number) => `${value.toFixed(1)} m`;
const formatAngle = (value: number) => `${value.toFixed(1)}°`;

function TargetPracticeDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("rangeAngle", 20);
    const highlight = useVar<string>("rangeHighlight", "");
    const [dragging, setDragging] = useState(false);
    const [hitAngles, setHitAngles] = useState<number[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);

    const radians = (angle * Math.PI) / 180;
    const landing = rangeFor(angle);
    const landingX = ORIGIN_X + landing * PIXELS_PER_METRE;
    const targetX = ORIGIN_X + TARGET_METRES * PIXELS_PER_METRE;
    const onTarget = Math.abs(landing - TARGET_METRES) <= HIT_TOLERANCE;

    const handleX = ORIGIN_X + ARROW_LENGTH * Math.cos(radians);
    const handleY = GROUND_Y - ARROW_LENGTH * Math.sin(radians);

    const isArcLit = highlight === "arc";
    const isGroundLit = highlight === "ground";
    const dimOthers = (id: string) => (highlight && highlight !== id ? DIM : 1);
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };

    const rememberHit = (value: number) => {
        if (Math.abs(rangeFor(value) - TARGET_METRES) > HIT_TOLERANCE) return;
        setHitAngles((previous) =>
            previous.some((stored) => Math.abs(stored - value) < 4) ? previous : [...previous, value].slice(-2),
        );
    };

    const handleMove = (event: React.PointerEvent) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
        const y = ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
        const next = (Math.atan2(GROUND_Y - y, Math.max(x - ORIGIN_X, 1)) * 180) / Math.PI;
        setVar("rangeExplored", 1);
        setVar("rangeAngle", Math.round(clamp(next, 10, 85) * 2) / 2);
    };

    const ticks = [0, 10, 20, 30, 40];

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="block w-full"
            style={{ touchAction: "none" }}
            onPointerMove={handleMove}
            onPointerUp={() => {
                if (dragging) rememberHit(angle);
                setDragging(false);
            }}
            onPointerLeave={() => setDragging(false)}
        >
            <defs>
                <marker id="range-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={KICK_COLOR} />
                </marker>
                <filter id="range-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* readouts */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <text x={PAD} y={40} fill={KICK_COLOR} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`angle  ${formatAngle(angle)}`}
                </text>
                <text
                    x={VIEWBOX_WIDTH - PAD}
                    y={40}
                    textAnchor="end"
                    fill={onTarget ? HIT_COLOR : INK}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {onTarget ? `on the cone at ${formatMetres(landing)}` : `lands at ${formatMetres(landing)}`}
                </text>
                <text x={VIEWBOX_WIDTH - PAD} y={60} textAnchor="end" fill={TARGET_COLOR} fontSize="12">
                    {`cone at ${formatMetres(TARGET_METRES)}, kick fixed at 20.0 m/s`}
                </text>
                {hitAngles.length === 2 && (
                    <text
                        x={VIEWBOX_WIDTH - PAD}
                        y={80}
                        textAnchor="end"
                        fill={HIT_COLOR}
                        fontSize="12"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {`hits at ${formatAngle(hitAngles[0])} and ${formatAngle(hitAngles[1])}`}
                    </text>
                )}
            </g>

            {/* pitch and distance marks */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <line
                    x1={PAD}
                    y1={GROUND_Y}
                    x2={VIEWBOX_WIDTH - PAD}
                    y2={GROUND_Y}
                    stroke={STRUCTURE}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {ticks.map((tick) => {
                    const x = ORIGIN_X + tick * PIXELS_PER_METRE;
                    return (
                        <g key={tick}>
                            <line x1={x} y1={GROUND_Y} x2={x} y2={GROUND_Y + 6} stroke={STRUCTURE} strokeWidth="1.5" />
                            <text
                                x={x}
                                y={GROUND_Y + 22}
                                textAnchor="middle"
                                fill={STRUCTURE}
                                fontSize="11"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {tick === 0 ? "0" : `${tick} m`}
                            </text>
                        </g>
                    );
                })}
            </g>

            {/* successful attempts stay on the pitch */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                {hitAngles.map((stored) => (
                    <path
                        key={stored}
                        d={pathFor(stored)}
                        fill="none"
                        stroke={HIT_COLOR}
                        strokeWidth="1.8"
                        strokeDasharray="5 6"
                        opacity={0.55}
                    />
                ))}
            </g>

            {/* the target cone */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <polygon
                    points={`${targetX} ${GROUND_Y - 24} ${targetX - 9} ${GROUND_Y} ${targetX + 9} ${GROUND_Y}`}
                    fill={onTarget ? HIT_COLOR : TARGET_COLOR}
                    fillOpacity={onTarget ? 0.45 : 0.28}
                    stroke={onTarget ? HIT_COLOR : TARGET_COLOR}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    style={ease}
                />
            </g>

            {/* the flight */}
            <g opacity={dimOthers("arc")} style={ease}>
                {isArcLit && (
                    <path d={pathFor(angle)} fill="none" stroke={KICK_COLOR} strokeWidth="10" opacity={0.28} strokeLinecap="round" />
                )}
                <path
                    d={pathFor(angle)}
                    fill="none"
                    stroke={KICK_COLOR}
                    strokeWidth={isArcLit ? 4 : 2.5}
                    strokeLinecap="round"
                    style={ease}
                    onPointerEnter={() => setVar("rangeHighlight", "arc")}
                    onPointerLeave={() => setVar("rangeHighlight", "")}
                />
                <circle cx={landingX} cy={GROUND_Y} r={5.5} fill={KICK_COLOR} />
            </g>

            {/* distance covered along the grass */}
            <g opacity={dimOthers("ground")} style={ease}>
                {isGroundLit && (
                    <line
                        x1={ORIGIN_X}
                        y1={GROUND_Y - 6}
                        x2={landingX}
                        y2={GROUND_Y - 6}
                        stroke={KICK_COLOR}
                        strokeWidth="10"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={ORIGIN_X}
                    y1={GROUND_Y - 6}
                    x2={landingX}
                    y2={GROUND_Y - 6}
                    stroke={KICK_COLOR}
                    strokeWidth={isGroundLit ? 4 : 2}
                    strokeLinecap="round"
                    opacity={0.85}
                    style={ease}
                    onPointerEnter={() => setVar("rangeHighlight", "ground")}
                    onPointerLeave={() => setVar("rangeHighlight", "")}
                />
            </g>

            {/* the draggable launch arrow */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <path
                    d={`M ${ORIGIN_X + 34} ${GROUND_Y} A 34 34 0 0 1 ${(ORIGIN_X + 34 * Math.cos(radians)).toFixed(1)} ${(
                        GROUND_Y - 34 * Math.sin(radians)
                    ).toFixed(1)}`}
                    fill="none"
                    stroke={KICK_COLOR}
                    strokeWidth="1.6"
                    opacity={0.8}
                />
                <line
                    x1={ORIGIN_X}
                    y1={GROUND_Y}
                    x2={handleX}
                    y2={handleY}
                    stroke={KICK_COLOR}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    markerEnd="url(#range-arrow)"
                />
                <circle
                    cx={handleX}
                    cy={handleY}
                    r={dragging ? 13 : 11}
                    fill={KICK_COLOR}
                    filter="url(#range-handle-shadow)"
                    style={ease}
                />
                <circle
                    cx={handleX}
                    cy={handleY}
                    r={26}
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging(true);
                    }}
                    onPointerMove={handleMove}
                    onPointerUp={() => {
                        rememberHit(angle);
                        setDragging(false);
                    }}
                    onPointerCancel={() => setDragging(false)}
                />
            </g>
        </svg>
    );
}

function TargetPracticeFigure() {
    const setVar = useSetVar();
    const angle = useVar<number>("rangeAngle", 20);
    const radians = (angle * Math.PI) / 180;
    const handleX = ORIGIN_X + ARROW_LENGTH * Math.cos(radians);
    const handleY = GROUND_Y - ARROW_LENGTH * Math.sin(radians);

    return (
        <Figure
            id="range-target-practice"
            onReset={() => {
                setVar("rangeAngle", 20);
                setVar("rangeHighlight", "");
            }}
            caption="The kick is fixed at 20 m/s, so the angle is the only thing you control. Swing the teal handle around and land the ball on the amber cone, then see whether a second angle can do it too."
        >
            <TargetPracticeDrawing />
            <InteractionHintSequence
                hintKey="range-angle-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Swing the teal handle to change the angle",
                        position: {
                            x: `${((handleX / VIEWBOX_WIDTH) * 100).toFixed(0)}%`,
                            y: `${((handleY / VIEWBOX_HEIGHT) * 100).toFixed(0)}%`,
                        },
                        dragPath: { type: "arc", startAngle: -20, endAngle: -70, radius: 36 },
                        color: KICK_COLOR,
                    },
                ]}
            />
        </Figure>
    );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

export const projectileRangeBlocks: ReactElement[] = [
    <StackLayout key="layout-range-heading" maxWidth="xl">
        <Block id="range-heading" padding="md">
            <EditableH2 id="h2-range-heading" blockId="range-heading">
                How far does it land
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-setup" maxWidth="xl">
        <Block id="range-setup" padding="sm">
            <EditableParagraph id="para-range-setup" blockId="range-setup">
                Nothing pushes the ball forwards once it leaves the boot, so range is just that steady forward speed
                multiplied by the time in the air. Swing the launch arrow around and try to drop this 20 m/s kick onto
                the cone.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-angle-figure" maxWidth="xl">
        <Block id="range-angle-figure" padding="sm" hasVisualization>
            <TargetPracticeFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-insight" maxWidth="xl">
        <Block id="range-insight" padding="sm">
            <EditableParagraph id="para-range-insight" blockId="range-insight">
                A steeper{" "}
                <InlineLinkedHighlight
                    varName="rangeHighlight"
                    highlightId="arc"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('rangeHighlight'))}
                    color={KICK_COLOR}
                    bgColor="rgba(98, 208, 173, 0.18)"
                >
                    arc
                </InlineLinkedHighlight>{" "}
                buys hang time but spends forward speed, so two different angles cover the same{" "}
                <InlineLinkedHighlight
                    varName="rangeHighlight"
                    highlightId="ground"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('rangeHighlight'))}
                    color={KICK_COLOR}
                    bgColor="rgba(98, 208, 173, 0.18)"
                    showHint={false}
                >
                    stretch of grass
                </InlineLinkedHighlight>
                . Only 45 degrees, splitting the kick evenly, reaches the furthest of all.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-question-twin" maxWidth="xl">
        <Block id="range-question-twin" padding="sm">
            <EditableParagraph id="para-range-question-twin" blockId="range-question-twin">
                <RevealOnInteraction
                    varName="rangeExplored"
                    placeholder="Take a few kicks at the cone above to unlock the questions."
                >
                    A corner kick at 25 degrees drops onto a team mate's head. Keeping the same power, the only other
                    angle that finds him is{" "}
                    <InlineFeedback
                        varName="answerRangeTwinAngle"
                        correctValue={["65", "65 degrees", "65°"]}
                        position="terminal"
                        successMessage="— yes, angle pairs that add up to 90 degrees always land in the same spot"
                        failureMessage="— not that one."
                        hint="Look at the pair of angles that hit the cone in the figure and see what they add up to"
                        reviewBlockId="range-angle-figure"
                        reviewLabel="Back to the pitch"
                    >
                        <InlineClozeInput
                            varName="answerRangeTwinAngle"
                            correctAnswer={["65", "65 degrees", "65°"]}
                            {...clozePropsFromDefinition(getVariableInfo('answerRangeTwinAngle'))}
                        />
                    </InlineFeedback>{" "}
                    degrees.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-question-steeper" maxWidth="xl">
        <Block id="range-question-steeper" padding="sm">
            <EditableParagraph id="para-range-question-steeper" blockId="range-question-steeper">
                <RevealOnInteraction varName="rangeExplored">
                    A player who lifts a 45 degree kick up to 70 degrees, with no extra power, finds that the ball{" "}
                    <InlineFeedback
                        varName="answerRangeSteeper"
                        correctValue="lands shorter"
                        position="terminal"
                        successMessage="— exactly, past 45 degrees the lost forward speed costs more than the extra hang time is worth"
                        failureMessage="— worth checking on the pitch above."
                        hint="Compare the landing distance at 45 degrees with the distance at 70"
                        reviewBlockId="range-insight"
                        reviewLabel="Revisit the trade off"
                        visualizationHint={{
                            blockId: "range-angle-figure",
                            hintKey: "feedback-range-steeper",
                            steps: [
                                {
                                    gesture: "drag-circular",
                                    label: "Swing the handle to 45 degrees and note where it lands",
                                    position: { x: "18%", y: "72%" },
                                    dragPath: { type: "arc", startAngle: -20, endAngle: -45, radius: 34 },
                                    completionVar: "rangeAngle",
                                    completionValue: 45,
                                    completionTolerance: 2,
                                },
                                {
                                    gesture: "drag-circular",
                                    label: "Now keep going up to 70 degrees, is it further or shorter?",
                                    position: { x: "14%", y: "62%" },
                                    dragPath: { type: "arc", startAngle: -45, endAngle: -75, radius: 34 },
                                    completionVar: "rangeAngle",
                                    completionValue: 70,
                                    completionTolerance: 2.5,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { rangeAngle: 20 },
                        }}
                    >
                        <InlineClozeChoice
                            varName="answerRangeSteeper"
                            correctAnswer="lands shorter"
                            options={["lands further away", "lands in the same place", "lands shorter"]}
                            {...choicePropsFromDefinition(getVariableInfo('answerRangeSteeper'))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
