function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Clara Market Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Top 20 by market cap (USD)
        </p>
      </header>
      <main className="flex-1 p-6">
        <p className="text-slate-600">Markets table will load here.</p>
      </main>
    </div>
  )
}

export default App
