import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                Forget sideways for a moment. Gravity eats 10 m/s of upward speed every second, so our 10 m/s climb is
                spent after just one second. Watch the ball's upward speed drain away as it rises.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-vertical-figure" maxWidth="xl">
        <Block id="flight-vertical-figure">
            <VisualOptionCards
                blockId="flight-vertical-figure"
                intro="Choose how students meet the climb, the peak, and the fall."
                cards={[
                    {
                        id: "scrub-the-climb",
                        title: "Scrub the climb",
                        manipulate:
                            "Drag the ball up and down its vertical path to move the clock, watching the speed arrow shrink, vanish, then grow downwards",
                        reveals:
                            "At the very top the speed is zero but the pull is not: gravity never switches off, which is why the ball turns around",
                        looks:
                            "A ball on a vertical track with a shrinking speed arrow beside it and a constant downward gravity arrow that never changes",
                        targetsMisconception: "Gravity stops acting at the top of the flight",
                        paradigm: "temporal",
                        recommended: true,
                    },
                    {
                        id: "mark-the-peak",
                        title: "Mark the peak first",
                        manipulate:
                            "Drag a horizontal marker line to the height you predict the ball will reach, then release the ball",
                        reveals:
                            "The peak is far lower than most guesses, and it comes from the upward speed alone",
                        looks:
                            "A goalpost-height scale with a draggable dashed line and a ghost of your guess left behind after the ball flies",
                        paradigm: "prediction",
                    },
                    {
                        id: "stack-the-seconds",
                        title: "Stack the seconds",
                        manipulate:
                            "Drag one-second speed blocks onto a stack to build the flight second by second",
                        reveals:
                            "The area of the blocks is the height climbed, and the stack runs out exactly when the speed hits zero",
                        looks:
                            "A staircase of speed blocks on the left and the matching ball height rising on the right",
                        paradigm: "constructivist",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-flight-insight" maxWidth="xl">
        <Block id="flight-insight" padding="sm">
            <EditableParagraph id="para-flight-insight" blockId="flight-insight">
                Coming down mirrors going up, so the whole flight lasts two seconds. Its average upward speed over the
                climb is 5 m/s, which lifts the ball a modest 5 metres.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
