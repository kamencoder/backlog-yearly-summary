import React from 'react';
import type { Summary } from './summarizer';


export interface Data {
  games?: CsvData[];
  year: number;
  summary: Summary | null,
  userData: UserData,
}

export interface ViewSectionVisibilitySettings {
  showPlatformSection: boolean;
  showGameLengthSection: boolean;
  showDecadeSection: boolean;
  showMonthlyOverview: boolean;
  showMonthlyGames: boolean;
  showAcquisitions: boolean;
}

export interface ViewSettings {
  sectionVisibility: ViewSectionVisibilitySettings;
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
        sectionVisibility: {
          showPlatformSection: true,
          showGameLengthSection: true,
          showDecadeSection: true,
          showAcquisitions: true,
          showMonthlyOverview: true,
          showMonthlyGames: true,
        },
        showPlaytimeStats: true,
      },
    }
  }
} as DataContextProps;

export const DataContext = React.createContext<DataContextProps>(defaultContext);
