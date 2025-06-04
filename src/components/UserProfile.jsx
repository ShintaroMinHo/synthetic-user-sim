import React, { useState, useEffect } from 'react';

function percentFromScore(score) {
    return Math.min(100, Math.max(0, Math.round((score / 15) * 100)));
}

export default function UserProfile({ selectedUserId, setSelectedUserId, totalUsers }) {
    const [userIdInput, setUserIdInput] = useState('');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch user profile from API
    const fetchUserProfile = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/get_user_profile?id=${id}`);
            if (!res.ok) throw new Error('User not found');
            const data = await res.json();
            setProfile(data);
            setSelectedUserId(id);
        } catch {
            alert('Invalid User ID');
        } finally {
            setLoading(false);
        }
    };

    // Random user fetch
    const fetchRandomUser = async () => {
        const res = await fetch('/api/random_user_id');
        const { id } = await res.json();
        setUserIdInput(id);
        fetchUserProfile(id);
    };

    // Handle input submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const id = parseInt(userIdInput);
        if (id >= 1 && id <= totalUsers) {
            fetchUserProfile(id);
        } else {
            alert(`User ID must be between 1 and ${totalUsers}`);
        }
    };

    useEffect(() => {
        if (selectedUserId) {
            setUserIdInput(selectedUserId);
        }
    }, [selectedUserId]);

    return (
        <section className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">User Profile Viewer</h2>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-4">
                <input
                    type="number"
                    min="1"
                    max={totalUsers}
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="User ID"
                    className="border rounded px-3 py-2 w-24"
                    disabled={loading}
                />
                <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
                    View
                </button>
                <button type="button" onClick={fetchRandomUser} disabled={loading} className="bg-gray-500 text-white px-4 py-2 rounded">
                    Random
                </button>
            </form>

            {loading && <p>Loading profile...</p>}

            {profile && (
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={`data:image/png;base64,${profile.avatar_url}`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{profile.first_name} {profile.surname} {profile.gender === 'M' ? '♂️' : '♀️'}</h3>

                        <div className="mt-4">
                            <h4 className="font-semibold">Interests</h4>
                            <div className="space-y-2 mt-2">
                                {profile.interests.map(({ name, score }) => (
                                    <div key={name}>
                                        <label className="flex justify-between font-medium">
                                            {name}
                                            <span>{percentFromScore(score)}%</span>
                                        </label>
                                        <div className="bg-gray-200 rounded h-4">
                                            <div
                                                className="bg-blue-500 h-4 rounded"
                                                style={{ width: `${percentFromScore(score)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-semibold">Tags</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${
                                            tag ? 'bg-green-600' : 'bg-gray-400'
                                        }`}
                                        title={tag ? 'Active Tag' : 'Inactive Tag'}
                                    >
                    {idx + 1}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
