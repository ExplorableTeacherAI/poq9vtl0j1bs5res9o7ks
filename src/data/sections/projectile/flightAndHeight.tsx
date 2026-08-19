import { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineLinkedHighlight,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp } from "@/lib/motion";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../../variables";

/* ------------------------------------------------------------------ */
/* Figure — "Scrub the climb": drag the ball, watch the speed drain    */
/* ------------------------------------------------------------------ */

const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 320;
const PAD = 24;

const GROUND_Y = 250;
const TRACK_X = 100;
const PIXELS_PER_METRE = 23;
const PIXELS_PER_SPEED = 5;
const GRAVITY = 10;

const CHART_X0 = 230;
const CHART_X1 = 510;

const SPEED_COLOR = "#62D0AD";
const GRAVITY_COLOR = "#F7B23B";
const INK = "#334155";
const STRUCTURE = "#64748B";
const DIM = 0.38;

const peakHeight = (launchSpeed: number) => (launchSpeed * launchSpeed) / (2 * GRAVITY);
const totalTime = (launchSpeed: number) => (2 * launchSpeed) / GRAVITY;
const heightAtTime = (launchSpeed: number, time: number) => launchSpeed * time - 0.5 * GRAVITY * time * time;

const formatSeconds = (value: number) => `${value.toFixed(2)} s`;
const formatMetres = (value: number) => `${value.toFixed(2)} m`;
const formatSpeed = (value: number) => `${value.toFixed(1)} m/s`;

