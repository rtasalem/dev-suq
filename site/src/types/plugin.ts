export interface Plugin {
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
  };
  license: string;
  keywords: string[];
  agents?: string;
  skills?: string;
  prerequisites?: string[];
}

export interface PluginCardData {
  name: string;
  description: string;
  keywords: string[];
}

export interface PluginModalData {
  name: string;
  description: string;
  version: string;
  license: string;
  author: string;
  keywords: string[];
  prerequisites: string[];
  installCommand: string;
}
