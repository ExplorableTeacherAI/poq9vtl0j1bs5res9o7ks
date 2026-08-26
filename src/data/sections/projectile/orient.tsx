import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const projectileOrientBlocks: ReactElement[] = [
    <StackLayout key="layout-orient-title" maxWidth="xl">
        <Block id="orient-title" padding="md">
            <EditableH1 id="h1-orient-title" blockId="orient-title">
                Projectile Motion
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-orient-opening" maxWidth="xl">
        <Block id="orient-opening" padding="sm">
            <EditableParagraph id="para-orient-opening" blockId="orient-opening">Kick a football and it traces the same smooth curve every time. That curve is called projectile motion, and it hides something strange: two completely separate journeys happening at once, sharing one clock.  Yh</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-block-1787717814218" maxWidth="xl">
        <Block id="block-1787717814218" padding="sm">
            <EditableParagraph id="para-block-1787717814218" blockId="block-1787717814218">hhbbjjb /</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-block-1787717978350" maxWidth="xl">
        <Block id="block-1787717978350" padding="sm">
            <EditableParagraph id="para-block-1787717978350" blockId="block-1787717978350"></EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-block-1787711136377" maxWidth="xl">
    <Block id="block-1787711136377" padding="sm">
        <EditableParagraph id="para-block-1787711136377" blockId="block-1787711136377"></EditableParagraph>
    </Block>
</StackLayout>,

    <StackLayout key="layout-orient-promise" maxWidth="xl">
        <Block id="orient-promise" padding="sm">
            <EditableParagraph id="para-orient-promise" blockId="orient-promise">
                By the end of this you will be able to take any kick, throw or serve and work out how long it stays
                up, how high it climbs and how far it lands. All you need to bring is speed, time, and a right-angled
                triangle.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
