type StatCardTone = "teal" | "blue" | "green" | "red";

type StatCardProps = {
  title: string;
  value: string;
  tone: StatCardTone;
};

export function StatCard({ title, value, tone }: StatCardProps) {
  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <h3>{value}</h3>
      <p>{title}</p>
    </article>
  );
}
