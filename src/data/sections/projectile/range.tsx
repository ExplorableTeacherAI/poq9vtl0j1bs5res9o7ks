import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                Nothing pushes the ball forwards once it leaves the boot, so the forward speed never changes. Range is
                simply that steady speed multiplied by the time in the air. Hunt for the angle that lands furthest.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-angle-figure" maxWidth="xl">
        <Block id="range-angle-figure">
            <VisualOptionCards
                blockId="range-angle-figure"
                intro="Pick how students should discover the best launch angle."
                cards={[
                    {
                        id: "reach-the-target",
                        title: "Land it on the target",
                        manipulate:
                            "Drag the angle handle on the launch arrow until the ball lands on a target cone on the pitch",
                        reveals:
                            "Two different angles reach the same target, and past 45 degrees a steeper kick lands shorter, not further",
                        looks:
                            "A pitch with a target cone, a draggable launch arrow and the flight path redrawing as you turn it",
                        targetsMisconception: "The steeper you launch it, the farther it always goes",
                        paradigm: "goal",
                        recommended: true,
                    },
                    {
                        id: "ghost-twin-kick",
                        title: "Race a ghost kick",
                        manipulate:
                            "Drag your ball's angle handle while a faded 45 degree ghost kick stays on the pitch beside it",
                        reveals:
                            "Steeper buys hang time but sacrifices forward speed, and 45 degrees is the deal that wins",
                        looks:
                            "Two arcs over the same pitch, one solid and one faded, with range bars stretching underneath",
                        paradigm: "comparison",
                    },
                    {
                        id: "plant-the-flag",
                        title: "Plant the landing flag",
                        manipulate:
                            "Drag a flag onto the pitch where you predict this kick will land, then let the ball fly",
                        reveals:
                            "Your instinct about steep kicks is usually far too generous, and the gap shows on the pitch",
                        looks:
                            "A pitch with a draggable flag, the real landing spot marked afterwards and the distance between them measured",
                        targetsMisconception: "The steeper you launch it, the farther it always goes",
                        paradigm: "prediction",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-range-insight" maxWidth="xl">
        <Block id="range-insight" padding="sm">
            <EditableParagraph id="para-range-insight" blockId="range-insight">
                Steeper buys time in the air but spends forward speed to get it. Flatter does the opposite, and
                45 degrees is where the trade is fairest.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
