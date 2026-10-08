import assert from 'node:assert/strict';
import { test } from 'node:test';
import { edgeStrength, flickerOpacity, sampleCells } from '../src/lib/retropc.ts';

test('sample every pixel, preserve alpha and handle partial edge cells', () => {
  const pixels = new Uint8ClampedArray([
    0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 0,
  ]);
  const cells = sampleCells(pixels, 3, 2, 2);
  assert.equal(cells.length, 2);
  assert.equal(cells[1]!.x, 2);
  assert.equal(cells[0]!.alpha, 1);
  assert.equal(cells[1]!.alpha, 0.5);
  assert.ok(Math.abs(cells[0]!.luminance - 0.5) < 1e-10);
  assert.ok(Math.abs(cells[1]!.luminance - 1) < 1e-10);
  assert.equal(sampleCells(new Uint8ClampedArray(4), 1, 1)[0]!.alpha, 0);
});

test('edge emphasis measures neighbors without wrapping across rows', () => {
  const cells = [0, 1, 0, 1].map(luminance => ({ luminance }));
  assert.equal(edgeStrength(cells, 0, 2), 1);
  assert.equal(edgeStrength(cells, 1, 2), 0);
  assert.equal(edgeStrength(cells, 3, 2), 0);
});

test('flicker is deterministic, varies over time and stays within 6% luminance', () => {
  const values = Array.from({ length: 100 }, (_, i) => flickerOpacity(i * 160));
  assert.ok(values.every(value => value >= 0.94 && value <= 1));
  assert.ok(new Set(values).size > 90);
  assert.equal(flickerOpacity(100), flickerOpacity(110));
});
