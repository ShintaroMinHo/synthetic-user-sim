import React, { useEffect, useState } from 'react';

export default function Recommendations({ userId }) {
    const [friendsOfFriends, setFriendsOfFriends] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [loadingFOF, setLoadingFOF] = useState(false);
    const [loadingSuggested, setLoadingSuggested] = useState(false);
    const [error, setError] = useState(null);
    const [totalUsers, setTotalUsers] = useState(null);

    useEffect(() => {
        // Fetch total users count on mount
        fetch('http://localhost:8080/api/get_total_count')
            .then((res) => res.json())
            .then((data) => {
                if (data.total_users !== undefined) {
                    setTotalUsers(data.total_users);
                }
            })
            .catch(() => setTotalUsers(null));
    }, []);

    useEffect(() => {
        // Reset lists and errors when userId changes
        setFriendsOfFriends([]);
        setSuggested([]);
        setError(null);
    }, [userId]);

    // Load Friends of Friends
    const handleLoadFOF = async () => {
        if (!userId) {
            setError('No user selected. Please select a user first.');
            return;
        }
        setError(null);
        setLoadingFOF(true);
        try {
            const fofRes = await fetch(`http://localhost:8080/api/recommend_fof?id=${userId}`);
            if (!fofRes.ok) throw new Error('Failed to fetch friends of friends');
            const fofData = await fofRes.json();

            const profilesRes = await fetch('http://localhost:8080/api/batch_get_simple_profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fofData.recommendations),
            });
            if (!profilesRes.ok) throw new Error('Failed to fetch FOF profiles');
            const profilesData = await profilesRes.json();

            setFriendsOfFriends(profilesData.profiles);
        } catch (err) {
            setError(err.message);
            setFriendsOfFriends([]);
        } finally {
            setLoadingFOF(false);
        }
    };

    // Load Suggested Users
    const handleLoadSuggested = async () => {
        if (!userId) {
            setError('No user selected. Please select a user first.');
            return;
        }
        setError(null);
        setLoadingSuggested(true);
        try {
            const suggestedRes = await fetch(`http://localhost:8080/api/recommend_strangers?id=${userId}`);
            if (!suggestedRes.ok) throw new Error('Failed to fetch suggested users');
            const suggestedData = await suggestedRes.json();

            const profilesRes = await fetch('http://localhost:8080/api/batch_get_simple_profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestedData.recommendations),
            });
            if (!profilesRes.ok) throw new Error('Failed to fetch suggested profiles');
            const profilesData = await profilesRes.json();

            setSuggested(profilesData.profiles);
        } catch (err) {
            setError(err.message);
            setSuggested([]);
        } finally {
            setLoadingSuggested(false);
        }
    };

    const anyLoading = loadingFOF || loadingSuggested;

    return (
        <section className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>

            <div className="mb-4 flex items-center justify-between gap-3">
                <div>Total users: {totalUsers !== null ? totalUsers : 'Loading...'}</div>
                <div className="font-medium">
                    {userId ? `Selected User ID: ${userId}` : 'No user selected'}
                </div>
            </div>

            <div className="mb-4 flex gap-3">
                <button
                    onClick={handleLoadFOF}
                    disabled={loadingFOF || !userId}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!userId ? 'Select a user first' : ''}
                >
                    {loadingFOF ? 'Loading Friends of Friends...' : 'Load Friends of Friends'}
                </button>

                <button
                    onClick={handleLoadSuggested}
                    disabled={loadingSuggested || !userId}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!userId ? 'Select a user first' : ''}
                >
                    {loadingSuggested ? 'Loading Recommendations...' : 'Load Recommendations'}
                </button>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Friends of Friends (FOF)</h3>
                {friendsOfFriends.length === 0 ? (
                    <p>No friends of friends loaded yet.</p>
                ) : (
                    <ul className="flex flex-wrap gap-3">
                        {friendsOfFriends.map((user) => (
                            <li
                                key={user.user_id}
                                className="flex flex-col items-center p-2 bg-gray-50 rounded w-24"
                            >
                                <img
                                    src={`data:image/png;base64,${user.avatar_url}`}
                                    alt={`${user.first_name} avatar`}
                                    className="w-16 h-16 rounded-full object-cover border mb-2"
                                />
                                <span className="text-sm text-center">
                  {user.first_name} {user.surname}
                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-3">Suggested Users</h3>
                {suggested.length === 0 ? (
                    <p>No suggestions loaded yet.</p>
                ) : (
                    <ul className="flex flex-wrap gap-3">
                        {suggested.map((user) => (
                            <li
                                key={user.user_id}
                                className="flex flex-col items-center p-2 bg-gray-50 rounded w-24"
                            >
                                <img
                                    src={`data:image/png;base64,${user.avatar_url}`}
                                    alt={`${user.first_name} avatar`}
                                    className="w-16 h-16 rounded-full object-cover border mb-2"
                                />
                                <span className="text-sm text-center">
                  {user.first_name} {user.surname}
                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
