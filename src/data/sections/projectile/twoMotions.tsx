import { useEffect, useRef, useState, type ReactElement } from "react";
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
import { clamp, useRafLoop } from "@/lib/motion";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../../variables";

/* ------------------------------------------------------------------ */
/* Figure — "Call it before you see it": predict, then race            */
/* ------------------------------------------------------------------ */

const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 320;
const PAD = 24;

const FLOOR_Y = 250;
const PIXELS_PER_METRE = 90;
const LEDGE_HEIGHT_METRES = 1.8;
const LEDGE_TOP_Y = FLOOR_Y - LEDGE_HEIGHT_METRES * PIXELS_PER_METRE; // 88
const EDGE_X = 120;
const GRAVITY = 10;
const FALL_TIME = Math.sqrt((2 * LEDGE_HEIGHT_METRES) / GRAVITY); // 0.6 s

const DROP_COLOR = "#8E90F5";
const KICK_COLOR = "#62D0AD";
const GUESS_COLOR = "#F7B23B";
const INK = "#334155";
const STRUCTURE = "#64748B";
const DIM = 0.38;

const heightAt = (time: number) => LEDGE_TOP_Y + 0.5 * GRAVITY * time * time * PIXELS_PER_METRE;
const kickXAt = (time: number, speed: number) => EDGE_X + speed * time * PIXELS_PER_METRE;
const formatSeconds = (value: number) => `${value.toFixed(2)} s`;
const formatMetres = (value: number) => `${value.toFixed(2)} m`;

