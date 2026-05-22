export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold text-green-500 mb-6">
        AgroVision AI 🌾
      </h1>

      <p className="text-xl mb-8">
        Smart Crop Health Monitoring System
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold text-green-400">
            Crop Health
          </h2>
          <p className="mt-4 text-4xl">78%</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold text-yellow-400">
            Alerts
          </h2>
          <p className="mt-4 text-4xl">4</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold text-blue-400">
            Weather
          </h2>
          <p className="mt-4 text-4xl">28°C</p>
        </div>
      </div>

      <div className="mt-10 bg-zinc-900 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-green-400">
          Upload Crop Image
        </h2>

        <input
          type="file"
          className="bg-zinc-800 p-3 rounded-lg"
        />
      </div>
    </main>
  );
}