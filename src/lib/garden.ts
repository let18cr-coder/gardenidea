export type Stage = "semilla" | "brote" | "planta" | "flor";

export const STAGES: { id: Stage; label: string; emoji: string; hint: string; tone: string }[] = [
  { id: "semilla", label: "Semilla", emoji: "🌰", hint: "Idea recién creada", tone: "bg-muted text-foreground" },
  { id: "brote", label: "Brote", emoji: "🌱", hint: "Idea en desarrollo", tone: "bg-secondary text-secondary-foreground" },
  { id: "planta", label: "Planta", emoji: "🌿", hint: "Idea en proceso", tone: "bg-lavender/50 text-foreground" },
  { id: "flor", label: "Flor", emoji: "🌸", hint: "Idea completada", tone: "bg-rose/60 text-accent-foreground" },
];

export const stageInfo = (s: Stage) => STAGES.find((x) => x.id === s)!;

export type Notebook = {
  id: string;
  name: string;
  description: string;
  cover: string; // cover key
  createdAt: number;
};

export type Idea = {
  id: string;
  title: string;
  description: string;
  notebookId: string;
  tags: string[];
  link?: string | undefined;
  image?: string | undefined;
  stage: Stage;
  createdAt: number;
};

export const COLOR_COVERS = ["rosa", "salvia", "lavanda"] as const;

const now = Date.now();
const d = (days: number) => now - days * 86400000;

export const SEED_NOTEBOOKS: Notebook[] = [
  { id: "casa", name: "Mi casa soñada", description: "Rincones, colores y texturas para un hogar acogedor.", cover: "casa", createdAt: d(30) },
  { id: "viajes", name: "Viajes y aventuras", description: "Destinos, rutas y pequeñas escapadas.", cover: "viajes", createdAt: d(20) },
  { id: "creativo", name: "Proyectos creativos", description: "Acuarela, costura, escritura y más.", cover: "creativo", createdAt: d(12) },
  { id: "personal", name: "Inspiración personal", description: "Frases, hábitos y metas que me hacen crecer.", cover: "personal", createdAt: d(5) },
];

export const SEED_IDEAS: Idea[] = [
  { id: "i1", title: "Rincón de lectura junto a la ventana", description: "Un sillón de mimbre, plantas colgantes y una lámpara cálida.", notebookId: "casa", tags: ["sala", "plantas"], image: "casa", stage: "planta", createdAt: d(9) },
  { id: "i2", title: "Paleta salvia y rosa para la cocina", description: "Azulejos verdes con detalles en rosa empolvado.", notebookId: "casa", tags: ["color", "cocina"], stage: "brote", createdAt: d(6) },
  { id: "i3", title: "Huerto en el balcón", description: "Albahaca, menta y tomates cherry en macetas de barro.", notebookId: "casa", tags: ["jardín"], stage: "semilla", createdAt: d(1) },
  { id: "i4", title: "Ruta por los Alpes suizos", description: "Tren panorámico y caminatas entre flores silvestres.", notebookId: "viajes", tags: ["europa", "montaña"], image: "viajes", stage: "brote", createdAt: d(8) },
  { id: "i5", title: "Fin de semana en Oaxaca", description: "Mercados, textiles y chocolate de metate.", notebookId: "viajes", tags: ["méxico", "comida"], stage: "flor", createdAt: d(15) },
  { id: "i6", title: "Serie de acuarelas botánicas", description: "Doce láminas, una por cada mes del año.", notebookId: "creativo", tags: ["acuarela", "arte"], image: "creativo", stage: "planta", createdAt: d(4) },
  { id: "i7", title: "Zine de recetas de la abuela", description: "Ilustrado a mano y encuadernado en casa.", notebookId: "creativo", tags: ["escritura", "familia"], stage: "semilla", createdAt: d(2) },
  { id: "i8", title: "Rutina de mañanas lentas", description: "Té, diario y diez minutos sin pantallas.", notebookId: "personal", tags: ["hábitos", "bienestar"], stage: "flor", createdAt: d(18) },
  { id: "i9", title: "Leer 20 libros este año", description: "Alternar novela, poesía y ensayo.", notebookId: "personal", tags: ["lectura", "metas"], image: "personal", stage: "brote", createdAt: d(3) },
];

export const uid = () => Math.random().toString(36).slice(2, 10);
