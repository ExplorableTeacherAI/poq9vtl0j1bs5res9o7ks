import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                A striker meets the ball at 20 m/s, angled 30 degrees above the grass. That single arrow is really
                two: one running along the ground, one climbing straight up.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-components-figure" maxWidth="xl">
        <Block id="splitting-components-figure">
            <VisualOptionCards
                blockId="splitting-components-figure"
                intro="How should students discover the two parts hiding inside one launch?"
                cards={[
                    {
                        id: "drag-the-boot-arrow",
                        title: "Drag the launch arrow",
                        manipulate:
                            "Drag the tip of the launch arrow at the striker's boot to change its angle and length",
                        reveals:
                            "Flattening the arrow grows the ground part and shrinks the climb, and the two always come from cosine and sine",
                        looks:
                            "A boot with one bold arrow, its shadow on the grass and its height on a vertical guide, both labelled with live numbers",
                        paradigm: "conventional",
                        recommended: true,
                    },
                    {
                        id: "build-from-parts",
                        title: "Build the kick backwards",
                        manipulate:
                            "Drag the flat ground arrow and the upright climbing arrow separately; the real launch arrow assembles itself between them",
                        reveals:
                            "Angle and speed are not chosen by the striker directly, they fall out of the two parts",
                        looks:
                            "Two draggable arrows forming a right-angled triangle, with the hypotenuse and its angle appearing live",
                        paradigm: "inversion",
                    },
                    {
                        id: "two-strikers-compared",
                        title: "Two strikers, same power",
                        manipulate:
                            "Drag the angle handle on the near striker while the far striker stays fixed at 45 degrees",
                        reveals:
                            "Equal speed can be shared between forwards and upwards in completely different ways",
                        looks:
                            "Two boots side by side, each with a bold arrow and a pair of labelled component bars underneath",
                        paradigm: "comparison",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-splitting-insight" maxWidth="xl">
        <Block id="splitting-insight" padding="sm">
            <EditableParagraph id="para-splitting-insight" blockId="splitting-insight">
                At 30 degrees that 20 m/s kick leaves with 17.3 m/s forwards but only 10 m/s upwards. Cosine hands you
                the flat part, sine hands you the climb.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
