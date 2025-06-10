import React, { useEffect, useState } from 'react';

export default function Recommendations() {
    const [userId, setUserId] = useState(null);
    const [friendsOfFriends, setFriendsOfFriends] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [friends, setFriends] = useState([]);
    const [totalUsers, setTotalUsers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch total users once on mount
    useEffect(() => {
        fetch('http://localhost:8080/api/get_total_count')
            .then(res => res.json())
            .then(data => {
                if (data.total_users !== undefined) {
                    setTotalUsers(data.total_users);
                }
            })
            .catch(() => setTotalUsers(null));
    }, []);

    // Fetch profiles simple batch helper
    const fetchProfiles = async (userIds) => {
        if (!userIds || userIds.length === 0) return [];
        const res = await fetch('http://localhost:8080/api/batch_get_simple_profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userIds),
        });
        if (!res.ok) throw new Error('Failed to fetch profiles');
        const data = await res.json();
        return data.profiles;
    };

    // Fetch friends list (user’s friends)
    const fetchFriends = async (uid) => {
        const res = await fetch(`http://localhost:8080/api/get_user_friends?id=${uid}`);
        if (!res.ok) throw new Error('Failed to fetch friends');
        const data = await res.json();
        const friendsProfiles = await fetchProfiles(data.friends);
        setFriends(friendsProfiles);
    };

    // Load all recommendations + friends for given userId
    const loadUserData = async (uid) => {
        try {
            setLoading(true);
            setError(null);
            setFriendsOfFriends([]);
            setSuggested([]);
            setFriends([]);

            // Parallel fetch fof and suggested
            const [fofRes, suggestedRes] = await Promise.all([
                fetch(`http://localhost:8080/api/recommend_fof?id=${uid}`),
                fetch(`http://localhost:8080/api/recommend_strangers?id=${uid}`),
            ]);

            if (!fofRes.ok || !suggestedRes.ok) {
                throw new Error('Failed to fetch recommendations');
            }

            const fofData = await fofRes.json();
            const suggestedData = await suggestedRes.json();

            // Fetch profiles
            const [fofProfiles, suggestedProfiles] = await Promise.all([
                fetchProfiles(fofData.recommendations),
                fetchProfiles(suggestedData.recommendations),
            ]);

            setFriendsOfFriends(fofProfiles);
            setSuggested(suggestedProfiles);

            // Fetch friends
            await fetchFriends(uid);

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Handler to get random user and load data
    const handleRandomUser = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('http://localhost:8080/api/random_user_id');
            if (!res.ok) throw new Error('Failed to fetch random user');
            const data = await res.json();
            setUserId(data.user_id);
            await loadUserData(data.user_id);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <section className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>

            <div className="mb-4 flex items-center justify-between">
                <div>Total users: {totalUsers !== null ? totalUsers : 'Loading...'}</div>
                <button
                    onClick={handleRandomUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Get Random User & Recommendations
                </button>
            </div>

            {error && <p className="text-red-600 mb-4">Error: {error}</p>}

            {!userId && !loading && <p>Select a user by clicking the button above.</p>}

            {loading && <p>Loading recommendations...</p>}

            {!loading && userId && (
                <>
                    <p className="mb-4 font-medium">Showing recommendations for user ID: {userId}</p>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">Friends</h3>
                        {friends.length === 0 ? (
                            <p>No friends found.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-3">
                                {friends.map(user => (
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

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">Friends of Friends (FOF)</h3>
                        {friendsOfFriends.length === 0 ? (
                            <p>No friends of friends found.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-3">
                                {friendsOfFriends.map(user => (
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
                            <p>No suggestions at this time.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-3">
                                {suggested.map(user => (
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
                </>
            )}
        </section>
    );
}
