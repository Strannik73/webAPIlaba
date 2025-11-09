const key = "e1cbe0e09b684aac88d8864e1aa3be94";
const url = "https://api.weatherbit.io/v2.0/current";

const form = document.getElementById("coord");
const lat = document.getElementById("lat");
const lon = document.getElementById("lon");
const msg = document.getElementById("msg");
const result = document.getElementById("resultat");
const city = document.getElementById("city");
const temp = document.getElementById("temp");
const img = document.getElementById("kartinka");
const txt = document.getElementById("txt");
const btn = document.getElementById("pogodaBtn");


function fon(desc) {
  if (!desc) return "linear-gradient(180deg,#f6f8fb,#eef3ff)";
  const s = desc.toLowerCase();

  if (s.includes("clear") || s.includes("ясно") || s.includes("sun") || s.includes("солнечно")) {
    return "linear-gradient(180deg,#ffd56b,#ffffff)";
  }
  if (s.includes("cloud") || s.includes("облачно") || s.includes("overcast")) {
    return "linear-gradient(180deg,#d7dde6,#ffffff)";
  }
  if (s.includes("rain") || s.includes("дожд") || s.includes("drizzle")) {
    return "linear-gradient(180deg,#6ea8d7,#ffffff)";
  }
  if (s.includes("snow") || s.includes("снег") || s.includes("sleet")) {
    return "linear-gradient(180deg,#e6f0fb,#ffffff)";
  }
  if (s.includes("thunder") || s.includes("гроза") || s.includes("storm")) {
    return "linear-gradient(180deg,#4b5563,#ffffff)";
  }
  if (s.includes("mist") || s.includes("fog") || s.includes("туман")) {
    return "linear-gradient(180deg,#d7dbe0,#ffffff)";
  }
  return "linear-gradient(180deg,#f6f8fb,#ffffff)";
}

function applyBk(desc) {
  document.body.style.transition = "background 600ms ease";
  document.body.style.background = fon(desc);
}

function parseValid(a, b) {
  const la = Number(a.replace(",", ".").trim());
  const lo = Number(b.replace(",", ".").trim());
  if (!isFinite(la) || !isFinite(lo)) return { error: "Координаты должны быть числами" };
  if (la < -90 || la > 90) return { error: "Широта должна быть в диапазоне -90..90" };
  if (lo < -180 || lo > 180) return { error: "Долгота должна быть в диапазоне -180..180" };
  return { la, lo };
}

function Url(la, lo) {
  const p = new URLSearchParams({
    lat: String(la),
    lon: String(lo),
    key: key,
    lang: "ru",
    units: "M"
  });
  return `${url}?${p.toString()}`;
}

function load(on) {
  btn.disabled = on;
  msg.textContent = on ? "Загрузка..." : "";
  msg.classList.remove("error");
  if (on) result.style.display = "none";
  if (on) applyBk(""); 
}

function error(t) {
  msg.textContent = t;
  msg.classList.add("error");
  result.style.display = "none";
  applyBk(""); 
}

function weather(d) {
  if (!d || !Array.isArray(d.data) || d.data.length === 0) {
    error("Неверный ответ от сервера");
    return;
  }
  const it = d.data[0];
  const descr = it.weather && it.weather.description ? it.weather.description : "";
  const ic = it.weather && it.weather.icon ? it.weather.icon : null;

  city.textContent = it.city_name || "Неизвестно";
  temp.textContent = (typeof it.temp === "number") ? `${Math.round(it.temp)}°C` : "—";
  txt.textContent = descr || "—";

  if (ic) {
    img.src = `https://www.weatherbit.io/static/img/icons/${ic}.png`;
    img.alt = txt.textContent;
    img.style.display = "";
  } else {
    img.src = "";
    img.alt = "";
    img.style.display = "none";
  }

  msg.textContent = "";
  msg.classList.remove("error");
  result.style.display = "block";

  applyBk(descr);
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  msg.classList.remove("error");
  result.style.display = "none";

  const { la, lo, error } = parseValid(lat.value, lon.value);
  if (error) {
    error(error);
    return;
  }

  const fullUrl = Url(la, lo);
  load(true);

  try {
    const res = await fetch(fullUrl, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      if (res.status === 400) throw new Error("Неверные параметры запроса");
      if (res.status === 401 || res.status === 403) throw new Error("Ошибка доступа к API ");
      if (res.status === 429) throw new Error("Слишком много запросов");
      throw new Error(`Ошибка сети: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    weather(data);
  } catch (err) {
    if (err.name === "TypeError") {
      error("Сетевая ошибка или запрос заблокирован.");
    } else {
      error(err.message || "Не удалось получить данные");
    }
  } finally {
    load(false);
  }
});
