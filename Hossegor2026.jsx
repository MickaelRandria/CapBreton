import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudSun,
  Edit3,
  Euro,
  Heart,
  Home,
  Hotel,
  Image as ImageIcon,
  Map as MapIcon,
  MapPin,
  Menu,
  Navigation,
  Plus,
  Save,
  Send,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trash2,
  User,
  Utensils,
  Waves,
  X,
  Download,
  Crosshair,
  ExternalLink,
  Zap,
} from "lucide-react";

// WMO Weather Interpretation Codes -> Icon + label
function getWeatherInfo(code) {
  if (code === 0) return { Icon: Sun, label: "Ensoleillé" };
  if (code <= 2) return { Icon: CloudSun, label: "Nuageux" };
  if (code === 3) return { Icon: Cloud, label: "Couvert" };
  if (code <= 49) return { Icon: CloudDrizzle, label: "Brouillard" };
  if (code <= 57) return { Icon: CloudDrizzle, label: "Bruine" };
  if (code <= 67) return { Icon: CloudRain, label: "Pluie" };
  if (code <= 77) return { Icon: CloudSnow, label: "Neige" };
  if (code <= 82) return { Icon: CloudRain, label: "Averses" };
  if (code <= 86) return { Icon: CloudSnow, label: "Grésil" };
  if (code <= 99) return { Icon: Zap, label: "Orage" };
  return { Icon: CloudSun, label: "Inconnu" };
}

const STORAGE_KEY = "hossegor-2026-activities";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const days = [
  { id: "lundi", short: "Lundi 04", label: "Lundi 04 mai" },
  { id: "mardi", short: "Mardi 05", label: "Mardi 05 mai" },
  { id: "mercredi", short: "Mercredi 06", label: "Mercredi 06 mai" },
];

const categories = [
  { label: "Hôtel", icon: Hotel },
  { label: "Resto", icon: Utensils },
  { label: "Spa", icon: Sparkles },
  { label: "Shopping", icon: ShoppingBag },
];

const images = {
  oysters:
    "https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?auto=format&fit=crop&w=1200&q=85",
  shopping:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
  stay: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  burger:
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=85",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  green:
    "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1200&q=85",
  tapas:
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=85",
  spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
};

const initialActivities = [
  {
    id: "lundi-huitres",
    day: "lundi",
    time: "12h00",
    title: "Déjeuner Huîtres au Lac",
    category: "Resto",
    price: 40,
    rating: 4.9,
    image: images.oysters,
    location: "Lac d'Hossegor",
    coords: [43.6767, -1.4325],
    distance: "2,1 km",
    duration: "8 min",
    weather: "18°C",
    favorite: true,
    description:
      "Pause iodée au bord du lac, avec une assiette d'huîtres, pain grillé et vue calme sur l'eau. Parfait pour lancer le séjour sans se presser.",
  },
  {
    id: "lundi-pedebert",
    day: "lundi",
    time: "13h30",
    title: "Shopping Zone Pédebert",
    category: "Shopping",
    price: 0,
    rating: 4.6,
    image: images.shopping,
    location: "Zone Pédebert",
    coords: [43.6628, -1.3856],
    distance: "7,4 km",
    duration: "14 min",
    weather: "19°C",
    favorite: false,
    description:
      "Sélection de boutiques surfwear, concept stores et bonnes adresses locales. Une étape pratique pour repérer les pièces fortes du week-end.",
  },
  {
    id: "lundi-airbnb",
    day: "lundi",
    time: "16h00",
    title: "Check-in Airbnb",
    category: "Hôtel",
    price: 140,
    rating: 4.8,
    image: images.stay,
    location: "Capbreton centre",
    coords: [43.6429, -1.4319],
    distance: "1,2 km",
    duration: "5 min",
    weather: "20°C",
    favorite: false,
    description:
      "Installation dans le logement, dépôt des sacs et première respiration côté Capbreton avant de ressortir pour la soirée.",
  },
  {
    id: "lundi-burgers",
    day: "lundi",
    time: "20h00",
    title: "Jack's Burgers",
    category: "Resto",
    price: 30,
    rating: 4.7,
    image: images.burger,
    location: "Hossegor",
    coords: [43.661, -1.4298],
    distance: "3,6 km",
    duration: "10 min",
    weather: "17°C",
    favorite: true,
    description:
      "Burgers généreux, ambiance détendue et service efficace. Une adresse simple et solide après une première journée bien remplie.",
  },
  {
    id: "mardi-estacade",
    day: "mardi",
    time: "10h30",
    title: "Estacade de Capbreton",
    category: "Shopping",
    price: 0,
    rating: 4.8,
    image: images.beach,
    location: "Front de mer",
    coords: [43.6442, -1.4471],
    distance: "2,8 km",
    duration: "9 min",
    weather: "19°C",
    favorite: false,
    description:
      "Balade sur l'estacade, horizon Atlantique et lumière du matin sur l'entrée du port. Le spot parfait pour quelques photos et un café face à l'océan.",
  },
  {
    id: "mardi-cantine",
    day: "mardi",
    time: "12h30",
    title: "Green Cantine",
    category: "Resto",
    price: 25,
    rating: 4.5,
    image: images.green,
    location: "Hossegor centre",
    coords: [43.6618, -1.4287],
    distance: "3,3 km",
    duration: "11 min",
    weather: "21°C",
    favorite: false,
    description:
      "Déjeuner frais et végétal, bowls colorés et jus maison. Une pause légère avant l'après-midi dans les rues d'Hossegor.",
  },
  {
    id: "mardi-etiquette",
    day: "mardi",
    time: "19h30",
    title: "Tapas à l'Étiquette",
    category: "Resto",
    price: 45,
    rating: 4.9,
    image: images.tapas,
    location: "Capbreton",
    coords: [43.6422, -1.4305],
    distance: "1,6 km",
    duration: "6 min",
    weather: "16°C",
    favorite: true,
    description:
      "Assiettes à partager, vin bien choisi et ambiance de soirée landaise. Une adresse de caractère pour prolonger la journée.",
  },
  {
    id: "mercredi-massage",
    day: "mercredi",
    time: "11h30",
    title: "Massage Duo",
    category: "Spa",
    price: 100,
    rating: 4.9,
    image: images.spa,
    location: "Soorts-Hossegor",
    coords: [43.6646, -1.3977],
    distance: "5,2 km",
    duration: "12 min",
    weather: "20°C",
    favorite: false,
    description:
      "Rituel détente à deux, huiles chaudes et atmosphère feutrée. La parenthèse idéale avant de reprendre la route.",
  },
];

