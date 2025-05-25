import { readdirSync, readFileSync } from 'fs';
import { join, parse } from 'path';

// Configurar rutas base
const assetsPath = join(process.cwd(), 'src', 'assets');
const dataPath = join(assetsPath, 'data');

// Función para obtener IDs dinámicos de los menús
const getMenuIds = () => {
  try {
    const menusDir = join(dataPath, 'menus');
    return readdirSync(menusDir)
      .filter(file => file.startsWith('menu_') && file.endsWith('.json'))
      .map(file => {
        const { name } = parse(file);
        const id = name.split('_')[1];
        return parseInt(id, 10);
      });
  } catch (error) {
    console.error('Error reading menus:', error);
    return [];
  }
};

// Función para obtener IDs de archivos JSON
const getIdsFromJson = (filename: string) => {
  try {
    const filePath = join(dataPath, filename);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    return data.map((item: any) => item.id);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

export default {
  routes: [
    '/',
    {
      path: '/menus/:id',
      renderMode: 'pre-render',
      getPrerenderParams: () => {
        return getMenuIds().map(id => ({ id }));
      }
    },
    {
      path: '/menus/editar/:id',
      renderMode: 'pre-render',
      getPrerenderParams: () => {
        return getMenuIds().map(id => ({ id }));
      }
    },
    {
      path: '/categorias/editar/:id',
      renderMode: 'pre-render',
      getPrerenderParams: () => {
        const ids = getIdsFromJson('categorias.json');
        return ids.map((id: any) => ({ id }));
      }
    },
    {
      path: '/platos/editar/:id',
      renderMode: 'pre-render',
      getPrerenderParams: () => {
        const ids = getIdsFromJson('platos.json');
        return ids.map((id: any) => ({ id }));
      }
    },
    // Rutas estáticas adicionales
    { path: '/list-category', renderMode: 'pre-render' },
    { path: '/create-category', renderMode: 'pre-render' },
    { path: '/list-platos', renderMode: 'pre-render' },
    { path: '/create-dishes', renderMode: 'pre-render' },
    { path: '/create-menu', renderMode: 'pre-render' },
    { path: '/personal-list', renderMode: 'pre-render' },
    { path: '/configuracion', renderMode: 'pre-render' },
    { path: '/login', renderMode: 'pre-render' },
    { path: '/payment', renderMode: 'pre-render' },
    { path: '/welcome', renderMode: 'pre-render' },

  ]
};

/*
import fetch from 'node-fetch';

interface Menu { id: number }
interface Categoria { id: number }
interface Plato { id: number }

export default {
  routes: [
    '/',
    {
      path: '/menus/:id',
      renderMode: 'pre-render',
      getPrerenderParams: async () => {
        const response = await fetch('http://localhost:8000/api/menus');
        const menus: Menu[] = await response.json();
        return menus.map(menu => ({ id: menu.id }));
      }
    },
    {
      path: '/menus/editar/:id',
      renderMode: 'pre-render',
      getPrerenderParams: async () => {
        const response = await fetch('http://localhost:8000/api/menus');
        const menus: Menu[] = await response.json();
        return menus.map(menu => ({ id: menu.id }));
      }
    },
    {
      path: '/categorias/editar/:id',
      renderMode: 'pre-render',
      getPrerenderParams: async () => {
        const response = await fetch('http://localhost:8000/api/categorias');
        const categorias: Categoria[] = await response.json();
        return categorias.map(cat => ({ id: cat.id }));
      }
    },
    {
      path: '/platos/editar/:id',
      renderMode: 'pre-render',
      getPrerenderParams: async () => {
        const response = await fetch('http://localhost:8000/api/platos');
        const platos: Plato[] = await response.json();
        return platos.map(plato => ({ id: plato.id }));
      }
    }
  ]
};

*/