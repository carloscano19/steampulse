|**StreamPulse**  ·  Gaming & Creator Hub SRS|v1.0.0  ·  Confidencial|
| :- | -: |


|**DOCUMENTO DE ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE**|
| :-: |

**StreamPulse**

**Gaming & Creator Hub**

*Software Requirements Specification  ·  v1.0.0*


|**CONFIDENCIAL  ·  Nombre en clave: STREAMPULSE  ·  Abril 2026**|
| :-: |


|**Preparado por**|Principal Software Architect & Head of Product|
| :- | :- |
|**Versión**|1\.0.0  –  Release inicial|
|**Fecha**|Abril 2026|
|**Estado**|BORRADOR – Aprobado internamente|


# **1. Introducción**
## **1.1 Propósito del Documento**
Este documento define los Requisitos de Software (SRS) para StreamPulse, una plataforma web de nueva generación que centraliza la industria del videojuego, la Creator Economy y datos en tiempo real de Fortnite. El documento sirve como contrato técnico entre el equipo de producto, desarrollo, diseño e infraestructura.

## **1.2 Alcance del Proyecto**
StreamPulse es una plataforma web full-stack desplegada bajo dominio independiente con las siguientes capacidades nucleares:

- Motor de búsqueda y catálogo de más de 500.000 videojuegos (fuente: IGDB/Twitch).
- Módulo VIP de Fortnite con tienda diaria, rotación de mapa y estadísticas de jugador.
- Hub de creadores con streams embebidos, clips virales y analíticas de Twitch.
- Feed de noticias automatizado con IA de relevancia (NewsData.io).
- Sistema de autenticación, caché y Edge Functions sobre Supabase + Vercel.

## **1.3 Definiciones y Acrónimos**

|**Término**|**Definición**|
| :-: | :-: |
|SRS|Software Requirements Specification – este documento.|
|BaaS|Backend as a Service. En este proyecto: Supabase.|
|Edge Function|Función serverless ejecutada en la red CDN de Vercel/Supabase.|
|Cron Job|Tarea programada que se ejecuta automáticamente a intervalos definidos.|
|ISR|Incremental Static Regeneration: regeneración estática incremental de Next.js.|
|ERD|Entity-Relationship Diagram: diagrama de entidad-relación de base de datos.|
|TTL|Time To Live: tiempo de vida de un elemento en caché.|
|Rate Limit|Límite de peticiones impuesto por un proveedor de API externo.|


# **2. Visión del Producto**
## **2.1 Propuesta de Valor**
StreamPulse elimina la fragmentación del ecosistema gaming: el jugador y el creador de contenido obtienen en una única URL toda la información que hoy requiere visitar 6–8 sitios distintos. La plataforma agrega, filtra y presenta datos de clase premium con una estética Cyber-Premium coherente y rendimiento de nivel AAA.

## **2.2 Usuarios Objetivo**

|**Segmento**|**Necesidad Principal**|**KPI de Éxito**|
| :-: | :-: | :-: |
|Jugador Casual|Noticias y tienda Fortnite sin fricciones|DAU > 10k en 90 días|
|Jugador Hardcore|Estadísticas profundas y catálogo IGDB|Sesión media > 8 min|
|Creador / Streamer|Perfil público con analytics y embed|Perfiles creados > 500|
|Agencia / Brand|Visibilidad en hub de creadores|CPM < €2 equivalente|

## **2.3 Restricciones de Alto Nivel**
- Presupuesto API gratuito/Hobby en fase MVP (gestión estricta de cuotas).
- Despliegue exclusivo en Vercel + Supabase Free/Pro tier.
- Sin backend propio; toda la lógica de servidor vía Edge Functions y Server Actions.
- RGPD: consentimiento de cookies, no almacenamiento de datos personales de terceros sin autorización.


# **3. Arquitectura del Sistema**
## **3.1 Stack Tecnológico**

|**FRONTEND**|
| :-: |

|**Framework**|Next.js 15 (App Router) – SSR, SSG, ISR y Server Components nativos.|
| :- | :- |

|**Estilos**|Tailwind CSS v3 + Shadcn/ui (componentes accesibles, headless).|
| :- | :- |

|**Lenguaje**|TypeScript 5.x – tipado estricto en toda la base de código.|
| :- | :- |

|**Imágenes**|next/image con dominios autorizados: igdb.com, fortniteapi.io, twitch.tv.|
| :- | :- |

|**BACKEND / BaaS**|
| :-: |

|**Plataforma**|Supabase (PostgreSQL 15, Auth, Storage, Edge Functions Deno).|
| :- | :- |

