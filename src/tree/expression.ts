import { Token } from './token.js';
import { Operator, Operators, Symbol, Symbols } from './terminal.js';

export class Expression<Type = unknown> extends Token<Type> {
    public constructor(public readonly value: Type) {
        super();
    }
}

export abstract class Literal<
    Value extends string | number | boolean | null,
> extends Expression<Value> {
    public toString(): string {
        return `${this.value}`;
    }
}

export class String extends Literal<string> {
    public constructor(value: string) {
        super(value.slice(1, -1));
    }
}

export class Number extends Literal<number> {
    public constructor(value: string) {
        super(value.startsWith('(') ? +value.slice(1, -1) : +value);
    }
}

export class Boolean extends Literal<boolean> {
    public constructor(value: string) {
        super(value.toLowerCase() === 'true');
    }
}

export class Nil extends Literal<null> {
    public constructor() {
        super(null);
    }
}

export class Identifier extends Expression<string> {
    public toString(): string {
        return `${this.value}`;
    }
}

export class Pair extends Expression<[Expression, Expression]> {
    public constructor(first: Expression, second: Expression) {
        super([first, second]);
    }
}

export class Map extends Expression<Pair[]> {
    public constructor() {
        super([]);
    }

    public push(pair: Pair): void {
        this.value.push(pair);
    }
}

export class Vector extends Expression<Expression[]> {
    public constructor() {
        super([]);
    }

    public push(expression: Expression): void {
        this.value.push(expression);
    }
}

export class ObjectMember extends Expression<[Identifier, Expression]> {
    public constructor(name: Identifier, value: Expression) {
        super([name, value]);
    }
}

export class ObjectDefinition extends Expression<ObjectMember[]> {
    public constructor() {
        super([]);
    }

    public push(member: ObjectMember): void {
        this.value.push(member);
    }
}

export class Assignment extends Expression<[Identifier, Expression]> {
    public constructor(name: Identifier, value: Expression) {
        super([name, value]);
    }
}

export abstract class Reference<Type extends Symbol | null> extends Expression<Identifier[]> {
    public constructor(public readonly type: Type) {
        super([]);
    }

    public push(identifier: Identifier): void {
        this.value.push(identifier);
    }
}

export class AbsoluteReference extends Reference<Symbol<Symbols.Dollar>> {}

export class ExternalReference extends Reference<Symbol<Symbols.Tilde>> {}

export class LocalReference extends Reference<Symbol<Symbols.Dot>> {}

export class MemberReference extends Reference<null> {}

export class BinaryExpression<Type extends Operators = Operators> extends Expression<
    [Token, Operator<Type>, Token]
> {
    public constructor(left: Token, operator: Operator<Type>, right: Token) {
        super([left, operator, right]);
    }
}

export class TernaryExpression extends Expression<[Token, Token, Token]> {
    public constructor(predicate: Token, then: Token, otherwise: Token) {
        super([predicate, then, otherwise]);
    }
}
