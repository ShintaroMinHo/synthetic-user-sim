import React from 'react';

export default function SimulationControls({ day, deltaUsers, deltaFriendships, deltaInteractions, onReset, onNextDay }) {
    return (
        <div className="bg-gray-100 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
                <h2 className="text-xl font-semibold">Day {day}</h2>
                <p className="text-sm text-gray-700">
                    +{deltaUsers ?? 0} users, +{deltaFriendships ?? 0} friendships, {(deltaInteractions ?? 0).toLocaleString()} interactions today
                </p>
            </div>
            <div className="space-x-3">
                <button
                    onClick={onReset}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                    Reset Simulation
                </button>
                <button
                    onClick={onNextDay}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Next Day
                </button>
            </div>
        </div>
    );
}
