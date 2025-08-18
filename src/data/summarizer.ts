import type { CsvData } from "./data-context";
import { DateTime } from "luxon";
import { platforms } from "./platforms";

const SummaryGroupWindowEnum = {
  month: 'month',
  year: 'year',
} as const;
export type SummaryGroupWindow = typeof SummaryGroupWindowEnum[keyof typeof SummaryGroupWindowEnum];

export interface ReleaseDecadeTotal {
  decade: number;
  decadeLabel: string;
  totalGames: number;
  totalTime: number; // minutes
};
export interface PlatformTotal {
  platform: string;
  platformAbbreviation: string;
  totalGames: number;
  totalTime: number;
  totalTimeHours: number;
  percentOfTotalGames: number; // Optional, can be calculated later
  percentOfTotalTime: number; // Optional, can be calculated later
};

export interface AcquisitionSourceTotal {
  acquisitionSource: string;
  totalGames: number;
  totalCost: number;
  percentOfTotalGames?: number; // Optional, can be calculated later
  percentOfTotalCost?: number; // Optional, can be calculated later
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

export type SummaryGameInfo = {
  id: string;
  title: string;
  platform: string;
  platformAbbreviation: string;
  status: string;
  completion: string;
  releaseYear: number | null;
  releaseDecade: number; // 0 if unknown
  acquisitionDateRaw: string | null; // ISO format
  acquisitionDate: string | null;
  acquisitionMonth: string | null;
  acquiredThisYear: boolean;
  acquisitionType: string | null;
  acquisitionSource: string;
  completionDateRaw: string | null; // ISO format
  completionDate: string | null;
  completionMonth: string | null;
  finishedThisYear: boolean;
  playTime: number | null;
  playTimeIsEstimatedAverage: boolean | null;
  coverImage: string | null;
  rating: number | null;
  amountPaid: number | null;
  parentGameId?: string; // Only used for bundled games that are children.
  bundleInfo: BundleInfo | null; // Only used for bundled games that are parents.  
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
  totalMoneySpent: number;
  percentPlayed: number;
  percentFinished: number;
}

interface BundleInfo {
  childGameIds: string[];
  totalGames: number; // Total games in the bundle
  totalFinished: number; // Total finished games in the bundle
  avgTimePerGame: number;
  avgCostPerGame: number;
}

export interface Summary {
  year: number;
  platformTotals: PlatformTotal[];
  lengthGroupTotals: LengthGroupTotal[];
  releaseDecadeTotals: ReleaseDecadeTotal[];
  acquisitionSourceTotals: AcquisitionSourceTotal[];
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

const getGameSummary = (game: CsvData, i: number, year: number, parentGame: SummaryGameInfo | null): SummaryGameInfo => {
  const id = game['IGDB ID']?.toString() || `unknown_${i}`;
  const title = game['Game name']?.toString() || 'Unknown Title';
  let platform = game['Platform']?.toString();
  const releaseDateRaw = game['Game release date']?.toString() || null;
  const releaseDate = releaseDateRaw ? DateTime.fromISO(releaseDateRaw) : null;
  const releaseYear = (releaseDate && releaseDate.isValid) ? releaseDate.year : null;
  const releaseDecade = releaseYear ? getDecadeFromYear(releaseYear) : 0;
  let completion = game['Completion']?.toString() || 'Unknown';
  let status = game['Status']?.toString() || null;
  let acquisitionDateRaw = game['Acquisition date']?.toString() || null;
  let acquisitionType = game['Acquisition']?.toString() || null;
  let acquisitionSource = game['Acquisition Source']?.toString() || null;
  const amountPaidRaw = game['Amount paid']?.toString() || null;
  let amountPaid = amountPaidRaw ? parseFloat(amountPaidRaw) / 100 : 0;
  const additionalCostRaw = game['Additional Cost']?.toString() || null;
  let additionalCost = additionalCostRaw ? parseFloat(additionalCostRaw) / 100 : 0;


  let completionDateRaw = game['Completion date']?.toString() || null;
  let playTime = game['Playtime'] ? parseInt(game['Playtime'].toString()) : null
  let playTimeIsEstimatedAverage = false;
  const type = game['Type']?.toString(); // (Bundled Game)
  const coverImage = game['Cover']?.toString() || null;
  const ratingRaw = game['Rating (Score)']?.toString();
  const rating = ratingRaw ? parseFloat(ratingRaw) / 2 : null; // comes in as 10 point raiting, need 

  const isBundleChild = type === 'Bundled Game';
  if (isBundleChild) {
    if (!status) { // There is no status for bundled child games, derive from completion value if possible.
      if (completion === 'Beaten' || completion === 'Completed' || completion === 'Continuous' || completion === 'Dropped' || completion === 'Unfinished') {
        status = 'Played';
      }
    }
    // Currently for game bundles, the parent game will have a record and all games that are part of that bundle will be right after it. 
    if (parentGame) {
      platform = platform || parentGame.platform;
      completion = completion || parentGame.completion;
      completionDateRaw = completionDateRaw || parentGame.completionDateRaw;
      acquisitionDateRaw = acquisitionDateRaw || parentGame.acquisitionDateRaw;
      acquisitionType = acquisitionType || parentGame.acquisitionType
      acquisitionSource = acquisitionSource || parentGame.acquisitionSource;
      status = status || parentGame.status;
      amountPaid = parentGame?.bundleInfo?.avgCostPerGame || 0;
      additionalCost = 0; // Already combined in avgCostPerGame

      if (!game['Playtime']) {
        // If the child game has no playtime, use the bundle average playtime per game.
        playTimeIsEstimatedAverage = true;
        playTime = parentGame.bundleInfo?.avgTimePerGame || null;
      }
    } else {
      console.warn(`Bundle child game ${title} has no parent game`);
    }
  }
  if (!platform) {
    platform = 'Unknown'; // Set to unknown if we still don't have a platform.
  }
  if (!acquisitionSource) {
    acquisitionSource = 'Unknown';
  }
  if (!status) {
    status = 'Unknown';
  }

  const completionDate = completionDateRaw ? DateTime.fromISO(completionDateRaw, { setZone: true }) : null;
  const completionYear = completionDate?.year;
  const finishedThisYear = Boolean(completionYear && completionYear >= year && completionYear < (year + 1));
  const acquisitionDate = acquisitionDateRaw ? DateTime.fromISO(acquisitionDateRaw, { setZone: true }) : null;
  const acquisitionYear = acquisitionDate?.year
  const acquiredThisYear = Boolean(acquisitionYear && acquisitionYear >= year && acquisitionYear < (year + 1));
  const platformAbbreviation = platforms.find(p => p.name === platform)?.abbreviation || platform;


  const gameSummary: SummaryGameInfo = {
    id,
    title,
    platform,
    platformAbbreviation,
    status,
    completion,
    releaseYear,
    releaseDecade,
    acquisitionDateRaw,
    acquisitionDate: acquisitionDate?.toFormat('MMM dd') || null,
    acquisitionMonth: acquisitionDate ? acquisitionDate.monthLong : null,
    acquisitionSource: acquisitionSource,
    acquisitionType: acquisitionType || null,
    acquiredThisYear,
    completionDateRaw,
    completionDate: completionDate?.toFormat('MMM dd') || null,
    completionMonth: completionDate ? completionDate.monthLong : null,
    amountPaid: amountPaid + additionalCost,
    finishedThisYear,
    playTime,
    playTimeIsEstimatedAverage,
    coverImage,
    rating,
    parentGameId: parentGame?.id,
    bundleInfo: null,
  };
  return gameSummary
}

export const getYearSummary = (games: CsvData[], year: number): Summary => {
  console.info('Generating year summary for year:', year);
  const summary: Summary = {
    year,
    platformTotals: [],
    lengthGroupTotals: [],
    releaseDecadeTotals: [],
    acquisitionSourceTotals: [],
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
      totalMoneySpent: 0,
      percentPlayed: 0,
      percentFinished: 0,
    },
    topGames: [],
    games: [],
  }

