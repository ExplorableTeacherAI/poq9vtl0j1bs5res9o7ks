/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // PROJECTILE MOTION LESSON
    // ========================================

    // --- Section 2: two journeys at once (drop vs kick race) ---
    twoMotionsKickSpeed: {
        defaultValue: 4,
        type: 'number',
        label: 'Sideways kick speed',
        description: 'Horizontal launch speed of the kicked ball as it leaves the ledge',
        unit: 'm/s',
        min: 2,
        max: 7,
        step: 0.5,
        color: '#62D0AD',
    },
    twoMotionsGuessHeight: {
        defaultValue: 1.2,
        type: 'number',
        label: 'Predicted height of the kicked ball',
        description: 'Student prediction, in metres, of where the kicked ball is when the dropped ball lands',
        unit: 'm',
        min: 0,
        max: 1.8,
        step: 0.05,
        color: '#F7B23B',
    },
    twoMotionsPlaying: {
        defaultValue: false,
        type: 'boolean',
        label: 'Race running',
        description: 'True while the drop-versus-kick race is animating',
    },
    twoMotionsLanded: {
        defaultValue: 0,
        type: 'number',
        label: 'Race finished',
        description: 'Set to 1 once both balls have reached the ground',
        min: 0,
        max: 1,
        step: 1,
    },
    twoMotionsHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Race figure highlight',
        description: 'Which path is highlighted in the race figure: drop or kick',
        color: '#334155',
        bgColor: 'rgba(51, 65, 85, 0.15)',
    },
    answerTwoMotionsLanding: {
        defaultValue: '',
        type: 'select',
        label: 'Race question: landing order',
        description: 'Does a horizontally thrown ball land before, with, or after a dropped one',
        placeholder: '???',
        correctAnswer: 'at the same time as',
        options: ['before', 'at the same time as', 'after'],
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.15)',
    },
    answerTwoMotionsDistance: {
        defaultValue: '',
        type: 'text',
        label: 'Race question: horizontal distance',
        description: 'How far from the wall the thrown ball lands',
        placeholder: '???',
        correctAnswer: ['30', '30 m', '30m'],
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.15)',
    },

    // --- Section 3: splitting the kick into two parts ---
    splittingForwardSpeed: {
        defaultValue: 17.3,
        type: 'number',
        label: 'Forward part of the kick',
        description: 'Horizontal component of the launch velocity, in m/s',
        unit: 'm/s',
        min: 2,
        max: 20,
        step: 0.1,
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    splittingUpSpeed: {
        defaultValue: 10,
        type: 'number',
        label: 'Upward part of the kick',
        description: 'Vertical component of the launch velocity, in m/s',
        unit: 'm/s',
        min: 0.5,
        max: 12,
        step: 0.1,
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.18)',
    },
    splittingHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Kick figure highlight',
        description: 'Which arrow is highlighted: forward, up or launch',
        color: '#334155',
        bgColor: 'rgba(51, 65, 85, 0.15)',
    },
    splittingExplored: {
        defaultValue: 0,
        type: 'number',
        label: 'Kick figure explored',
        description: 'Set to 1 once the student has dragged one of the component arrows',
        min: 0,
        max: 1,
        step: 1,
    },
    answerSplittingForwardPart: {
        defaultValue: '',
        type: 'text',
        label: 'Basketball forward part',
        description: 'Horizontal component of a 10 m/s launch at 60 degrees',
        placeholder: '???',
        correctAnswer: ['5', '5 m/s', '5m/s'],
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.15)',
    },
    answerSplittingFortyFive: {
        defaultValue: '',
        type: 'select',
        label: 'Forty five degree comparison',
        description: 'How the two parts compare at a 45 degree launch',
        placeholder: '???',
        correctAnswer: 'exactly equal',
        options: ['mostly forward', 'exactly equal', 'mostly upward'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.15)',
    },

    // --- Section 4: how long, how high (the vertical story) ---
    flightUpSpeed: {
        defaultValue: 10,
        type: 'number',
        label: 'Upward launch speed',
        description: 'Vertical launch speed for the climb figure, in m/s',
        unit: 'm/s',
        min: 6,
        max: 12,
        step: 0.5,
        color: '#62D0AD',
    },
    flightTime: {
        defaultValue: 0,
        type: 'number',
        label: 'Scrubbed flight time',
        description: 'Where the student has scrubbed to in the flight, in seconds',
        unit: 's',
        min: 0,
        max: 2.4,
        step: 0.01,
        color: '#334155',
    },
    flightHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Climb figure highlight',
        description: 'Which arrow is highlighted: velocity or gravity',
        color: '#334155',
        bgColor: 'rgba(51, 65, 85, 0.15)',
    },
    flightExplored: {
        defaultValue: 0,
        type: 'number',
        label: 'Climb figure explored',
        description: 'Set to 1 once the student has scrubbed the climb',
        min: 0,
        max: 1,
        step: 1,
    },
    answerFlightServeTime: {
        defaultValue: '',
        type: 'text',
        label: 'Serve: time to the top',
        description: 'Seconds for a 15 m/s climb to be cancelled by gravity',
        placeholder: '???',
        correctAnswer: ['1.5', '1.5 s', '1.5s'],
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.15)',
    },
    answerFlightTopPull: {
        defaultValue: '',
        type: 'select',
        label: 'Pull of gravity at the top',
        description: 'What gravity is doing at the highest point of a throw',
        placeholder: '???',
        correctAnswer: 'just as strong as ever',
        options: ['gone for an instant', 'just as strong as ever', 'pushing the ball upward'],
        color: '#F7B23B',
        bgColor: 'rgba(247, 178, 59, 0.15)',
    },

    // --- Practice section answers (Your turn on the field) ---
    answerPracticeClimbTime: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: time to reach the top',
        description: 'Seconds for the upward speed of 20 m/s to be cancelled by gravity',
        placeholder: '???',
        correctAnswer: ['2', '2 s', '2s'],
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.15)',
    },
    answerPracticeFlightTime: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: total time of flight',
        description: 'Total seconds in the air for the clearance',
        placeholder: '???',
        correctAnswer: ['4', '4 s', '4s'],
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.15)',
    },
    answerPracticeMaxHeight: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: maximum height',
        description: 'Peak height in metres for the clearance',
        placeholder: '???',
        correctAnswer: ['20', '20 m', '20m'],
        color: '#F7B23B',
        bgColor: 'rgba(247, 178, 59, 0.15)',
    },
    answerPracticeRange: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: range',
        description: 'Horizontal distance in metres for the clearance',
        placeholder: '???',
        correctAnswer: ['60', '60 m', '60m'],
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.15)',
    },

    // ========================================
    // ADD YOUR VARIABLES HERE
    // ========================================

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
