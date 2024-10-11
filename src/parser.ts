import { P, match } from 'ts-pattern';

import {
    AbsoluteReference,
    Assignment,
    Expression,
    ExternalReference,
    Identifier,
    Keywords,
    Literal,
    LocalReference,
    Map,
    MemberReference,
    ObjectDefinition,
    ObjectMember,
    BinaryExpression,
    Operator,
    Operators,
    Pair,
    Separators,
    Symbol,
    Symbols,
    Terminal,
    Token,
    Vector,
    Number,
    TernaryExpression,
} from './tree/index.js';

let tokens: Terminal[];
const ast: Expression[] = [];

let index = 0;

let current: Token | null;
let next: Token | null;

const skip = (steps: number) => {
    index += steps;

    // console.log(steps, current, next);

    current = tokens.at(index) || null;
    next = tokens.at(index + 1) || null;

    // console.log(steps, current, next);

    // console.log(new Error().stack!.split('\n').slice(0, -18).join('\n'));
};

enum Precedence {
    Or,
    And,
    Equality,
    Relational,
    Additive,
    Multiplicative,
    Ternary,
    Primary,
}

const parseUnaryExpression = <Expected extends Expression = Expression>(): Expected | null => {
    if (current?.value === Operators.Minus) {
        const operand = (skip(1), parseUnaryExpression()!) as Number;

        return new Number(`${-operand.value}`) as Expected;
    }

    return parsePrimaryExpression<Expected>();
};

const matchPrecedence = (operator: Operator): Precedence => {
    return match(operator.value)
        .returnType<Precedence>()
        .with(Operators.Disjunction, () => Precedence.Or)
        .with(Operators.Conjuction, () => Precedence.And)
        .with(Operators.Eq, Operators.Neq, () => Precedence.Equality)
        .with(Operators.Gt, Operators.Gte, Operators.Lt, Operators.Lte, () => Precedence.Relational)
        .with(Operators.Plus, Operators.Minus, () => Precedence.Additive)
        .with(Operators.Asterisk, Operators.Div, Operators.Modulo, () => Precedence.Multiplicative)
        .otherwise(() => Precedence.Primary);
};

const parseBinaryExpression = <Expected extends Expression = Expression>(
    precedence: Precedence,
): Expected | null => {
    let left = parseUnaryExpression();
    let operatorPrecedence: Precedence | null = null;

    while (
        current instanceof Operator &&
        (operatorPrecedence = matchPrecedence(current)) >= precedence
    ) {
        const operator = current;

        const right = (skip(1), parseBinaryExpression(operatorPrecedence + 1)!);

        if (operator.value === Operators.Ternary) {
            const otherwise = (skip(1), parseBinaryExpression(operatorPrecedence + 1)!);

            if (otherwise) {
                left = new TernaryExpression(left!, right, otherwise);
            } else {
                break;
            }
        } else if (right) {
            left = new BinaryExpression(left!, operator, right);
        } else {
            break;
        }
    }

    return left as Expected;
};

const parseExpression = <Expected extends Expression = Expression>(): Expected | null => {
    return parseBinaryExpression(Precedence.Or);
};

const parsePrimaryExpression = <Expected extends Expression = Expression>(): Expected | null => {
    return match([current, next])
        .with(
            [{ value: Symbols.Colon }, { value: Separators.BraceOpen }],
            () => (skip(2), parseExpression()),
        )
        .with(
            [P.instanceOf(Identifier), { value: Keywords.Is }],
            ([name]) => (skip(2), new Assignment(name, parseExpression()!)),
        )
        .with(
            [
                P.union(P.instanceOf(Identifier), {
                    value: P.union(Symbols.Dollar, Symbols.Tilde, Symbols.Dot),
                }),
                { value: Symbols.Slash },
            ],
            () => {
                const reference = match(current)
                    .with(
                        { value: '$' },
                        () => new AbsoluteReference(current as Symbol<Symbols.Dollar>),
                    )
                    .with(
                        { value: '~' },
                        () => new ExternalReference(current as Symbol<Symbols.Tilde>),
                    )
                    .with({ value: '.' }, () => new LocalReference(current as Symbol<Symbols.Dot>))
                    .otherwise(() => new MemberReference(null));

                if (!(reference instanceof MemberReference)) {
                    skip(2);
                }

                while (true) {
                    reference.push(current as Identifier);

                    if (next?.value === Symbols.Slash) {
                        skip(2);
                    } else {
                        return skip(1), reference;
                    }
                }
            },
        )
        .with([{ value: Keywords.Map }, { value: Separators.SqBracketOpen }], () => {
            const map = (skip(2), new Map());

            while (current?.value !== Separators.SqBracketClose) {
                const expression = parseExpression<Pair>();

                if (expression) {
                    map.push(expression);
                } else {
                    continue;
                }
            }

            return skip(1), map;
        })
        .with([{ value: Separators.SqBracketOpen }, P.any], () => {
            const vector = (skip(1), new Vector());

            while (current?.value !== Separators.SqBracketClose) {
                const expression = parseExpression();

                if (expression) {
                    vector.push(expression);
                } else {
                    continue;
                }
            }

            return skip(1), vector;
        })
        .with([P.instanceOf(Identifier), { value: Separators.BracketOpen }], () => {
            const objectDefinition = (skip(2), new ObjectDefinition());

            while (current?.value !== Separators.BracketClose) {
                const objectMember = parseExpression<ObjectMember>();

                if (objectMember) {
                    objectDefinition.push(objectMember);
                } else {
                    continue;
                }
            }

            return skip(1), objectDefinition;
        })
        .with(
            [P.instanceOf(Identifier), { value: Symbols.Eq }],
            ([identifier]) => (skip(2), new ObjectMember(identifier, parseExpression()!)),
        )
        .with([{ value: Separators.BracketOpen }, P.any], () => {
            const expression = (skip(1), parseExpression()!);

            if (current?.value === Symbols.Comma) {
                const second = (skip(1), parseExpression()!);

                if ((current as Token).value === Separators.BracketClose) {
                    return skip(1), new Pair(expression, second);
                }

                return skip(1), second;
            }

            return skip(1), expression;
        })
        .with(
            [P.union(P.instanceOf(Literal), P.instanceOf(Identifier)), P.any],
            ([terminal]) => (skip(1), terminal),
        )
        .otherwise(() => (skip(1), null)) as Expected | null;
};

export const parse = (input: Terminal[]): Expression[] => {
    tokens = input;

    current = tokens.at(0) || null;
    next = tokens.at(1) || null;

    while (current !== null) {
        const expression = parseExpression();

        if (expression) {
            ast.push(expression);
        }
    }

    index = 0;

    return ast.splice(0, ast.length);
};
