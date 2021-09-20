import s from './style.module.css';

const components = {
    p: ({ children }: { children: React.ReactNode }) => <p className={s.paragraph}>{children}</p>,
};

export default components;
