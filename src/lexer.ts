import {
    Token,
    Keyword,
    Operator,
    Symbol,
    Identifier,
    Separator,
    String,
    Number,
    Nil,
    Boolean,
    Terminal,
} from './tree/index.js';

export const sanitize = (input: string): string => {
    return (
        input
            // remove inline comments
            .replace(/\/\/.*$/gm, '')
            // remove newlines
            .replace(/\n/gm, '')
            // remove block comments
            .replace(/([/(]\*)[^}]*(\*[/)])/g, '')
            // dunno what to do with it
            .replace(/GUID:/g, '')
    );
};

const match = <T extends Terminal>(
    sample: string,
    token: new (value: any) => T,
    regExp: RegExp,
): [T | null, number] => {
    const match = sample.match(regExp)?.[0];

    return match ? [new token(match), match.length] : [null, 1];
};

const matchers: Array<[new (value: string) => Token, RegExp]> = [
    // string, GUID
    [String, /^[{"'].*?["'}]/],
    // integer, float
    [Number, /^((\d+(\.\d*)?|\.\d+)|(\((\d+(\.\d*)?|\.\d+)\)))/],
    [Separator, /^[()[\]{}]/],
    [Symbol, /^[$\/.~,<>:=]/],
    [Operator, /^([-+*|%&?]|(\=\=)|(!\=)|(>\=)|(<\=)|(div\b))/i],
    [Nil, /^(nil)\b/i],
    [Boolean, /^(true|false)\b/i],
    [Keyword, /^(export|is|template|unnamed|private|map)\b/i],
    [Identifier, /^[a-zA-Z_][a-zA-Z0-9_]*/],
];

export const tokenize = (input: string): Token[] => {
    const tokens: Token[] = [];

    let index = 0;

    while (index < input.length) {
        const sample = input.slice(index);
        let token: Token | null = null;
        let advanceFor!: number;

        matchers.some((matcher) => ([token, advanceFor] = match(sample, ...matcher))[0]);

        if (token) {
            tokens.push(token);
        }

        index += advanceFor;
    }

    return tokens;
};
