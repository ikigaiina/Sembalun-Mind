export const setLocalSetting = (key: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting local storage item ${key}:`, error);
  }
};

export const getLocalSetting = (key: string, defaultValue: any = null) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting local storage item ${key}:`, error);
    return defaultValue;
  }
};

export const removeLocalSetting = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing local storage item ${key}:`, error);
  }
};