|**Auth**|Supabase Auth con proveedores: Email, Google OAuth 2.0, Twitch OAuth.|
| :- | :- |

|**Caché**|Tablas PostgreSQL como caché con columna expires\_at + cron pg\_cron.|
| :- | :- |

|**Edge Fn.**|Una Edge Function por integración API externa; proxying seguro de credenciales.|
| :- | :- |

|**INFRAESTRUCTURA**|
| :-: |

|**Deploy**|Vercel (Pro recomendado). Preview por rama, Rollback automático.|
| :- | :- |

|**Secrets**|Variables de entorno en Vercel Dashboard; nunca expuestas en cliente.|
| :- | :- |

|**CDN**|Vercel Edge Network (>300 PoPs). Assets estáticos con Cache-Control inmutable.|
| :- | :- |

|**Monitoring**|Vercel Analytics + Sentry para error tracking front y back.|
| :- | :- |

## **3.2 Diagrama de Flujo de Datos (Nivel C4 – Contexto)**
El siguiente flujo describe la interacción entre los sistemas a nivel de contexto:

|**USUARIO / BROWSER**|**→**|**NEXT.JS / VERCEL**|**→**|**SUPABASE / APIs**|
| :-: | :-: | :-: | :-: | :-: |

El Next.js App Router actúa como BFF (Backend For Frontend): llama a Edge Functions de Supabase, que a su vez consultan la caché PostgreSQL o —si expirada— realizan la llamada real a la API externa. La respuesta retorna al servidor Next.js, que renderiza los Server Components y sirve el HTML al cliente. El cliente solo ejecuta JavaScript mínimo para interactividad.


# **4. Ecosistema de APIs e Integraciones**
## **4.1 Matriz de Integraciones**

|**API / Servicio**|**Autenticación**|**Cuota Free**|**TTL Caché**|**Módulo**|
| :-: | :-: | :-: | :-: | :-: |
|FortniteAPI.io|API Key (Header)|Ilimitada (fair use)|24h tienda / 1h mapa|fortnite|
|IGDB (Twitch)|Client-ID + Bearer|500 req / seg|7 días juego|games|
|YouTube Data v3|OAuth2 / API Key|10\.000 u/día|12h por game\_id|games|
|Twitch Helix|Client-ID + Bearer|800 req / min|5 min streams|creators|
|NewsData.io|API Key (param)|200 req/día|6h por keyword|news|
|Supabase Storage|Service Role Key|1 GB free|Permanente|all|

## **4.2 Módulo Fortnite VIP**
### **4.2.1 Tienda Diaria**
Cron Job configurado en Supabase pg\_cron (o Vercel Cron) para ejecutarse a las 00:05 UTC (5 minutos tras la rotación oficial de Epic Games). El job llama al endpoint /v2/shop de FortniteAPI.io, transforma la respuesta al schema de la tabla fortnite\_shop y hace un upsert masivo. En caso de fallo (HTTP 4xx/5xx), se reintenta hasta 3 veces con backoff exponencial (5s, 30s, 120s) antes de marcar un flag shop\_unavailable.

- Endpoint: GET https://fortniteapi.io/v2/shop?includeRenderData=true
- Cron: '5 0 \* \* \*' (UTC)
- Fallback: servir último snapshot válido de la tabla fortnite\_shop.

### **4.2.2 Rotación de Mapa**
Llamada bajo demanda con ISR de 1 hora. Datos del mapa actual obtenidos de /v1/map. La imagen se almacena en Supabase Storage (bucket: fortnite-maps) con path {season}/{date}.png.

### **4.2.3 Buscador de Estadísticas de Jugador**
Endpoint dinámico /api/fortnite/player?username=X que consulta /v1/stats. Los datos de jugador NO se cachean (siempre en tiempo real) para garantizar precisión. Rate limiting propio: máximo 20 búsquedas/minuto por IP mediante middleware de Vercel.

## **4.3 Módulo IGDB**
Motor de búsqueda full-text para el catálogo de más de 500.000 títulos. La integración usa el endpoint /games de la API v4 de IGDB con queries en su lenguaje propietario (Apicalypse).

- Búsqueda: campos name, cover.url, genres.name, rating, summary, first\_release\_date.
- Imágenes: transformadas a t\_cover\_big (264x352px) via CDN de IGDB.
- Paginación: limit 20, offset basado en cursor para infinite scroll.
- Caché: 7 días para fichas individuales, 1 hora para resultados de búsqueda.

