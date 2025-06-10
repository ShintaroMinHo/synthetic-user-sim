import React, { useState, useEffect } from 'react';
import SimulationControls from './SimulationControls';
import MetricChart from './MetricChart';
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

    const [loadingRandomUser, setLoadingRandomUser] = useState(false);
    const [loadingNextDay, setLoadingNextDay] = useState(false);

    const totalUsersFromHistory = activityHistory.reduce((acc, day) => acc + day.users, 0);
    const totalFriendships = activityHistory.reduce((acc, day) => acc + day.friendships, 0);
    const totalInteractions = activityHistory.reduce((acc, day) => acc + day.interactions, 0);

    const fetchTotalUsers = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/get_total_count');
            if (!res.ok) throw new Error('Failed to fetch total users');
            const count = await res.json();
            setTotalUsers(count);
        } catch (err) {
            console.error(err);
        }
    };

    const resetSimulation = async () => {
        try {
            await fetch('http://localhost:8080/api/refresh_db', { method: 'POST' });
            setDay(0);
            setActivityHistory([]);
            setDeltaUsers(0);
            setDeltaFriendships(0);
            setDeltaInteractions(0);
            setSelectedUserId(null);
            await fetchTotalUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const nextDay = async () => {
        if (loadingNextDay) return; // Ignore si déjà en cours
        setLoadingNextDay(true);
        try {
            const res = await fetch('http://localhost:8080/api/simulate_day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Erreur HTTP:', res.status, errText);
                return;
            }

            const data = await res.json();

            setDay(prev => prev + 1);
            setDeltaUsers(data.new_users);
            setDeltaFriendships(data.new_friendships);
            setDeltaInteractions(data.total_interactions);

            setActivityHistory(prev => [
                ...prev,
                {
                    users: data.new_users,
                    friendships: data.new_friendships,
                    interactions: data.total_interactions,
                },
            ]);

            await fetchTotalUsers();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingNextDay(false);
        }
    };

    const fetchRandomUserId = async () => {
        if (loadingRandomUser) return; // Ignore si déjà en cours
        setLoadingRandomUser(true);
        try {
            const res = await fetch('http://localhost:8080/api/random_user_id');
            if (!res.ok) throw new Error('Failed to get random user');
            const { user_id } = await res.json();
            setSelectedUserId(user_id);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la récupération d'un utilisateur aléatoire");
        } finally {
            setLoadingRandomUser(false);
        }
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
                loadingNextDay={loadingNextDay} // Passe le flag pour désactiver le bouton si besoin
            />

            <button
                onClick={fetchRandomUserId}
                disabled={loadingRandomUser}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loadingRandomUser ? 'Loading...' : 'Random user information'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricChart
                    title="New Users"
                    color="rgb(16, 185, 129)"
                    data={activityHistory.map(day => day.users)}
                    total={totalUsersFromHistory}
                    delta={deltaUsers}
                />
                <MetricChart
                    title="New Friendships"
                    color="rgb(59, 130, 246)"
                    data={activityHistory.map(day => day.friendships)}
                    total={totalFriendships}
                    delta={deltaFriendships}
                />
                <MetricChart
                    title="Interactions"
                    color="rgb(234, 179, 8)"
                    data={activityHistory.map(day => day.interactions)}
                    total={totalInteractions}
                    delta={deltaInteractions}
                />
            </div>

            {selectedUserId && (
                <section className="mt-10 border-t pt-6">
                    <UserProfile
                        selectedUserId={selectedUserId}
                        setSelectedUserId={setSelectedUserId}
                        totalUsers={totalUsers}
                        day={day}
                    />
                    <FriendsList userId={selectedUserId} />
                    <Recommendations userId={selectedUserId} />
                </section>
            )}
        </div>
    );
}
