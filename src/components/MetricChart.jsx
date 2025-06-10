// MetricChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function MetricChart({ title, color, data, total, delta }) {
    const labels = data.map((_, i) => `Day ${i + 1}`);

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data,
                borderColor: color,
                backgroundColor: `${color}33`, // couleur avec transparence
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                font: { size: 18 },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 14 } },
            },
            x: {
                ticks: { font: { size: 14 } },
            },
        },
    };

    return (
        <div className="flex bg-white rounded shadow p-6 items-center mb-8" style={{ minHeight: 280 }}>
            <div className="w-4/5" style={{ height: 240 }}>
                <Line data={chartData} options={options} />
            </div>
            <div className="w-1/5 pl-8 text-right">
                <p className="text-2xl font-bold mb-1">Total: {total.toLocaleString()}</p>
                <p className="text-lg text-gray-700">+{delta.toLocaleString()} today</p>
            </div>
        </div>
    );
}
