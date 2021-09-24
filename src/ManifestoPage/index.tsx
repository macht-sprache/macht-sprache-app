import Header from '../Header';
import { SingleColumn } from '../Layout/Columns';
import MdxWrapper from '../MdxWrapper';

/* eslint-disable import/no-webpack-loader-syntax */
import Intro from '!babel-loader!@mdx-js/loader!./intro.en.mdx';
/* eslint-disable import/no-webpack-loader-syntax */
import About from '!babel-loader!@mdx-js/loader!./aboutus.en.mdx';
/* eslint-disable import/no-webpack-loader-syntax */
import Principles from '!babel-loader!@mdx-js/loader!./principles.en.mdx';
/* eslint-disable import/no-webpack-loader-syntax */
import Guidelines from '!babel-loader!@mdx-js/loader!./guidelines.en.mdx';

export default function ManifestoPage() {
    return (
        <>
            <Header subLine="Here is a telling sub-line">Manifesto</Header>

            <SingleColumn>
                <MdxWrapper>
                    <Intro />
                    <About />
                    <Principles />
                    <Guidelines />
                </MdxWrapper>
            </SingleColumn>
        </>
    );
}
