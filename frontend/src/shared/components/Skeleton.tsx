export function Skeleton() {
  return (
    <div aria-label="Cargando" role="status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="card animate-pulse h-52 bg-slate-100" />
      ))}
    </div>
  )
}
