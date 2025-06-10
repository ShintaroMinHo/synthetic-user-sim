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

// Enregistrer les modules nécessaires
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function MetricChart({ title, color, data, total, delta }) {
    const labels = data.map((_, i) => `Day ${i + 1}`);

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data,
                borderColor: color,
                backgroundColor: `${color}33`, // transparence
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
            },
        },
    };

    return (
        <div className="flex bg-white rounded shadow p-4 items-center mb-6">
            <div className="w-3/4">
                <Line data={chartData} options={options} />
            </div>
            <div className="w-1/4 pl-6 text-right">
                <p className="text-lg font-semibold">Total: {total.toLocaleString()}</p>
                <p className="text-sm text-gray-600">+{delta.toLocaleString()} today</p>
            </div>
        </div>
    );
}

export default function StatsChart({ activityHistory }) {
    const totalInteractions = activityHistory.reduce((acc, d) => acc + d.interactions, 0);
    const totalUsers = activityHistory.reduce((acc, d) => acc + d.users, 0);
    const totalFriendships = activityHistory.reduce((acc, d) => acc + d.friendships, 0);

    const last = activityHistory[activityHistory.length - 1] || {
        interactions: 0,
        users: 0,
        friendships: 0,
    };

    return (
        <div className="space-y-6">
            <MetricChart
                title="Daily Interactions"
                color="rgb(59,130,246)" // bleu
                data={activityHistory.map(d => d.interactions)}
                total={totalInteractions}
                delta={last.interactions}
            />
            <MetricChart
                title="New Users"
                color="rgb(34,197,94)" // vert
                data={activityHistory.map(d => d.users)}
                total={totalUsers}
                delta={last.users}
            />
            <MetricChart
                title="New Friendships"
                color="rgb(234,179,8)" // jaune
                data={activityHistory.map(d => d.friendships)}
                total={totalFriendships}
                delta={last.friendships}
            />
        </div>
    );
}
