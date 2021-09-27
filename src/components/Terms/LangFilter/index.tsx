import { useTranslation } from 'react-i18next';
import { HorizontalRadio, HorizontalRadioContainer } from '../../Form/HorizontalRadio';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';

type LangFilterProps = {
    setLangFilter: (lang: Lang | undefined) => void;
    langFilter?: Lang;
};

export function LangFilter({ setLangFilter, langFilter }: LangFilterProps) {
    const { t } = useTranslation();

    const langFilters: { value?: Lang; label: string; longLabel: string }[] = [
        {
            label: t('nav.filter.all.label'),
            longLabel: t('nav.filter.all.longLabel'),
        },
        {
            value: langB,
            label: langB.toUpperCase(),
            longLabel: t(`nav.filter.${langB}.longLabel` as const),
        },
        {
            value: langA,
            label: langA.toUpperCase(),
            longLabel: t(`nav.filter.${langA}.longLabel` as const),
        },
    ];

    return (
        <HorizontalRadioContainer>
            {langFilters.map(({ value, label, longLabel }) => (
                <HorizontalRadio
                    key={value ?? ''}
                    value={value ?? ''}
                    label={label}
                    name="language_nav_main"
                    checked={value === langFilter}
                    aria-label={longLabel}
                    onChange={() => {
                        setLangFilter(value);
                    }}
                    background={value || 'striped'}
                />
            ))}
        </HorizontalRadioContainer>
    );
}
