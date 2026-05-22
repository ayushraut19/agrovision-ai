import { weather } from "@/lib/dashboard-data";
import { SectionHeader } from "@/components/SectionHeader";

function conditionIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return "🌧️";
  if (c.includes("storm")) return "⛈️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("clear") || c.includes("sunny")) return "☀️";
  if (c.includes("fog") || c.includes("mist")) return "🌫️";
  return "🌤️";
}

export function WeatherSection() {
  const metrics = [
    { label: "Humidity", value: `${weather.humidity}%`, accent: "text-cyan-400" },
    { label: "Wind Speed", value: `${weather.windSpeed} km/h`, accent: "text-sky-400" },
    {
      label: "Condition",
      value: weather.condition,
      accent: "text-blue-400",
      compact: true,
    },
  ];

  return (
    <section aria-labelledby="weather-heading">
      <SectionHeader
        id="weather-heading"
        title="Field Weather"
        subtitle={weather.location}
        accent="text-blue-400"
        meta="Updated just now"
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col justify-between gap-6 border-b border-zinc-800 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Temperature
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums sm:text-5xl">
                  {weather.temperature}
                  <span className="ml-1 text-2xl font-semibold text-zinc-400 sm:text-3xl">
                    °C
                  </span>
                </p>
              </div>
              <span
                className="text-3xl sm:text-4xl"
                role="img"
                aria-label={weather.condition}
              >
                {conditionIcon(weather.condition)}
              </span>
            </div>
            <p className="text-base text-zinc-300 sm:text-lg">
              {weather.condition}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-zinc-800 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col justify-center bg-zinc-900 p-5 sm:p-6"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {metric.label}
                </p>
                <p
                  className={`mt-2 font-semibold tabular-nums ${metric.compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"} ${metric.accent}`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