function RaceDrawing() {
    const setVar = useSetVar();
    const speed = useVar<number>("twoMotionsKickSpeed", 4);
    const guess = useVar<number>("twoMotionsGuessHeight", 1.2);
    const playing = useVar<boolean>("twoMotionsPlaying", false);
    const landed = useVar<number>("twoMotionsLanded", 0);
    const highlight = useVar<string>("twoMotionsHighlight", "");

    const [simTime, setSimTime] = useState(0);
    const [dragging, setDragging] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    // Pressing play after a finished race starts a fresh one.
    useEffect(() => {
        if (playing && landed === 1) {
            setSimTime(0);
            setVar("twoMotionsLanded", 0);
        }
    }, [playing, landed, setVar]);

    useRafLoop(
        (dt) => setSimTime((previous) => Math.min(FALL_TIME, previous + dt * 0.5)),
        { paused: !playing },
    );

    useEffect(() => {
        if (simTime >= FALL_TIME - 1e-6 && playing) {
            setVar("twoMotionsPlaying", false);
            setVar("twoMotionsLanded", 1);
        }
    }, [simTime, playing, setVar]);

    const landingX = kickXAt(FALL_TIME, speed);
    const guessY = FLOOR_Y - guess * PIXELS_PER_METRE;
    const ballY = heightAt(simTime);
    const kickX = kickXAt(simTime, speed);

    const isDropLit = highlight === "drop";
    const isKickLit = highlight === "kick";
    const dimOthers = (id: string) => (highlight && highlight !== id ? DIM : 1);
    const ease = { transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" };

    const flightPath = Array.from({ length: 41 }, (_, index) => {
        const time = (index / 40) * FALL_TIME;
        return `${index === 0 ? "M" : "L"} ${kickXAt(time, speed).toFixed(1)} ${heightAt(time).toFixed(1)}`;
    }).join(" ");

    const strobeTimes = [0.15, 0.3, 0.45, FALL_TIME].filter((time) => time <= simTime + 1e-6);

    const moveGuess = (event: React.PointerEvent) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const y = ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
        setVar("twoMotionsGuessHeight", clamp((FLOOR_Y - y) / PIXELS_PER_METRE, 0, LEDGE_HEIGHT_METRES));
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="block w-full"
            style={{ touchAction: "none" }}
        >
            <defs>
                <filter id="race-ghost-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.22" />
                </filter>
            </defs>

            {/* readouts */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <text x={PAD} y={42} fill={INK} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`clock  ${formatSeconds(simTime)}`}
                </text>
                <text
                    x={VIEWBOX_WIDTH - PAD}
                    y={42}
                    textAnchor="end"
                    fill={GUESS_COLOR}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`your guess  ${formatMetres(guess)}`}
                </text>
                {landed === 1 && (
                    <text
                        x={VIEWBOX_WIDTH - PAD}
                        y={62}
                        textAnchor="end"
                        fill={KICK_COLOR}
                        fontSize="12"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {`kicked ball  ${formatMetres(0)}, already down`}
                    </text>
                )}
                <text x={PAD} y={LEDGE_TOP_Y - 12} fill={STRUCTURE} fontSize="12">
                    {`${LEDGE_HEIGHT_METRES.toFixed(1)} m ledge`}
                </text>
            </g>

            {/* structure: ledge, leg, floor */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <line
                    x1={44}
                    y1={LEDGE_TOP_Y + 10}
                    x2={44}
                    y2={FLOOR_Y}
                    stroke={STRUCTURE}
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                    opacity={0.6}
                />
                <rect
                    x={60}
                    y={LEDGE_TOP_Y + 10}
                    width={EDGE_X - 60}
                    height={10}
                    fill="#F1F5F9"
                    stroke={STRUCTURE}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <rect
                    x={76}
                    y={LEDGE_TOP_Y + 20}
                    width={14}
                    height={FLOOR_Y - LEDGE_TOP_Y - 20}
                    fill="#F1F5F9"
                    stroke={STRUCTURE}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <line
                    x1={PAD}
                    y1={FLOOR_Y}
                    x2={VIEWBOX_WIDTH - PAD}
                    y2={FLOOR_Y}
                    stroke={STRUCTURE}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {/* how far along the floor the kicked ball travels */}
                <line
                    x1={EDGE_X}
                    y1={FLOOR_Y + 26}
                    x2={landingX}
                    y2={FLOOR_Y + 26}
                    stroke={STRUCTURE}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={0.7}
                />
                <text
                    x={(EDGE_X + landingX) / 2}
                    y={FLOOR_Y + 44}
                    textAnchor="middle"
                    fill={STRUCTURE}
                    fontSize="12"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`${(speed * FALL_TIME).toFixed(2)} m along the ground`}
                </text>
            </g>

            {/* strobe trail: the before-state, frame by frame */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                {strobeTimes.map((time) => (
                    <g key={time}>
                        <line
                            x1={EDGE_X}
                            y1={heightAt(time)}
                            x2={kickXAt(time, speed)}
                            y2={heightAt(time)}
                            stroke="#94A3B8"
                            strokeWidth="1"
                            strokeDasharray="3 4"
                            opacity={0.55}
                        />
                        <circle cx={EDGE_X} cy={heightAt(time)} r={3.5} fill={DROP_COLOR} opacity={0.5} />
                        <circle cx={kickXAt(time, speed)} cy={heightAt(time)} r={3.5} fill={KICK_COLOR} opacity={0.5} />
                    </g>
                ))}
            </g>

            {/* dropped ball group */}
            <g opacity={dimOthers("drop")} style={ease}>
                {isDropLit && (
                    <line
                        x1={EDGE_X}
                        y1={LEDGE_TOP_Y}
                        x2={EDGE_X}
                        y2={FLOOR_Y}
                        stroke={DROP_COLOR}
                        strokeWidth="9"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={EDGE_X}
                    y1={LEDGE_TOP_Y}
                    x2={EDGE_X}
                    y2={FLOOR_Y}
                    stroke={DROP_COLOR}
                    strokeWidth={isDropLit ? 3 : 1.8}
                    strokeDasharray="5 6"
                    strokeLinecap="round"
                    style={ease}
                    onPointerEnter={() => setVar("twoMotionsHighlight", "drop")}
                    onPointerLeave={() => setVar("twoMotionsHighlight", "")}
                />
                <circle
                    cx={EDGE_X}
                    cy={ballY}
                    r={isDropLit ? 11.7 : 9}
                    fill="#FFFFFF"
                    stroke={DROP_COLOR}
                    strokeWidth={isDropLit ? 3.5 : 2.5}
                    style={ease}
                    onPointerEnter={() => setVar("twoMotionsHighlight", "drop")}
                    onPointerLeave={() => setVar("twoMotionsHighlight", "")}
                />
                <text x={EDGE_X - 16} y={LEDGE_TOP_Y - 30} textAnchor="end" fill={DROP_COLOR} fontSize="12">
                    dropped
                </text>
                <line
                    x1={EDGE_X - 14}
                    y1={LEDGE_TOP_Y - 26}
                    x2={EDGE_X - 4}
                    y2={LEDGE_TOP_Y - 10}
                    stroke={DROP_COLOR}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={0.7}
                />
            </g>

            {/* kicked ball group */}
            <g opacity={dimOthers("kick")} style={ease}>
                {isKickLit && (
                    <path d={flightPath} fill="none" stroke={KICK_COLOR} strokeWidth="9" opacity={0.28} strokeLinecap="round" />
                )}
                <path
                    d={flightPath}
                    fill="none"
                    stroke={KICK_COLOR}
                    strokeWidth={isKickLit ? 3 : 1.8}
                    strokeDasharray="5 6"
                    strokeLinecap="round"
                    style={ease}
                    onPointerEnter={() => setVar("twoMotionsHighlight", "kick")}
                    onPointerLeave={() => setVar("twoMotionsHighlight", "")}
                />
                <circle
                    cx={kickX}
                    cy={ballY}
                    r={isKickLit ? 9.8 : 7.5}
                    fill={KICK_COLOR}
                    style={ease}
                    onPointerEnter={() => setVar("twoMotionsHighlight", "kick")}
                    onPointerLeave={() => setVar("twoMotionsHighlight", "")}
                />
                <text x={EDGE_X + 18} y={LEDGE_TOP_Y - 30} fill={KICK_COLOR} fontSize="12">
                    kicked sideways
                </text>
                <line
                    x1={EDGE_X + 16}
                    y1={LEDGE_TOP_Y - 26}
                    x2={EDGE_X + 6}
                    y2={LEDGE_TOP_Y - 10}
                    stroke={KICK_COLOR}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={0.7}
                />
            </g>

            {/* the student's prediction */}
            <g opacity={highlight ? DIM : 1} style={ease}>
                <line
                    x1={landingX}
                    y1={LEDGE_TOP_Y}
                    x2={landingX}
                    y2={FLOOR_Y}
                    stroke={GUESS_COLOR}
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                    opacity={0.55}
                />
                <circle
                    cx={landingX}
                    cy={guessY}
                    r={12}
                    fill={GUESS_COLOR}
                    fillOpacity={0.22}
                    stroke={GUESS_COLOR}
                    strokeWidth={dragging ? 3 : 2.2}
                    strokeDasharray="4 4"
                    filter="url(#race-ghost-shadow)"
                />
                <text
                    x={clamp(landingX, PAD + 40, VIEWBOX_WIDTH - PAD - 40)}
                    y={Math.max(guessY - 22, LEDGE_TOP_Y - 4)}
                    textAnchor="middle"
                    fill={GUESS_COLOR}
                    fontSize="12"
                >
                    your guess
                </text>
                <circle
                    cx={landingX}
                    cy={guessY}
                    r={24}
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging(true);
                    }}
                    onPointerMove={moveGuess}
                    onPointerUp={() => setDragging(false)}
                    onPointerCancel={() => setDragging(false)}
                />
            </g>
        </svg>
    );
}

