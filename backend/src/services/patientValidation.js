export function validatePatient(input = {}) {
  const errors = [];
  const nombres = typeof input.nombres === 'string' ? input.nombres.trim() : '';
  const apellidos = typeof input.apellidos === 'string' ? input.apellidos.trim() : '';
  if (!nombres) errors.push('El nombre es obligatorio.');
  if (!apellidos) errors.push('Los apellidos son obligatorios.');
  if (input.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.correo)) errors.push('El correo no tiene un formato válido.');
  return { valid: errors.length === 0, errors, value: { nombres, apellidos, dni: input.dni?.trim() || null, telefono: input.telefono?.trim() || null, correo: input.correo?.trim() || null, fecha_nacimiento: input.fecha_nacimiento || null, condicion: input.condicion?.trim() || null } };
}