function ClimbDrawing() {
    const setVar = useSetVar();
    const launchSpeed = useVar<number>("flightUpSpeed", 10);
    const time = useVar<number>("flightTime", 0);
    const highlight = useVar<string>("flightHighlight", "");
    const [dragging, setDragging] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const pastTopRef = useRef(false);
    const lastYRef = useRef(0);

    const flightDuration = totalTime(launchSpeed);
    const maxHeight = peakHeight(launchSpeed);
    const clampedTime = clamp(time, 0, flightDuration);
    const height = Math.max(0, heightAtTime(launchSpeed, clampedTime));
    const velocity = launchSpeed - GRAVITY * clampedTime;

    const ballY = GROUND_Y - height * PIXELS_PER_METRE;
    const chartX = CHART_X0 + (clampedTime / flightDuration) * (CHART_X1 - CHART_X0);

    const isSpeedLit = highlight === "velocity";
    const isGravityLit = highlight === "gravity";
    const dimOthers = (id: string) => (highlight && highlight !== id ? DIM : 1);
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };

    const timeForHeight = (target: number, descending: boolean) => {
        const inside = Math.max(0, launchSpeed * launchSpeed - 2 * GRAVITY * target);
        const root = Math.sqrt(inside);
        return (descending ? launchSpeed + root : launchSpeed - root) / GRAVITY;
    };

    const handleMove = (event: React.PointerEvent) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const y = ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
        const target = clamp((GROUND_Y - y) / PIXELS_PER_METRE, 0, maxHeight);
        const movingDown = y > lastYRef.current;
        lastYRef.current = y;
        if (target >= maxHeight - 0.06 && movingDown) pastTopRef.current = true;
        if (target <= 0.06 && !movingDown) pastTopRef.current = false;
        setVar("flightExplored", 1);
        setVar("flightTime", Math.round(timeForHeight(target, pastTopRef.current) * 100) / 100);
    };

    const samples = 60;
    const fullPath = Array.from({ length: samples + 1 }, (_, index) => {
        const t = (index / samples) * flightDuration;
        const x = CHART_X0 + (t / flightDuration) * (CHART_X1 - CHART_X0);
        const y = GROUND_Y - heightAtTime(launchSpeed, t) * PIXELS_PER_METRE;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

    const tracedPath = Array.from({ length: samples + 1 }, (_, index) => {
        const t = (index / samples) * clampedTime;
        const x = CHART_X0 + (t / flightDuration) * (CHART_X1 - CHART_X0);
        const y = GROUND_Y - heightAtTime(launchSpeed, t) * PIXELS_PER_METRE;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

    const ticks: number[] = [];
    for (let t = 0; t <= flightDuration + 1e-6; t += 0.5) ticks.push(Number(t.toFixed(1)));

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="block w-full"
            style={{ touchAction: "none" }}
            onPointerMove={handleMove}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
        >
            <defs>
                <marker id="climb-arrow-speed" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={SPEED_COLOR} />
                </marker>
                <marker id="climb-arrow-gravity" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={GRAVITY_COLOR} />
                </marker>
                <filter id="climb-ball-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* readouts */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <text x={PAD} y={38} fill={INK} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`clock  ${formatSeconds(clampedTime)}`}
                </text>
                <text x={PAD} y={58} fill={SPEED_COLOR} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`upward speed  ${formatSpeed(Math.abs(velocity) < 0.05 ? 0 : velocity)}`}
                </text>
                <text
                    x={VIEWBOX_WIDTH - PAD}
                    y={38}
                    textAnchor="end"
                    fill={INK}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`height  ${formatMetres(height)}`}
                </text>
                <text x={VIEWBOX_WIDTH - PAD} y={58} textAnchor="end" fill={GRAVITY_COLOR} fontSize="12">
                    gravity never lets go
                </text>
            </g>

            {/* ground, track and the height-versus-time chart */}
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
                <line
                    x1={TRACK_X}
                    y1={GROUND_Y}
                    x2={TRACK_X}
                    y2={GROUND_Y - maxHeight * PIXELS_PER_METRE}
                    stroke={STRUCTURE}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    opacity={0.5}
                />
                <line
                    x1={TRACK_X + 14}
                    y1={ballY}
                    x2={chartX}
                    y2={ballY}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                    opacity={0.5}
                />
                <path d={fullPath} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 6" opacity={0.45} />
                <path d={tracedPath} fill="none" stroke={SPEED_COLOR} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={chartX} cy={ballY} r={5} fill={SPEED_COLOR} />
                {ticks.map((tick) => {
                    const x = CHART_X0 + (tick / flightDuration) * (CHART_X1 - CHART_X0);
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
                                {tick.toFixed(1)}
                            </text>
                        </g>
                    );
                })}
                <text x={(CHART_X0 + CHART_X1) / 2} y={GROUND_Y + 42} textAnchor="middle" fill={STRUCTURE} fontSize="12">
                    seconds since launch
                </text>
            </g>

            {/* the pull that never changes */}
            <g opacity={dimOthers("gravity")} style={ease}>
                {isGravityLit && (
                    <line
                        x1={TRACK_X + 26}
                        y1={ballY - 4}
                        x2={TRACK_X + 26}
                        y2={ballY + 44}
                        stroke={GRAVITY_COLOR}
                        strokeWidth="10"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={TRACK_X + 26}
                    y1={ballY - 4}
                    x2={TRACK_X + 26}
                    y2={ballY + 44}
                    stroke={GRAVITY_COLOR}
                    strokeWidth={isGravityLit ? 4.5 : 3}
                    strokeLinecap="round"
                    markerEnd="url(#climb-arrow-gravity)"
                    style={ease}
                    onPointerEnter={() => setVar("flightHighlight", "gravity")}
                    onPointerLeave={() => setVar("flightHighlight", "")}
                />
                <text x={TRACK_X + 36} y={ballY + 28} fill={GRAVITY_COLOR} fontSize="12">
                    gravity
                </text>
            </g>

            {/* the speed that drains away */}
            <g opacity={dimOthers("velocity")} style={ease}>
                {Math.abs(velocity) > 0.3 && (
                    <>
                        {isSpeedLit && (
                            <line
                                x1={TRACK_X}
                                y1={ballY}
                                x2={TRACK_X}
                                y2={ballY - velocity * PIXELS_PER_SPEED}
                                stroke={SPEED_COLOR}
                                strokeWidth="10"
                                opacity={0.28}
                                strokeLinecap="round"
                            />
                        )}
                        <line
                            x1={TRACK_X}
                            y1={ballY}
                            x2={TRACK_X}
                            y2={ballY - velocity * PIXELS_PER_SPEED}
                            stroke={SPEED_COLOR}
                            strokeWidth={isSpeedLit ? 4.5 : 3}
                            strokeLinecap="round"
                            markerEnd="url(#climb-arrow-speed)"
                            style={ease}
                            onPointerEnter={() => setVar("flightHighlight", "velocity")}
                            onPointerLeave={() => setVar("flightHighlight", "")}
                        />
                    </>
                )}
                <circle
                    cx={TRACK_X}
                    cy={ballY}
                    r={dragging ? 13 : 11}
                    fill={SPEED_COLOR}
                    filter="url(#climb-ball-shadow)"
                    style={ease}
                />
                <circle
                    cx={TRACK_X}
                    cy={ballY}
                    r={26}
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        lastYRef.current = ballY;
                        pastTopRef.current = clampedTime > flightDuration / 2;
                        setDragging(true);
                    }}
                    onPointerMove={handleMove}
                    onPointerUp={() => setDragging(false)}
                    onPointerCancel={() => setDragging(false)}
                    onPointerEnter={() => setVar("flightHighlight", "velocity")}
                    onPointerLeave={() => setVar("flightHighlight", "")}
                />
            </g>
        </svg>
    );
}

