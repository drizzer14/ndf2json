import styled, { createGlobalStyle } from 'styled-components';

export const Root = createGlobalStyle`
    /*
    Josh's Custom CSS Reset
    https://www.joshwcomeau.com/css/custom-css-reset/
  */

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    * {
        margin: 0;
    }

    html {
        height: 100%;
        font-size: 18px;
        font-family: Oxanium;
    }

    body {
        height: 100%;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
    }

    #root {
        height: 100%;
    }

    img,
    picture,
    video,
    canvas,
    svg {
        display: block;
        max-width: 100%;
    }

    input,
    button,
    textarea,
    select {
        font: inherit;
    }

    span,
    p,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        overflow-wrap: break-word;
    }

    ol,
    ul {
        list-style: none;
    }

    #root {
        isolation: isolate;
    }

    * {
        margin: 0;
        padding: 0;
    }
`;

export const Main = styled.main`
    display: flex;

    width: 100%;
    height: 100%;

    font-family: monospace;
`;

export const Input = styled.textarea`
    flex: 1 0 25%;

    padding: 24px;

    resize: none;

    border: none;
    border-right: 2px solid black;
`;

export const Output = styled.div`
    flex: 1 0 75%;

    padding: 24px;

    white-space: pre-wrap;
    overflow-y: auto;
`;

export const Parse = styled.button`
    position: absolute;
    top: 24px;
    left: 25%;

    transform: translateX(calc(-50% - 54px));
`;