## **4.4 Módulo YouTube Data v3**
Extracción de contenido audiovisual vinculado al juego. Cada ficha /games/[slug] dispara una búsqueda YouTube con query = '{game.name} guide OR walkthrough OR trailer'. La respuesta (máximo 6 vídeos) se almacena en youtube\_cache indexada por game\_id.

- Cuota: cada búsqueda consume 100 unidades. Con 10.000 u/día disponibles = 100 búsquedas/día.
- Estrategia: pre-cachear los 500 juegos más populares (ranking IGDB) en batch nocturno.
- Embed: componente <YouTubePlayer> con facade de bajo impacto (thumbnail + play on click).

## **4.5 Módulo Twitch**
Integración con Helix API para contenido live y clips. Dos sub-módulos diferenciados:

- Live Now Widget: consulta /streams con game\_id filtrando streamers con >500 viewers. Refresco cada 5 minutos via SWR (stale-while-revalidate) en cliente.
- Clips Virales: endpoint /clips?game\_id={id}&first=9&sort=views. Caché de 1 hora.
- Perfil Creador: OAuth Twitch para creadores que se registren; almacena broadcaster\_id y display\_name en tabla creators.

## **4.6 Módulo NewsData.io**
Feed de noticias gaming con sistema de scoring de relevancia. El cron job se ejecuta cada 6 horas con queries predefinidas: 'gaming news', 'Fortnite', 'esports', 'new game release'. Cada artículo recibe un relevance\_score calculado como:

- +3 puntos si el título contiene keywords de alta prioridad (lista configurable en tabla news\_keywords).
- +2 puntos si la fuente está en la whitelist (tabla news\_sources).
- +1 punto por cada 100 veces que la keyword aparece en el cuerpo.
- Artículos con score <= 0 se descartan antes de inserción.


# **5. Mapa del Sitio y Especificación UX**
## **5.1 Estructura de Rutas**

|**Ruta**|**Tipo Render**|**Descripción**|
| :-: | :-: | :-: |
|/|ISR (60s)|Home: Dashboard Trending Now (Juegos + Streamers + Noticias)|
|/fortnite|ISR (3600s)|Landing VIP: tienda del día, mapa, buscador de stats|
|/games|SSG + ISR|Catálogo con filtros (género, plataforma, año)|
|/games/[slug]|SSR + ISR (7d)|Ficha técnica: metadata, vídeos YouTube, streams Twitch|
|/creators|ISR (300s)|Directorio de creadores destacados con estado live|
|/creators/[id]|SSR|Perfil creador: embed stream, clips, analíticas públicas|
|/news|SSR + Infinite Scroll|Archivo de noticias filtrado por relevancia y fecha|
|/auth/login|CSR|Formulario de login/registro (Email + OAuth)|
|/api/\*|Edge Runtime|Endpoints de API interna (proxying de APIs externas)|

## **5.2 Especificación por Página**
### **5.2.1  /  –  Home Dashboard**
Sección hero con gradiente navy-to-purple y CTA principal. Tres widgets en grid 3 columnas (responsive a 1):

- Trending Games: 6 tarjetas con portada IGDB, nombre, rating, género. Link a /games/[slug].
- Live Now: 4 streamers con avatar, nombre, juego y contador de viewers en tiempo real.
- Latest News: 5 titulares con imagen, fuente y hace X tiempo. Link a /news.

Footer con Fortnite Shop teaser (3 ítems destacados del día). Actualización ISR cada 60 segundos.

### **5.2.2  /fortnite  –  Fortnite VIP Landing**
Página de aterrizaje con identidad visual propia dentro del sistema de diseño (fondo oscuro con partículas CSS, acento en azul-neón complementario). Secciones:

- Today's Item Shop: grid de ítems cosméticos con imagen, nombre, rareza y precio en V-Bucks.
- Current Map: imagen interactiva del mapa actual con puntos de interés como overlays.
- Player Stats Finder: formulario de búsqueda por username con display de KD, Win Rate y matches.
- Active Challenges: listado de desafíos de temporada (obtenido de /v1/challenges).

### **5.2.3  /games/[slug]  –  Ficha de Juego**
Página generada con generateStaticParams para los 1000 juegos más populares. Estructura:

- Hero: portada en formato art-key (t\_1080p), título, rating, metacritic score, plataformas.
- Metadata grid: desarrollador, publisher, fecha de lanzamiento, géneros, modos de juego.
- Descripción: summary de IGDB con expand/collapse.
- YouTube Section: 6 vídeos en grid (trailers, guías). Componente con facade de carga diferida.
- Live Streams: widget Twitch con streamers jugando el título ahora mismo.
- Related Games: 4 juegos relacionados por género (llamada IGDB similar\_games).