function ClimbFigure() {
    const setVar = useSetVar();
    const launchSpeed = useVar<number>("flightUpSpeed", 10);
    const time = useVar<number>("flightTime", 0);
    const height = Math.max(0, heightAtTime(launchSpeed, clamp(time, 0, totalTime(launchSpeed))));
    const ballY = GROUND_Y - height * PIXELS_PER_METRE;

    return (
        <Figure
            id="flight-climb-scrub"
            onReset={() => {
                setVar("flightTime", 0);
                setVar("flightUpSpeed", 10);
                setVar("flightHighlight", "");
            }}
            caption="Drag the teal ball up its dashed track and back down again. The teal arrow is the ball's own speed, the amber arrow is the pull of gravity, and the graph on the right records the climb second by second."
        >
            <ClimbDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="flightUpSpeed"
                    label="Upward launch speed"
                    {...numberPropsFromDefinition(getVariableInfo('flightUpSpeed'))}
                    formatValue={(value) => `${value.toFixed(1)} m/s`}
                />
            </div>
            <InteractionHintSequence
                hintKey="flight-climb-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the teal ball up its track",
                        position: {
                            x: `${((TRACK_X / VIEWBOX_WIDTH) * 100).toFixed(0)}%`,
                            y: `${((ballY / VIEWBOX_HEIGHT) * 100).toFixed(0)}%`,
                        },
                        dragPath: { type: "line", startOffset: { x: 0, y: 26 }, endOffset: { x: 0, y: -26 } },
                        color: SPEED_COLOR,
                    },
                ]}
            />
        </Figure>
    );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

