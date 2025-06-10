import React, { useEffect, useState } from 'react';

export default function FriendsList({ userId }) {
    const [friendsIds, setFriendsIds] = useState([]);
    const [friendsProfiles, setFriendsProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setFriendsIds([]);
            setFriendsProfiles([]);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Debounce timer
        const debounceTimer = setTimeout(() => {
            // 1. Fetch friends IDs
            fetch(`http://localhost:8080/api/get_user_friends?id=${userId}`)
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch friends IDs');
                    return res.json();
                })
                .then((data) => {
                    setFriendsIds(data.friends);

                    if (data.friends.length === 0) {
                        setFriendsProfiles([]);
                        setLoading(false);
                        return null; // stop chain
                    }

                    // 2. Fetch friends profiles batch
                    return fetch('http://localhost:8080/api/batch_get_simple_profiles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data.friends),
                    });
                })
                .then((res) => {
                    if (!res) return; // if no friends
                    if (!res.ok) throw new Error('Failed to fetch friends profiles');
                    return res.json();
                })
                .then((data) => {
                    if (data) setFriendsProfiles(data.profiles);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }, 500); // délai debounce de 500ms

        // Cleanup function : annule le timer si userId change avant les 500ms
        return () => clearTimeout(debounceTimer);
    }, [userId]);

    if (!userId) return null;

    if (loading) return <div>Loading friends...</div>;

    if (error) return <div className="text-red-600">Error: {error}</div>;

    if (friendsProfiles.length === 0) return <div>No friends found.</div>;

    return (
        <div className="mt-6 p-4 border rounded shadow">
            <h3 className="text-lg font-semibold mb-3">Friends</h3>
            <ul className="flex flex-wrap gap-4">
                {friendsProfiles.map((friend) => (
                    <li key={friend.user_id} className="flex flex-col items-center w-20">
                        <img
                            src={`data:image/png;base64,${friend.avatar_url}`}
                            alt={`${friend.first_name} avatar`}
                            className="w-16 h-16 rounded-full"
                        />
                        <span className="text-sm text-center">
                            {friend.first_name} {friend.surname}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
