import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';
import { Lang, PersonToken } from '../types';

export type TranslatorEnvironment = {
    translation: {
        lang: string;
        text: string;
    };
    original: {
        lang: string;
        text: string;
    };
};

export type CheckerResult = {
    status: Status;
    translation?: {
        lang: Lang;
        text: string;
        tokens: MatchGroup[];
    };
    original?: {
        lang: Lang;
        text: string;
        tokens: PersonToken[];
    };
};

export type Status = 'loading' | 'inactive' | 'idle';

export type OnUpdate = (result: CheckerResult, openModal?: (startPos: number) => void) => void;
