/**
 * Genera un UUIDv7 con byte-order optimizado para SQL Server.
 *
 * SQL Server ordena `uniqueidentifier` por bytes [10-15, 8-9, 6-7, 4-5, 0-3].
 * Colocamos el timestamp en bytes 10-15 para que el clustered index sea secuencial.
 */
export function generateId(): string {
  const now = Date.now()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Timestamp en bytes 10-15 (donde SQL Server ordena primero)
  bytes[10] = (now / 2 ** 40) & 0xff
  bytes[11] = (now / 2 ** 32) & 0xff
  bytes[12] = (now / 2 ** 24) & 0xff
  bytes[13] = (now / 2 ** 16) & 0xff
  bytes[14] = (now / 2 ** 8) & 0xff
  bytes[15] = now & 0xff

  // UUIDv7 version (bits 48-51) y variant 2 (bits 64-65)
  bytes[6] = ((bytes[6] as number) & 0x0f) | 0x70
  bytes[8] = ((bytes[8] as number) & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
