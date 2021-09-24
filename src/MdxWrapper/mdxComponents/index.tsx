import Button, { ButtonAnchor, ButtonContainer } from '../../Form/Button';
import CollapsableSection from '../../Layout/CollapsableSection';
import s from './style.module.css';

const components = {
    Button,
    ButtonAnchor,
    ButtonContainer,
    CollapsableSection,
    p: ({ children }: { children: React.ReactNode }) => <p className={s.paragraph}>{children}</p>,
};

export default components;
