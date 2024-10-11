import { Token } from './token.js';

export abstract class Terminal<Value = unknown> extends Token<Value> {
    public constructor(public readonly value: Value) {
        super();
    }

    public toString(): string {
        return `${this.value}`;
    }
}

export enum Keywords {
    Export = 'export',
    Is = 'is',
    Template = 'template',
    Unnamed = 'unnamed',
    Private = 'private',
    Map = 'map',
}

export class Keyword<Value extends Keywords = Keywords> extends Terminal<Value> {
    public constructor(value: string) {
        super(value.toLowerCase() as Value);
    }
}

export enum Operators {
    Plus = '+',
    Minus = '-',
    Asterisk = '*',
    Div = 'div',
    Modulo = '%',
    Eq = '==',
    Neq = '!=',
    Gt = '>',
    Gte = '>=',
    Lt = '<',
    Lte = '<=',
    Conjuction = '&',
    Disjunction = '|',
    Ternary = '?',
}

export class Operator<Value extends Operators = Operators> extends Terminal<Value> {
    public constructor(value: string) {
        super(value.toLowerCase() as Value);
    }
}

export enum Separators {
    BracketOpen = '(',
    BracketClose = ')',
    SqBracketOpen = '[',
    SqBracketClose = ']',
    BraceOpen = '{',
    BraceClose = '}',
}

export class Separator<Value extends Separators = Separators> extends Terminal<Value> {}

export enum Symbols {
    Dollar = '$',
    Tilde = '~',
    Dot = '.',
    Comma = ',',
    Slash = '/',
    ArrowRight = '>',
    ArrowLeft = '<',
    Colon = ':',
    Eq = '=',
}

export class Symbol<Value extends Symbols = Symbols> extends Terminal<Value> {}
