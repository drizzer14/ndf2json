import chalk from 'chalk';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const parseBuildTsconfigJSON = async (compilerOptions) => {
    try {
        const buildTsconfigPath = resolve('tsconfig.build.json');
        const buildTsconfig = readFileSync(buildTsconfigPath, 'utf-8').toString();
        const parsedBuildTsconfig = JSON.parse(buildTsconfig);

        const { module, target, moduleResolution, lib } = parsedBuildTsconfig.compilerOptions;

        return { module, target, moduleResolution, lib };
    } catch (error) {
        throw new Error(chalk.red('tsconfig.json: Unable to parse tsconfig.build.json'), {
            cause: error,
        });
    }
};

const createPublishTsconfigJSON = async (compilerOptions) => {
    try {
        const publishTsconfigPath = resolve('lib', 'tsconfig.json');
        const publishTsconfig = JSON.stringify({ compilerOptions }, null, 4);

        writeFileSync(publishTsconfigPath, publishTsconfig, { encoding: 'utf-8' });
    } catch (error) {
        throw new Error(chalk.red('tsconfig.json: Unable to create publish tsconfig.json'), {
            cause: error,
        });
    }
};

await parseBuildTsconfigJSON()
    .then(createPublishTsconfigJSON)
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .then(() => {
        console.log(
            chalk.green('\ntsconfig.json: Publish tsconfig.json file successfully created!\n'),
        );
    });
