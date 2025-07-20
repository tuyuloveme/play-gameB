const BASE_URL = import.meta.env.VITE_API_URL;

export const getEspIp = async () => {
  const res = await fetch(`${BASE_URL}/esp`);
  const data = await res.json();
  return data.ip;
};

export const isEspConnected = async () => {
  try {
    const ip = await getEspIp();
    const res = await fetch(`${BASE_URL}/ping-esp?ip=${encodeURIComponent(ip)}`);
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const togglePower = async (nomorPs) => {
  const ip = await getEspIp();
  await fetch(`${BASE_URL}/toggle-esp?ip=${encodeURIComponent(ip)}&ps=${nomorPs}`);
};
