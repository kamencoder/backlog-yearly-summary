import type { CsvData } from "./DataContext";
import { DateTime } from "luxon";

// YEARLY SUMMARY
// Games finished (beat or complete)
// PLATFORMS:
//   - Total Unique (Number)
//   - Games finished by platform (Pie)
// RELEASE YEARS:
//   - Time Traveler Ranking (S,A,B,C,D,F) based on decades explored
//   - Time Preference (Modern, Vintage, Mixed)
//   - Games finished by decade (Bar)
// TIME SPENT:
//   - Total time spent (Number)
//   - Average time spent per game (Number)
//   - Games finished by length group (Bar)
// 
// { [year]: { platform: { [platform]: number } }  }
// Top 5 games (ranked by rating)
// ACQUISITIONS:
//   - Total games acquired (Number)
//      - Games played
//      - Games beaten, completed, dropped, or continuous


const SummaryGroupWindowEnum = {
  month: 'month',
  year: 'year',
} as const;
export type SummaryGroupWindow = typeof SummaryGroupWindowEnum[keyof typeof SummaryGroupWindowEnum];

export interface ReleaseDecadeTotal {
  decade: number;
  total: number;
};
export interface PlatformTotal {
  platform: string;
  platformAbbreviation: string;
  total: number;
};

const LengthGroupEnum = {
  extrashort: '<1hr', // 1hr or less
  short: '1-5 hrs', // 1-5 hrs
  mediumsmall: '5-10 hrs', // 5-10 hrs
  medium: '10-20 hrs', // 10-20 hrs
  long: '20-40 hrs', // 20-40 hrs
  extralong: '40-80 hrs', // 40-80 hrs
  extraextralong: '80+ hrs', // 80+ hrs    
  unknown: 'unknown',
} as const;
const LengthGroupSorting = {
  [LengthGroupEnum.extrashort]: 1,
  [LengthGroupEnum.short]: 2,
  [LengthGroupEnum.mediumsmall]: 3,
  [LengthGroupEnum.medium]: 4,
  [LengthGroupEnum.long]: 5,
  [LengthGroupEnum.extralong]: 6,
  [LengthGroupEnum.extraextralong]: 7,
  [LengthGroupEnum.unknown]: 8,
}
const platformAbbreviations: { [key: string]: string } = {
  'Windows PC': 'PC',
  'Web browser': 'Web',
  'Nintendo Entertainment System': 'NES',
  'Family Computer': 'Famicom',
  'Super Famicom': 'SFC',
  'Super Nintendo Entertainment System': 'SNES',
  'Nintendo 64': 'N64',
  'Nintendo GameCube': 'GC',
  'Nintendo Switch': 'Switch',
  'Nintendo Switch 2': 'Switch2',
  'Game Boy': 'GB',
  'Game Boy Color': 'GBC',
  'Game Boy Advance': 'GBA',
  'Nintendo DS': 'DS',
  'Nintendo 3DS': '3DS',
  'Sega Master System': 'SMS',
  'Sega Genesis': 'Genesis',
  'Sega Game Gear': 'GG',
  'Sega CD': 'SegaCD',
  'Sega 32X': '32X',
  'Sega Mega Drive': 'MD',
  'Sega Saturn': 'Saturn',
  'Sega Dreamcast': 'DC',
  'Turbografx-16/PC Engine CD': 'TG16',
  'PlayStation': 'PS1',
  'PlayStation 2': 'PS2',
  'PlayStation 3': 'PS3',
  'PlayStation 4': 'PS4',
  'PlayStation 5': 'PS5',
  'Xbox': 'XB',
  'Xbox 360': '360',
  'Xbox One': 'XB1',
  'Xbox Series X|S': 'XBS',
}

export type SummaryGameInfo = {
  id: string;
  title: string;
  platform: string;
  platformAbbreviation: string;
  status: string;
  completion: string;
  releaseYear: string | null;
  acquisitionDate: string | null;
  acquisitionMonth: string | null;
  acquiredThisYear: boolean;
  completionDate: string | null;
  completionMonth: string | null;
  playTime: number | null;
  coverImage: string | null;
  rating: number | null;
}

export type LengthGroup = typeof LengthGroupEnum[keyof typeof LengthGroupEnum];
export interface LengthGroupTotal {
  lengthGroup: LengthGroup;
  totalGames: number;
  totalTimeSpent: number;
};

export interface AcquisitionSummary {
  totalAcquired: number;
  totalPlayed: number;
  totalFinished: number; // Beaten, Completed, Dropped, Continuous
  totalDropped: number;
  totalBeaten: number;
  totalCompleted: number;
  totalContinuous: number;
  percentPlayed: number;
  percentFinished: number;
}


