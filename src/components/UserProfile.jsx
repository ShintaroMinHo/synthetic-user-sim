import React, { useState, useEffect } from 'react';

export default function UserProfile({ selectedUserId, setSelectedUserId, totalUsers, day }) {
    const [userIdInput, setUserIdInput] = useState('');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserProfile = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8080/api/get_user_profile?id=${id}`);
            if (!res.ok) throw new Error('User not found');
            const data = await res.json();
            setProfile(data);
            setSelectedUserId(id);
        } catch (err) {
            setError(err.message);
            setProfile(null);
            setSelectedUserId(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchRandomUser = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8080/api/random_user_id');
            if (!res.ok) throw new Error('Failed to get random user');
            const { id } = await res.json();
            setUserIdInput(id.toString());
            await fetchUserProfile(id);
        } catch (err) {
            setError("Erreur lors de la récupération d'un utilisateur aléatoire");
            setProfile(null);
            setSelectedUserId(null);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = parseInt(userIdInput, 10);
        if (id >= 1 && id <= totalUsers) {
            fetchUserProfile(id);
        } else {
            setError(`User ID must be between 1 and ${totalUsers}`);
        }
    };

    useEffect(() => {
        if (selectedUserId) {
            setUserIdInput(selectedUserId.toString());
            fetchUserProfile(selectedUserId);
        } else {
            setProfile(null);
            setUserIdInput('');
            setError(null);
        }
    }, [selectedUserId, day]);

    return (
        <section className="bg-white shadow rounded p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">User Profile Viewer</h2>

            <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-4" noValidate>
                <label htmlFor="userIdInput" className="sr-only">User ID</label>
                <input
                    id="userIdInput"
                    type="number"
                    min="1"
                    max={totalUsers}
                    value={userIdInput}
                    onChange={(e) => {
                        setUserIdInput(e.target.value);
                        if (error) setError(null);
                    }}
                    placeholder="User ID"
                    className="border rounded px-3 py-2 w-24"
                    disabled={loading}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby="error-message"
                />
                <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
                    View
                </button>
                <button
                    type="button"
                    onClick={fetchRandomUser}
                    disabled={loading}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Random
                </button>
            </form>

            {loading && <p>Loading profile...</p>}

            {error && <p id="error-message" className="text-red-600 mb-4">{error}</p>}

            {profile && (
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={`data:image/png;base64,${profile.avatar_url}`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">
                            {profile.first_name} {profile.surname} {profile.gender === 'M' ? '♂️' : profile.gender === 'F' ? '♀️' : ''}
                        </h3>

                        <div className="mt-4">
                            <h4 className="font-semibold">Interests</h4>
                            {profile.interests.length === 0 ? (
                                <p className="text-gray-500 italic">No interests</p>
                            ) : (
                                <div className="space-y-2 mt-2">
                                    {profile.interests.map(({ name, score }) => (
                                        <div key={name} className="flex justify-between font-medium">
                                            <span>{name}</span>
                                            <span>{score}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                        {tag}
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
