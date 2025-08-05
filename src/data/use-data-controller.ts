import { useEffect, useMemo, useState } from "react";
import { getYearSummary, type Summary } from "./summarizer";
import type { CsvData, Data, UserData } from "./DataContext";

const initialUserData = JSON.parse(localStorage.getItem('user-data') || "{}");

export const useDataController = () => {

  const [startingData, setStartingData] = useState<{ games: CsvData[], year: number }>();
  const [userData, setUserData] = useState<UserData>({ ...initialUserData, gameEdits: { ...initialUserData.gameEdits } });
  const [baseSummary, setBaseSummary] = useState<Summary | null>(null);

  useEffect(() => {
    console.log('Creating summary from CSV data', { games: startingData?.games?.length });
    if (startingData?.games && startingData.games.length > 0) {
      const baseSummary = getYearSummary(startingData.games, startingData.year);
      setBaseSummary(baseSummary);
    }
  }, [startingData]);


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
      games: startingData?.games,
      year: startingData?.year,
      summary,
      userData,
    }
  }, [startingData, summary])



  useEffect(() => {
    if (userData) {
      updateUserDataLocalStorage();
    }
  }, [userData])

  const updateUserDataLocalStorage = () => {
    if (!summary) return;
    try {
      console.log('Saving user data to local storage');
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
    initialize: (games: CsvData[], year: number) => {
      console.log('Initializing data controller with games and year', { games, year });
      setStartingData({ games, year });
    },
    editGame: (gameId: string, gameEdit: { coverImage: string | null }) => {
      console.log('Editing game', { gameId, gameEdit });
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