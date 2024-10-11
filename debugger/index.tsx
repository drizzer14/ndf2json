import { createRoot } from 'react-dom/client';

import App from './app.component';

const root = createRoot(document.querySelector('#root')!);
root.render(<App />);
