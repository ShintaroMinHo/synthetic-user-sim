import React, { useState, useEffect } from 'react';
import SimulationControls from './SimulationControls';
import StatsChart from './StatsChart';
import UserProfile from './UserProfile';
import Recommendations from './Recommendations';
import FriendsList from './FriendsList';


export default function Dashboard() {
    const [day, setDay] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [deltaUsers, setDeltaUsers] = useState(0);
    const [deltaFriendships, setDeltaFriendships] = useState(0);
    const [deltaInteractions, setDeltaInteractions] = useState(0);
    const [activityHistory, setActivityHistory] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Load total users from API
    const fetchTotalUsers = async () => {
        const res = await fetch('/api/get_total_count');
        const count = await res.json();
        setTotalUsers(count);
    };

    // Reset simulation
    const resetSimulation = async () => {
        await fetch('/api/refresh_db');
        setDay(0);
        setActivityHistory([]);
        setDeltaUsers(0);
        setDeltaFriendships(0);
        setDeltaInteractions(0);
        await fetchTotalUsers();
        setSelectedUserId(null);
    };

    // Simulate next day
    const nextDay = async () => {
        const res = await fetch('/api/simulate_day');
        const data = await res.json();
        // Expected response: { delta_users, delta_friendships, delta_interactions }
        setDay(prev => prev + 1);
        setDeltaUsers(data.delta_users);
        setDeltaFriendships(data.delta_friendships);
        setDeltaInteractions(data.delta_interactions);
        setActivityHistory(prev => [...prev, data.delta_interactions]);
        await fetchTotalUsers();
    };

    useEffect(() => {
        fetchTotalUsers();
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Synthetic User Simulation</h1>

            <SimulationControls
                day={day}
                deltaUsers={deltaUsers}
                deltaFriendships={deltaFriendships}
                deltaInteractions={deltaInteractions}
                onReset={resetSimulation}
                onNextDay={nextDay}
            />

            <StatsChart activityHistory={activityHistory} />

            <UserProfile
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                totalUsers={totalUsers}
            />

            {selectedUserId && (
                <>
                    <FriendsList userId={selectedUserId} />
                    <Recommendations userId={selectedUserId} />
                </>
            )}

            {selectedUserId && (
                <Recommendations userId={selectedUserId} />
            )}
        </div>
    );
}
