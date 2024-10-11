import { P, match } from 'ts-pattern';

import {
    Literal,
    Expression,
    Pair,
    Vector,
    Map,
    ObjectMember,
    ObjectDefinition,
    Assignment,
    Reference,
    Identifier,
    BinaryExpression,
    TernaryExpression,
} from './tree/index.js';

export type JSON =
    | string
    | number
    | boolean
    | null
    | JSON[]
    | {
          [key: string]: JSON;
      };

const translateExpression = (expression: Expression): JSON => {
    return match(expression)
        .returnType<JSON>()
        .with(P.instanceOf(Literal), P.instanceOf(Identifier), (terminal) => terminal.value)
        .with(
            P.instanceOf(Pair),
            P.instanceOf(Vector),
            P.instanceOf(Assignment),
            P.instanceOf(ObjectMember),
            (arrayLike) => arrayLike.value.map(translateExpression),
        )
        .with(P.instanceOf(Map), P.instanceOf(ObjectDefinition), (objectLike) => {
            const object: Record<string, JSON> = {};

            for (let index = 0; index < objectLike.value.length; index += 1) {
                const [key, value] = translateExpression(objectLike.value[index]!) as [
                    string,
                    JSON,
                ];

                object[key] = value;
            }

            return object;
        })
        .with(P.instanceOf(Reference), (reference) =>
            reference.value.map(translateExpression).join('.'),
        )
        .with(P.instanceOf(BinaryExpression), (expression) =>
            [
                translateExpression(expression.value[0]),
                expression.value[1].value,
                translateExpression(expression.value[2]),
            ].join(' '),
        )
        .with(P.instanceOf(TernaryExpression), (expression) =>
            [
                translateExpression(expression.value[0]),
                '?',
                translateExpression(expression.value[1]),
                ':',
                translateExpression(expression.value[2]),
            ].join(' '),
        )
        .run();
};

export const translate = (expressions: Expression[]): JSON => {
    const json: JSON = {};

    for (let index = 0; index < expressions.length; index += 1) {
        const [key, value] = translateExpression(expressions[index]!) as [string, JSON];

        json[key] = value;
    }

    return json;
};
