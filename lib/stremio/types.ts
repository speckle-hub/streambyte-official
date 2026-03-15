export interface Manifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  resources: (string | { name: string; types: string[]; idPrefixes?: string[] })[];
  types: string[];
  catalogs: CatalogManifest[];
  idPrefixes?: string[];
  background?: string;
  logo?: string;
  contactEmail?: string;
  behaviorHints?: BehaviorHints;
}

export interface CatalogManifest {
  type: string;
  id: string;
  name?: string;
  extra?: CatalogExtra[];
}

export interface CatalogExtra {
  name: string;
  options?: string[];
  required?: boolean;
  isRequired?: boolean;
}

export interface BehaviorHints {
  adultContent?: boolean;
  configurable?: boolean;
  configurationRequired?: boolean;
  defaultVideoId?: string;
}

export type CatalogItem = MetaPreview;

export interface MetaPreview {
  id: string;
  type: string;
  name: string;
  poster?: string;
  posterShape?: 'poster' | 'landscape' | 'square';
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  genres?: string[];
}

export interface MetaDetail extends MetaPreview {
  videos?: Video[];
  runtime?: string;
  cast?: string[];
  director?: string[];
  website?: string;
  awards?: string;
  behaviorHints?: {
    defaultVideoId?: string;
    hasDetailsView?: boolean;
  };
}

export interface Video {
  id: string;
  title?: string;
  released?: string;
  season?: number;
  episode?: number;
  number?: number;
  thumbnail?: string;
  overview?: string;
  streams?: Stream[];
  available?: boolean;
}

export interface Stream {
  url?: string;
  ytId?: string;
  externalUrl?: string;
  infoHash?: string;
  fileIdx?: number;
  title?: string;
  name?: string;
  description?: string;
  behaviorHints?: StreamBehaviorHints;
}

export interface StreamBehaviorHints {
  notWebReady?: boolean;
  bingeGroup?: string;
  countryWhitelist?: string[];
  proxyHeaders?: Record<string, string>;
}

export interface Subtitle {
  id?: string;
  url: string;
  lang: string;
}

export interface AddonResponse<T> {
  [key: string]: T;
}
