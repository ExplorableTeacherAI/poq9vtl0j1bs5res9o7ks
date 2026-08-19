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
import { Figure } from "@/components/molecules";
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
/* Figure — "Build the kick backwards": drag the two parts             */
/* ------------------------------------------------------------------ */

const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 320;
const PAD = 24;

const ORIGIN_X = 110;
const ORIGIN_Y = 250;
const PIXELS_PER_SPEED = 16; // same scale on both axes, so the drawn angle is honest

const FORWARD_COLOR = "#62D0AD";
const UP_COLOR = "#8E90F5";
const LAUNCH_COLOR = "#AC8BF9";
const STRUCTURE = "#64748B";
const DIM = 0.38;

const FORWARD_MIN = 2;
const FORWARD_MAX = 20;
const UP_MIN = 0.5;
const UP_MAX = 12;

const formatSpeed = (value: number) => `${value.toFixed(1)} m/s`;
const formatAngle = (value: number) => `${value.toFixed(1)}°`;

function KickPartsDrawing() {
    const setVar = useSetVar();
    const forward = useVar<number>("splittingForwardSpeed", 17.3);
    const up = useVar<number>("splittingUpSpeed", 10);
    const highlight = useVar<string>("splittingHighlight", "");
    const [dragging, setDragging] = useState<"forward" | "up" | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const forwardTipX = ORIGIN_X + forward * PIXELS_PER_SPEED;
    const upTipY = ORIGIN_Y - up * PIXELS_PER_SPEED;
    const speed = Math.hypot(forward, up);
    const angle = (Math.atan2(up, forward) * 180) / Math.PI;

    const isForwardLit = highlight === "forward";
    const isUpLit = highlight === "up";
    const isLaunchLit = highlight === "launch";
    const dimOthers = (id: string) => (highlight && highlight !== id ? DIM : 1);
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };

    const toViewBox = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
        };
    };

    const handleMove = (event: React.PointerEvent) => {
        if (!dragging) return;
        const point = toViewBox(event);
        if (!point) return;
        setVar("splittingExplored", 1);
        if (dragging === "forward") {
            setVar(
                "splittingForwardSpeed",
                Math.round(clamp((point.x - ORIGIN_X) / PIXELS_PER_SPEED, FORWARD_MIN, FORWARD_MAX) * 10) / 10,
            );
        } else {
            setVar(
                "splittingUpSpeed",
                Math.round(clamp((ORIGIN_Y - point.y) / PIXELS_PER_SPEED, UP_MIN, UP_MAX) * 10) / 10,
            );
        }
    };

    const arcRadius = 46;
    const arcPath = `M ${ORIGIN_X + arcRadius} ${ORIGIN_Y} A ${arcRadius} ${arcRadius} 0 0 1 ${(
        ORIGIN_X + arcRadius * Math.cos((angle * Math.PI) / 180)
    ).toFixed(1)} ${(ORIGIN_Y - arcRadius * Math.sin((angle * Math.PI) / 180)).toFixed(1)}`;
    const arcLabelX = ORIGIN_X + 66 * Math.cos((angle * Math.PI) / 360);
    const arcLabelY = ORIGIN_Y - 66 * Math.sin((angle * Math.PI) / 360);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="block w-full"
            style={{ touchAction: "none" }}
            onPointerMove={handleMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
        >
            <defs>
                <marker id="kick-arrow-forward" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={FORWARD_COLOR} />
                </marker>
                <marker id="kick-arrow-up" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={UP_COLOR} />
                </marker>
                <marker id="kick-arrow-launch" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                    <path d="M 0 0 L 9 4.5 L 0 9 z" fill={LAUNCH_COLOR} />
                </marker>
                <filter id="kick-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* grass, tracks and the ball at the striker's boot */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <line
                    x1={PAD}
                    y1={ORIGIN_Y}
                    x2={VIEWBOX_WIDTH - PAD}
                    y2={ORIGIN_Y}
                    stroke={STRUCTURE}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={ORIGIN_X}
                    y2={ORIGIN_Y - UP_MAX * PIXELS_PER_SPEED}
                    stroke={STRUCTURE}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    opacity={0.45}
                />
                <line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={ORIGIN_X + FORWARD_MAX * PIXELS_PER_SPEED}
                    y2={ORIGIN_Y}
                    stroke={STRUCTURE}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    opacity={0.45}
                />
                {/* the rectangle that closes the triangle */}
                <path
                    d={`M ${forwardTipX} ${ORIGIN_Y} L ${forwardTipX} ${upTipY} L ${ORIGIN_X} ${upTipY}`}
                    fill="none"
                    stroke={STRUCTURE}
                    strokeWidth="1.5"
                    strokeDasharray="5 6"
                    opacity={0.5}
                />
                <circle cx={ORIGIN_X} cy={ORIGIN_Y} r={8} fill="#F1F5F9" stroke={STRUCTURE} strokeWidth="2" />
            </g>

            {/* the assembled launch arrow */}
            <g opacity={dimOthers("launch")} style={ease}>
                {isLaunchLit && (
                    <line
                        x1={ORIGIN_X}
                        y1={ORIGIN_Y}
                        x2={forwardTipX}
                        y2={upTipY}
                        stroke={LAUNCH_COLOR}
                        strokeWidth="10"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={forwardTipX}
                    y2={upTipY}
                    stroke={LAUNCH_COLOR}
                    strokeWidth={isLaunchLit ? 5 : 3.5}
                    strokeLinecap="round"
                    markerEnd="url(#kick-arrow-launch)"
                    style={ease}
                    onPointerEnter={() => setVar("splittingHighlight", "launch")}
                    onPointerLeave={() => setVar("splittingHighlight", "")}
                />
                <path d={arcPath} fill="none" stroke={LAUNCH_COLOR} strokeWidth="1.8" opacity={0.8} />
                <text
                    x={arcLabelX}
                    y={arcLabelY}
                    textAnchor="middle"
                    fill={LAUNCH_COLOR}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatAngle(angle)}
                </text>
                <text
                    x={Math.min(forwardTipX + 14, VIEWBOX_WIDTH - PAD - 60)}
                    y={Math.max(upTipY + 4, PAD + 16)}
                    fill={LAUNCH_COLOR}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatSpeed(speed)}
                </text>
            </g>

            {/* forward part */}
            <g opacity={dimOthers("forward")} style={ease}>
                {isForwardLit && (
                    <line
                        x1={ORIGIN_X}
                        y1={ORIGIN_Y}
                        x2={forwardTipX}
                        y2={ORIGIN_Y}
                        stroke={FORWARD_COLOR}
                        strokeWidth="10"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={forwardTipX}
                    y2={ORIGIN_Y}
                    stroke={FORWARD_COLOR}
                    strokeWidth={isForwardLit ? 4.5 : 3}
                    strokeLinecap="round"
                    markerEnd="url(#kick-arrow-forward)"
                    style={ease}
                    onPointerEnter={() => setVar("splittingHighlight", "forward")}
                    onPointerLeave={() => setVar("splittingHighlight", "")}
                />
                <text
                    x={(ORIGIN_X + forwardTipX) / 2}
                    y={ORIGIN_Y + 26}
                    textAnchor="middle"
                    fill={FORWARD_COLOR}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`forwards ${formatSpeed(forward)}`}
                </text>
                <circle
                    cx={forwardTipX}
                    cy={ORIGIN_Y}
                    r={dragging === "forward" ? 13 : 11}
                    fill={FORWARD_COLOR}
                    filter="url(#kick-handle-shadow)"
                    style={ease}
                />
                <circle
                    cx={forwardTipX}
                    cy={ORIGIN_Y}
                    r={24}
                    fill="transparent"
                    style={{ cursor: dragging === "forward" ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging("forward");
                    }}
                    onPointerMove={handleMove}
                    onPointerUp={() => setDragging(null)}
                    onPointerCancel={() => setDragging(null)}
                    onPointerEnter={() => setVar("splittingHighlight", "forward")}
                    onPointerLeave={() => setVar("splittingHighlight", "")}
                />
            </g>

            {/* upward part */}
            <g opacity={dimOthers("up")} style={ease}>
                {isUpLit && (
                    <line
                        x1={ORIGIN_X}
                        y1={ORIGIN_Y}
                        x2={ORIGIN_X}
                        y2={upTipY}
                        stroke={UP_COLOR}
                        strokeWidth="10"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={ORIGIN_X}
                    y2={upTipY}
                    stroke={UP_COLOR}
                    strokeWidth={isUpLit ? 4.5 : 3}
                    strokeLinecap="round"
                    markerEnd="url(#kick-arrow-up)"
                    style={ease}
                    onPointerEnter={() => setVar("splittingHighlight", "up")}
                    onPointerLeave={() => setVar("splittingHighlight", "")}
                />
                <text
                    x={ORIGIN_X}
                    y={Math.max(upTipY - 20, PAD + 14)}
                    textAnchor="middle"
                    fill={UP_COLOR}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`upwards ${formatSpeed(up)}`}
                </text>
                <circle
                    cx={ORIGIN_X}
                    cy={upTipY}
                    r={dragging === "up" ? 13 : 11}
                    fill={UP_COLOR}
                    filter="url(#kick-handle-shadow)"
                    style={ease}
                />
                <circle
                    cx={ORIGIN_X}
                    cy={upTipY}
                    r={24}
                    fill="transparent"
                    style={{ cursor: dragging === "up" ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging("up");
                    }}
                    onPointerMove={handleMove}
                    onPointerUp={() => setDragging(null)}
                    onPointerCancel={() => setDragging(null)}
                    onPointerEnter={() => setVar("splittingHighlight", "up")}
                    onPointerLeave={() => setVar("splittingHighlight", "")}
                />
            </g>
        </svg>
    );
}

function KickPartsFigure() {
    const setVar = useSetVar();
    const forward = useVar<number>("splittingForwardSpeed", 17.3);
    const up = useVar<number>("splittingUpSpeed", 10);
    const forwardTipX = ORIGIN_X + forward * PIXELS_PER_SPEED;
    const upTipY = ORIGIN_Y - up * PIXELS_PER_SPEED;

    return (
        <Figure
            id="splitting-kick-parts"
            onReset={() => {
                setVar("splittingForwardSpeed", 17.3);
                setVar("splittingUpSpeed", 10);
                setVar("splittingHighlight", "");
            }}
            caption="Drag the teal handle along the grass and the indigo handle up the dashed post. The violet launch arrow and its angle are never dragged, they are whatever the two parts make them."
        >
            <KickPartsDrawing />
            <InteractionHintSequence
                hintKey="splitting-parts-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the teal handle along the grass",
                        position: {
                            x: `${((forwardTipX / VIEWBOX_WIDTH) * 100).toFixed(0)}%`,
                            y: `${((ORIGIN_Y / VIEWBOX_HEIGHT) * 100).toFixed(0)}%`,
                        },
                        dragPath: { type: "line", startOffset: { x: -26, y: 0 }, endOffset: { x: 26, y: 0 } },
                        color: FORWARD_COLOR,
                    },
                    {
                        gesture: "drag-vertical",
                        label: "Now drag the indigo handle up the post",
                        position: {
                            x: `${((ORIGIN_X / VIEWBOX_WIDTH) * 100).toFixed(0)}%`,
                            y: `${((upTipY / VIEWBOX_HEIGHT) * 100).toFixed(0)}%`,
                        },
                        dragPath: { type: "line", startOffset: { x: 0, y: 24 }, endOffset: { x: 0, y: -24 } },
                        color: UP_COLOR,
                    },
                ]}
            />
        </Figure>
    );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

