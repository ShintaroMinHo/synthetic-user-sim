import React, { useEffect, useState } from 'react';

export default function FriendsList({ userId }) {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        // Get friend IDs
        fetch(`/api/get_user_friends?id=${userId}`)
            .then(res => res.json())
            .then(friendIds => {
                // Batch fetch friend profiles
                if(friendIds.length === 0) {
                    setFriends([]);
                    setLoading(false);
                    return;
                }
                fetch('/api/batch_get_simple_profiles', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ ids: friendIds }),
                })
                    .then(res => res.json())
                    .then(profiles => {
                        setFriends(profiles);
                        setLoading(false);
                    });
            });
    }, [userId]);

    if (!userId) return null;
    if (loading) return <p>Loading friends...</p>;
    if (friends.length === 0) return <p>No friends found.</p>;

    return (
        <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Friends</h4>
            <ul className="flex flex-wrap gap-3">
                {friends.map(friend => (
                    <li key={friend.id} className="flex items-center space-x-3 bg-gray-50 rounded p-2">
                        <img
                            src={`data:image/png;base64,${friend.avatar}`}
                            alt={`${friend.first_name} avatar`}
                            className="w-10 h-10 rounded-full object-cover border"
                        />
                        <span>{friend.first_name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
