import { useEffect, useMemo, useState } from "react";
import { getYearSummary, type Summary } from "./summarizer";
import { defaultContext, type CsvData, type Data, type DeepPartial, type UserData, type ViewSettings } from "./data-context";

const initialUserData = JSON.parse(localStorage.getItem('user-data') || "{}");

export const useDataController = () => {

  const currentYear = (new Date()).getFullYear();
  const [csvData, setCsvData] = useState<{ games: CsvData[] }>();
  const [userData, setUserData] = useState<UserData>({
    ...defaultContext.data.userData,
    ...initialUserData,
    gameEdits: {
      ...initialUserData.gameEdits
    },
    viewSettings: {
      ...defaultContext.data.userData.viewSettings,
      ...initialUserData.viewSettings,
      sectionSettings: {
        platform: {
          ...defaultContext.data.userData.viewSettings.sectionSettings.platform,
          ...initialUserData.sectionSettings?.platform,
        },
        gameLength: {
          ...defaultContext.data.userData.viewSettings.sectionSettings.gameLength,
          ...initialUserData.sectionSettings?.gameLength,
        },
        decade: {
          ...defaultContext.data.userData.viewSettings.sectionSettings.decade,
          ...initialUserData.sectionSettings?.decade,
        },
        acquisitions: {
          ...defaultContext.data.userData.viewSettings.sectionSettings.acquisitions,
          ...initialUserData.sectionSettings?.acquisitions,
        },
        monthly: {
          ...defaultContext.data.userData.viewSettings.sectionSettings.monthly,
          ...initialUserData.sectionSettings?.monthly,
        },
      }
    }
  });
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
    },
    editViewSettings: (settings: DeepPartial<ViewSettings>) => {
      const newUserData = {
        ...userData,
        viewSettings: {
          ...userData.viewSettings,
          ...settings,
          sectionSettings: {
            platform: {
              ...userData.viewSettings.sectionSettings.platform,
              ...settings.sectionSettings?.platform,
            },
            gameLength: {
              ...userData.viewSettings.sectionSettings.gameLength,
              ...settings.sectionSettings?.gameLength,
            },
            decade: {
              ...userData.viewSettings.sectionSettings.decade,
              ...settings.sectionSettings?.decade,
            },
            acquisitions: {
              ...userData.viewSettings.sectionSettings.acquisitions,
              ...settings.sectionSettings?.acquisitions,
            },
            monthly: {
              ...userData.viewSettings.sectionSettings.monthly,
              ...settings.sectionSettings?.monthly,
            },
          }
        }
      }
      setUserData(newUserData);
    }
  }
}