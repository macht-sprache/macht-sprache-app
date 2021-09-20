import Header from '../Header';
import { SingleColumn } from '../Layout/Columns';
import TextChecker from '../TextChecker';

/* eslint-disable import/no-webpack-loader-syntax */
import Intro from '!babel-loader!@mdx-js/loader!./intro.en.mdx';
/* eslint-disable import/no-webpack-loader-syntax */
import About from '!babel-loader!@mdx-js/loader!./aboutus.en.mdx';
/* eslint-disable import/no-webpack-loader-syntax */
import Principles from '!babel-loader!@mdx-js/loader!./principles.en.mdx';

export default function ManifestoPage() {
    return (
        <>
            <Header subLine="Here is a telling sub-line">Manifesto</Header>

            <SingleColumn>
                <Intro />
                <About />
                <Principles />
                <h2>Text Checker</h2>
                <TextChecker />
            </SingleColumn>
        </>
    );
}
