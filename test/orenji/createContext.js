const Orenji = require('../..');

describe('orenji.createContext', () => {
  const orenji = new Orenji();

  it('should return context of type object', () => {
    const ctx = orenji.createContext();
    expect(typeof ctx).toBe('object');
  });
});

describe('orenji.createContext.app', () => {
  const orenji = new Orenji();
  const ctx = orenji.createContext();

  it('should be an instance of Orenji', () => {
    expect(ctx.app instanceof Orenji).toBeTruthy();
  });
});

describe('orenji.createContext.state', () => {
  const orenji = new Orenji();
  const ctx = orenji.createContext();

  it('should be of type object', () => {
    expect(typeof ctx.state).toBe('object');
  });
});
