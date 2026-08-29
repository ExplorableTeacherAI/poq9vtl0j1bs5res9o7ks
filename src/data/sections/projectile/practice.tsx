import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineClozeInput, InlineFeedback } from "@/components/atoms";
import { getVariableInfo, clozePropsFromDefinition } from "../../variables";

export const projectilePracticeBlocks: ReactElement[] = [
    <StackLayout key="layout-practice-heading" maxWidth="xl">
        <Block id="practice-heading" padding="md">
            <EditableH2 id="h2-practice-heading" blockId="practice-heading">
                Your turn on the field
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-scenario" maxWidth="xl">
        <Block id="practice-scenario" padding="sm">
            <EditableParagraph id="para-practice-scenario" blockId="practice-scenario">z</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-time" maxWidth="xl">
        <Block id="practice-question-time" padding="sm">
            <EditableParagraph id="para-practice-question-time" blockId="practice-question-time">/Gravity takes  off the climb every second, so the ball stops rising after <InlineFeedback varName={"answerPracticeClimbTime"} correctValue={["2", "2 s", "2s"]} caseSensitive={false} position={"mid"} hint={"How many bites of 10 m/s fit into 20 m/s"} reviewBlockId={"flight-insight"} reviewLabel={"Revisit the climb"}><InlineClozeInput varName={"answerPracticeClimbTime"} correctAnswer={["2", "2 s", "2s"]} placeholder={"???"} color={"#8E90F5"} bgColor={"rgba(142, 144, 245, 0.15)"} caseSensitive={false} id={"cloze-1787989849051-tyule"} /></InlineFeedback> seconds, and the whole flight therefore lasts <InlineFeedback varName={"answerPracticeFlightTime"} correctValue={["4", "4 s", "4s"]} caseSensitive={false} position={"terminal"} successMessage={"— spot on, the fall mirrors the climb exactly, so the two halves take the same time"} failureMessage={"— not yet."} hint={"Coming down takes just as long as going up"} reviewBlockId={"flight-insight"} reviewLabel={"Revisit the climb"}><InlineClozeInput varName={"answerPracticeFlightTime"} correctAnswer={["4", "4 s", "4s"]} placeholder={"???"} color={"#8E90F5"} bgColor={"rgba(142, 144, 245, 0.15)"} caseSensitive={false} id={"cloze-1787989849051-scidg"} /></InlineFeedback> seconds.</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-height" maxWidth="xl">
        <Block id="practice-question-height" padding="sm">
            <EditableParagraph id="para-practice-question-height" blockId="practice-question-height">
                Its upward speed slides evenly from 20 m/s down to nothing during the climb, which lifts the ball to a
                peak of{" "}
                <InlineFeedback
                    varName="answerPracticeMaxHeight"
                    correctValue={["20", "20 m", "20m"]}
                    position="terminal"
                    successMessage="— exactly, an average climb speed of 10 m/s kept up for 2 seconds"
                    failureMessage="— have another go."
                    hint="Halfway between 20 m/s and 0 m/s is the average speed of the climb"
                    reviewBlockId="flight-insight"
                    reviewLabel="Revisit the peak"
                >
                    <InlineClozeInput
                        varName="answerPracticeMaxHeight"
                        correctAnswer={["20", "20 m", "20m"]}
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeMaxHeight'))}
                    />
                </InlineFeedback>{" "}
                metres.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-range" maxWidth="xl">
        <Block id="practice-question-range" padding="sm">
            <EditableParagraph id="para-practice-question-range" blockId="practice-question-range">
                Nothing slows the forward part, so all the way through the flight it keeps sailing on at 15 m/s and
                the clearance finally bounces{" "}
                <InlineFeedback
                    varName="answerPracticeRange"
                    correctValue={["60", "60 m", "60m"]}
                    position="terminal"
                    successMessage="— brilliant, steady forward speed multiplied by the full time in the air"
                    failureMessage="— close, but check the time you use."
                    hint="Use the whole flight, not just the climb"
                    reviewBlockId="range-insight"
                    reviewLabel="Revisit the range idea"
                >
                    <InlineClozeInput
                        varName="answerPracticeRange"
                        correctAnswer={["60", "60 m", "60m"]}
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeRange'))}
                    />
                </InlineFeedback>{" "}
                metres down the pitch.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
