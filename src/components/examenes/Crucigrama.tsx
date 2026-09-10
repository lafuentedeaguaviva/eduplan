"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface CrucigramaItem {
  palabra: string;
  pista: string;
}

interface CrucigramaProps {
  items: CrucigramaItem[];
}

type Direction = "across" | "down";

interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  dir: Direction;
  number: number;
}

interface GridCell {
  char: string;
  number?: number;
}

export function Crucigrama({ items }: CrucigramaProps) {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);

  useEffect(() => {
    generateCrossword();
  }, [items]);

  const generateCrossword = () => {
    // 1. Limpiar y ordenar palabras (la más larga primero)
    const cleanedItems = items.map(item => ({
      ...item,
      palabra: item.palabra.toUpperCase().replace(/[^A-Z]/g, "")
    })).filter(i => i.palabra.length > 0).sort((a, b) => b.palabra.length - a.palabra.length);

    if (cleanedItems.length === 0) return;

    const MAX_SIZE = 40;
    const initialGrid = Array(MAX_SIZE).fill(null).map(() => Array(MAX_SIZE).fill(null));
    const placed: PlacedWord[] = [];

    // Colocar la primera palabra en el centro, horizontal
    const first = cleanedItems[0];
    const startRow = Math.floor(MAX_SIZE / 2);
    const startCol = Math.floor((MAX_SIZE - first.palabra.length) / 2);

    for (let i = 0; i < first.palabra.length; i++) {
      initialGrid[startRow][startCol + i] = first.palabra[i];
    }
    placed.push({ word: first.palabra, clue: first.pista, row: startRow, col: startCol, dir: "across", number: 1 });

    // Intentar colocar el resto
    let counter = 2;
    for (let i = 1; i < cleanedItems.length; i++) {
      const current = cleanedItems[i];
      let bestPlacement = null;

      // Buscar posibles cruces con letras ya colocadas
      for (let pIdx = 0; pIdx < placed.length; pIdx++) {
        const pWord = placed[pIdx];
        const newDir: Direction = pWord.dir === "across" ? "down" : "across";

        for (let j = 0; j < pWord.word.length; j++) {
          const matchChar = pWord.word[j];
          const matchIndices = getCharIndices(current.palabra, matchChar);

          for (const matchIdx of matchIndices) {
            // Calcular posición de inicio hipotética
            const r = pWord.dir === "across" ? pWord.row - matchIdx : pWord.row + j;
            const c = pWord.dir === "across" ? pWord.col + j : pWord.col - matchIdx;

            if (canPlaceCrossword(current.palabra, r, c, newDir, initialGrid, MAX_SIZE)) {
              bestPlacement = { r, c, dir: newDir };
              break; // Romper en el primer encaje válido
            }
          }
          if (bestPlacement) break;
        }
        if (bestPlacement) break;
      }

      if (bestPlacement) {
        const { r, c, dir } = bestPlacement;
        for (let k = 0; k < current.palabra.length; k++) {
          initialGrid[dir === "down" ? r + k : r][dir === "down" ? c : c + k] = current.palabra[k];
        }
        // Asignar número (comprobar si comparte inicio con otra palabra)
        const existingWordAtStart = placed.find(w => w.row === r && w.col === c);
        const num = existingWordAtStart ? existingWordAtStart.number : counter++;
        
        placed.push({ word: current.palabra, clue: current.pista, row: r, col: c, dir, number: num });
      } else {
         // Fallback: colocar debajo como palabra huérfana (simplificación)
         // Para evitar que se rompa visualmente, la omitimos si no encaja,
         // o la ponemos aislada en un borde. Por simplicidad, en este POC la omitiremos si no cruza.
         console.warn("No se pudo cruzar la palabra:", current.palabra);
      }
    }

    // Recortar la grilla al bounding box de las letras
    let minR = MAX_SIZE, maxR = 0, minC = MAX_SIZE, maxC = 0;
    for (let r = 0; r < MAX_SIZE; r++) {
      for (let c = 0; c < MAX_SIZE; c++) {
        if (initialGrid[r][c] !== null) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    // Añadir margen de 1
    minR = Math.max(0, minR - 1);
    maxR = Math.min(MAX_SIZE - 1, maxR + 1);
    minC = Math.max(0, minC - 1);
    maxC = Math.min(MAX_SIZE - 1, maxC + 1);

    const finalGrid: GridCell[][] = [];
    for (let r = minR; r <= maxR; r++) {
      const newRow: GridCell[] = [];
      for (let c = minC; c <= maxC; c++) {
        const char = initialGrid[r][c];
        let number = undefined;
        if (char !== null) {
          const startsHere = placed.find(w => w.row === r && w.col === c);
          if (startsHere) number = startsHere.number;
        }
        newRow.push({ char: char || "", number });
      }
      finalGrid.push(newRow);
    }

    // Actualizar coordenadas de placedWords
    const adjustedPlaced = placed.map(p => ({
      ...p,
      row: p.row - minR,
      col: p.col - minC
    }));

    setGrid(finalGrid);
    setPlacedWords(adjustedPlaced.sort((a, b) => a.number - b.number));
  };

  const getCharIndices = (word: string, char: string) => {
    const indices = [];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === char) indices.push(i);
    }
    return indices;
  };

  const canPlaceCrossword = (word: string, r: number, c: number, dir: Direction, currentGrid: any[][], size: number) => {
    if (r < 0 || c < 0) return false;
    if (dir === "across" && c + word.length > size) return false;
    if (dir === "down" && r + word.length > size) return false;

    // Comprobar la palabra entera
    for (let i = 0; i < word.length; i++) {
      const cr = dir === "down" ? r + i : r;
      const cc = dir === "down" ? c : c + i;

      const existingChar = currentGrid[cr][cc];
      
      // Si la celda está ocupada y no es la misma letra, falla
      if (existingChar !== null && existingChar !== word[i]) {
        return false;
      }

      // Si la celda está vacía, comprobar las celdas ADYACENTES laterales para evitar letras pegadas accidentalmente
      if (existingChar === null) {
        if (dir === "across") {
          // Revisar arriba y abajo
          if (cr > 0 && currentGrid[cr - 1][cc] !== null) return false;
          if (cr < size - 1 && currentGrid[cr + 1][cc] !== null) return false;
        } else {
          // Revisar izquierda y derecha
          if (cc > 0 && currentGrid[cr][cc - 1] !== null) return false;
          if (cc < size - 1 && currentGrid[cr][cc + 1] !== null) return false;
        }
      }
    }

    // Comprobar las celdas JUSTO ANTES y JUSTO DESPUÉS de la palabra entera para evitar palabras unidas por los extremos
    if (dir === "across") {
      if (c > 0 && currentGrid[r][c - 1] !== null) return false;
      if (c + word.length < size && currentGrid[r][c + word.length] !== null) return false;
    } else {
      if (r > 0 && currentGrid[r - 1][c] !== null) return false;
      if (r + word.length < size && currentGrid[r + word.length][c] !== null) return false;
    }

    return true;
  };

  const acrossClues = placedWords.filter(w => w.dir === "across");
  const downClues = placedWords.filter(w => w.dir === "down");

  if (grid.length === 0) return null;

  const renderVersion = (isSolution: boolean) => (
    <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
      {/* Grilla */}
      <div 
        className="grid gap-[1px] bg-slate-300 border-2 border-slate-800 p-[2px] rounded-lg mx-auto print:border-black"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rIdx) => 
          row.map((cell, cIdx) => (
            <div 
              key={`${rIdx}-${cIdx}`} 
              className={cn(
                "relative w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 flex items-center justify-center font-bold text-slate-800 sm:text-lg md:text-xl",
                cell.char !== "" 
                  ? (isSolution ? "bg-emerald-50 border border-emerald-200 text-emerald-900" : "bg-white border border-slate-200") 
                  : "bg-slate-800/10"
              )}
            >
              {/* Número en la esquina superior izquierda */}
              {cell.number && (
                <span className="absolute top-0 left-0.5 text-[8px] sm:text-[10px] font-black leading-none mt-0.5 select-none">
                  {cell.number}
                </span>
              )}
              {isSolution ? cell.char : ""}
            </div>
          ))
        )}
      </div>

      {/* Pistas */}
      <div className="flex-1 w-full flex flex-col sm:flex-row lg:flex-col gap-8">
        <div className="flex-1">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-4 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
            <span className="material-symbols-rounded text-lg text-indigo-500">east</span> Horizontales
          </h3>
          <ul className="space-y-3">
            {acrossClues.map(w => (
              <li key={w.number} className="text-sm font-medium text-slate-600 flex gap-3">
                <span className="font-black text-slate-800 min-w-[20px]">{w.number}.</span>
                <span>{w.clue}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-4 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
            <span className="material-symbols-rounded text-lg text-rose-500">south</span> Verticales
          </h3>
          <ul className="space-y-3">
            {downClues.map(w => (
              <li key={w.number} className="text-sm font-medium text-slate-600 flex gap-3">
                <span className="font-black text-slate-800 min-w-[20px]">{w.number}.</span>
                <span>{w.clue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl max-w-5xl mx-auto w-full print:border-none print:shadow-none space-y-16">
      {/* VERSIÓN ESTUDIANTE */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Crucigrama</h2>
          <p className="text-slate-500 font-medium mt-2">Lee las pistas y completa las palabras entrelazadas.</p>
        </div>
        {renderVersion(false)}
      </div>

      <hr className="border-2 border-dashed border-slate-200" />

      {/* VERSIÓN MAESTRO (SOLUCIONARIO) */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-emerald-600 uppercase tracking-tight">Solucionario (Para el Maestro)</h2>
          <p className="text-slate-500 font-medium mt-2">Respuestas del crucigrama.</p>
        </div>
        {renderVersion(true)}
      </div>
    </div>
  );
}
