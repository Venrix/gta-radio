import { stationData } from './station-data.js';

const iconModules = import.meta.glob('./assets/station_icons/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

export interface Station {
  id: string;
  title: string;
  icon: string;
  url: string;
  disabled: boolean;
  duration: number;
}

export const stations: Station[] = stationData.map((s) => ({
  ...s,
  icon:
    iconModules[`./assets/station_icons/${s.iconFile}`] ??
    `/assets/station_icons/${s.iconFile}`
}));
