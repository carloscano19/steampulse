"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Target, BrainCircuit, Gamepad2, Crosshair, Map } from 'lucide-react';

type Genre = {
  id: string;
  name: string;
  fullName?: string;
  definition: string;
  example: string;
  subgenres?: Genre[];
};

type Family = {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  genres: Genre[];
};

const WIKI_DATA: Family[] = [
  {
    id: "rpg",
    name: "Familia RPG (Rol)",
    color: "text-accent-purple",
    icon: <BrainCircuit className="w-6 h-6" />,
    genres: [
      { id: "rpg", name: "RPG", fullName: "Juego de Rol", definition: "La base del rol. Encarnas a un personaje, tomas decisiones y mejoras sus estadísticas y nivel.", example: "The Witcher 3" },
      { id: "arpg", name: "ARPG", fullName: "Action RPG", definition: "Rol centrado en el combate dinámico en tiempo real y la obtención de botín.", example: "Diablo IV", subgenres: [
          { id: "soulslike", name: "Soulslike", definition: "Acción con dificultad extrema, pérdida de recursos al morir y combate basado en patrones.", example: "Elden Ring" }
      ]},
      { id: "jrpg", name: "JRPG", fullName: "Japanese RPG", definition: "Estilo japonés, habitualmente con combates por turnos y gran peso narrativo.", example: "Persona 5" },
      { id: "crpg", name: "CRPG", fullName: "Computer RPG", definition: "Rol clásico de vista isométrica, inspirado en juegos de mesa y con decisiones tácticas.", example: "Baldur's Gate 3" },
      { id: "trpg", name: "Tactical RPG", fullName: "TRPG", definition: "Fusión de rol y estrategia donde los combates ocurren en un tablero por turnos.", example: "Fire Emblem o XCOM" },
      { id: "mmorpg", name: "MMORPG", definition: "Juegos de rol online donde miles de personas comparten un mundo persistente.", example: "World of Warcraft" }
    ]
  },
  {
    id: "action_adventure",
    name: "Familia Acción y Aventura",
    color: "text-accent-blue",
    icon: <Map className="w-6 h-6" />,
    genres: [
      { id: "roguelike", name: "Roguelike", definition: "Niveles aleatorios y muerte permanente; si mueres, pierdes todo el progreso de la partida.", example: "Hades", subgenres: [
          { id: "roguelite", name: "Roguelite", definition: "Como el anterior, pero permite comprar mejoras permanentes para cada intento.", example: "Vampire Survivors" }
      ]},
      { id: "metroidvania", name: "Metroidvania", definition: "Mapa gigante interconectado que requiere nuevas habilidades para abrir caminos cerrados.", example: "Hollow Knight" },
      { id: "hack_slash", name: "Hack and Slash", definition: "Acción de combate cuerpo a cuerpo rápido enfocada en encadenar combos.", example: "Devil May Cry" },
      { id: "survival", name: "Survival", definition: "Centrado en la recolección de recursos, construcción de refugios y supervivencia al entorno.", example: "Rust o Valheim" },
      { id: "sandbox", name: "Sandbox", definition: "Mundos abiertos que permiten al jugador crear su propio contenido o diversión con libertad total.", example: "Minecraft" },
      { id: "survival_horror", name: "Survival Horror", definition: "Gestión de recursos escasos, puzles y atmósfera de miedo o tensión.", example: "Resident Evil 4" },
      { id: "musou", name: "Musou", definition: "Acción donde un solo héroe se enfrenta a miles de enemigos en batallas masivas.", example: "Dynasty Warriors" },
      { id: "plataformas", name: "Plataformas", definition: "Acción basada en la precisión de saltos y el movimiento para superar obstáculos.", example: "Super Mario Odyssey" }
    ]
  },
  {
    id: "shooters",
    name: "Familia Shooters (Disparos)",
    color: "text-rose-500",
    icon: <Crosshair className="w-6 h-6" />,
    genres: [
      { id: "fps", name: "FPS", fullName: "First Person Shooter", definition: "Disparos en primera persona. El estándar del género.", example: "Call of Duty" },
      { id: "boomer_shooter", name: "Boomer Shooter", definition: "Shooters retro de velocidad frenética y niveles laberínticos.", example: "DOOM Eternal" },
      { id: "extraction_shooter", name: "Extraction Shooter", definition: "Multijugador donde debes entrar, saquear y salir vivo; si mueres, pierdes todo.", example: "Escape from Tarkov" },
      { id: "hero_shooter", name: "Hero Shooter", definition: "Disparos por equipos donde cada personaje tiene habilidades y roles únicos.", example: "Overwatch 2" },
      { id: "battle_royale", name: "Battle Royale", definition: "Supervivencia masiva donde gana el último que quede en pie.", example: "Fortnite" }
    ]
  },
  {
    id: "strategy_sim",
    name: "Estrategia y Simulación",
    color: "text-emerald-500",
    icon: <Target className="w-6 h-6" />,
    genres: [
      { id: "rts", name: "Estrategia (RTS)", definition: "Gestión de recursos y ejércitos en tiempo real para derrotar al rival.", example: "Age of Empires" },
      { id: "auto_battler", name: "Auto-Battler", definition: "Estrategia donde colocas unidades en un tablero y ellas luchan solas.", example: "Teamfight Tactics (TFT)" },
      { id: "tower_defense", name: "Tower Defense", definition: "Colocas defensas estratégicamente para frenar oleadas de enemigos.", example: "Plants vs. Zombies" },
      { id: "simulation", name: "Simulation", definition: "Gestión y simulación de sistemas complejos (ciudades, granjas o vida).", example: "Cities Skylines o Stardew Valley" }
    ]
  },
  {
    id: "others",
    name: "Otras Categorías Críticas",
    color: "text-amber-500",
    icon: <Gamepad2 className="w-6 h-6" />,
    genres: [
      { id: "fighting_game", name: "Fighting Game (Lucha)", definition: "Combates 1v1 con sistemas de combos complejos y lectura del rival.", example: "Street Fighter 6 o Tekken 8" },
      { id: "sports_racing", name: "Sports / Racing", definition: "Simulación o arcada de deportes reales y conducción.", example: "EA Sports FC o Forza" },
      { id: "puzzle", name: "Puzzle", definition: "Resolución de problemas lógicos como mecánica central.", example: "Portal 2 o Tetris" },
      { id: "visual_novel", name: "Visual Novel", definition: "Narrativa interactiva basada en texto donde tus decisiones cambian la historia.", example: "Ace Attorney" },
      { id: "immersive_sim", name: "Immersive Sim", definition: "Libertad total para resolver situaciones usando las leyes del mundo (sigilo, hackeo).", example: "Deus Ex" },
      { id: "walking_simulator", name: "Walking Simulator", definition: "Experiencias centradas exclusivamente en la exploración y la narrativa.", example: "What Remains of Edith Finch" }
    ]
  }
];