const blankForm = {
  day: "lundi",
  time: "12h00",
  title: "",
  category: "Resto",
  price: 0,
  rating: 4.8,
  image: "",
  location: "Hossegor",
  latitude: 43.6618,
  longitude: -1.4287,
  distance: "",
  duration: "",
  weather: "",
  description: "",
  link: "",
  done: false,
};

const currency = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function createMarkerIcon(category) {
  const color =
    category === "Resto"
      ? "#2d6a4f"
      : category === "Spa"
        ? "#0e7490"
        : category === "Hôtel"
          ? "#1b4332"
          : "#40916c";

  return L.divIcon({
    className: "",
    html: `<div style="height:38px;width:38px;border-radius:999px;background:${color};border:4px solid white;box-shadow:0 14px 30px rgba(27,67,50,.28);display:grid;place-items:center;color:white;font-weight:800;font-size:13px;">${category.slice(
      0,
      1,
    )}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="height:42px;width:42px;border-radius:999px;background:#0e7490;border:4px solid white;box-shadow:0 16px 34px rgba(14,116,144,.34);display:grid;place-items:center;"><div style="height:14px;width:14px;border-radius:999px;background:white;"></div></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function formatRouteDistance(meters) {
  if (!Number.isFinite(meters)) return "Distance inconnue";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function formatRouteDuration(seconds) {
  if (!Number.isFinite(seconds)) return "Durée inconnue";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function loadActivities() {
  if (typeof window === "undefined") return initialActivities;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialActivities;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : initialActivities;
  } catch {
    return initialActivities;
  }
}

function activityToForm(activity) {
  return {
    ...blankForm,
    ...activity,
    latitude: activity.coords?.[0] ?? blankForm.latitude,
    longitude: activity.coords?.[1] ?? blankForm.longitude,
  };
}

function normalizeForm(form, id, favorite = false, done = false) {
  return {
    id: id || `activity-${Date.now()}`,
    day: form.day,
    time: form.time,
    title: form.title.trim() || "Nouvelle activité",
    category: form.category,
    price: Number(form.price) || 0,
    rating: Math.min(5, Math.max(0, Number(form.rating) || 0)),
    image: form.image.trim() || images.beach,
    location: form.location.trim() || "Hossegor",
    coords: [
      Number(form.latitude) || blankForm.latitude,
      Number(form.longitude) || blankForm.longitude,
    ],
    distance: form.distance.trim(),
    duration: form.duration.trim(),
    weather: form.weather.trim(),
    description: form.description.trim() || "Une adresse ajoutée à l'itinéraire HOSSEGOR 2026.",
    link: form.link?.trim() || "",
    favorite,
    done,
  };
}

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="h-3.5 w-3.5 text-amber-400"
          fill={index < Math.round(value) ? "currentColor" : "none"}
          strokeWidth={2.5}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-white/90">{value}</span>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-3xl border border-[#d8eadf] bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-[#52796f]">
        <Icon className="h-3.5 w-3.5 text-[#2d6a4f]" />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-black text-[#1b4332]">
        {value}
      </div>
    </div>
  );
}

function ActivityCard({ activity, onOpen, onEdit, onDelete, onFavorite, onToggleDone }) {
  return (
    <article className={`group overflow-hidden rounded-[2rem] shadow-[0_18px_45px_rgba(27,67,50,0.14)] transition-opacity ${activity.done ? 'opacity-60' : 'bg-white'}`} style={activity.done ? {background:'#f0f7f4'} : {background:'white'}}>
      <div className="relative h-56 overflow-hidden">
        <button
          type="button"
          onClick={() => onOpen(activity.id)}
          className="block h-full w-full text-left"
        >
          <img
            src={activity.image}
            alt=""
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${activity.done ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#1b4332] shadow-lg backdrop-blur">
            {activity.time}
          </div>
          {activity.done && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-[#1b4332]/80 px-4 py-2 text-sm font-black text-white backdrop-blur">✓ Fait</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#74c69d]/95 px-3 py-1 text-xs font-black text-[#1b4332]">
                {activity.category}
              </span>
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#1b4332]">
                {activity.price ? currency.format(activity.price) : "Gratuit"}
              </span>
            </div>
            <h3 className="text-xl font-black leading-tight text-white">
              {activity.title}
            </h3>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Stars value={activity.rating} />
              <span className="truncate text-xs font-semibold text-white/80">
                {activity.location}
              </span>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onFavorite(activity.id)}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[#1b4332] shadow-lg backdrop-blur"
          aria-label="Favori"
        >
          <Heart
            className="h-5 w-5"
            fill={activity.favorite ? "#ef476f" : "none"}
            stroke={activity.favorite ? "#ef476f" : "currentColor"}
          />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => onToggleDone(activity.id)}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black transition ${
            activity.done
              ? 'bg-[#74c69d] text-[#1b4332]'
              : 'bg-[#edf6f0] text-[#52796f] hover:bg-[#74c69d] hover:text-[#1b4332]'
          }`}
        >
          {activity.done ? '✓ Fait' : 'Marquer fait'}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="grid h-8 w-8 place-items-center rounded-full text-[#52796f] transition hover:bg-black/5 hover:text-[#1b4332]"
            aria-label="Modifier"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(activity.id)}
            className="grid h-8 w-8 place-items-center rounded-full text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#95d5b2] bg-white/70 p-8 text-center">
      <Waves className="mx-auto h-8 w-8 text-[#2d6a4f]" />
      <p className="mt-3 text-sm font-bold text-[#1b4332]">{label}</p>
    </div>
  );
}

