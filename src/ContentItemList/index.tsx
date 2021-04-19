import { orderBy } from 'lodash';
import {
    CommentItemLinkWrapper,
    TermItemLinkWrapper,
    TranslationExampleItemLinkWrapper,
    TranslationItemLinkWrapper,
} from '../ContentItemLinkWrapper';
import { Comment, Term, Translation, TranslationExample } from '../types';
import s from './style.module.css';

type ItemType =
    | {
          type: 'Comment';
          item: Comment;
      }
    | {
          type: 'Translation';
          item: Translation;
      }
    | {
          type: 'TranslationExample';
          item: TranslationExample;
      }
    | {
          type: 'Term';
          item: Term;
      };

export function ContentItemList({
    comments = [],
    translations = [],
    translationExamples = [],
    terms = [],
}: {
    comments?: Comment[];
    translations?: Translation[];
    translationExamples?: TranslationExample[];
    terms?: Term[];
}) {
    const items: ItemType[] = [
        ...comments.map(comment => ({ type: 'Comment', item: comment } as ItemType)),
        ...translations.map(translation => ({ type: 'Translation', item: translation } as ItemType)),
        ...translationExamples.map(
            translationExample => ({ type: 'TranslationExample', item: translationExample } as ItemType)
        ),
        ...terms.map(term => ({ type: 'Term', item: term } as ItemType)),
    ];

    const sortedItems = orderBy(items, item => {
        return -item.item.createdAt.toMillis();
    });

    return (
        <div className={s.container}>
            {sortedItems.map(item => {
                if (item.type === 'Comment') {
                    return <CommentItemLinkWrapper key={item.item.id} comment={item.item} />;
                }
                if (item.type === 'Term') {
                    return <TermItemLinkWrapper key={item.item.id} term={item.item} />;
                }
                if (item.type === 'Translation') {
                    return <TranslationItemLinkWrapper key={item.item.id} translation={item.item} />;
                }
                if (item.type === 'TranslationExample') {
                    return <TranslationExampleItemLinkWrapper key={item.item.id} translationExample={item.item} />;
                }

                return null;
            })}
        </div>
    );
}
