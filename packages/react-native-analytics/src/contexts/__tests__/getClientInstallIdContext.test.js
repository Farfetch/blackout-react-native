import getClientInstallIdContext, {
  ClientInstallIdDefaultKey,
} from '../getClientInstallIdContext';
import AsyncStorage from '@react-native-community/async-storage';

describe('getClientInstallIdContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should create a context function when no options are passed', async () => {
    const contextFn = getClientInstallIdContext();

    expect(typeof contextFn).toBe('function');

    const context = await contextFn();

    expect(context).toEqual(
      expect.objectContaining({
        app: { clientInstallId: expect.any(String) },
      }),
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      ClientInstallIdDefaultKey,
      expect.any(String),
    );
  });

  it('Should allow to specify the key where the clientInstallId will be stored', async () => {
    const storageKey = 'my-storage-key';

    const contextFn = getClientInstallIdContext({ storageKey });

    expect(typeof contextFn).toBe('function');

    const context = await contextFn();

    expect(context).toEqual(
      expect.objectContaining({
        app: { clientInstallId: expect.any(String) },
      }),
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      storageKey,
      expect.any(String),
    );
  });

  it('Should allow to specify a storage instance where clientInstallId will be stored', async () => {
    const DummyStorage = class {
      setItem = jest.fn();
      getItem = jest.fn();
      removeItem = jest.fn();
    };

    const storage = new DummyStorage();

    const contextFn = getClientInstallIdContext({ storage });

    expect(typeof contextFn).toBe('function');

    await contextFn();

    expect(storage.setItem).toHaveBeenCalledWith(
      ClientInstallIdDefaultKey,
      expect.any(String),
    );
  });

  it('Should return the same clientInstallId whenever called', async () => {
    const contextFn = getClientInstallIdContext();

    let context = await contextFn();

    const {
      app: { clientInstallId: previousClientInstallId },
    } = context;

    context = await contextFn();

    const {
      app: { clientInstallId: currentClientInstallId },
    } = context;

    expect(previousClientInstallId === currentClientInstallId).toBe(true);
  });
});
