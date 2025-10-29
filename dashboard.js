// src/components/SpendingChart.jsx
import { Pie } from 'react-chartjs-2';

function SpendingChart({ data }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data),
      backgroundColor: ['#f87171', '#34d399', '#60a5fa'],
    }],
  };

  return <Pie data={chartData} />;
}