### **5.2.4  /creators/[id]  –  Perfil de Creador**
Perfil público accesible sin autenticación. El creador debe haberse registrado via OAuth de Twitch:

- Header: banner personalizable, avatar, nombre, descripción, redes sociales, botón Follow Twitch.
- Stream Embed: iframe oficial de Twitch (parent: dominio del sitio). Solo visible si está live.
- Clips Virales: grid 3×3 de sus clips más vistos (últimos 30 días).
- Analíticas públicas: gráfica de crecimiento de seguidores (datos Twitch + historico propio).
- Juegos Más Jugados: top 5 por horas de stream.

### **5.2.5  /news  –  Noticias**
Archivo de noticias con infinite scroll implementado via Intersection Observer + Server Actions:

- Filtros: por keyword, fuente, fecha. Estado de filtros en URL params (shareable).
- Tarjeta de noticia: imagen, titular, fuente, fecha, relevance\_score badge, excerpt.
- Página de detalle: /news/[id] renderiza el artículo completo con SEO Open Graph.


# **6. Esquema de Base de Datos (ERD)**
## **6.1 Descripción General**
La base de datos PostgreSQL 15 alojada en Supabase se organiza en cuatro dominios funcionales: Gaming, Fortnite, Creators y News. Se añade un dominio transversal de Auth (gestionado por Supabase Auth) y un dominio de Cache Management.

## **6.2 Tablas del Dominio: Gaming**

|**TABLA: games**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK, DEFAULT gen\_random\_uuid()|Identificador único interno|
|igdb\_id|INTEGER|UNIQUE NOT NULL|ID del juego en IGDB|
|slug|TEXT|UNIQUE NOT NULL|URL amigable generada del nombre|
|name|TEXT|NOT NULL|Nombre oficial del juego|
|cover\_url|TEXT||URL de portada en CDN de IGDB|
|summary|TEXT||Descripción larga del juego|
|rating|FLOAT4|CHECK (0..100)|Rating de usuarios en IGDB|
|genres|TEXT[]||Array de géneros|
|platforms|TEXT[]||Array de plataformas|
|release\_date|DATE||Fecha de lanzamiento global|
|developer|TEXT||Estudio desarrollador|
|publisher|TEXT||Distribuidora/Publisher|
|igdb\_raw|JSONB||Payload completo original de IGDB|
|cached\_at|TIMESTAMPTZ|DEFAULT NOW()|Última sincronización con IGDB|
|expires\_at|TIMESTAMPTZ|NOT NULL|Expiración de caché (cached\_at + 7d)|

|**TABLA: youtube\_cache**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK|Identificador|
|game\_id|UUID|FK → games.id, NOT NULL|Juego asociado|
|video\_id|TEXT|NOT NULL|ID del vídeo de YouTube|
|title|TEXT|NOT NULL|Título del vídeo|
|thumbnail\_url|TEXT||Miniatura del vídeo|
|channel\_name|TEXT||Nombre del canal|
|view\_count|BIGINT|DEFAULT 0|Número de reproducciones|
|published\_at|TIMESTAMPTZ||Fecha de publicación|
|cached\_at|TIMESTAMPTZ|DEFAULT NOW()|Fecha de caché|
|expires\_at|TIMESTAMPTZ|NOT NULL|Expiración (cached\_at + 12h)|

## **6.3 Tablas del Dominio: Fortnite**

|**TABLA: fortnite\_shop**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK|Identificador|
|item\_id|TEXT|UNIQUE NOT NULL|ID del ítem en FortniteAPI|
|name|TEXT|NOT NULL|Nombre del cosmético|
|type|TEXT|NOT NULL|Tipo: Outfit, Pickaxe, Emote…|
|rarity|TEXT||Rareza: Common, Rare, Epic, Legendary|
|price\_vbucks|INTEGER|CHECK (>= 0)|Precio en V-Bucks|
|image\_url|TEXT||URL de imagen del ítem|
|shop\_date|DATE|NOT NULL, DEFAULT CURRENT\_DATE|Fecha de aparición en tienda|
|raw\_data|JSONB||Payload completo de la API|

|**TABLA: fortnite\_map\_history**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK|Identificador|
|season|TEXT|NOT NULL|Temporada (e.g. 'C6S2')|
|image\_storage\_path|TEXT|NOT NULL|Ruta en Supabase Storage|
|pois|JSONB||Array de puntos de interés con coords|
|captured\_at|TIMESTAMPTZ|DEFAULT NOW()|Momento de captura|
|is\_current|BOOLEAN|DEFAULT FALSE|Mapa activo actualmente|

