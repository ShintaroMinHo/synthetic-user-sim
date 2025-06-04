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

// Register ChartJS modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function StatsChart({ activityHistory }) {
    const data = {
        labels: activityHistory.map((_, i) => `Day ${i + 1}`),
        datasets: [
            {
                label: 'Interactions',
                data: activityHistory,
                borderColor: 'rgb(59, 130, 246)', // Tailwind blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Daily Interactions Over Time',
            },
        },
    };

    return (
        <div className="bg-white rounded shadow p-4 mt-6">
            <Line data={data} options={options} />
        </div>
    );
}
