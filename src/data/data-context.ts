import React from 'react';
import type { Summary } from './summarizer';


export interface Data {
  games?: CsvData[];
  year: number;
  summary: Summary | null,
  userData: UserData,
}


export interface ViewSectionSettings {
  platform: PlatformViewSectionSettings;
  gameLength: BaseViewSectionSettings;
  decade: BaseViewSectionSettings;
  acquisitions: BaseViewSectionSettings;
  monthly: BaseViewSectionSettings;
}

export interface BaseViewSectionSettings {
  visible: boolean;
}
export interface PlatformViewSectionSettings extends BaseViewSectionSettings {
  showPlatformTimeAndGamesCombined: boolean;
}

export interface ViewSettings {
  sectionSettings: ViewSectionSettings;
  showPlaytimeStats: boolean;
}
export interface UserData {
  gameEdits: Record<string, GameEdit | undefined>; // Game edits by game id
  viewSettings: ViewSettings;
}
export interface GameEdit {
  coverImage: string | null;
}
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};


export interface DataContextProps {
  data: Data;
  initialize: (games: CsvData[]) => void;
  editYear: (year: number) => void;
  editGame: (gameId: string, gameEdit: GameEdit) => void;
  editViewSettings: (settings: DeepPartial<ViewSettings>) => void;
}

export interface CsvData {
  [key: string]: string | number | null | undefined;
}

export const defaultContext: DataContextProps = {
  data: {
    year: new Date().getFullYear(),
    userData: {
      gameEdits: {},
      viewSettings: {
        sectionSettings: {
          platform: { visible: true, showPlatformTimeAndGamesCombined: true },
          gameLength: { visible: true },
          decade: { visible: true },
          acquisitions: { visible: true },
          monthly: { visible: true },
        },
        showPlaytimeStats: true,
      },
    }
  }
} as DataContextProps;

export const DataContext = React.createContext<DataContextProps>(defaultContext);