## **6.4 Tablas del Dominio: Creators**

|**TABLA: creators**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK, FK → auth.users.id|Vinculado a Supabase Auth|
|twitch\_broadcaster\_id|TEXT|UNIQUE|ID de broadcaster Twitch|
|display\_name|TEXT|NOT NULL|Nombre público|
|avatar\_url|TEXT||URL del avatar|
|banner\_url|TEXT||URL del banner de perfil|
|bio|TEXT||Descripción del creador|
|socials|JSONB||URLs de RRSS: {twitter, youtube, discord}|
|follower\_count|INTEGER|DEFAULT 0|Seguidores en Twitch|
|is\_featured|BOOLEAN|DEFAULT FALSE|Creador destacado (editorial)|
|created\_at|TIMESTAMPTZ|DEFAULT NOW()|Registro en plataforma|

|**TABLA: twitch\_clips\_cache**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK|Identificador|
|creator\_id|UUID|FK → creators.id|Creador del clip|
|game\_id|UUID|FK → games.id, NULLABLE|Juego del clip|
|clip\_id|TEXT|UNIQUE NOT NULL|ID del clip en Twitch|
|title|TEXT|NOT NULL|Título del clip|
|thumbnail\_url|TEXT||Miniatura|
|view\_count|INTEGER|DEFAULT 0|Reproducciones|
|duration|FLOAT4||Duración en segundos|
|created\_at|TIMESTAMPTZ||Fecha de creación en Twitch|
|expires\_at|TIMESTAMPTZ|NOT NULL|Expiración de caché (1h)|

## **6.5 Tablas del Dominio: News**

|**TABLA: news\_articles**|
| :-: |

|**Columna**|**Tipo**|**Restricción**|**Descripción**|
| :-: | :-: | :-: | :-: |
|id|UUID|PK|Identificador|
|external\_id|TEXT|UNIQUE NOT NULL|ID del artículo en NewsData.io|
|title|TEXT|NOT NULL|Titular del artículo|
|description|TEXT||Extracto / lead|
|content|TEXT||Cuerpo completo|
|image\_url|TEXT||Imagen destacada|
|source\_name|TEXT|NOT NULL|Nombre del medio|
|source\_url|TEXT|NOT NULL|URL del artículo original|
|relevance\_score|SMALLINT|DEFAULT 0, CHECK(>=0)|Score de relevancia calculado|
|keywords|TEXT[]||Tags extraídos|
|published\_at|TIMESTAMPTZ|NOT NULL|Fecha de publicación original|
|ingested\_at|TIMESTAMPTZ|DEFAULT NOW()|Fecha de ingesta en StreamPulse|

## **6.6 Índices y Relaciones Clave**
Los siguientes índices deben crearse para garantizar el rendimiento de las queries más frecuentes:

|**Índice**|**Tabla / Columna**|**Justificación**|
| :-: | :-: | :-: |
|idx\_games\_slug|games(slug)|Lookup de ficha por URL slug|
|idx\_games\_rating\_desc|games(rating DESC)|Listado de top juegos|
|idx\_games\_expires|games(expires\_at)|Detección de caché expirada|
|idx\_fortnite\_shop\_date|fortnite\_shop(shop\_date DESC)|Tienda del día actual|
|idx\_news\_score\_date|news\_articles(relevance\_score DESC, published\_at DESC)|Feed principal|
|idx\_creators\_featured|creators(is\_featured) WHERE is\_featured=TRUE|Widget home|
|idx\_yt\_game|youtube\_cache(game\_id, expires\_at)|Videos por juego|


# **7. Jerarquía de Carpetas del Proyecto**
## **7.1 Estructura Raíz**
El repositorio sigue la convención de Next.js App Router con separación estricta entre código cliente, servidor y código compartido:

|**/ (raíz del monorepo)**|
| :-: |

|**Carpeta / Archivo**|**Descripción**|
| :-: | :-: |
|/.github/workflows/|CI/CD: lint, type-check, deploy preview.|
|/app/|App Router de Next.js 15. Contiene todas las rutas.|
|/components/|Componentes React compartidos y específicos.|
|/lib/|Utilidades, clientes de API, helpers.|
|/hooks/|Custom React Hooks (cliente).|
|/types/|Definiciones TypeScript globales e interfaces.|
|/supabase/|Migraciones SQL, seed data, config local.|
|/public/|Assets estáticos: logos, fuentes, og-images.|
|/.env.local|Variables de entorno (NO commitear; en .gitignore).|
|/next.config.ts|Configuración de Next.js, dominios de imagen.|
|/tailwind.config.ts|Theme personalizado con paleta Cyber-Premium.|
|/middleware.ts|Middleware global: rate limiting, auth guards.|

