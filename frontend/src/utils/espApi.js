// src/utils/espApi.js

// ✅ Ambil IP ESP dari backend Flask
export const getEspIp = async () => {
  const res = await fetch('http://192.168.18.5:5000/esp');  // Flask endpoint
  const data = await res.json();
  return data.ip;  // contoh: "http://192.168.18.88"
};

// ✅ Ping ESP lewat Flask (Flask relay ke ESP)
export const isEspConnected = async () => {
  try {
    const ip = await getEspIp();
    const res = await fetch(`http://192.168.18.5:5000/ping-esp?ip=${encodeURIComponent(ip)}`);
    return res.ok;
  } catch (e) {
    return false;
  }
};

// ✅ Toggle power PS lewat Flask (Flask relay ke ESP)
export const togglePower = async (nomorPs) => {
  const ip = await getEspIp();
  await fetch(`http://192.168.18.5:5000/toggle-esp?ip=${encodeURIComponent(ip)}&ps=${nomorPs}`);
};
