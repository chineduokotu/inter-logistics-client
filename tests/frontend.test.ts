// @vitest-environment happy-dom
import { act } from 'react';
import { expect, it, vi } from 'vitest';

it('renders the homepage in StrictMode when scrollTo returns a Promise', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  window.history.replaceState({}, '', '/');
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  // Some browsers return a Promise here. It must not become an effect cleanup.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => Promise.resolve() as unknown as void);
  const errors = vi.spyOn(console, 'error');
  try {
    await act(async () => {
      await import('../src/main');
    });
    expect(document.querySelector('h1')?.textContent).toContain('WE MOVE');
    expect(document.body.textContent).toContain('Start shipping');
    expect(errors.mock.calls.flat().join(' ')).not.toContain('useEffect must not return');
  } finally {
    vi.restoreAllMocks();
  }
});
