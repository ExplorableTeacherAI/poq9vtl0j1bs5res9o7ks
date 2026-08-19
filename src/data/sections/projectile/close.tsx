import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const projectileCloseBlocks: ReactElement[] = [
    <StackLayout key="layout-close-heading" maxWidth="xl">
        <Block id="close-heading" padding="md">
            <EditableH2 id="h2-close-heading" blockId="close-heading">
                Wrapping up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-close-summary" maxWidth="xl">
        <Block id="close-summary" padding="sm">
            <EditableParagraph id="para-close-summary" blockId="close-summary">
                A curving shot was never one motion. It is a steady walk forwards glued to a free fall upwards, the two
                of them sharing a single clock. Split any launch into those parts and one hard question becomes two
                easy ones.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-close-next" maxWidth="xl">
        <Block id="close-next" padding="sm">
            <EditableParagraph id="para-close-next" blockId="close-next">
                That same split explains a basketball arc, a long jump and a ski jump. Next it stretches all the way to
                orbit, where the ground curves away as fast as the object falls.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