function RaceFigure() {
    const setVar = useSetVar();
    const speed = useVar<number>("twoMotionsKickSpeed", 4);
    const guess = useVar<number>("twoMotionsGuessHeight", 1.2);
    const landingX = kickXAt(FALL_TIME, speed);
    const guessY = FLOOR_Y - guess * PIXELS_PER_METRE;

    return (
        <Figure
            id="two-motions-race"
            playable
            playVarName="twoMotionsPlaying"
            onReset={() => {
                setVar("twoMotionsGuessHeight", 1.2);
                setVar("twoMotionsKickSpeed", 4);
                setVar("twoMotionsPlaying", false);
                setVar("twoMotionsLanded", 0);
                setVar("twoMotionsHighlight", "");
            }}
            caption="Drag the amber ghost to the height you think the kicked ball will be at the moment the dropped ball lands, then press play. The dashed lines that appear join the two balls at each frozen frame."
        >
            <RaceDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="twoMotionsKickSpeed"
                    label="Sideways kick"
                    {...numberPropsFromDefinition(getVariableInfo('twoMotionsKickSpeed'))}
                    formatValue={(value) => `${value.toFixed(1)} m/s`}
                />
            </div>
            <InteractionHintSequence
                hintKey="two-motions-guess-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the amber ghost to your predicted height",
                        position: {
                            x: `${((landingX / VIEWBOX_WIDTH) * 100).toFixed(0)}%`,
                            y: `${((guessY / VIEWBOX_HEIGHT) * 100).toFixed(0)}%`,
                        },
                        dragPath: { type: "line", startOffset: { x: 0, y: -22 }, endOffset: { x: 0, y: 22 } },
                        color: GUESS_COLOR,
                    },
                ]}
            />
        </Figure>
    );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

