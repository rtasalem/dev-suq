import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, PluginCardData, PluginModalData } from '../types/plugin';

const PLUGINS_DIR = path.resolve(process.cwd(), '../plugins');
const MARKETPLACE_NAME = 'dev-suq';

function loadPluginManifests(): Plugin[] {
  const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const manifestPath = path.join(PLUGINS_DIR, entry.name, 'plugin.json');
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(raw) as Plugin;
    });
}

export function getPluginCards(): PluginCardData[] {
  return loadPluginManifests().map((plugin) => ({
    name: plugin.name,
    description: plugin.description,
    keywords: plugin.keywords,
  }));
}

export function getPluginModals(): PluginModalData[] {
  return loadPluginManifests().map((plugin) => ({
    name: plugin.name,
    description: plugin.description,
    version: plugin.version,
    license: plugin.license,
    author: plugin.author.name,
    keywords: plugin.keywords,
    prerequisites: plugin.prerequisites ?? [],
    installCommand: `copilot plugin install ${plugin.name}@${MARKETPLACE_NAME}`,
  }));
}
