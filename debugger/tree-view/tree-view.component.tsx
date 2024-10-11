import { P, match } from 'ts-pattern';
import { FC, createContext, useContext, useState } from 'react';

import { Pair, Token } from 'src';

import * as Styled from './tree-view.styles';

const Level = createContext(0);

const TreeNode: FC<{ node: Token }> = ({ node }) => {
    const level = useContext(Level);

    const [open, toggle] = useState(
        Array.isArray(node.value)
            ? match(node)
                  .with(P.instanceOf(Pair), () => true)
                  .otherwise(() => (node.value as Token[]).length === 1)
            : true,
    );

    return (
        <Level.Provider value={level + 1}>
            <details
                key={Math.random().toString(32)}
                open={open}
                onToggle={(event) => toggle(event.currentTarget.open)}
                style={{ backgroundColor: `rgba(0, 0, 0, ${level / 200})` }}
            >
                <summary>{node?.constructor.name}</summary>

                {open &&
                    (Array.isArray(node.value) ? (
                        <TreeView nodes={node.value} />
                    ) : (
                        node?.toString()
                    ))}
            </details>
        </Level.Provider>
    );
};

const TreeView: FC<{ nodes: Token[] }> = ({ nodes }) => {
    return (
        <Styled.Tree>
            {nodes.map((node) => (
                <TreeNode key={Math.random().toString(32)} node={node} />
            ))}
        </Styled.Tree>
    );
};

export default TreeView;