## **7.2 Detalle: /app (App Router)**

|**Ruta en /app**|**Archivos y Responsabilidad**|
| :-: | :-: |
|/app/layout.tsx|Root layout: providers, fuentes, metadata global.|
|/app/page.tsx|Home Dashboard (ISR 60s).|
|/app/fortnite/|page.tsx: Landing Fortnite VIP.|
|/app/games/|page.tsx: Catálogo. [slug]/page.tsx: Ficha.|
|/app/creators/|page.tsx: Directorio. [id]/page.tsx: Perfil.|
|/app/news/|page.tsx: Feed. [id]/page.tsx: Artículo detalle.|
|/app/auth/|login/page.tsx, callback/route.ts (OAuth).|
|/app/api/|Route Handlers: fortnite/, games/, twitch/, news/.|

## **7.3 Detalle: /components**

|**Subcarpeta**|**Descripción**|
| :-: | :-: |
|/components/ui/|Componentes base Shadcn/ui (Button, Card, Badge…).|
|/components/layout/|Navbar, Footer, Sidebar, MobileMenu.|
|/components/fortnite/|ShopGrid, ShopItem, MapViewer, PlayerStats.|
|/components/games/|GameCard, GameGrid, GameHero, YouTubePlayer.|
|/components/creators/|CreatorCard, StreamEmbed, ClipsGrid, AnalyticsChart.|
|/components/news/|NewsCard, NewsFeed, NewsFilter, InfiniteScroll.|
|/components/common/|TrendingWidget, LiveBadge, ErrorBoundary, Skeleton.|

## **7.4 Detalle: /lib (Lógica de Negocio)**

|**Módulo / Archivo**|**Responsabilidad**|
| :-: | :-: |
|/lib/supabase/|client.ts, server.ts, middleware.ts (clientes SSR/SSG/Edge).|
|/lib/api/fortnite.ts|Wrapper FortniteAPI.io: shop, map, playerStats.|
|/lib/api/igdb.ts|Wrapper IGDB: search, getById, getSimilar.|
|/lib/api/youtube.ts|Wrapper YouTube Data v3: searchByGame.|
|/lib/api/twitch.ts|Wrapper Twitch Helix: streams, clips, users.|
|/lib/api/newsdata.ts|Wrapper NewsData.io: fetchNews, scoreRelevance.|
|/lib/cache/|cache.ts: helpers read/write/invalidate en Supabase.|
|/lib/utils.ts|cn(), formatDate(), slugify(), truncate().|


# **8. Manual de Buenas Prácticas y Seguridad**
## **8.1 Gestión de APIs y Rate Limiting**
El middleware de gestión de APIs se implementa como una clase ApiClient en /lib/api/\_base.ts que envuelve todas las llamadas externas. Su funcionamiento es el siguiente:

1. Antes de llamar a una API externa, consulta la tabla de caché en Supabase (expires\_at > NOW()).
1. Si el dato está en caché y vigente, lo devuelve sin consumir cuota.
1. Si el dato está expirado o no existe, realiza la llamada externa.
1. En caso de error HTTP 429 (Too Many Requests), activa un flag api\_throttled en la tabla api\_status y sirve el dato caché aunque esté expirado (stale-while-revalidate extendido).
1. Errores 5xx: máximo 3 reintentos con backoff exponencial (1s, 4s, 16s).
1. Todo error se registra en la tabla api\_error\_log con timestamp, api\_name, status\_code y message.

## **8.2 Seguridad**
- Todas las API Keys residen en variables de entorno de Vercel (.env). Nunca se envían al cliente.
- Las Edge Functions actúan como proxies: el cliente solicita a /api/\*, nunca a las APIs externas.
- Supabase Row Level Security (RLS) habilitada en todas las tablas con políticas granulares.
- Inputs del usuario (búsquedas) sanitizados con Zod antes de usarse en queries SQL.
- Headers de seguridad configurados en next.config.ts: CSP, HSTS, X-Frame-Options.
- Rate limiting por IP en middleware.ts usando un contador Redis (Upstash) o tabla Supabase.
- OAuth tokens de Twitch almacenados cifrados en Supabase Vault, nunca en texto plano.

## **8.3 Rendimiento**
- next/image para todas las imágenes de portada, avatar y noticias. Lazy loading automático.
- Componentes pesados (YouTubePlayer, StreamEmbed, AnalyticsChart) cargados con dynamic() y loading skeleton.
- Fonts Inter y Rajdhani con next/font/google para eliminar layout shift (CLS = 0).
- Tailwind CSS purge automático; bundle CSS < 15 KB en producción.
- ISR configurado por ruta con revalidate óptimo para cada tipo de dato (ver Sección 5.1).
- Prefetch automático de Next.js en links visible en viewport.

