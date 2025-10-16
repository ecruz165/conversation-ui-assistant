interface MetricCardProps {
  label: string;
  value: string | number;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-card hover:shadow-lg transition-shadow h-[128px] flex flex-col justify-center text-center">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