  const getBundleInfo = (parentGame: SummaryGameInfo, parentGameIndex: number) => {
    if (parentGameIndex === games.length - 1) return null;

    const bundleInfo: BundleInfo = {
      childGameIds: [],
      totalFinished: 0,
      totalGames: 0,
      avgTimePerGame: 0,
      avgCostPerGame: 0,
    };

    for (let i = parentGameIndex + 1; i < games.length; i++) {
      const childGame = games[i];
      const isBundleChild = childGame?.['Type']?.toString() === 'Bundled Game';
      if (isBundleChild) {
        const childGameInfo = getGameSummary(games[i], i, year, parentGame);
        bundleInfo.childGameIds.push(childGameInfo.id);
        bundleInfo.totalGames += 1;
        bundleInfo.totalFinished += (childGameInfo.finishedThisYear ? 1 : 0);
      } else {
        break;
      }
    }
    bundleInfo.avgCostPerGame = parentGame.amountPaid ? (parentGame.amountPaid / bundleInfo.totalGames) : 0;
    bundleInfo.avgTimePerGame = parentGame.playTime ? (parentGame.playTime / (bundleInfo.totalFinished || 1)) : 0;

    return bundleInfo || null;
  }

  const parentGameBundles: SummaryGameInfo[] = [];

  games.forEach((game, i) => {
    const id = game['IGDB ID']?.toString() || `unknown_${i}`;
    const type = game['Type']?.toString(); // (Bundled Game, DLC / Expansion)
    const nextGame = games.length > i + 1 ? games[i + 1] : null;
    const isBundleParent = type !== 'Bundled Game' && nextGame?.['Type']?.toString() === 'Bundled Game';
    const isBundleChild = type === 'Bundled Game';
    const isDLC = type === 'DLC / Expansion';

    const parentGame = isBundleChild && parentGameBundles.find(pg => pg.bundleInfo?.childGameIds?.includes(id)) || null;
    const gameSummary = getGameSummary(game, i, year, parentGame);

    if (gameSummary.status === 'No Status' || isDLC) {
      return; // Skip no status and dlc
    }

    // Update completion totals
    if (gameSummary.finishedThisYear && !isBundleParent) {
      if (gameSummary.completion === 'Beaten') {
        summary.totalGamesBeaten += 1;
      } else if (gameSummary.completion === 'Completed') {
        summary.totalGamesCompeleted += 1;
      }

      if (gameSummary.playTime) {
        summary.totalTimeSpent += gameSummary.playTime;
      }

      // Update platform totals
      const platformTotal = summary.platformTotals.find(pt => pt.platform === gameSummary.platform);
      if (platformTotal) {
        platformTotal.totalGames += 1;
        platformTotal.totalTime += gameSummary.playTime || 0;
      } else {
        summary.platformTotals.push({
          platform: gameSummary.platform,
          platformAbbreviation: gameSummary.platformAbbreviation,
          totalGames: 1,
          totalTime: gameSummary.playTime || 0,
          totalTimeHours: 0, // will be calculated later
          percentOfTotalGames: 0, // will be calculated later
          percentOfTotalTime: 0, // will be calculated later
        });
      }

      // Update length group totals
      let lengthGroup = getLengthGroupByTimePlayed(gameSummary.playTime);
      const lengthTotal = summary.lengthGroupTotals.find(lt => lt.lengthGroup === lengthGroup);
      if (lengthTotal) {
        lengthTotal.totalGames += 1;
        lengthTotal.totalTimeSpent += gameSummary.playTime || 0;
      } else {
        summary.lengthGroupTotals.push({ lengthGroup, totalGames: 1, totalTimeSpent: gameSummary.playTime || 0 });
      }

      // Update release decade totals
      const decadeLabel = gameSummary.releaseDecade ? `${gameSummary.releaseDecade}s` : 'Unknown';
      const decadeTotal = summary.releaseDecadeTotals.find(yr => yr.decade === gameSummary.releaseDecade);
      if (decadeTotal) {
        decadeTotal.totalGames += 1;
        decadeTotal.totalTime += gameSummary.playTime || 0;
      } else {
        summary.releaseDecadeTotals.push({
          decade: gameSummary.releaseDecade,
          decadeLabel,
          totalGames: 1,
          totalTime: gameSummary.playTime || 0,
        });
      }
    }

    // Update acquisition totals
    if (gameSummary.acquiredThisYear && !isBundleParent) {
      summary.acquisitions.totalAcquired += 1;
      summary.acquisitions.totalBeaten += (gameSummary.completion === 'Beaten' ? 1 : 0);
      summary.acquisitions.totalCompleted += (gameSummary.completion === 'Completed' ? 1 : 0);
      summary.acquisitions.totalDropped += (gameSummary.completion === 'Dropped' ? 1 : 0);
      summary.acquisitions.totalContinuous += (gameSummary.completion === 'Continuous' ? 1 : 0);
      summary.acquisitions.totalFinished += (['Beaten', 'Completed', 'Continuous', 'Dropped'].includes(gameSummary.completion) ? 1 : 0);
      summary.acquisitions.totalPlayed += (gameSummary.status === 'Played' || gameSummary.status === 'Playing' ? 1 : 0);

      if (gameSummary.amountPaid && !isNaN(gameSummary.amountPaid)) {
        summary.acquisitions.totalMoneySpent += (gameSummary.amountPaid || 0);
      }

      // Update acquisition source totals
      const acquisitionTotal = summary.acquisitionSourceTotals.find(pt => pt.acquisitionSource === gameSummary.acquisitionSource);
      if (acquisitionTotal) {
        acquisitionTotal.totalGames += 1;
        acquisitionTotal.totalCost += gameSummary.amountPaid || 0;
      } else {
        summary.acquisitionSourceTotals.push({
          acquisitionSource: gameSummary.acquisitionSource,
          totalGames: 1,
          totalCost: gameSummary.amountPaid || 0,
          percentOfTotalGames: 0, // will be calculated later
          percentOfTotalCost: 0, // will be calculated later
        });
      }
    }


    if (isBundleParent) {
      gameSummary.bundleInfo = getBundleInfo(gameSummary, i);
      parentGameBundles.push(gameSummary)
    } else {
      if (gameSummary.finishedThisYear || gameSummary.acquiredThisYear) {
        summary.games.push(gameSummary);
      }
    }
  });

