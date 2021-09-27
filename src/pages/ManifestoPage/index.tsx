/* eslint-disable import/no-webpack-loader-syntax */

import Header from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import MdxWrapper from '../../components/MdxWrapper';

import Intro from '!babel-loader!@mdx-js/loader!../../Manifesto/intro.en.mdx';
import About from '!babel-loader!@mdx-js/loader!../../Manifesto/aboutus.en.mdx';
import Principles from '!babel-loader!@mdx-js/loader!../../Manifesto/principles.en.mdx';
import Guidelines from '!babel-loader!@mdx-js/loader!../../Manifesto/guidelines.en.mdx';

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
