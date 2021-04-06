import clsx from 'clsx';
import s from './style.module.css';
import Pocolit from './Logos/pocolit.svg';
import Volligohne from './Logos/volligohne.svg';
import SenatEn from './Logos/senat_en.svg';
import SenatDe from './Logos/senat_de.svg';
import { useLang } from '../../useLang';
import { langA } from '../../languages';
import { useTranslation } from 'react-i18next';

export default function Footer({ className }: { className?: string }) {
    const [lang] = useLang();
    const { t } = useTranslation();

    return (
        <footer className={clsx(s.footer, className)}>
            <div className={s.logos}>
                <LogoContainer heading={t('footer.initiatedBy')}>
                    <Logo alt="poco.lit." img={Pocolit} link="https://pocolit.com" />
                    <Logo alt="völlig ohne" img={Volligohne} link="https://volligohne.de" size="small" />
                </LogoContainer>
                <LogoContainer heading={t('footer.fundedBy')}>
                    <Logo alt={t('footer.senate')} img={lang === langA ? SenatEn : SenatDe} />
                </LogoContainer>
            </div>
        </footer>
    );
}

function LogoContainer({ children, heading }: { heading: string; children?: React.ReactNode }) {
    return (
        <div className={s.logoContainer}>
            <h3 className={s.logoHeading}>{heading}</h3>
            <div>{children}</div>
        </div>
    );
}

function Logo({
    img,
    alt,
    link,
    size = 'medium',
}: {
    img: string;
    alt: string;
    link?: string;
    size?: 'medium' | 'small';
}) {
    if (!link) {
        return (
            <div className={s.logoWrapper}>
                <img className={clsx(s.logoImg, s[size])} src={img} alt={alt} title={alt} />
            </div>
        );
    }
    return (
        <a className={s.logoWrapper} target="_blank" href={link} rel="noreferrer">
            <img className={clsx(s.logoImg, s[size])} src={img} alt={alt} title={alt} />
        </a>
    );
}
