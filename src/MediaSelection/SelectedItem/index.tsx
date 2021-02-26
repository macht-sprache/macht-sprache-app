import { useEffect, useRef } from 'react';
import Button from '../../Form/Button';
import { Lang } from '../../types';
import s from './style.module.css';

type Props<T> = {
    item: T;
    onCancel: () => void;
    coverComponent: React.ComponentType<{ item: T; className?: string }>;
    surTitle?: React.ReactNode;
    metaInfo: React.ReactNode;
    cancelLabel: string;
};

export default function SelectedItem<T extends { title: string; lang: Lang }>({
    item,
    onCancel,
    coverComponent: Cover,
    surTitle,
    metaInfo,
    cancelLabel,
}: Props<T>) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (item) {
            cancelButtonRef.current?.focus();
        }
    }, [item]);

    return (
        <div className={s.selected}>
            <Cover item={item} />
            <div className={s.selectedMeta}>
                {surTitle && <div>{surTitle}</div>}
                <h3 lang={item.lang} className={s.selectedHeading}>
                    {item.title}
                </h3>
                <div className={s.selectedMetaBottom}>
                    {metaInfo}
                    <div className={s.selectedCancelButtonInline}>
                        <Button onClick={onCancel} size="small" ref={cancelButtonRef}>
                            {cancelLabel}
                        </Button>
                    </div>
                </div>
            </div>
            <button
                className={s.selectedCancelButton}
                onClick={onCancel}
                title={cancelLabel}
                aria-hidden="true"
                tabIndex={-1}
            ></button>
        </div>
    );
}
