import * as fs from 'fs/promises';
import * as path from 'path';
import { Compiler } from 'webpack';

const bundlePath = path.resolve(__dirname, 'bundle');
const manifestRegex = /^manifest-(\w+)\.json$/;
const mainManifestFile = 'manifest.json';

async function buildBundles(entryFiles: Map<string, Set<string>>) {
    const files = await fs.readdir(bundlePath);
    const browserManifestFiles = files.filter(file => /^manifest-\w+\.json$/.test(file));
    const otherFiles = files.filter(file => ![...browserManifestFiles, mainManifestFile].includes(file));
    const mainManifest = JSON.parse(
        await fs.readFile(path.resolve(bundlePath, mainManifestFile), { encoding: 'utf-8' })
    );

    return Promise.all(
        browserManifestFiles.map(async file => {
            const browserName = file.match(manifestRegex)![1]!;
            const browserManifest = JSON.parse(
                await fs.readFile(path.resolve(bundlePath, file), { encoding: 'utf-8' })
            );
            const combinedMainfest = { ...mainManifest, ...browserManifest };
            const manifest = {
                ...combinedMainfest,
                content_scripts: combinedMainfest['content_scripts'].map((cs: any) => ({
                    ...cs,
                    js: cs.js?.flatMap((js: string) => {
                        const name = path.basename(js, '.js');
                        const dir = path.dirname(js);
                        const files = entryFiles.get(name);
                        return files ? Array.from(files).map(f => path.join(dir, f)) : js;
                    }),
                })),
            };
            const folderPath = path.resolve(__dirname, 'bundle-' + browserName);

            await fs.rm(folderPath, { force: true, recursive: true });
            await fs.mkdir(folderPath, { recursive: true });
            await fs.writeFile(path.resolve(folderPath, mainManifestFile), JSON.stringify(manifest, null, '  '));
            await Promise.all(
                otherFiles.map(file =>
                    fs.cp(path.resolve(bundlePath, file), path.resolve(folderPath, file), { recursive: true })
                )
            );
        })
    );
}

export class BuildBundlesPlugin {
    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tapAsync('BuildBundlesPlugin', async (compilation, callback) => {
            const entryFiles = new Map(
                Array.from(compilation.entrypoints.entries()).map(([name, entrypoint]) => {
                    const chunkFiles = entrypoint.chunks.flatMap(chunk => {
                        const asyncFiles = Array.from(chunk.getAllAsyncChunks()).flatMap(c => Array.from(c.files));
                        return [...Array.from(chunk.files), ...asyncFiles].filter(file => path.extname(file) === '.js');
                    });
                    return [name, new Set(chunkFiles)] as const;
                })
            );

            await buildBundles(entryFiles);
            callback();
        });
    }
}
