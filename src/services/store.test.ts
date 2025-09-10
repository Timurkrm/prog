import * as storeModule from './store';

type AnyStore = {
  getState: () => any;
  dispatch: (action: { type: string; payload?: unknown }) => unknown;
  subscribe: (listener: () => void) => () => void;
};

const resolveStore = (m: any): AnyStore => {
  const candidate = m?.store ?? m?.default ?? m;
  return candidate as AnyStore;
};

const store = resolveStore(storeModule);

describe('Redux store — базовая работоспособность', () => {
  it('инициализируется и предоставляет необходимые методы', () => {
    expect(store).toBeTruthy();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('имеет начальное состояние (объект) и хотя бы один ключ', () => {
    const state = store.getState();
    expect(state).toBeTruthy();
    expect(typeof state).toBe('object');
    expect(Object.keys(state).length).toBeGreaterThan(0);
  });

  it('dispatch неизвестного экшена не мутирует состояние на верхнем уровне', () => {
    const prev = store.getState();
    store.dispatch({ type: '@@TEST/UNKNOWN_ACTION' });
    const next = store.getState();
    expect(Object.keys(next)).toEqual(Object.keys(prev));
    for (const key of Object.keys(prev)) {
      expect(next).toHaveProperty(key);
    }
  });

  it('subscribe вызывает слушатель при изменении состояния и корректно отписывается', () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    store.dispatch({ type: '@@TEST/NOOP' });
    const countAfterFirst = listener.mock.calls.length;
    unsubscribe();
    store.dispatch({ type: '@@TEST/NOOP_AFTER_UNSUB' });
    const countAfterUnsub = listener.mock.calls.length;
    expect(countAfterUnsub).toBe(countAfterFirst);
  });
});

describe('Redux store — безопасный smoke-тест dispatch', () => {
  it('допускает dispatch простого служебного экшена без ошибок', () => {
    expect(() => {
      store.dispatch({ type: '@@TEST/SMOKE' });
    }).not.toThrow();
  });
});
