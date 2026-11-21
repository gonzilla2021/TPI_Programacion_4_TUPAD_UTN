export const dinero = (valor: number) =>
  valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