export const projectileTwoMotionsBlocks: ReactElement[] = [
    <StackLayout key="layout-two-motions-heading" maxWidth="xl">
        <Block id="two-motions-heading" padding="md">
            <EditableH2 id="h2-two-motions-heading" blockId="two-motions-heading">
                Two journeys at once
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-setup" maxWidth="xl">
        <Block id="two-motions-setup" padding="sm">
            <EditableParagraph id="para-two-motions-setup" blockId="two-motions-setup">
                Here is a claim that sounds wrong. Knocked sideways off a ledge at{" "}
                <InlineScrubbleNumber
                    varName="twoMotionsKickSpeed"
                    {...numberPropsFromDefinition(getVariableInfo('twoMotionsKickSpeed'))}
                    formatValue={(value: number) => `${value.toFixed(1)} m/s`}
                />
                , a ball reaches the grass at the same instant as one simply dropped. Place your amber ghost where you
                think the kicked ball will be when the dropped one lands, then press play.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-race-figure" maxWidth="xl">
        <Block id="two-motions-race-figure" padding="sm" hasVisualization>
            <RaceFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-insight" maxWidth="xl">
        <Block id="two-motions-insight" padding="sm">
            <EditableParagraph id="para-two-motions-insight" blockId="two-motions-insight">
                The{" "}
                <InlineLinkedHighlight
                    varName="twoMotionsHighlight"
                    highlightId="kick"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('twoMotionsHighlight'))}
                    color={KICK_COLOR}
                    bgColor="rgba(98, 208, 173, 0.18)"
                >
                    kicked ball's curve
                </InlineLinkedHighlight>{" "}
                and the{" "}
                <InlineLinkedHighlight
                    varName="twoMotionsHighlight"
                    highlightId="drop"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('twoMotionsHighlight'))}
                    color={DROP_COLOR}
                    bgColor="rgba(142, 144, 245, 0.18)"
                    showHint={false}
                >
                    dropped ball's plunge
                </InlineLinkedHighlight>{" "}
                stay level all the way down. Sideways speed buys distance, never hang time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-question-order" maxWidth="xl">
        <Block id="two-motions-question-order" padding="sm">
            <EditableParagraph id="para-two-motions-question-order" blockId="two-motions-question-order">
                <RevealOnInteraction
                    varName="twoMotionsLanded"
                    placeholder="Run the race above to unlock the questions."
                >
                    A fielder hurls a cricket ball horizontally at 30 m/s from a 5 m balcony, and at that instant a
                    second ball rolls off the edge. The thrown ball reaches the ground{" "}
                    <InlineFeedback
                        varName="answerTwoMotionsLanding"
                        correctValue="at the same time as"
                        position="terminal"
                        successMessage="— yes, its sideways speed has no say in how fast gravity brings it down"
                        failureMessage="— have another look at the race."
                        hint="Watch the dashed lines joining the two balls in the figure"
                        reviewBlockId="two-motions-insight"
                        reviewLabel="Revisit the race"
                        visualizationHint={{
                            blockId: "two-motions-race-figure",
                            hintKey: "feedback-two-motions-race",
                            steps: [
                                {
                                    gesture: "drag-vertical",
                                    label: "Drag the amber ghost right down onto the grass",
                                    position: { x: "60%", y: "62%" },
                                    dragPath: { type: "line", startOffset: { x: 0, y: -25 }, endOffset: { x: 0, y: 25 } },
                                    completionVar: "twoMotionsGuessHeight",
                                    completionValue: 0,
                                    completionTolerance: 0.25,
                                },
                                {
                                    gesture: "click",
                                    label: "Now press play — do the two balls touch down together?",
                                    position: { x: "88%", y: "8%" },
                                    completionVar: "twoMotionsLanded",
                                    completionValue: 1,
                                    completionTolerance: 0.4,
                                },
                            ],
                            label: "Discover it yourself",
                            resetVars: { twoMotionsGuessHeight: 1.2, twoMotionsPlaying: false, twoMotionsLanded: 0 },
                        }}
                    >
                        <InlineClozeChoice
                            varName="answerTwoMotionsLanding"
                            correctAnswer="at the same time as"
                            options={["before", "at the same time as", "after"]}
                            {...choicePropsFromDefinition(getVariableInfo('answerTwoMotionsLanding'))}
                        />
                    </InlineFeedback>{" "}
                    the dropped one.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-question-distance" maxWidth="xl">
        <Block id="two-motions-question-distance" padding="sm">
            <EditableParagraph id="para-two-motions-question-distance" blockId="two-motions-question-distance">
                <RevealOnInteraction varName="twoMotionsLanded">
                    That fall takes a full second, and nothing slows the cricket ball's forward rush, so it thumps down{" "}
                    <InlineFeedback
                        varName="answerTwoMotionsDistance"
                        correctValue={["30", "30 m", "30m"]}
                        position="terminal"
                        successMessage="— exactly, 30 m/s held steady for one whole second"
                        failureMessage="— not quite."
                        hint="Forward speed never changes, so distance is just speed multiplied by time"
                        reviewBlockId="two-motions-insight"
                        reviewLabel="Revisit the race"
                    >
                        <InlineClozeInput
                            varName="answerTwoMotionsDistance"
                            correctAnswer={["30", "30 m", "30m"]}
                            {...clozePropsFromDefinition(getVariableInfo('answerTwoMotionsDistance'))}
                        />
                    </InlineFeedback>{" "}
                    metres from the wall.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