function GenreCard({ genre, isChild = false }: { genre: Genre, isChild?: boolean }) {
  return (
    <div className={`relative flex flex-col p-5 rounded-2xl bg-[#0F172A]/40 glass border border-surface-2 hover:border-accent-purple/50 transition-all hover:-translate-y-1 ${isChild ? 'ml-6 mt-3 border-l-[3px] border-l-accent-purple/50' : 'h-full'}`}>
      <div className="flex-1">
        <h4 className="text-xl font-bold text-text-primary mb-1 flex items-baseline gap-2">
          {genre.name}
          {genre.fullName && <span className="text-xs font-medium text-text-muted">({genre.fullName})</span>}
        </h4>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {genre.definition}
        </p>
      </div>
      
      <div className="pt-3 border-t border-surface-2/50 mt-auto flex items-center gap-2 text-xs font-semibold text-accent-blue bg-accent-blue/5 px-3 py-2 rounded-lg">
        <span>🎮</span> Ejemplo: <span className="text-text-primary">{genre.example}</span>
      </div>

      {genre.subgenres && genre.subgenres.length > 0 && (
         <div className="mt-4 flex flex-col gap-3">
            {genre.subgenres.map(sub => (
               <GenreCard key={sub.id} genre={sub} isChild={true} />
            ))}
         </div>
      )}
    </div>
  );
}

export default function WikiPage() {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!query.trim()) return WIKI_DATA;
    const lowerQuery = query.toLowerCase();

    return WIKI_DATA.map(family => {
      // If family name matches, return all genres inside
      if (family.name.toLowerCase().includes(lowerQuery)) return family;

      // Filter genres inside
      const filteredGenres = family.genres.map(genre => {
         // Check if parent matches
         const parentMatches = 
            genre.name.toLowerCase().includes(lowerQuery) || 
            (genre.fullName && genre.fullName.toLowerCase().includes(lowerQuery)) ||
            genre.definition.toLowerCase().includes(lowerQuery) ||
            genre.example.toLowerCase().includes(lowerQuery);

         if (parentMatches) return genre; // Include parent and all its subgenres

         // If parent doesn't match, check subgenres
         if (genre.subgenres) {
            const matchingSubs = genre.subgenres.filter(sub => 
               sub.name.toLowerCase().includes(lowerQuery) ||
               sub.definition.toLowerCase().includes(lowerQuery) ||
               sub.example.toLowerCase().includes(lowerQuery)
            );
            if (matchingSubs.length > 0) {
               return { ...genre, subgenres: matchingSubs };
            }
         }
         return null;
      }).filter(Boolean) as Genre[];

      if (filteredGenres.length > 0) {
         return { ...family, genres: filteredGenres };
      }
      return null;
    }).filter(Boolean) as Family[];
  }, [query]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header Background */}
      <div className="relative pt-24 pb-12 overflow-hidden border-b border-surface-2/50">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 to-background z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-wider mb-6">
            <BrainCircuit className="w-4 h-4" /> Directorio de Conocimiento
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-4 font-[family-name:var(--font-rajdhani)] tracking-tight">
            StreamPulse <span className="gradient-text">Wiki</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            La enciclopedia definitiva de géneros de videojuegos. Aprende a distinguir un Soulslike de un Roguelite fácilmente.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto relative group">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-purple transition-colors">
                <Search className="w-5 h-5" />
             </div>
             <input 
               type="text" 
               placeholder="Buscar un género, ejemplo o definición..." 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface/50 glass border border-surface-2 focus:border-accent-purple outline-none text-text-primary placeholder:text-text-muted/70 shadow-2xl transition-all font-medium text-lg"
             />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {filteredData.length === 0 ? (
          <div className="text-center py-20">
             <div className="text-6xl mb-4 opacity-50">🕵️</div>
             <h3 className="text-2xl font-bold text-text-primary mb-2">No se encontraron resultados</h3>
             <p className="text-text-secondary">Prueba con otro término o género.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredData.map(family => (
               <section key={family.id} className="animate-fade-in relative">
                  {/* Family Header */}
                  <h2 className={`text-3xl font-black ${family.color} mb-8 flex items-center gap-3 font-[family-name:var(--font-rajdhani)] uppercase tracking-wider`}>
                     <span className={`p-2 rounded-xl bg-surface-2/50 border border-surface-2 ${family.color}`}>
                       {family.icon}
                     </span>
                     {family.name}
                  </h2>
                  
                  {/* Genres Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {family.genres.map(genre => (
                        <GenreCard key={genre.id} genre={genre} />
                     ))}
                  </div>
               </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
