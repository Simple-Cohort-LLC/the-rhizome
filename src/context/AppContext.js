import {
  useContext,
  createContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { removeUser, retrieveUser, storeUser } from "../utils/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../consts/api";
import { fetchWithHeaders } from "../utils/fetchWithHeaders";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [displayName, setDisplayName] = useState(null);
  const [pfp, setPfp] = useState(null);
  const [signerUuid, setSignerUuid] = useState(null);
  const [fid, setFid] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      AsyncStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const initializeDarkMode = useCallback(async () => {
    try {
      const storedDarkMode = await AsyncStorage.getItem("darkMode");
      if (storedDarkMode !== null) {
        setIsDarkMode(JSON.parse(storedDarkMode));
      }
    } catch (error) {
      console.error("Error loading dark mode preference:", error);
    }
  }, []);

  useEffect(() => {
    initializeDarkMode();
  }, [initializeDarkMode]);

  const retrieveUserFromStorage = async () => {
    const user = await retrieveUser();
    if (!user) {
      setIsAuthenticated(false);
      return;
    }
    await fetchUserAndSetUser(parseInt(user.fid));
    setSignerUuid(user.signer_uuid);
    setFid(user.fid);
    setIsAuthenticated(user.is_authenticated);
  };

  useEffect(() => {
    retrieveUserFromStorage();
  }, []);

  const fetchUserAndSetUser = async (fid) => {
    try {
      const response = await fetchWithHeaders(`${API_URL}/user?fid=${fid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const { display_name, pfp_url } = await response.json();
      setDisplayName(display_name);
      setPfp(pfp_url);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSignin = async (data) => {
    setIsAuthenticated(null);
    storeUser(data);
    await fetchUserAndSetUser(parseInt(data.fid));
    setIsAuthenticated(data.is_authenticated);
    setFid(data.fid);
    setSignerUuid(data.signer_uuid);
  };

  const handleSignout = async () => {
    await removeUser();
    setDisplayName(null);
    setPfp(null);
    setSignerUuid(null);
    setFid(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      displayName,
      setDisplayName,
      pfp,
      setPfp,
      signerUuid,
      setSignerUuid,
      fid,
      setFid,
      isAuthenticated,
      setIsAuthenticated,
      handleSignin,
      handleSignout,
      isDarkMode,
      toggleDarkMode,
    }),
    [
      displayName,
      pfp,
      signerUuid,
      fid,
      isAuthenticated,
      isDarkMode,
      toggleDarkMode,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