## **8.4 Escalabilidad y Modularidad**
La arquitectura está diseñada para incorporar nuevos módulos de juegos específicos con fricción mínima. El patrón a seguir para añadir una nueva integración de API es:

1. Crear /lib/api/{nombre\_api}.ts con las funciones wrapper tipadas.
1. Añadir las variables de entorno correspondientes a .env.local y a Vercel Dashboard.
1. Crear la tabla de caché en Supabase via una migración en /supabase/migrations/.
1. Registrar la nueva API en /lib/cache/cache.ts para el manejo unificado de TTL.
1. Si requiere UI propia, crear carpeta en /components/{nombre\_modulo}/ y ruta en /app/.

Esta modularidad garantiza que añadir soporte para, por ejemplo, Riot Games API (LoL/Valorant) o Steam Web API no requiera modificar código existente, solo añadir nuevo código.


# **9. Guía de Estilo Visual – Cyber-Premium**
## **9.1 Identidad Visual**
La estética Cyber-Premium de StreamPulse combina la oscuridad y profundidad del cyberpunk con la refinación y limpieza del diseño premium de producto. El resultado: una interfaz que transmite poder, exclusividad y velocidad.

## **9.2 Paleta de Colores**

|**Token**|**Hex**|**Uso**|
| :-: | :-: | :-: |
|--color-background|#0F172A|Fondo principal de toda la aplicación|
|--color-surface|#1E293B|Cards, modales, paneles secundarios|
|--color-surface-2|#334155|Bordes, separadores, hover states|
|--color-accent-purple|#7C3AED|Acento primario: CTA, headings, highlights|
|--color-accent-green|#10B981|Acento secundario: badges live, éxito, stats|
|--color-accent-blue|#0EA5E9|Acento terciario: links, info, Twitch elements|
|--color-text-primary|#F8FAFC|Texto principal sobre fondos oscuros|
|--color-text-secondary|#94A3B8|Texto secundario, metadatos, timestamps|
|--color-text-muted|#475569|Texto deshabilitado, placeholders|

## **9.3 Tipografía**

|**FUENTE PRIMARIA: Inter**|
| :-: |

|**Elemento**|**Tamaño**|**Peso**|**Uso**|
| :-: | :-: | :-: | :-: |
|Display XL|4rem / 64px|900 (Black)|Hero headlines de landing|
|Display L|3rem / 48px|800 (ExtraBold)|Títulos de sección hero|
|Heading 1|2rem / 32px|700 (Bold)|Títulos principales de página|
|Heading 2|1\.5rem / 24px|600 (SemiBold)|Subtítulos y secciones|
|Heading 3|1\.25rem / 20px|600 (SemiBold)|Títulos de card, widget|
|Body L|1\.125rem / 18px|400 (Regular)|Texto de descripción larga|
|Body|1rem / 16px|400 (Regular)|Texto de cuerpo estándar|
|Body S|0\.875rem / 14px|400 (Regular)|Metadatos, timestamps, labels|
|Caption|0\.75rem / 12px|500 (Medium)|Badges, chips, tooltips|

|**FUENTE DE DISPLAY: Rajdhani**|
| :-: |

Rajdhani es una fuente de display de origen indio con carácter geométrico y tecnológico. Se reserva exclusivamente para elementos de alto impacto visual:

- Logotipo y nombre de la marca 'StreamPulse'.
- Contadores y estadísticas numéricas grandes (viewers, K/D ratio, V-Bucks).
- Labels de rareza en ítems de Fortnite (LEGENDARY, EPIC, RARE).
- Títulos de la sección Fortnite VIP (para reforzar la identidad gaming del módulo).

Configuración: next/font/google con subsets: ['latin', 'latin-ext']. Weights cargados: 400, 500, 600, 700.

## **9.4 Espaciado y Grid**
Sistema de espaciado basado en múltiplos de 4px (Tailwind default). Puntos de ruptura responsive:

|**Breakpoint**|**Anchura**|**Grid**|
| :-: | :-: | :-: |
|xs (mobile)|< 640px|1 columna, padding 16px|
|sm|640px+|2 columnas, padding 24px|
|md|768px+|2-3 columnas, padding 32px|
|lg|1024px+|3-4 columnas, padding 48px|
|xl|1280px+|4-6 columnas, padding 64px|
|2xl|1536px+|Max-width 1400px, centrado|

