import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';

function App(): React.JSX.Element {
  return (
    <MantineProvider>
      <main>
        <h1>Micro SaaS</h1>
      </main>
    </MantineProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
