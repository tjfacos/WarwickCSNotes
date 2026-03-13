import { Link } from "react-router-dom";

export const Welcome = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(y => (
          <Link
            key={y}
            to={`/year/${y}`}
            className="block p-6 border rounded-lg hover:bg-muted transition"
          >
            <h2 className="text-2xl font-semibold">Year {y}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};
