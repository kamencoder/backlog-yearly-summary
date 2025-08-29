import { useEffect, useMemo, useState } from "react";
import { getYearSummary, type Summary } from "./summarizer";
import { defaultContext, type CsvData, type Data, type DeepPartial, type UserData, type ViewSettings } from "./data-context";
import { mergeDeep } from "./utils";

const initialUserData = JSON.parse(localStorage.getItem('user-data') || "{}");

export const useDataController = () => {

  const startingData = mergeDeep(defaultContext.data.userData, initialUserData);
  const currentYear = (new Date()).getFullYear();
  const [csvData, setCsvData] = useState<{ games: CsvData[] }>();
  const [userData, setUserData] = useState<UserData>(startingData);
  const [baseSummary, setBaseSummary] = useState<Summary | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (csvData?.games && csvData.games.length > 0) {
      const baseSummary = getYearSummary(csvData.games, selectedYear);
      setBaseSummary(baseSummary);
    }
  }, [csvData, selectedYear]);


  const summary = useMemo((): Summary | null => {
    if (!baseSummary) {
      return baseSummary;
    }
    return {
      ...baseSummary,
      games: baseSummary.games.map(g => ({
        ...g,
        ...userData.gameEdits?.[g.id],
      }))
    }
  }, [baseSummary, userData])

  const data = useMemo<Data>((): Data => {
    return {
      games: csvData?.games,
      year: selectedYear,
      summary,
      userData,
    }
  }, [csvData, summary, selectedYear, userData]);

  useEffect(() => {
    if (userData) {
      updateUserDataLocalStorage();
    }
  }, [userData])

  const updateUserDataLocalStorage = () => {
    if (!summary) return;
    try {
      const currentUserData = JSON.parse(localStorage.getItem('user-data') || "{}");
      localStorage.setItem('user-data', JSON.stringify(mergeDeep(currentUserData, userData)));
    } catch (err) {
      console.error('Unable to save user-data to local storage', err);
    }
  }

  return {
    data,
    initialize: (games: CsvData[]) => {
      setCsvData({ games });
    },
    updateUserData: (userData: UserData) => {
      setUserData(userData);
    },
    editYear: (year: number) => {
      setSelectedYear(year);
    },
    editGame: (gameId: string, gameEdit: { coverImage: string | null }) => {
      const newUserData = {
        ...userData,
        gameEdits: {
          ...userData.gameEdits,
          [gameId]: mergeDeep(userData.gameEdits[gameId], gameEdit)
        }
      }
      setUserData(newUserData);
    },
    editViewSettings: (settings: DeepPartial<ViewSettings>) => {
      const newUserData = {
        ...userData,
        viewSettings: mergeDeep(userData.viewSettings, settings),
      }
      setUserData(newUserData);
    }
  }
}