## **9.5 Componentes Visuales Clave**
### **9.5.1 Game Card**
Dimensiones base: 200×280px. Borde redondeado 12px. Efecto hover: translateY(-4px) + box-shadow con acento purple. Imagen en cover fit. Badge de rating en esquina inferior derecha con fondo semitransparente.
### **9.5.2 Live Badge**
Punto animado (pulsante, CSS animation) en verde acento (#10B981). Texto 'LIVE' en Rajdhani, mayúsculas, peso 600. Background: rgba(16, 185, 129, 0.15) con border rgba(16, 185, 129, 0.4).
### **9.5.3 Rarity Badge (Fortnite)**
Sistema de colores por rareza: Common = #6B7280, Uncommon = #22C55E, Rare = #3B82F6, Epic = #A855F7, Legendary = #F59E0B, Mythic = #F97316. Texto en Rajdhani, peso 700.
### **9.5.4 News Card**
Ratio de imagen 16:9. Overlay gradient en hover para revelar el excerpt. Source badge en esquina superior izquierda. Relevance score como barra de progreso horizontal en la parte inferior.


# **10. Variables de Entorno Requeridas**
El siguiente inventario debe configurarse tanto en .env.local (desarrollo) como en Vercel Dashboard (producción). Las variables marcadas con (\*) son públicas (pueden exponerse al cliente vía NEXT\_PUBLIC\_).

|**Variable**|**Módulo**|**Descripción**|
| :-: | :-: | :-: |
|NEXT\_PUBLIC\_SUPABASE\_URL (\*)|Core|URL pública del proyecto Supabase|
|NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY (\*)|Core|Clave anónima de Supabase (RLS)|
|SUPABASE\_SERVICE\_ROLE\_KEY|Core|Clave de servicio (solo servidor)|
|FORTNITE\_API\_KEY|Fortnite|API Key de FortniteAPI.io|
|IGDB\_CLIENT\_ID|Games|Client ID de Twitch para IGDB|
|IGDB\_CLIENT\_SECRET|Games|Client Secret de Twitch para IGDB|
|YOUTUBE\_API\_KEY|Games|API Key de YouTube Data v3|
|TWITCH\_CLIENT\_ID|Creators|Client ID de aplicación Twitch|
|TWITCH\_CLIENT\_SECRET|Creators|Client Secret de aplicación Twitch|
|NEWSDATA\_API\_KEY|News|API Key de NewsData.io|
|CRON\_SECRET|Sistema|Secret para autorizar cron jobs de Vercel|


# **11. Requisitos No Funcionales**

|**Categoría**|**Métrica**|**Objetivo**|
| :-: | :-: | :-: |
|Rendimiento|LCP (Largest Contentful Paint)|< 2.5 seg en 75th percentil|
|Rendimiento|FID / INP|< 100ms|
|Rendimiento|CLS (Cumulative Layout Shift)|< 0.1|
|Disponibilidad|Uptime mensual|> 99.5% (Vercel SLA)|
|SEO|Core Web Vitals|Todas las páginas en verde|
|SEO|Open Graph / Twitter Cards|100% de rutas con meta dinámico|
|Accesibilidad|WCAG|Nivel AA en componentes core|
|Seguridad|OWASP Top 10|Sin vulnerabilidades críticas|
|Escalabilidad|Cold Start Edge Functions|< 50ms|
|Internacionalización|Idiomas MVP|ES + EN (next-intl)|


# **12. Roadmap de Implementación**

|**Fase**|**Duración**|**Entregables**|
| :-: | :-: | :-: |
|Fase 0|1 semana|Setup: repo, Supabase, Vercel, variables de entorno, design tokens.|
|Fase 1|2 semanas|Core: layout, auth, home dashboard, DB schema + migraciones.|
|Fase 2|2 semanas|Módulo Games: IGDB + YouTube + ficha completa.|
|Fase 3|2 semanas|Módulo Fortnite: tienda, mapa, buscador de stats.|
|Fase 4|2 semanas|Módulo Creators: perfiles, Twitch OAuth, clips.|
|Fase 5|1 semana|Módulo News: feed, scoring, infinite scroll.|
|Fase 6|1 semana|QA, SEO audit, performance tuning, lanzamiento Beta.|


|**FIN DEL DOCUMENTO  ·  StreamPulse SRS v1.0.0  ·  Confidencial**|
| :-: |

*Documento generado automáticamente. Para modificaciones, contactar al Principal Software Architect.*
|© 2026 StreamPulse. Todos los derechos reservados.|Página  de |
| :- | -: |
