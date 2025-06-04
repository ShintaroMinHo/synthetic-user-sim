import React, { useEffect, useState } from 'react';
import FriendsList from './FriendsList';

export default function Recommendations({ userId }) {
    const [friendsOfFriends, setFriendsOfFriends] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);

        fetch(`/api/get_friends_of_friends?id=${userId}`)
            .then(res => res.json())
            .then(fof => {
                setFriendsOfFriends(fof);
            });

        fetch(`/api/get_suggested_users?id=${userId}`)
            .then(res => res.json())
            .then(sugg => {
                setSuggested(sugg);
                setLoading(false);
            });
    }, [userId]);

    if (!userId) return null;
    if (loading) return <p>Loading recommendations...</p>;

    return (
        <section className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>

            <div className="mb-6">
                <h3 className="text-xl font-semibold">Friends of Friends (FOF)</h3>
                {friendsOfFriends.length === 0 ? (
                    <p>No friends of friends found.</p>
                ) : (
                    <ul className="flex flex-wrap gap-3">
                        {friendsOfFriends.map(user => (
                            <li key={user.id} className="flex flex-col items-center p-2 bg-gray-50 rounded w-24">
                                <img
                                    src={`data:image/png;base64,${user.avatar}`}
                                    alt={`${user.first_name} avatar`}
                                    className="w-16 h-16 rounded-full object-cover border mb-2"
                                />
                                <span className="text-sm">{user.first_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold">Suggested Users</h3>
                {suggested.length === 0 ? (
                    <p>No suggestions at this time.</p>
                ) : (
                    <ul className="flex flex-wrap gap-3">
                        {suggested.map(user => (
                            <li key={user.id} className="flex flex-col items-center p-2 bg-gray-50 rounded w-24">
                                <img
                                    src={`data:image/png;base64,${user.avatar}`}
                                    alt={`${user.first_name} avatar`}
                                    className="w-16 h-16 rounded-full object-cover border mb-2"
                                />
                                <span className="text-sm">{user.first_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
