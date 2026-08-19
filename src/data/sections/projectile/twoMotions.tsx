import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                Here is a claim that sounds wrong. A ball knocked hard sideways off a bench hits the floor at exactly
                the same moment as one simply dropped beside it. Race them and see.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-race-figure" maxWidth="xl">
        <Block id="two-motions-race-figure">
            <VisualOptionCards
                blockId="two-motions-race-figure"
                intro="Pick how your students should meet the drop-versus-kick race."
                cards={[
                    {
                        id: "predict-the-winner",
                        title: "Call it before you see it",
                        manipulate:
                            "Drag a ghost ball to the height where you predict the kicked ball will be at the exact moment the dropped ball lands, then release both",
                        reveals:
                            "The kicked ball is already on the floor too: sideways speed buys distance, never extra hang time",
                        looks:
                            "A bench with two balls, a faint ghost marker the student positions, and a replay that shows the real answer next to their guess",
                        targetsMisconception: "A ball thrown forward falls slower than one simply dropped",
                        paradigm: "prediction",
                        recommended: true,
                    },
                    {
                        id: "linked-strobe-race",
                        title: "Stroboscope side by side",
                        manipulate:
                            "Drag the speed arrow attached to the kicked ball to make the knock harder or softer",
                        reveals:
                            "However hard you hit it, the two balls stay level with each other the whole way down",
                        looks:
                            "Two falling balls leaving strobe dots, joined by dashed level lines that always stay horizontal",
                        targetsMisconception: "Something keeps pushing the ball forward after it is launched",
                        paradigm: "comparison",
                    },
                    {
                        id: "scrub-the-flight",
                        title: "Scrub the flight frame by frame",
                        manipulate: "Drag the kicked ball itself along its curved path to move time forwards and back",
                        reveals:
                            "The sideways gaps between frames stay identical while the downward gaps grow: two motions, one clock",
                        looks:
                            "A curved path with frozen frames appearing behind the ball, plus a tick strip along the floor and down the wall",
                        paradigm: "temporal",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-two-motions-insight" maxWidth="xl">
        <Block id="two-motions-insight" padding="sm">
            <EditableParagraph id="para-two-motions-insight" blockId="two-motions-insight">
                Gravity pulls down and only down. The falling half of the story never notices how fast the ball is
                travelling forwards, so we can treat the two directions as two separate, much easier problems.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