export const projectileFlightHeightBlocks: ReactElement[] = [
    <StackLayout key="layout-flight-heading" maxWidth="xl">
        <Block id="flight-heading" padding="md">
            <EditableH2 id="h2-flight-heading" blockId="flight-heading">
                How long, how high
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-setup" maxWidth="xl">
        <Block id="flight-setup" padding="sm">
            <EditableParagraph id="para-flight-setup" blockId="flight-setup">
                Forget sideways for a moment. Gravity strips 10 m/s off a climb every second, so a launch of{" "}
                <InlineScrubbleNumber
                    varName="flightUpSpeed"
                    {...numberPropsFromDefinition(getVariableInfo('flightUpSpeed'))}
                    formatValue={(value: number) => `${value.toFixed(1)}`}
                />
                {" "}m/s upwards is spent fast. Drag the teal ball up its track and watch its speed arrow shrink.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-vertical-figure" maxWidth="xl">
        <Block id="flight-vertical-figure" padding="sm" hasVisualization>
            <ClimbFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-insight" maxWidth="xl">
        <Block id="flight-insight" padding="sm">
            <EditableParagraph id="para-flight-insight" blockId="flight-insight">
                At the top the{" "}
                <InlineLinkedHighlight
                    varName="flightHighlight"
                    highlightId="velocity"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('flightHighlight'))}
                    color={SPEED_COLOR}
                    bgColor="rgba(98, 208, 173, 0.18)"
                >
                    speed arrow
                </InlineLinkedHighlight>{" "}
                has vanished, yet the{" "}
                <InlineLinkedHighlight
                    varName="flightHighlight"
                    highlightId="gravity"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('flightHighlight'))}
                    color={GRAVITY_COLOR}
                    bgColor="rgba(247, 178, 59, 0.18)"
                    showHint={false}
                >
                    gravity arrow
                </InlineLinkedHighlight>{" "}
                is unchanged, which is exactly why the ball turns around. The fall mirrors the climb: two seconds in
                the air, peaking at a modest 5 metres.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-question-serve" maxWidth="xl">
        <Block id="flight-question-serve" padding="sm">
            <EditableParagraph id="para-flight-question-serve" blockId="flight-question-serve">
                <RevealOnInteraction
                    varName="flightExplored"
                    placeholder="Scrub the climb above to unlock the questions."
                >
                    A volleyball serve leaves the hand climbing at 15 m/s. It stops rising after{" "}
                    <InlineFeedback
                        varName="answerFlightServeTime"
                        correctValue={["1.5", "1.5 s", "1.5s"]}
                        position="terminal"
                        successMessage="— yes, and it needs the same again to come back down, so 3 seconds in the air"
                        failureMessage="— not yet."
                        hint="How many bites of 10 m/s does gravity need to swallow 15 m/s"
                        reviewBlockId="flight-insight"
                        reviewLabel="Revisit the climb"
                    >
                        <InlineClozeInput
                            varName="answerFlightServeTime"
                            correctAnswer={["1.5", "1.5 s", "1.5s"]}
                            {...clozePropsFromDefinition(getVariableInfo('answerFlightServeTime'))}
                        />
                    </InlineFeedback>{" "}
                    seconds.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-question-top" maxWidth="xl">
        <Block id="flight-question-top" padding="sm">
            <EditableParagraph id="para-flight-question-top" blockId="flight-question-top">
                <RevealOnInteraction varName="flightExplored">
                    At the highest point of any throw, when the ball is briefly going nowhere, the pull of gravity on
                    it is{" "}
                    <InlineFeedback
                        varName="answerFlightTopPull"
                        correctValue="just as strong as ever"
                        position="terminal"
                        successMessage="— exactly, the speed hits zero but the pull does not, so the ball immediately starts falling"
                        failureMessage="— take another look at the two arrows."
                        hint="One arrow disappears at the top and one does not"
                        reviewBlockId="flight-insight"
                        reviewLabel="Revisit the top of the flight"
                        visualizationHint={{
                            blockId: "flight-vertical-figure",
                            hintKey: "feedback-flight-top-pull",
                            steps: [
                                {
                                    gesture: "drag-vertical",
                                    label: "Drag the ball right up to the top of its track",
                                    position: { x: "18%", y: "55%" },
                                    dragPath: { type: "line", startOffset: { x: 0, y: 28 }, endOffset: { x: 0, y: -28 } },
                                    completionVar: "flightTime",
                                    completionValue: 1,
                                    completionTolerance: 0.12,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { flightUpSpeed: 10, flightTime: 0 },
                        }}
                    >
                        <InlineClozeChoice
                            varName="answerFlightTopPull"
                            correctAnswer="just as strong as ever"
                            options={["gone for an instant", "just as strong as ever", "pushing the ball upward"]}
                            {...choicePropsFromDefinition(getVariableInfo('answerFlightTopPull'))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