export default function Hossegor2026() {
  const [activities, setActivities] = useState(loadActivities);
  const [activeDay, setActiveDay] = useState("lundi");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [query, setQuery] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [toast, setToast] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...blankForm });
  const [formOpen, setFormOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [bellRead, setBellRead] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=43.66&longitude=-1.43&current_weather=true&hourly=temperature_2m,weathercode&forecast_days=2");
        const data = await res.json();
        setWeather({ current: data.current_weather, hourly: data.hourly });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    }
    fetchWeather();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const totalBudget = useMemo(
    () => activities.reduce((sum, activity) => sum + Number(activity.price), 0),
    [activities],
  );

  const dayBudget = useMemo(
    () =>
      activities
        .filter((activity) => activity.day === activeDay)
        .reduce((sum, activity) => sum + Number(activity.price), 0),
    [activities, activeDay],
  );

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedId),
    [activities, selectedId],
  );

  const nextActivity = useMemo(() => {
    return activities
      .filter((activity) => activity.day === activeDay)
      .sort((a, b) => a.time.localeCompare(b.time))[0];
  }, [activities, activeDay]);

  const filteredActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return activities
      .filter((activity) =>
        activeNav === "favorites" ? activity.favorite : activity.day === activeDay,
      )
      .filter((activity) =>
        activeCategory ? activity.category === activeCategory : true,
      )
      .filter((activity) => {
        if (!normalizedQuery) return true;
        return [
          activity.title,
          activity.location,
          activity.category,
          activity.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [activities, activeCategory, activeDay, activeNav, query]);

  const navItems = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "favorites", label: "Favoris", icon: Heart },
    { id: "profile", label: "Profil", icon: User },
    { id: "map", label: "Carte", icon: MapIcon },
  ];

  const openCreate = () => {
    setQuickMenuOpen(false);
    setEditingId(null);
    setForm({ ...blankForm, day: activeDay, category: activeCategory || "Resto" });
    setFormOpen(true);
  };

  const openEdit = (activity) => {
    setEditingId(activity.id);
    setForm(activityToForm(activity));
    setFormOpen(true);
  };

  const deleteActivity = (id) => {
    if (!window.confirm("Supprimer cette activité ?")) return;
    setActivities((current) => current.filter((activity) => activity.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editingId === id) setFormOpen(false);
  };

  const toggleFavorite = (id) => {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id
          ? { ...activity, favorite: !activity.favorite }
          : activity,
      ),
    );
  };

  const clearFilters = () => {
    setQuery("");
    setActiveCategory(null);
    setActiveNav("home");
    setToast("Recherche et filtres réinitialisés");
  };

  const importTrip = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        if (payload.activities) {
          setActivities(payload.activities);
          setToast("Itinéraire importé !");
          setQuickMenuOpen(false);
        }
      } catch {
        setToast("Fichier invalide");
      }
    };
    reader.readAsText(file);
  };

  const exportTrip = () => {
    const payload = {
      app: "HOSSEGOR 2026",
      exportedAt: new Date().toISOString(),
      totalBudget,
      activities,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hossegor-2026-itineraire.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setQuickMenuOpen(false);
    setToast("Itinéraire exporté");
  };

  const installApp = async () => {
    if (!installPrompt) {
      setToast("Installation disponible après déploiement HTTPS");
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setQuickMenuOpen(false);
  };

  const saveActivity = (event) => {
    event.preventDefault();
    const previous = activities.find((activity) => activity.id === editingId);
    const nextActivity = normalizeForm(form, editingId, previous?.favorite, previous?.done ?? false);

    setActivities((current) => {
      if (!editingId) return [...current, nextActivity];
      return current.map((activity) =>
        activity.id === editingId ? nextActivity : activity,
      );
    });
    setActiveDay(nextActivity.day);
    setFormOpen(false);
    setEditingId(null);
  };

  const toggleDone = (id) => {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id ? { ...activity, done: !activity.done } : activity,
      ),
    );
  };

  const resetTrip = () => {
    if (!window.confirm("Restaurer l'itinéraire initial ?")) return;
    setActivities(initialActivities);
    setActiveCategory(null);
    setActiveDay("lundi");
    setActiveNav("home");
  };

  const buildSystemPrompt = () => {
    const now = new Date();
    const meteo = weather
      ? `${Math.round(weather.current.temperature)}°C, ${getWeatherInfo(weather.current.weathercode).label}`
      : "non disponible";
    const itinerary = activities
      .map((a) => `- ${a.day} ${a.time} : ${a.title} (${a.category}, ${a.location}${
        a.price ? `, ${a.price}€` : ", gratuit"
      }${a.done ? " ✓ fait" : ""})`)
      .join("\n");
    return `Tu es l'assistant IA du guide de voyage HOSSEGOR 2026, un groupe d'amis appelé "Capbreton crew" en séjour à Hossegor et Capbreton, Landes, France, du 4 au 6 mai 2026.

CONTEXTE ACTUEL :
- Heure : ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
- Date : ${now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
- Météo à Hossegor : ${meteo}

ITINÉRAIRE PRÉVU :
${itinerary}

INSTRUCTIONS :
- Réponds toujours en français, de façon concise et pratique, comme un ami local.
- Connais bien la région : Hossegor = surf (plage de la Gravière, Les Culs Nuls), restaurants fruits de mer, boutiques surfwear, lac d'Hossegor. Capbreton = estacade, port, restaurants, marché.
- Si l'utilisateur demande de suggérer, trouver ou ajouter une activité/resto/sortie, génère une activité au format suivant EN FIN DE RÉPONSE (une seule fois) :
[ACTIVITE]
{"title": "Nom du lieu", "category": "Resto", "description": "Description courte et enthousiaste.", "location": "Quartier ou nom du lieu", "price": 0, "time": "20h00", "day": "lundi", "coords": [43.66, -1.43]}
[/ACTIVITE]
- Les valeurs de "category" possibles : Resto, Hôtel, Spa, Shopping.
- Les valeurs de "day" possibles : lundi, mardi, mercredi.
- Sois enthousiaste et pratique. Evite les longues listes, préfère 1 vraie bonne adresse.`;
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = { role: "user", content: aiInput.trim() };
    const history = [...aiMessages, userMsg];
    setAiMessages(history);
    setAiInput("");
    setAiLoading(true);
    try {
      const contents = history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content || " " }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
            contents,
            generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
          }),
        }
      );
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu répondre.";
      const match = raw.match(/\[ACTIVITE\]([\s\S]*?)\[\/ACTIVITE\]/);
      let suggestedActivity = null;
      let text = raw;
      if (match) {
        try {
          suggestedActivity = JSON.parse(match[1].trim());
          text = raw.replace(/\[ACTIVITE\][\s\S]*?\[\/ACTIVITE\]/, "").trim();
          if (!text) text = "Voici ma suggestion d'activité !";
        } catch (e) { /* ignore parse error */ }
      }
      setAiMessages((prev) => [...prev, { role: "model", content: text || " ", suggestedActivity }]);
    } catch {
      setAiMessages((prev) => [...prev, { role: "model", content: "Erreur de connexion. Vérifie ta connexion internet." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const addAiActivity = (suggested) => {
    const newAct = {
      id: `ai-${Date.now()}`,
      day: suggested.day || "lundi",
      time: suggested.time || "12h00",
      title: suggested.title || "Nouvelle activité",
      category: suggested.category || "Resto",
      price: Number(suggested.price) || 0,
      rating: 4.5,
      image: images.beach,
      location: suggested.location || "Hossegor",
      coords: Array.isArray(suggested.coords) ? suggested.coords : [43.66, -1.43],
      distance: "",
      duration: "",
      weather: "",
      description: suggested.description || "",
      link: "",
      favorite: false,
      done: false,
    };
    setActivities((cur) => [...cur, newAct]);
    setActiveDay(newAct.day);
    setActiveNav("home");
    setToast(`"${newAct.title}" ajouté à l'itinéraire !`);
  };

  return (
    <div className="min-h-screen bg-[#9ad0c9] font-['Inter',_'Montserrat',sans-serif] text-[#1b4332]">
      <div className="mx-auto min-h-screen max-w-md bg-[#edf6f0] shadow-2xl md:my-8 md:min-h-[860px] md:overflow-hidden md:rounded-[2.5rem]">
        <header className="rounded-b-[2.5rem] bg-[#1b4332] px-5 pb-8 pt-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#74c69d] text-lg font-black text-[#1b4332]">
                H
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70">Bonjour</p>
                <p className="text-sm font-black">Capbreton crew</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {weather?.current && (() => {
                const { Icon: WIcon, label } = getWeatherInfo(weather.current.weathercode);
                return (
                  <div className="mr-1 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/5" title={label}>
                    <WIcon className="h-4 w-4" />
                    <span className="text-xs font-bold">{Math.round(weather.current.temperature)}°C</span>
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={() => {
                  setNoticeOpen((current) => !current);
                  setBellRead(true);
                  setQuickMenuOpen(false);
                }}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b4332]"
                aria-label="Afficher le résumé"
              >
                <Bell className="h-5 w-5" />
                {!bellRead && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ef476f]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickMenuOpen((current) => !current);
                  setNoticeOpen(false);
                }}
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b4332]"
                aria-label="Ouvrir les actions rapides"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {noticeOpen && (
            <div className="mt-5 rounded-[2rem] bg-white/12 p-4 text-sm font-bold text-white shadow-[0_18px_38px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#b7e4c7]">
                    Prochain stop
                  </p>
                  <p className="mt-1 text-base font-black">
                    {nextActivity
                      ? `${nextActivity.time} · ${nextActivity.title}`
                      : "Aucune activité prévue"}
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    Mode PWA prêt pour Vercel, données locales conservées.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNoticeOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#1b4332]"
                  aria-label="Fermer le résumé"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {quickMenuOpen && (
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-[2rem] bg-white/12 p-3 shadow-[0_18px_38px_rgba(0,0,0,0.16)] backdrop-blur">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl bg-white px-3 py-3 text-xs font-black text-[#1b4332]">
                <input type="file" accept=".json" onChange={importTrip} className="hidden" />
                <Download className="h-4 w-4" />
                Import
              </label>
              <button
                type="button"
                onClick={() => {
                  setActiveNav("ia");
                  setQuickMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 px-3 py-3 text-xs font-black text-white shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                Assistant IA
              </button>
              <button
                type="button"
                onClick={exportTrip}
                className="flex items-center justify-center gap-2 rounded-3xl bg-white px-3 py-3 text-xs font-black text-[#1b4332]"
              >
                <Save className="h-4 w-4" />
                Exporter
              </button>
              <button
                type="button"
                onClick={installApp}
                className="flex items-center justify-center gap-2 rounded-3xl bg-[#74c69d] px-3 py-3 text-xs font-black text-[#1b4332]"
              >
                <Navigation className="h-4 w-4" />
                Installer
              </button>
            </div>
          )}

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#95d5b2]">
                Guide de voyage
              </p>
              <h1 className="mt-2 text-4xl font-black leading-[0.95]">
                HOSSEGOR
                <span className="block text-[#b7e4c7]">2026</span>
              </h1>
            </div>
            <div className="rounded-[1.5rem] bg-white/15 px-5 py-3 text-right shadow-sm backdrop-blur-md border border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Budget</p>
              <p className="text-2xl font-black text-white">
                {currency.format(totalBudget)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white px-4 py-3 text-[#1b4332] shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
            <Search className="h-5 w-5 text-[#52796f]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrer les activités..."
              className="min-w-0 flex-1 bg-transparent text-base placeholder:text-[#52796f]/70"
            />
            <button
              type="button"
              onClick={clearFilters}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e9f5ee] text-[#2d6a4f]"
              aria-label="Réinitialiser la recherche et les filtres"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.label;

              return (
                <button
                  key={category.label}
                  type="button"
                  onClick={() =>
                    setActiveCategory((current) =>
                      current === category.label ? null : category.label,
                    )
                  }
                  className="group flex min-w-0 flex-col items-center gap-2 text-xs font-bold"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-full shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${
                      active
                        ? "bg-[#74c69d] text-[#1b4332]"
                        : "bg-white text-[#1b4332] group-hover:bg-[#e9f5ee]"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="truncate text-white/90">{category.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        <main className="px-5 pb-28 pt-5">
          {activeNav === "ia" ? (
            <AIView
              messages={aiMessages}
              input={aiInput}
              loading={aiLoading}
              onInputChange={setAiInput}
              onSend={sendAiMessage}
              onAddActivity={addAiActivity}
            />
          ) : activeNav === "map" ? (
            <MapView activities={activities} onOpen={setSelectedId} />
          ) : activeNav === "profile" ? (
            <ProfileView
              activities={activities}
              budget={totalBudget}
              onReset={resetTrip}
            />
          ) : (
            <>
              {activeNav === "home" && weather?.hourly && (
                <section className="-mx-5 mb-5 overflow-x-auto px-5 pb-2">
                  <div className="flex gap-3">
                    {weather.hourly.time.map((timeString, i) => {
                      const date = new Date(timeString);
                      const now = new Date();
                      const isNow = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate() && date.getHours() === now.getHours();
                      if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())) return null;
                      if (date > new Date(now.getTime() + 24 * 60 * 60 * 1000)) return null;
                      return (() => {
                        const { Icon: WIcon, label } = getWeatherInfo(weather.hourly.weathercode[i]);
                        return (
                          <div key={timeString} className={`shrink-0 min-w-[76px] rounded-[1.25rem] p-3 text-center shadow-[0_8px_20px_rgba(27,67,50,0.08)] ${isNow ? 'bg-[#1b4332] text-white ring-2 ring-[#74c69d]' : 'bg-white'}`}>
                            <p className={`text-[11px] font-black ${isNow ? 'text-[#74c69d]' : 'text-[#52796f]'}`}>{isNow ? 'Maintenant' : `${date.getHours()}h`}</p>
                            <WIcon className={`mx-auto my-1.5 h-6 w-6 ${isNow ? 'text-[#74c69d]' : 'text-[#74c69d]'}`} />
                            <p className={`text-[10px] font-semibold ${isNow ? 'text-white/70' : 'text-[#52796f]/80'}`}>{label}</p>
                            <p className={`text-sm font-black ${isNow ? 'text-white' : 'text-[#1b4332]'}`}>{Math.round(weather.hourly.temperature_2m[i])}°</p>
                          </div>
                        );
                      })()
                    })}
                  </div>
                </section>
              )}

              {activeNav === "home" && (
                <section className="-mx-5 overflow-x-auto px-5 pb-4">
                  <div className="flex gap-3">
                    {days.map((dayItem) => {
                      const active = dayItem.id === activeDay;
                      const count = activities.filter(
                        (activity) => activity.day === dayItem.id,
                      ).length;

                      return (
                        <button
                          key={dayItem.id}
                          type="button"
                          onClick={() => setActiveDay(dayItem.id)}
                          className={`min-w-[132px] rounded-3xl px-4 py-3 text-left shadow-sm transition ${
                            active
                              ? "bg-[#1b4332] text-white"
                              : "bg-white text-[#1b4332]"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                            <CalendarDays className="h-4 w-4" />
                            {count} étape{count > 1 ? 's' : ''}
                          </div>
                          <p className="mt-2 text-base font-black">
                            {dayItem.short}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="mb-5 grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <p className="text-sm font-bold text-[#52796f]">
                    {activeNav === "favorites"
                      ? "Sélection favorite"
                      : days.find((dayItem) => dayItem.id === activeDay)?.label}
                  </p>
                  <h2 className="text-2xl font-black">
                    {activeNav === "favorites" ? "Favoris" : "Itinéraire"}
                  </h2>
                </div>
                <div className="rounded-[1.5rem] bg-white px-5 py-3 text-right shadow-[0_8px_20px_rgba(27,67,50,0.06)] border border-[#e9f5ee]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#52796f]">
                    Journée
                  </p>
                  <p className="text-xl font-black text-[#1b4332]">{currency.format(dayBudget)}</p>
                </div>
              </section>

              <section className="space-y-5">
                {filteredActivities.length ? (
                  filteredActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onOpen={setSelectedId}
                      onEdit={openEdit}
                      onDelete={deleteActivity}
                      onFavorite={toggleFavorite}
                      onToggleDone={toggleDone}
                    />
                  ))
                ) : (
                  <EmptyState
                    label={
                      activeNav === "favorites"
                        ? "Aucun favori pour le moment"
                        : "Aucune activité sur cette sélection"
                    }
                  />
                )}
              </section>
            </>
          )}
        </main>

        <nav className="fixed bottom-4 left-1/2 z-30 grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 grid-cols-5 gap-1 rounded-[2rem] bg-[#48a69e] p-2 shadow-[0_20px_60px_rgba(27,67,50,0.3)] backdrop-blur md:bottom-8">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-black transition ${
                  active
                    ? "bg-white text-[#1b4332]"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  fill={item.id === "favorites" && active ? "currentColor" : "none"}
                />
                {item.label}
              </button>
            );
          })}
          
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={openCreate}
              className="absolute -top-8 grid h-16 w-16 place-items-center rounded-full bg-[#2d6a4f] text-white shadow-[0_18px_38px_rgba(45,106,79,0.42)] ring-[6px] ring-[#edf6f0] transition hover:scale-105"
              aria-label="Ajouter"
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>

          {navItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-black transition ${
                  active
                    ? "bg-white text-[#1b4332]"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  fill={item.id === "favorites" && active ? "currentColor" : "none"}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {selectedActivity && (
        <DetailView
          activity={selectedActivity}
          onClose={() => setSelectedId(null)}
          onEdit={openEdit}
          onDelete={deleteActivity}
          onFavorite={toggleFavorite}
          onToggleDone={toggleDone}
          onUpdateNote={(id, note) =>
            setActivities((cur) =>
              cur.map((a) => (a.id === id ? { ...a, quickNote: note } : a))
            )
          }
          onMap={() => {
            setActiveNav("map");
            setSelectedId(null);
          }}
        />
      )}

      {formOpen && (
        <ActivityForm
          form={form}
          editing={Boolean(editingId)}
          onChange={setForm}
          onClose={() => {
            setFormOpen(false);
            setEditingId(null);
          }}
          onSave={saveActivity}
        />
      )}

      {toast && (
        <div className="fixed left-1/2 top-5 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-3xl bg-[#1b4332] px-5 py-4 text-center text-sm font-black text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function DetailView({ activity, onClose, onEdit, onDelete, onFavorite, onMap, onToggleDone, onUpdateNote }) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(activity.quickNote || "");
  return (
    <section className="fixed inset-0 z-50 overflow-y-auto bg-[#edf6f0] font-['Inter',_'Montserrat',sans-serif] text-[#1b4332]">
      <div className="mx-auto min-h-screen max-w-md bg-white pb-8">
        <div className="relative h-[420px] overflow-hidden rounded-b-[2.25rem]">
          <img src={activity.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
          <div className="absolute left-4 right-4 top-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b4332] shadow-lg"
              aria-label="Retour"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFavorite(activity.id)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b4332] shadow-lg"
                aria-label="Favori"
              >
                <Heart
                  className="h-5 w-5"
                  fill={activity.favorite ? "#ef476f" : "none"}
                  stroke={activity.favorite ? "#ef476f" : "currentColor"}
                />
              </button>
              <button
                type="button"
                onClick={() => onEdit(activity)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b4332] shadow-lg"
                aria-label="Modifier"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-6 left-5 right-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-[#74c69d] px-3 py-1 text-xs font-black text-[#1b4332]">
                {activity.category}
              </span>
              <Stars value={activity.rating} />
            </div>
            <h2 className="text-4xl font-black leading-none text-white">
              {activity.title}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-white/85">
              <MapPin className="h-4 w-4" />
              {activity.location}
            </p>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="grid grid-cols-3 gap-2">
            <InfoChip icon={Navigation} label="Distance" value={activity.distance || 'N/A'} />
            <InfoChip icon={Clock} label="Temps" value={activity.duration || 'N/A'} />
            <InfoChip icon={CloudSun} label="Météo" value={activity.weather || 'N/A'} />
          </div>

          {/* Statut + Lien réservation */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => onToggleDone(activity.id)}
              className={`flex-1 rounded-2xl py-3 text-sm font-black transition ${
                activity.done
                  ? 'bg-[#74c69d] text-[#1b4332]'
                  : 'bg-[#edf6f0] text-[#52796f] hover:bg-[#74c69d] hover:text-[#1b4332]'
              }`}
            >
              {activity.done ? '✓ Marqué comme fait' : 'Marquer comme fait'}
            </button>
            {activity.link && (
              <a
                href={activity.link.startsWith('http') || activity.link.startsWith('tel') ? activity.link : `https://${activity.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-[#2d6a4f] px-4 py-3 text-sm font-black text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Réserver
              </a>
            )}
          </div>

          <div className="mt-6 rounded-[2rem] bg-[#edf6f0] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#52796f]">Prix estimé</p>
                <p className="text-3xl font-black">
                  {activity.price ? currency.format(activity.price) : "Gratuit"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onMap}
                  className="rounded-full bg-[#1b4332] px-5 py-3 text-sm font-black text-white"
                >
                  Carte
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activity.coords[0]},${activity.coords[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-[#2d6a4f] px-5 py-3 text-sm font-black text-white shadow-md"
                >
                  <Navigation className="h-4 w-4" />
                  S'y rendre
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-black">Description</h3>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#52796f]">
              {activity.description}
            </p>
          </div>

          {/* Note rapide */}
          <div className="mt-6 rounded-[2rem] bg-amber-50 p-4 border border-amber-100">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase text-amber-700">Note perso</p>
              <button
                type="button"
                onClick={() => {
                  if (editingNote) onUpdateNote(activity.id, noteValue);
                  setEditingNote(!editingNote);
                }}
                className="text-xs font-bold text-amber-700 underline"
              >
                {editingNote ? 'Sauvegarder' : 'Modifier'}
              </button>
            </div>
            {editingNote ? (
              <textarea
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl bg-white px-3 py-2 text-base"
                placeholder="Ex: réserver à l'avance, demander terrasse..."
              />
            ) : (
              <p className="text-sm font-semibold text-amber-900">
                {noteValue || <span className="italic text-amber-400">Aucune note. Touche Modifier pour en ajouter.</span>}
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onEdit(activity)}
              className="flex items-center justify-center gap-2 rounded-3xl bg-[#2d6a4f] px-5 py-4 text-sm font-black text-white"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              className="flex items-center justify-center gap-2 rounded-3xl bg-rose-50 px-5 py-4 text-sm font-black text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapView({ activities, onOpen }) {
  const [userPosition, setUserPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");
  const [mapDay, setMapDay] = useState("all");

  const locateUser = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserPosition(coords);
          resolve(coords);
        },
        () => {
          reject(
            new Error(
              "Position impossible à récupérer. Vérifie l'autorisation de localisation.",
            ),
          );
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 12000 },
      );
    });

  const requestLocation = async () => {
    setRouteMessage("");
    try {
      await locateUser();
      setRouteMessage("Position détectée. Choisis une activité pour tracer un trajet.");
    } catch (error) {
      setRouteMessage(error.message);
    }
  };

  const buildRoute = async (activity) => {
    setRouteLoading(true);
    setRouteMessage("");

    try {
      const origin = userPosition || (await locateUser());
      const destination = activity.coords;
      const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Le service d'itinéraire ne répond pas pour le moment.");
      }

      const data = await response.json();
      const bestRoute = data.routes?.[0];

      if (!bestRoute?.geometry?.coordinates?.length) {
        throw new Error("Aucun itinéraire trouvé vers cette adresse.");
      }

      setRoute({
        activityId: activity.id,
        title: activity.title,
        destination,
        coords: bestRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distance: formatRouteDistance(bestRoute.distance),
        duration: formatRouteDuration(bestRoute.duration),
      });
      setRouteMessage(`Itinéraire vers ${activity.title}`);
    } catch (error) {
      setRoute(null);
      setRouteMessage(error.message);
    } finally {
      setRouteLoading(false);
    }
  };

  const googleMapsUrl =
    route && userPosition
      ? `https://www.google.com/maps/dir/?api=1&origin=${userPosition[0]},${userPosition[1]}&destination=${route.destination[0]},${route.destination[1]}&travelmode=driving`
      : "";

  return (
    <section>
      <div className="mb-4 -mx-0 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          <button
            type="button"
            onClick={() => setMapDay("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
              mapDay === "all" ? "bg-[#1b4332] text-white" : "bg-white text-[#52796f]"
            }`}
          >
            Tous
          </button>
          {days.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setMapDay(d.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                mapDay === d.id ? "bg-[#1b4332] text-white" : "bg-white text-[#52796f]"
              }`}
            >
              {d.short}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#52796f]">Exploration</p>
          <h2 className="text-2xl font-black">Carte du séjour</h2>
        </div>
        <button
          type="button"
          onClick={requestLocation}
          className="flex h-12 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-[#2d6a4f] shadow-sm"
        >
          <Navigation className="h-4 w-4" />
          Me localiser
        </button>
      </div>

      <div className="h-[520px] overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_20px_50px_rgba(27,67,50,0.18)]">
        <MapContainer
          center={[43.657, -1.425]}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {route?.coords?.length > 0 && (
            <Polyline
              positions={route.coords}
              pathOptions={{ color: "#0e7490", weight: 6, opacity: 0.88 }}
            />
          )}
          {userPosition && (
            <Marker position={userPosition} icon={createUserIcon()}>
              <Popup>
                <div className="min-w-[150px]">
                  <p className="font-bold text-[#1b4332]">Vous êtes ici</p>
                  <p className="text-sm text-[#52796f]">Position GPS actuelle</p>
                </div>
              </Popup>
            </Marker>
          )}
          {(mapDay === "all" ? activities : activities.filter(a => a.day === mapDay)).map((activity) => (
            <Marker
              key={activity.id}
              position={activity.coords}
              icon={createMarkerIcon(activity.category)}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <p className="font-bold text-[#1b4332]">{activity.title}</p>
                  <p className="text-sm text-[#52796f]">
                    {activity.time} -{" "}
                    {activity.price ? currency.format(activity.price) : "Gratuit"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(activity.id)}
                      className="rounded-full bg-[#edf6f0] px-3 py-2 text-xs font-black text-[#1b4332]"
                    >
                      Détail
                    </button>
                    <button
                      type="button"
                      onClick={() => buildRoute(activity)}
                      className="rounded-full bg-[#2d6a4f] px-3 py-2 text-xs font-black text-white"
                    >
                      Itinéraire
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div
        className="mt-4 rounded-[2rem] bg-white p-4 shadow-sm"
        aria-live="polite"
      >
        {routeLoading ? (
          <p className="text-sm font-black text-[#1b4332]">
            Calcul de l'itinéraire...
          </p>
        ) : route ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-[#52796f]">
                {routeMessage}
              </p>
              <p className="mt-1 text-lg font-black text-[#1b4332]">
                {route.distance} · {route.duration}
              </p>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#1b4332] px-4 py-3 text-xs font-black text-white"
            >
              Y aller
            </a>
          </div>
        ) : (
          <p className="text-sm font-bold text-[#52796f]">
            {routeMessage ||
              "Localise-toi, puis touche un marqueur pour lancer un itinéraire."}
          </p>
        )}
      </div>
    </section>
  );
}

function ProfileView({ activities, budget, onReset }) {
  const favoriteCount = activities.filter((a) => a.favorite).length;
  const doneCount = activities.filter((a) => a.done).length;
  const favBudget = activities.filter((a) => a.favorite).reduce((s, a) => s + Number(a.price), 0);
  const averageRating =
    activities.reduce((sum, a) => sum + Number(a.rating), 0) / Math.max(activities.length, 1);

  const urgences = [
    { label: "SAMU", tel: "tel:15", icon: "🚑" },
    { label: "Pompiers", tel: "tel:18", icon: "🚒" },
    { label: "Police", tel: "tel:17", icon: "🚔" },
    { label: "Urgences EU", tel: "tel:112", icon: "🆘" },
  ];

  return (
    <section className="space-y-5">
      {/* Carte identité */}
      <div className="rounded-[2rem] bg-[#1b4332] p-5 text-white shadow-[0_18px_45px_rgba(27,67,50,0.22)]">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#74c69d] text-2xl font-black text-[#1b4332]">
            H
          </div>
          <div>
            <p className="text-sm font-semibold text-white/70">Séjour</p>
            <h2 className="text-2xl font-black">Hossegor 2026</h2>
            <p className="text-xs text-white/60">04 – 06 mai · Capbreton crew</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-2">
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-black">{activities.length}</p>
            <p className="text-[10px] font-bold text-white/70">Étapes</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-black">{doneCount}</p>
            <p className="text-[10px] font-bold text-white/70">Faits</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-black">{favoriteCount}</p>
            <p className="text-[10px] font-bold text-white/70">Favoris</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center">
            <p className="text-xl font-black">{averageRating.toFixed(1)}</p>
            <p className="text-[10px] font-bold text-white/70">Note</p>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <Euro className="h-6 w-6 text-[#2d6a4f]" />
          <p className="mt-4 text-sm font-bold text-[#52796f]">Budget total</p>
          <p className="text-2xl font-black">{currency.format(budget)}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <Heart className="h-6 w-6 text-rose-400" />
          <p className="mt-4 text-sm font-bold text-[#52796f]">Budget favoris</p>
          <p className="text-2xl font-black">{currency.format(favBudget)}</p>
        </div>
      </div>

      {/* Hébergement */}
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#52796f]">🏠 Hébergement</p>
            <p className="mt-1 font-black text-[#1b4332]">Airbnb Capbreton centre</p>
            <p className="text-sm text-[#52796f]">Check-in lundi 16h00</p>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=43.6429,-1.4319"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#1b4332] px-4 py-2.5 text-xs font-black text-white"
          >
            <Navigation className="h-3.5 w-3.5" />
            Y aller
          </a>
        </div>
      </div>

      {/* Numéros utiles */}
      <div className="rounded-[2rem] bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-black uppercase text-[#52796f]">📞 Numéros utiles</p>
        <div className="grid grid-cols-2 gap-2">
          {urgences.map((u) => (
            <a
              key={u.label}
              href={u.tel}
              className="flex items-center gap-2 rounded-2xl bg-[#edf6f0] px-3 py-3 text-sm font-bold text-[#1b4332] hover:bg-[#74c69d]/30"
            >
              <span>{u.icon}</span>
              {u.label}
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-3xl bg-white px-5 py-4 text-sm font-black text-[#1b4332] shadow-sm"
      >
        Restaurer l'itinéraire initial
      </button>
    </section>
  );
}

function ActivityForm({ form, editing, onChange, onClose, onSave }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const update = (field, value) => onChange({ ...form, [field]: value });

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="fixed inset-0 z-[60] overflow-y-auto bg-[#1b4332]/55 p-4 font-['Inter',_'Montserrat',sans-serif] backdrop-blur">
      <form
        onSubmit={onSave}
        className="mx-auto mt-6 max-w-md rounded-[2.25rem] bg-[#edf6f0] p-5 text-[#1b4332] shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#52796f]">
              {editing ? "Édition" : "Création"}
            </p>
            <h2 className="text-2xl font-black">
              {editing ? "Modifier" : "Nouvelle activité"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b4332]"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
              Titre
            </span>
            <input
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              placeholder="Nom de l'activité"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
                Jour
              </span>
              <select
                value={form.day}
                onChange={(event) => update("day", event.target.value)}
                className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              >
                {days.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.short}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
                Heure
              </span>
              <input
                value={form.time}
                onChange={(event) => update("time", event.target.value)}
                className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
                placeholder="12h00"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
                Catégorie
              </span>
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              >
                {categories.map((category) => (
                  <option key={category.label} value={category.label}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
                Prix
              </span>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
                Note
              </span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) => update("rating", event.target.value)}
                className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </label>
            <label className="relative block">
              <span className="mb-2 flex items-center justify-between text-xs font-black uppercase text-[#52796f]">
                Lieu ou Adresse
                <button
                  type="button"
                  onClick={() => {
                    if ("geolocation" in navigator) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        update("latitude", pos.coords.latitude);
                        update("longitude", pos.coords.longitude);
                        update("location", "Ma position actuelle");
                        setShowSuggestions(false);
                      });
                    }
                  }}
                  className="text-[#2d6a4f] transition hover:scale-110 hover:text-[#1b4332]"
                  title="Utiliser ma position GPS"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </span>
              <input
                value={form.location}
                onChange={(event) => {
                  update("location", event.target.value);
                  searchAddress(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
                placeholder="Rechercher une adresse..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-[#d8eadf]">
                  {suggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      onClick={() => {
                        update("location", s.name || s.display_name.split(',')[0]);
                        update("latitude", parseFloat(s.lat));
                        update("longitude", parseFloat(s.lon));
                        setShowSuggestions(false);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#edf6f0]"
                    >
                      <p className="font-bold text-[#1b4332]">{s.name || s.display_name.split(',')[0]}</p>
                      <p className="truncate text-xs text-[#52796f]">{s.display_name}</p>
                    </button>
                  ))}
                </div>
              )}
            </label>
          </div>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#52796f]">
              <ImageIcon className="h-4 w-4" />
              Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => update("image", e.target.result);
                reader.readAsDataURL(file);
              }}
              className="w-full rounded-3xl border-0 bg-white px-4 py-3 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
            />
            {form.image && form.image.startsWith("data:image") && (
              <img src={form.image} alt="Aperçu" className="mt-2 h-16 w-16 rounded-xl object-cover" />
            )}
          </label>

          {/* Lat/Lng hidden - automatically managed by the Autocomplete */}

          <div className="grid grid-cols-3 gap-3">
            <input
              value={form.distance}
              onChange={(event) => update("distance", event.target.value)}
              className="w-full rounded-3xl border-0 bg-white px-3 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              placeholder="Distance"
            />
            <input
              value={form.duration}
              onChange={(event) => update("duration", event.target.value)}
              className="w-full rounded-3xl border-0 bg-white px-3 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              placeholder="Temps"
            />
            <input
              value={form.weather}
              onChange={(event) => update("weather", event.target.value)}
              className="w-full rounded-3xl border-0 bg-white px-3 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              placeholder="Météo"
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase text-[#52796f]">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows={4}
              className="w-full resize-none rounded-[1.75rem] border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              placeholder="Notes privées"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#52796f]">
              <ExternalLink className="h-4 w-4" />
              Lien / Téléphone (optionnel)
            </span>
            <input
              value={form.link || ''}
              onChange={(event) => update("link", event.target.value)}
              className="w-full rounded-3xl border-0 bg-white px-4 py-4 text-base ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-[#2d6a4f]"
              placeholder="https://restaurant.fr ou tel:0556..."
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_1.3fr] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-3xl bg-white px-5 py-4 text-sm font-black text-[#1b4332]"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-3xl bg-[#2d6a4f] px-5 py-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(45,106,79,0.3)]"
          >
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
        </div>
      </form>
    </section>
  );
}

function AIView({ messages, input, loading, onInputChange, onSend, onAddActivity }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "Il pleut cet aprem, qu'est-ce qu'on fait ?",
    "Suggère-nous un bon restau pour ce soir",
    "On veut une activité sportive demain matin",
    "Quels sont les meilleurs spots de surf ici ?",
  ];

  return (
    <section className="flex flex-col" style={{ height: "calc(100dvh - 220px)" }}>
      {/* En-tête */}
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#52796f]">Propulsé par Gemini</p>
          <h2 className="text-xl font-black text-[#1b4332]">Assistant IA</h2>
        </div>
      </div>

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <div className="rounded-[2rem] bg-gradient-to-br from-violet-50 to-indigo-50 p-5 border border-violet-100">
            <p className="text-sm font-black text-indigo-800 mb-1">👋 Bonjour Capbreton crew !</p>
            <p className="text-sm text-indigo-700 mb-4 leading-relaxed">
              Je connais votre itinéraire et la météo. Pose-moi n'importe quelle question sur Hossegor, ou demande-moi de suggérer une activité.
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onInputChange(s)}
                  className="w-full text-left rounded-2xl bg-white px-4 py-3 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition border border-indigo-100"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 ${
                msg.role === "user"
                  ? "rounded-br-md bg-[#1b4332] text-white"
                  : "rounded-bl-md bg-white shadow-[0_4px_16px_rgba(27,67,50,0.08)]"
              }`}
            >
              <p className={`text-sm font-semibold leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "text-white" : "text-[#1b4332]"}`}>
                {msg.content}
              </p>

              {msg.suggestedActivity && (
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#edf6f0] to-[#d8eadf] p-4 border border-[#b7e4c7]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#52796f] mb-2">✨ Activité suggérée</p>
                  <p className="font-black text-[#1b4332] text-base">{msg.suggestedActivity.title}</p>
                  <p className="text-xs text-[#52796f] mt-0.5">
                    {msg.suggestedActivity.day} · {msg.suggestedActivity.time} · {msg.suggestedActivity.location}
                    {msg.suggestedActivity.price > 0 ? ` · ${msg.suggestedActivity.price}€` : " · Gratuit"}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddActivity(msg.suggestedActivity)}
                    className="mt-3 w-full rounded-xl bg-[#2d6a4f] py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#1b4332] transition"
                  >
                    + Ajouter à l'itinéraire
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[1.5rem] rounded-bl-md bg-white px-5 py-4 shadow-[0_4px_16px_rgba(27,67,50,0.08)]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-[#e9f5ee]">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder="Pose ta question à Gemini..."
          className="flex-1 rounded-3xl bg-white px-4 py-3.5 text-base shadow-sm ring-1 ring-[#d8eadf] focus:ring-2 focus:ring-violet-400 placeholder:text-[#52796f]/60"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg disabled:opacity-40 transition hover:scale-105"
          aria-label="Envoyer"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

