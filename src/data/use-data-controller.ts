import { useEffect, useMemo, useState } from "react";
import { getYearSummary, type Summary } from "./summarizer";
import type { CsvData, Data, UserData } from "./DataContext";

const initialUserData = JSON.parse(localStorage.getItem('user-data') || "{}");

export const useDataController = () => {

  const currentYear = (new Date()).getFullYear();
  const [csvData, setCsvData] = useState<{ games: CsvData[] }>();
  const [userData, setUserData] = useState<UserData>({ ...initialUserData, gameEdits: { ...initialUserData.gameEdits } });
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
      localStorage.setItem('user-data', JSON.stringify({
        ...currentUserData,
        ...userData,
        gameEdits: {
          ...currentUserData?.gameEdits,
          ...userData?.gameEdits,
        }
      }))
    } catch (err) {
      console.error('Unable to save user-data to local storage', err);
    }
  }

  return {
    data,
    initialize: (games: CsvData[]) => {
      setCsvData({ games });
    },
    editYear: (year: number) => {
      setSelectedYear(year);
    },
    editGame: (gameId: string, gameEdit: { coverImage: string | null }) => {
      const newUserData = {
        ...userData,
        gameEdits: {
          ...userData.gameEdits,
          [gameId]: {
            ...userData.gameEdits[gameId],
            ...gameEdit
          }
        }
      }
      setUserData(newUserData);
    }
  }
}