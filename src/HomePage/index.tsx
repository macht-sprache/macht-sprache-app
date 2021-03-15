import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '../Header';
import { ColumnHeading, Columns } from '../Layout/Columns';
import { TERMS } from '../routes';
import { useWpPage } from '../useWpHooks';
import s from './style.module.css';

const ABOUT_SLUGS = {
    en: 'about-macht-sprache-short-version-landing-page',
    de: 'ueber-macht-sprache-kurzversion-startseite',
};

export default function Home() {
    const { t } = useTranslation();
    const { response } = useWpPage(ABOUT_SLUGS);

    return (
        <>
            <Header>macht.sprache.</Header>
            <Columns>
                <div className={s.introText}>
                    <ColumnHeading>{t('common.entities.term.value_plural')}</ColumnHeading>
                    <p>{t('home.termDescription')}</p>
                    [here there will be the terms of the week]
                    <p>
                        <Link to={TERMS}>to the terms</Link>
                    </p>
                </div>
                <div>
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <div
                        className={s.introText}
                        dangerouslySetInnerHTML={{ __html: response ? response.body : t('common.loading') }}
                    />
                </div>
            </Columns>
        </>
    );
}
