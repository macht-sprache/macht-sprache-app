import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';
import { Lang } from '../types';

export type TranslatorEnvironment = {
    lang?: string;
    text?: string;
    originalLang?: string;
    originalText?: string;
};

export type CheckerResult = {
    status: Status;
    text?: string;
    matches?: MatchGroup[];
    lang?: Lang;
};

export type Status = 'loading' | 'inactive' | 'idle';

export type OnUpdate = (result: CheckerResult, openModal?: (startPos: number) => void) => void;
