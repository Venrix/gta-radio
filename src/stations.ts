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

export const stations: Station[] = [
  {
    id: 'blue_ark',
    title: 'Blue Ark',
    icon: '/assets/station_icons/blue_ark.jpg',
    duration: 135.57,
    url: 'https://www.youtube.com/watch?v=LRdjhqMYSGg',
    disabled: false
  },
  {
    id: 'music_locker_radio',
    title: 'Music Locker Radio',
    icon: '/assets/station_icons/music_locker_radio.jpg',
    duration: 454.1,
    url: 'https://www.youtube.com/watch?v=dBvMBYbUZFc',
    disabled: false
  },
  {
    id: 'worldwide_fm',
    title: 'Worldwide FM',
    icon: '/assets/station_icons/worldwide_fm.jpg',
    duration: 307.72,
    url: 'https://www.youtube.com/watch?v=GgIB2WClkwY',
    disabled: false
  },
  {
    id: 'flylo_fm',
    title: 'FlyLo FM',
    icon: '/assets/station_icons/flylo_fm.jpg',
    duration: 129.5,
    url: 'https://www.youtube.com/watch?v=3P-ux63rHkU',
    disabled: false
  },
  {
    id: 'the_lowdown_91.1',
    title: 'The Lowdown 91.1',
    icon: '/assets/station_icons/the_lowdown_91.1.jpg',
    duration: 142.33,
    url: 'https://www.youtube.com/watch?v=RT9h-C24idQ',
    disabled: false
  },
  {
    id: 'the_lab',
    title: 'The Lab',
    icon: '/assets/station_icons/the_lab.jpg',
    duration: 57.62,
    url: 'https://www.youtube.com/watch?v=Xy75nA56vcc',
    disabled: false
  },
  {
    id: 'radio_mirror_park',
    title: 'Radio Mirror Park',
    icon: '/assets/station_icons/radio_mirror_park.jpg',
    duration: 212.9,
    url: 'https://www.youtube.com/watch?v=SDWHIACuuaQ',
    disabled: false
  },
  {
    id: 'kult_fm',
    title: 'Kult FM',
    icon: '/assets/station_icons/kult_fm.jpg',
    duration: 140.2,
    url: 'https://www.youtube.com/watch?v=9cL6IDCtuzs',
    disabled: false
  },
  {
    id: 'space_103.2',
    title: 'Space 103.2',
    icon: '/assets/station_icons/space_103.2.jpg',
    duration: 188.32,
    url: 'https://www.youtube.com/watch?v=6TnV43UWoqk',
    disabled: false
  },
  {
    id: 'vinewood_boulevard_radio',
    title: 'Vinewood Boulevard Radio',
    icon: '/assets/station_icons/vinewood_boulevard_radio.jpg',
    duration: 92.28,
    url: 'https://www.youtube.com/watch?v=5fnGyUc2eFs',
    disabled: false
  },
  {
    id: 'blonded_los_santos_97.8_fm',
    title: 'blonded Los Santos 97.8 FM',
    icon: '/assets/station_icons/blonded_los_santos_97.8_fm.jpg',
    duration: 102.33,
    url: 'https://www.youtube.com/watch?v=-tVumJBaTWY',
    disabled: false
  },
  {
    id: 'los_santos_underground_radio',
    title: 'Los Santos Underground Radio',
    icon: '/assets/station_icons/los_santos_underground_radio.jpg',
    duration: 278.92,
    url: 'https://www.youtube.com/watch?v=I2Xjuz-mnN0',
    disabled: false
  },
  {
    id: 'ifruit_radio',
    title: 'iFruit Radio',
    icon: '/assets/station_icons/ifruit_radio.jpg',
    duration: 86.7,
    url: 'https://www.youtube.com/watch?v=fpvJaphZ2_g',
    disabled: false
  },
  {
    id: 'still_slipping_los_santos',
    title: 'Still Slipping Los Santos',
    icon: '/assets/station_icons/still_slipping_los_santos.jpg',
    duration: 72.75,
    url: 'https://www.youtube.com/watch?v=P3qixldzDow',
    disabled: false
  },
  {
    id: 'los_santos_rock_radio',
    title: 'Los Santos Rock Radio',
    icon: '/assets/station_icons/los_santos_rock_radio.jpg',
    duration: 287.35,
    url: 'https://www.youtube.com/watch?v=fZPV-9GlM-c',
    disabled: false
  },
  {
    id: 'non-stop-pop_fm',
    title: 'Non-Stop-Pop FM',
    icon: '/assets/station_icons/non-stop-pop_fm.jpg',
    duration: 231.32,
    url: 'https://www.youtube.com/watch?v=Fjp0wu3lEHk',
    disabled: false
  },
  {
    id: 'radio_los_santos',
    title: 'Radio Los Santos',
    icon: '/assets/station_icons/radio_los_santos.jpg',
    duration: 356.42,
    url: 'https://www.youtube.com/watch?v=C3_FSXZtRe8',
    disabled: false
  },
  {
    id: 'channel_x',
    title: 'Channel X',
    icon: '/assets/station_icons/channel_x.jpg',
    duration: 91.83,
    url: 'https://www.youtube.com/watch?v=HHG44PJ0oyo',
    disabled: false
  },
  {
    id: 'rebel_radio',
    title: 'Rebel Radio',
    icon: '/assets/station_icons/rebel_radio.jpg',
    duration: 82.65,
    url: 'https://www.youtube.com/watch?v=HeLsaX1I5B4',
    disabled: false
  },
  {
    id: 'soulwax_fm',
    title: 'Soulwax FM',
    icon: '/assets/station_icons/soulwax_fm.jpg',
    duration: 54.33,
    url: 'https://www.youtube.com/watch?v=EhsQZl8BFz8',
    disabled: false
  },
  {
    id: 'east_los_fm',
    title: 'East Los FM',
    icon: '/assets/station_icons/east_los_fm.jpg',
    duration: 45.05,
    url: 'https://www.youtube.com/watch?v=xTpsoTmhdNc',
    disabled: false
  },
  {
    id: 'west_coast_classics',
    title: 'West Coast Classics',
    icon: '/assets/station_icons/west_coast_classics.jpg',
    duration: 258.55,
    url: 'https://www.youtube.com/watch?v=z0Wf3IuZnf0',
    disabled: false
  },
  {
    id: 'media_player',
    title: 'Media Player',
    icon: '/assets/station_icons/media_player.jpg',
    duration: 416,
    url: 'https://www.youtube.com/watch?v=dPkzYz-AYOs',
    disabled: false
  },
  {
    id: 'motomami_los_santos',
    title: 'MOTOMAMI Los Santos',
    icon: '/assets/station_icons/motomami_los_santos.jpg',
    duration: 196,
    url: 'https://www.youtube.com/watch?v=30uA_Hppzpc',
    disabled: false
  },
  {
    id: 'blaine_county_talk_radio',
    title: 'Blaine County Talk Radio',
    icon: '/assets/station_icons/blaine_county_talk_radio.jpg',
    duration: 0,
    url: '',
    disabled: true
  },
  {
    id: 'self_radio',
    title: 'Self Radio',
    icon: '/assets/station_icons/self_radio.jpg',
    duration: 0,
    url: '',
    disabled: true
  },
  {
    id: 'west_coast_talk_radio',
    title: 'West Coast Talk Radio',
    icon: '/assets/station_icons/west_coast_talk_radio.jpg',
    duration: 0,
    url: '',
    disabled: true
  }
];

for (const station of stations) {
  station.icon = iconModules[`.${station.icon}`] ?? station.icon;
}
