import styled from 'styled-components';

export const Tree = styled.div`
    display: flex;

    width: 100%;

    details {
        display: flex;
        justify-content: center;
        flex: 1 1 100%;

        padding: 16px;

        text-align: center;

        &:not([open]) {
            color: grey;
        }
    }

    summary {
        cursor: pointer;
        font-weight: bold;

        list-style: none;

        &::-webkit-details-marker {
            display: none;
        }
    }
`;