export interface Summary {
  year: number;
  platformTotals: PlatformTotal[];
  lengthGroupTotals: LengthGroupTotal[];
  releaseDecadeTotals: ReleaseDecadeTotal[];
  totalGamesBeaten: number;
  totalGamesCompeleted: number;
  totalTimeSpent: number;
  averageTimeSpent: number;
  acquisitions: AcquisitionSummary;
  topGames: string[];
  games: SummaryGameInfo[];
}

const getDecadeFromYear = (year: number | null): number => {
  if (!year) {
    return 0;
  }
  return Math.floor(year / 10) * 10;
}

export const getPlayTimeInHours = (playTime: number | null, decimals?: number): number | null => {
  if (!playTime) {
    return null;
  }
  const hours = playTime / 60;
  if (!decimals) {
    return Math.floor(hours);
  } else {
    return parseFloat(hours.toFixed(decimals));
  }
}


const getLengthGroupByTimePlayed = (timePlayed: number | null): LengthGroup => {
  if (!timePlayed) {
    return LengthGroupEnum.unknown;
  }
  if (timePlayed <= (1 * 60)) { // 1 hour or le ss
    return LengthGroupEnum.extrashort;
  } else if (timePlayed <= (5 * 60)) { // 1-5 hours
    return LengthGroupEnum.short;
  } else if (timePlayed <= (10 * 60)) { // 5-10 hours
    return LengthGroupEnum.mediumsmall;
  } else if (timePlayed <= (20 * 60)) { // 10-20 hours
    return LengthGroupEnum.medium;
  } else if (timePlayed <= (40 * 60)) { // 20-40 hours
    return LengthGroupEnum.long;
  } else if (timePlayed <= (80 * 60)) { // 40-80 hours
    return LengthGroupEnum.extralong;
  } else {
    return LengthGroupEnum.extraextralong;
  }
}

