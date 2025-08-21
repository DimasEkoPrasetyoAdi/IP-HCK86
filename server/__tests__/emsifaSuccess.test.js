jest.mock('axios', () => ({ get: jest.fn((url) => {
  if(url.includes('/provinces')) return Promise.resolve({ data:[{ id:11, name:'ProvinceX'}] });
  if(url.includes('/regencies/11')) return Promise.resolve({ data:[{ id:1101, name:'RegencyY'}] });
  return Promise.reject(new Error('unexpected url'));
}) }));

const { getProvinces, getRegencies } = require('../services/emsifa');

describe('Emsifa success paths', () => {
  test('getProvinces returns list', async ()=>{
    const list = await getProvinces();
    expect(list[0].name).toBe('ProvinceX');
  });
  test('getRegencies returns list', async ()=>{
    const list = await getRegencies(11);
    expect(list[0].name).toBe('RegencyY');
  });
});
