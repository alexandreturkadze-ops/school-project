// ხატულები Lucide-დან (https://lucide.dev) — მხოლოდ ის, რაც საიტზე გამოიყენება
import {
  Users, User, UserRound, Baby, Backpack, BookOpen, FlaskConical, GraduationCap, Pencil, School,
  ChartBar, ChartPie, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, MapPin, Map, Globe, Languages,
  Flag, Grid3x3, Calculator, Trophy, Medal, Plus, FolderOpen, Folder, Settings, LogOut, Lock,
  Menu, X, ChevronDown, Trash2, Save, Upload, Download, Image, Type, RotateCcw, Search, Eye,
  ExternalLink, LayoutGrid, Layers, Check, TriangleAlert, ChevronUp, House, Hash, Sparkles, KeyRound,
  IdCard, CalendarDays, Building2, Mountain,
  Sun, Moon, Monitor, Undo2, Redo2, Copy, FileSpreadsheet, Filter, ArrowUpToLine, Palette, EyeOff, Info, Clock, HardDrive, LayoutDashboard, ChevronRight, Pause, Play,
} from 'lucide';

export const ICONS = {
  users: Users, user: User, 'user-round': UserRound, baby: Baby, backpack: Backpack, book: BookOpen,
  flask: FlaskConical, cap: GraduationCap, pencil: Pencil, school: School, bar: ChartBar, pie: ChartPie,
  up: ArrowUp, down: ArrowDown, right: ArrowRight, left: ArrowLeft, pin: MapPin, map: Map, globe: Globe,
  languages: Languages, flag: Flag, grid: Grid3x3, calc: Calculator, trophy: Trophy, medal: Medal,
  plus: Plus, 'folder-open': FolderOpen, folder: Folder, settings: Settings, logout: LogOut, lock: Lock,
  menu: Menu, x: X, 'chevron-down': ChevronDown, 'chevron-up': ChevronUp, trash: Trash2, save: Save,
  upload: Upload, download: Download, image: Image, type: Type, reset: RotateCcw, search: Search, eye: Eye,
  external: ExternalLink, layout: LayoutGrid, layers: Layers, check: Check, warn: TriangleAlert, home: House,
  hash: Hash, sparkles: Sparkles, key: KeyRound, id: IdCard, calendar: CalendarDays,
  building: Building2, mountain: Mountain,
  sun: Sun, moon: Moon, monitor: Monitor, undo: Undo2, redo: Redo2, copy: Copy, sheet: FileSpreadsheet, filter: Filter,
  top: ArrowUpToLine, palette: Palette, 'eye-off': EyeOff, info: Info, clock: Clock, drive: HardDrive, dashboard: LayoutDashboard, 'chevron-right': ChevronRight, pause: Pause, play: Play,
} as const;

export type IconName = keyof typeof ICONS;
