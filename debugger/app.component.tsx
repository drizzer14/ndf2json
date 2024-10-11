import { compose } from 'fnts';
import JSONView from 'react-json-view';
import { FC, useState, useDeferredValue, useCallback, Suspense } from 'react';

import { sanitize, tokenize, parse, translate, type JSON } from 'src';

import * as Styled from './app.styles';

const App: FC = () => {
    const [input, setInput] = useState('');

    const [json, setJSON] = useState<JSON>({});

    const deferredJSON = useDeferredValue(json);

    const onParse = useCallback((): void => {
        setJSON(compose(compose(translate, parse), compose(tokenize, sanitize), input));
    }, [input]);

    return (
        <>
            <Styled.Main>
                <Styled.Parse onClick={onParse}>Parse</Styled.Parse>

                <Styled.Input value={input} onChange={(event) => setInput(event.target.value)} />

                <Styled.Output>
                    {/* <TreeView nodes={deferredAST} /> */}
                    <Suspense fallback="...">
                        <JSONView name="NDF" src={deferredJSON as any} collapsed />
                    </Suspense>
                </Styled.Output>
            </Styled.Main>

            <Styled.Root />
        </>
    );
};

export default App;
