import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePatient } from '../src/services/patientValidation.js';

test('rechaza paciente sin nombres ni apellidos', () => {
  const result = validatePatient({});
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['El nombre es obligatorio.', 'Los apellidos son obligatorios.']);
});

test('rechaza correo con formato inválido', () => {
  const result = validatePatient({ nombres: 'Ana', apellidos: 'Pérez', correo: 'no-es-correo' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('El correo no tiene un formato válido.'));
});

test('normaliza espacios y permite datos opcionales vacíos', () => {
  const result = validatePatient({ nombres: ' Ana ', apellidos: ' Pérez ' });
  assert.equal(result.valid, true);
  assert.equal(result.value.nombres, 'Ana');
  assert.equal(result.value.apellidos, 'Pérez');
  assert.equal(result.value.dni, null);
});
