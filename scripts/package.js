import chalk from 'chalk';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const parseRootPackageJSON = async () => {
    console.log(chalk.yellow('\npackage.json: Creating publish package.json file...\n'));

    try {
        const rootPackageJSONPath = resolve('package.json');
        const rootPackageJSON = readFileSync(rootPackageJSONPath, 'utf-8').toString();
        const parsedRootPackageJSON = JSON.parse(rootPackageJSON);

        const {
            name,
            description,
            version,
            author,
            repository,
            type,
            sideEffects,
            module,
            types,
            dependencies,
        } = parsedRootPackageJSON;

        return {
            name,
            description,
            version,
            author,
            repository,
            type,
            sideEffects,
            module,
            types,
            dependencies,
        };
    } catch (error) {
        throw new Error(chalk.red('package.json: Unable to parse root package.json'), {
            cause: error,
        });
    }
};

const createPublishPackageJSON = async (rootPackageJSON) => {
    try {
        const publishPackageJSONPath = resolve('lib', 'package.json');
        const publishPackageJSON = JSON.stringify(
            {
                ...rootPackageJSON,
                exports: {
                    '.': './index.js',
                },
            },
            null,
            4,
        );

        writeFileSync(publishPackageJSONPath, publishPackageJSON, { encoding: 'utf-8' });
    } catch (error) {
        throw new Error(chalk.red('package.json: Unable to create publish package.json'), {
            cause: error,
        });
    }
};

await parseRootPackageJSON()
    .then(createPublishPackageJSON)
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .then(() => {
        console.log(
            chalk.green('\npackage.json: Publish package.json file successfully created!\n'),
        );
    });
