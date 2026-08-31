import { describe, expect, it } from 'vitest';
import { generateApartmentCodes, generateHouseCodes } from './CreatePropertyModal';

describe('property unit generation', () => {
  it('generates alphabetical apartment codes per floor', () => {
    expect(generateApartmentCodes(2, 4)).toEqual(['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D']);
  });

  it('generates sequential house codes', () => {
    expect(generateHouseCodes(3)).toEqual(['1', '2', '3']);
  });
});