export const getYearSummary = (games: CsvData[], year: number): Summary => {
  const summary: Summary = {
    year,
    platformTotals: [],
    lengthGroupTotals: [],
    releaseDecadeTotals: [],
    totalGamesBeaten: 0,
    totalGamesCompeleted: 0,
    totalTimeSpent: 0,
    averageTimeSpent: 0,
    acquisitions: {
      totalAcquired: 0,
      totalPlayed: 0,
      totalFinished: 0, // Beaten, Completed, Dropped, Continuous
      totalDropped: 0,
      totalBeaten: 0,
      totalCompleted: 0,
      totalContinuous: 0,
      percentPlayed: 0,
      percentFinished: 0,
    },
    topGames: [],
    games: [],
  }

  const getBundleParentGame = (games: CsvData[], childGameIndex: number) => {
    if (childGameIndex === 0) return null;

    for (let i = childGameIndex - 1; i--;) {
      if (games[i]?.['Type']?.toString() !== 'Bundled Game') {
        return games[i];
      }
    }
  }

  games.forEach((game, i) => {
    const nextGame = games.length > i + 1 ? games[i + 1] : null;
    const id = game['IGDB ID']?.toString() || `unknown_${i}`;
    const title = game['Game name']?.toString() || 'Unknown Title';
    let platform = game['Platform']?.toString();
    const releaseDateRaw = game['Game release date']?.toString();
    const releaseDate = releaseDateRaw ? DateTime.fromISO(releaseDateRaw) : null;
    const completion = game['Completion']?.toString() || 'Unknown';
    const status = game['Status']?.toString() || 'Unknown';
    let acquisitionDateRaw = game['Acquisition date']?.toString();

    const completionDateRaw = game['Completion date']?.toString();
    const completionDate = completionDateRaw ? DateTime.fromISO(completionDateRaw, { setZone: true }) : null;
    const completionYear = completionDate?.year;
    const playTime = game['Playtime'] ? parseInt(game['Playtime'].toString()) : null
    const type = game['Type']?.toString(); // (Bundled Game)
    const coverImage = game['Cover']?.toString() || null;
    const ratingRaw = game['Rating (Score)']?.toString();
    const rating = ratingRaw ? parseFloat(ratingRaw) / 2 : null; // comes in as 10 point raiting, need 

    const isBundleParent = nextGame?.['Type']?.toString() === 'Bundled Game';
    if (isBundleParent) {
      return; // Skip parent
    }

    const isBundleChild = type === 'Bundled Game';
    if (isBundleChild) {
      // Currently for game bundles, the parent game will have a record and all games that are part of that bundle will be right after it. 
      const parentGame = getBundleParentGame(games, i);
      if (parentGame) {
        platform = platform || parentGame?.['Platform']?.toString();
        acquisitionDateRaw = acquisitionDateRaw || parentGame?.['Acquisition date']?.toString();
      }
    }
    if (!platform) {
      platform = 'Unknown'; // Set to unknown if we still don't have a platform.
    }

    const acquisitionDate = acquisitionDateRaw ? DateTime.fromISO(acquisitionDateRaw, { setZone: true }) : null;
    const acquisitionYear = acquisitionDate?.year
    const platformAbbreviation = `${platformAbbreviations[platform] || platform}`

    let gameIncluded = false;
    if (completionYear && completionYear >= year && completionYear < (year + 1)) {
      gameIncluded = true;
      if (completion === 'Beaten') {
        summary.totalGamesBeaten += 1;
      } else if (completion === 'Completed') {
        summary.totalGamesCompeleted += 1;
      }

      if (playTime) {
        summary.totalTimeSpent += playTime;
      }

      // Update platform totals
      const platformTotal = summary.platformTotals.find(pt => pt.platform === platform);
      if (platformTotal) {
        platformTotal.total += 1;
      } else {
        summary.platformTotals.push({
          platform,
          platformAbbreviation,
          total: 1
        });
      }

      // Update length group totals
      let lengthGroup = getLengthGroupByTimePlayed(playTime);
      const lengthTotal = summary.lengthGroupTotals.find(lt => lt.lengthGroup === lengthGroup);
      if (lengthTotal) {
        lengthTotal.totalGames += 1;
        lengthTotal.totalTimeSpent += playTime || 0;
      } else {
        summary.lengthGroupTotals.push({ lengthGroup, totalGames: 1, totalTimeSpent: playTime || 0 });
      }

      // Update release decade totals
      const releaseYear = releaseDate ? releaseDate.year : null;
      const releaseDecade = getDecadeFromYear(releaseYear);
      const decadeTotal = summary.releaseDecadeTotals.find(yr => yr.decade === releaseDecade);
      if (decadeTotal) {
        decadeTotal.total += 1;
      } else {
        summary.releaseDecadeTotals.push({ decade: releaseDecade, total: 1 });
      }
    }

    let acquiredThisYear = false;
    if (acquisitionYear && acquisitionYear >= year && acquisitionYear < (year + 1)) {
      gameIncluded = true;
      acquiredThisYear = true;
      summary.acquisitions.totalAcquired += 1;
      summary.acquisitions.totalBeaten += (completion === 'Beaten' ? 1 : 0);
      summary.acquisitions.totalCompleted += (completion === 'Completed' ? 1 : 0);
      summary.acquisitions.totalDropped += (completion === 'Dropped' ? 1 : 0);
      summary.acquisitions.totalContinuous += (completion === 'Continuous' ? 1 : 0);
      summary.acquisitions.totalFinished += (['Beaten', 'Completed', 'Continuous', 'Dropped'].includes(completion) ? 1 : 0);
      summary.acquisitions.totalPlayed += (status === 'Played' || status === 'Playing' ? 1 : 0);
    }

    if (gameIncluded) {
      summary.games.push({
        id,
        title,
        platform,
        platformAbbreviation,
        status,
        completion,
        releaseYear: releaseDate?.year?.toString() || null,
        acquisitionDate: acquisitionDate?.toFormat('MMM dd') || null,
        acquisitionMonth: acquisitionDate ? acquisitionDate.monthLong : null,
        completionDate: completionDate?.toFormat('MMM dd') || null,
        completionMonth: completionDate ? completionDate.monthLong : null,
        playTime,
        coverImage,
        acquiredThisYear,
        rating
      });
    }
  });

  // Sort platforms by name
  summary.platformTotals.sort((a, b) => a.platform.localeCompare(b.platform));

  // Sort length groups by defined order
  summary.lengthGroupTotals.sort((a, b) => LengthGroupSorting[a.lengthGroup] - LengthGroupSorting[b.lengthGroup]);
  // convert time spent to hours
  summary.lengthGroupTotals.forEach(lt => {
    lt.totalTimeSpent = getPlayTimeInHours(lt.totalTimeSpent) || 0;
  });

  // Sort release decades by decade
  summary.releaseDecadeTotals.sort((a, b) => a.decade - b.decade);

  // Add missing decades
  const earliestDecade = summary.releaseDecadeTotals[0]?.decade || 0;
  const latestDecade = summary.releaseDecadeTotals[summary.releaseDecadeTotals.length - 1]?.decade || 0;
  if (earliestDecade !== latestDecade) {
    // Add missing decades
    for (let decade = earliestDecade + 10; decade < latestDecade; decade += 10) {
      if (!summary.releaseDecadeTotals.find(d => d.decade === decade)) {
        summary.releaseDecadeTotals.push({ decade, total: 0 });
      }
    }
  }
  // add acquisition percentages
  if (summary.acquisitions.totalAcquired > 0) {
    summary.acquisitions.percentPlayed = Math.round((summary?.acquisitions.totalPlayed / summary.acquisitions.totalAcquired) * 100)
    summary.acquisitions.percentFinished = Math.round((summary?.acquisitions.totalFinished / summary.acquisitions.totalAcquired) * 100)
  }


  return summary;

}
