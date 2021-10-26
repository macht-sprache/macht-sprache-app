import { Suspense } from 'react';
import s from './style.module.css';

export default function TermExampleContainer({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <div className={s.container}>{children}</div>
        </Suspense>
    );
}