export const projectileSplittingBlocks: ReactElement[] = [
    <StackLayout key="layout-splitting-heading" maxWidth="xl">
        <Block id="splitting-heading" padding="md">
            <EditableH2 id="h2-splitting-heading" blockId="splitting-heading">
                Splitting the kick
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-setup" maxWidth="xl">
        <Block id="splitting-setup" padding="sm">
            <EditableParagraph id="para-splitting-setup" blockId="splitting-setup">
                A striker meets the ball at 20 m/s, 30 degrees above the grass, and that single arrow is really two.
                Drag the teal handle along the ground and the indigo handle up the post, and watch the launch arrow
                build itself between them.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-components-figure" maxWidth="xl">
        <Block id="splitting-components-figure" padding="sm" hasVisualization>
            <KickPartsFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-insight" maxWidth="xl">
        <Block id="splitting-insight" padding="sm">
            <EditableParagraph id="para-splitting-insight" blockId="splitting-insight">
                Running{" "}
                <InlineLinkedHighlight
                    varName="splittingHighlight"
                    highlightId="forward"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('splittingHighlight'))}
                    color={FORWARD_COLOR}
                    bgColor="rgba(98, 208, 173, 0.18)"
                >
                    forwards
                </InlineLinkedHighlight>{" "}
                at{" "}
                <InlineScrubbleNumber
                    varName="splittingForwardSpeed"
                    {...numberPropsFromDefinition(getVariableInfo('splittingForwardSpeed'))}
                    formatValue={(value: number) => `${value.toFixed(1)}`}
                />
                {" "}m/s while{" "}
                <InlineLinkedHighlight
                    varName="splittingHighlight"
                    highlightId="up"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('splittingHighlight'))}
                    color={UP_COLOR}
                    bgColor="rgba(142, 144, 245, 0.18)"
                    showHint={false}
                >
                    climbing
                </InlineLinkedHighlight>{" "}
                at{" "}
                <InlineScrubbleNumber
                    varName="splittingUpSpeed"
                    {...numberPropsFromDefinition(getVariableInfo('splittingUpSpeed'))}
                    formatValue={(value: number) => `${value.toFixed(1)}`}
                    showHint={false}
                />
                {" "}m/s makes exactly that 20 m/s kick at 30 degrees. Cosine hands you the flat part, sine hands you
                the climb.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-question-basketball" maxWidth="xl">
        <Block id="splitting-question-basketball" padding="sm">
            <EditableParagraph id="para-splitting-question-basketball" blockId="splitting-question-basketball">
                <RevealOnInteraction
                    varName="splittingExplored"
                    placeholder="Build a kick above to unlock the questions."
                >
                    A jump shot leaves the hands at 10 m/s, 60 degrees above the court, where cos 60 is 0.5 and
                    sin 60 is 0.87. Towards the hoop it is travelling at{" "}
                    <InlineFeedback
                        varName="answerSplittingForwardPart"
                        correctValue={["5", "5 m/s", "5m/s"]}
                        position="terminal"
                        successMessage="— right, cosine takes the flat share, and a steep shot leaves little of it"
                        failureMessage="— careful, that is the climbing share."
                        hint="Cosine gives the flat part, sine gives the climb"
                        reviewBlockId="splitting-insight"
                        reviewLabel="Revisit the two parts"
                    >
                        <InlineClozeInput
                            varName="answerSplittingForwardPart"
                            correctAnswer={["5", "5 m/s", "5m/s"]}
                            {...clozePropsFromDefinition(getVariableInfo('answerSplittingForwardPart'))}
                        />
                    </InlineFeedback>{" "}
                    m/s.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-question-forty-five" maxWidth="xl">
        <Block id="splitting-question-forty-five" padding="sm">
            <EditableParagraph id="para-splitting-question-forty-five" blockId="splitting-question-forty-five">
                <RevealOnInteraction varName="splittingExplored">
                    A kick sent out at 45 degrees splits its speed so that the two parts are{" "}
                    <InlineFeedback
                        varName="answerSplittingFortyFive"
                        correctValue="exactly equal"
                        position="terminal"
                        successMessage="— yes, a 45 degree launch shares itself evenly between the ground and the sky"
                        failureMessage="— worth testing in the figure."
                        hint="Try building an arrow whose angle reads 45 degrees"
                        reviewBlockId="splitting-components-figure"
                        reviewLabel="Back to the arrows"
                        visualizationHint={{
                            blockId: "splitting-components-figure",
                            hintKey: "feedback-splitting-forty-five",
                            steps: [
                                {
                                    gesture: "drag-horizontal",
                                    label: "Drag the teal handle until it reads 10.0 m/s",
                                    position: { x: "50%", y: "78%" },
                                    dragPath: { type: "line", startOffset: { x: 26, y: 0 }, endOffset: { x: -26, y: 0 } },
                                    completionVar: "splittingForwardSpeed",
                                    completionValue: 10,
                                    completionTolerance: 0.6,
                                },
                                {
                                    gesture: "drag-vertical",
                                    label: "Now match it with the indigo handle and read the angle",
                                    position: { x: "20%", y: "44%" },
                                    dragPath: { type: "line", startOffset: { x: 0, y: 24 }, endOffset: { x: 0, y: -24 } },
                                    completionVar: "splittingUpSpeed",
                                    completionValue: 10,
                                    completionTolerance: 0.6,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { splittingForwardSpeed: 17.3, splittingUpSpeed: 10 },
                        }}
                    >
                        <InlineClozeChoice
                            varName="answerSplittingFortyFive"
                            correctAnswer="exactly equal"
                            options={["mostly forward", "exactly equal", "mostly upward"]}
                            {...choicePropsFromDefinition(getVariableInfo('answerSplittingFortyFive'))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
