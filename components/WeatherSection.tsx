import { weather } from "@/lib/dashboard-data";

function conditionIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return "🌧️";
  if (c.includes("storm")) return "⛈️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("clear") || c.includes("sunny")) return "☀️";
  return "🌤️";
}

export function WeatherSection() {
  return (
    <section aria-labelledby="weather-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="weather-heading" className="text-lg font-semibold text-blue-400">
            Weather Snapshot
          </h2>
          <p className="text-xs text-zinc-500">{weather.location}</p>
        </div>
        <span className="text-2xl" role="img" aria-label={weather.condition}>
          {conditionIcon(weather.condition)}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold">
        {weather.temperature}
        <span className="ml-1 text-lg text-zinc-400">°C</span>
      </p>
      <p className="mt-1 text-sm text-zinc-300">{weather.condition}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-zinc-950 px-3 py-2 text-zinc-400">Humidity: {weather.humidity}%</div>
        <div className="rounded-lg bg-zinc-950 px-3 py-2 text-zinc-400">Wind: {weather.windSpeed} km/h</div>
      </div>
    </section>
  );
}
