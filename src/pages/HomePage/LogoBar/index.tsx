import s from './style.module.css';
import PTF from './Logos/PrototypeFund.svg';
import senat from './Logos/senat_en.svg';
import wikimedia from './Logos/wikimedia-de-logo.svg';

const logos = [
    {
        img: PTF,
        label: 'Prototype Fund',
    },
    {
        img: senat,
        label: 'Senate Department of Culture and Europe Berlin',
    },
    {
        img: wikimedia,
        label: 'Wikimedia Deutschland',
    },
];

export function LogoBar() {
    return (
        <section className={s.container}>
            <div className={s.inner}>
                <h1 className={s.heading}>Supported by</h1>
                <ul className={s.logos}>
                    {logos.map(({ img, label }) => (
                        <li className={s.logoWrapper} key={img}>
                            <img className={s.logo} src={img} alt={label} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
