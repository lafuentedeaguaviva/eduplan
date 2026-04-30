/**
 * Utility: sorting.ts
 * 
 * Centraliza la lógica de ordenamiento de arreglos de datos en la UI.
 * Implementa el "Stable Sorting" para asegurar que los elementos con el mismo
 * índice de 'orden' mantengan una posición predecible (usando el ID como tie-breaker).
 */

export interface SortableByOrder {
    id: string | number;
    orden: number;
}

/**
 * Ordena un arreglo de objetos que tengan 'id' y 'orden'.
 * Prioriza 'orden', y en caso de empate, usa 'id' de forma ascendente.
 */
export function stableSortByOrden<T extends SortableByOrder>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        if (a.orden !== b.orden) return a.orden - b.orden;
        // Tie-breaker estable usando el ID
        return Number(a.id) - Number(b.id);
    });
}