  // Sort platforms by name
  summary.platformTotals.sort((a, b) => a.platform.localeCompare(b.platform));
  summary.platformTotals.forEach(pt => {
    pt.totalTimeHours = getPlayTimeInHours(pt.totalTime, 2) || 0;
    if (summary.totalGamesBeaten + summary.totalGamesCompeleted > 0) {
      pt.percentOfTotalGames = Math.ceil((pt.totalGames / (summary.totalGamesBeaten + summary.totalGamesCompeleted)) * 100) || 0;
    } else {
      pt.percentOfTotalGames = 0;
    }
    if (summary.totalTimeSpent > 0) {
      pt.percentOfTotalTime = Math.ceil((pt.totalTime / summary.totalTimeSpent) * 100) || 0;
    } else {
      pt.percentOfTotalTime = 0;
    }
  });

  // Sort length groups by defined order
  summary.lengthGroupTotals.sort((a, b) => LengthGroupSorting[a.lengthGroup] - LengthGroupSorting[b.lengthGroup]);
  // convert time spent to hours
  summary.lengthGroupTotals.forEach(lt => {
    lt.totalTimeSpent = getPlayTimeInHours(lt.totalTimeSpent) || 0;
  });


  // Sort release decades by decade
  summary.releaseDecadeTotals.sort((a, b) => a.decade - b.decade);
  // Add missing decades
  const earliestPossibleDecade = 1960;
  const earliestDecade = summary.releaseDecadeTotals.filter(t => Boolean(t.decade))?.[0]?.decade || 0;
  const latestDecade = summary.releaseDecadeTotals[summary.releaseDecadeTotals.length - 1]?.decade || 0;
  if (earliestDecade !== latestDecade) {
    // Add missing decades
    const startingDecade = (earliestDecade < earliestPossibleDecade ? earliestPossibleDecade : earliestDecade)
    for (let decade = startingDecade + 10; decade < latestDecade; decade += 10) {
      if (!summary.releaseDecadeTotals.find(d => d.decade === decade)) {
        summary.releaseDecadeTotals.push({ decade, decadeLabel: `${decade}s`, totalGames: 0, totalTime: 0 });
      }
    }
  }
  // Resort release decades by decade
  summary.releaseDecadeTotals.sort((a, b) => a.decade - b.decade);

  // add acquisition percentages
  if (summary.acquisitions.totalAcquired > 0) {
    summary.acquisitions.percentPlayed = Math.round((summary?.acquisitions.totalPlayed / summary.acquisitions.totalAcquired) * 100)
    summary.acquisitions.percentFinished = Math.round((summary?.acquisitions.totalFinished / summary.acquisitions.totalAcquired) * 100)
    summary.acquisitionSourceTotals.forEach(ast => {
      ast.percentOfTotalCost = Math.ceil((summary.acquisitions.totalMoneySpent ? ast.totalCost / summary.acquisitions.totalMoneySpent : 0) * 100)
      ast.percentOfTotalGames = Math.ceil((summary.acquisitions.totalAcquired ? ast.totalGames / summary.acquisitions.totalAcquired : 0) * 100);
    })
  }


  return summary;

}
