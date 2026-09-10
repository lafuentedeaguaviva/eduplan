"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SopaDeLetrasProps {
  palabras: string[];
  gridSize?: number;
}

type Direction = [number, number];
const DIRECTIONS: Direction[] = [
  [0, 1],   // Derecha
  [1, 0],   // Abajo
  [1, 1],   // Diagonal Abajo-Derecha
  [-1, 1],  // Diagonal Arriba-Derecha
];

export function SopaDeLetras({ palabras, gridSize = 14 }: SopaDeLetrasProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<{ word: string; start: [number, number]; dir: Direction }[]>([]);

  useEffect(() => {
    generateGrid();
  }, [palabras, gridSize]);

  const generateGrid = () => {
    // Inicializar matriz vacía
    const newGrid = Array(gridSize).fill("").map(() => Array(gridSize).fill(""));
    const wordsPlaced: { word: string; start: [number, number]; dir: Direction }[] = [];

    // Ordenar palabras por longitud descendente para ubicar las más largas primero
    const sortedWords = [...palabras]
      .map(p => p.toUpperCase().replace(/[^A-Z]/g, "")) // Limpiar caracteres
      .filter(p => p.length <= gridSize && p.length > 0)
      .sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 150) {
        attempts++;
        const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);
        
        if (canPlaceWord(word, startRow, startCol, dir, newGrid, gridSize)) {
          placeWord(word, startRow, startCol, dir, newGrid);
          wordsPlaced.push({ word, start: [startRow, startCol], dir });
          placed = true;
        }
      }
    }

    // Rellenar vacíos
    const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (newGrid[r][c] === "") {
          newGrid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
      }
    }

    setGrid(newGrid);
    setPlacedWords(wordsPlaced);
  };

  const canPlaceWord = (word: string, r: number, c: number, [dr, dc]: Direction, currentGrid: string[][], size: number) => {
    // Chequear límites
    const endR = r + dr * (word.length - 1);
    const endC = c + dc * (word.length - 1);
    if (endR < 0 || endR >= size || endC < 0 || endC >= size) return false;

    // Chequear colisiones
    for (let i = 0; i < word.length; i++) {
      const currChar = currentGrid[r + dr * i][c + dc * i];
      if (currChar !== "" && currChar !== word[i]) {
        return false; // Conflicto
      }
    }
    return true;
  };

  const placeWord = (word: string, r: number, c: number, [dr, dc]: Direction, currentGrid: string[][]) => {
    for (let i = 0; i < word.length; i++) {
      currentGrid[r + dr * i][c + dc * i] = word[i];
    }
  };

  if (grid.length === 0) return null;

  // Renderiza una sola versión (estudiante o maestro)
  const renderVersion = (isSolution: boolean) => (
    <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start justify-center">
      {/* Grilla */}
      <div 
        className="grid gap-[2px] p-2 bg-indigo-900 rounded-2xl print:bg-black" 
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rIdx) => 
          row.map((letter, cIdx) => {
            // Verificar si esta letra pertenece a alguna palabra
            let isPartOfWord = false;
            if (isSolution) {
               for (const pw of placedWords) {
                 const [dr, dc] = pw.dir;
                 const [startR, startC] = pw.start;
                 for (let i = 0; i < pw.word.length; i++) {
                   if (startR + dr * i === rIdx && startC + dc * i === cIdx) {
                     isPartOfWord = true;
                     break;
                   }
                 }
                 if (isPartOfWord) break;
               }
            }

            return (
              <div 
                key={`${rIdx}-${cIdx}`} 
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm sm:text-lg md:text-xl rounded-[4px] cursor-pointer transition-colors select-none",
                  isSolution 
                    ? (isPartOfWord ? "bg-emerald-400 text-emerald-950 shadow-sm" : "bg-white/10 text-white/30") 
                    : "bg-white text-slate-800 hover:bg-indigo-50"
                )}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Lista de Palabras */}
      <div className="flex-1 min-w-[200px] w-full lg:w-auto">
        <h3 className="font-bold text-slate-700 uppercase tracking-widest text-sm mb-4 border-b-2 border-slate-100 pb-2">Palabras a buscar:</h3>
        <ul className="grid grid-cols-2 lg:grid-cols-1 gap-y-2 gap-x-4">
          {palabras.map((p, i) => {
            const cleaned = p.toUpperCase().replace(/[^A-Z]/g, "");
            const isPlaced = placedWords.some(w => w.word === cleaned);
            return (
              <li key={i} className={cn(
                "font-medium text-slate-600 flex items-center gap-2",
                !isPlaced && "line-through opacity-40 text-red-400"
              )}>
                <div className={cn("size-2 rounded-full", isPlaced ? (isSolution ? "bg-emerald-400" : "bg-indigo-400") : "bg-red-400")} />
                {cleaned}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto w-full print:border-none print:shadow-none space-y-16">
      {/* VERSIÓN ESTUDIANTE */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Sopa de Letras</h2>
          <p className="text-slate-500 font-medium mt-2">Encuentra las siguientes palabras escondidas en la cuadrícula.</p>
        </div>
        {renderVersion(false)}
      </div>

      <hr className="border-2 border-dashed border-slate-200" />

      {/* VERSIÓN MAESTRO (SOLUCIONARIO) */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-emerald-600 uppercase tracking-tight">Solucionario (Para el Maestro)</h2>
          <p className="text-slate-500 font-medium mt-2">Posición exacta de las palabras en la sopa de letras.</p>
        </div>
        {renderVersion(true)}
      </div>
    </div>
  );
}
