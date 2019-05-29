const Orenji = require('../..');

describe('When creating orenji', () => {
  const orenji = new Orenji();
  const ctx = orenji.createContext();

  it('should return context of type object', () => {
    const ctx = orenji.createContext();
    expect(typeof ctx).toBe('object');
  });

  it('should be an instance of Orenji', () => {
    expect(ctx.app instanceof Orenji).toBeTruthy();
  });

  it('should be of type object', () => {
    expect(typeof ctx.state).toBe('object');
  });
});
