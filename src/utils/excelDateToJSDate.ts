export default function excelDateToJSDate(serial: number): string {

  const excelEpoch = new Date(1899, 11, 30); // Excel "día 0" es 30/12/1899
  const days = Math.floor(serial);
  
  const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString() // devuelve 'YYYY-MM-DD'
}