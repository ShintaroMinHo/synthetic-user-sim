import React, { useState, useEffect } from 'react';

function percentFromScore(score) {
    const percentage = (score / 15) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
}

export default function UserInsight({ totalUsers, day }) {
    const [userIdInput, setUserIdInput] = useState('');
    const [profile, setProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUserProfile = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8080/api/get_user_profile?id=${id}`);
            if (!res.ok) throw new Error('User not found');
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async (id) => {
        try {
            const res = await fetch(`http://localhost:8080/api/recommendations?id=${id}`);
            const data = await res.json();
            setRecommendations(data);
        } catch (err) {
            console.error('Erreur recommandation', err);
            setRecommendations([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = parseInt(userIdInput, 10);
        if (id >= 1 && id <= totalUsers) {
            fetchUserProfile(id);
            fetchRecommendations(id);
        } else {
            setError(`User ID must be between 1 and ${totalUsers}`);
        }
    };

    const fetchRandomUser = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/random_user_id');
            const { id } = await res.json();
            setUserIdInput(id);
            fetchUserProfile(id);
            fetchRecommendations(id);
        } catch (err) {
            console.error('Erreur utilisateur aléatoire', err);
        }
    };

    return (
        <section className="bg-white p-6 rounded shadow mt-6">
            <h2 className="text-2xl font-semibold mb-4">🔍 User Insight</h2>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="number"
                    min="1"
                    max={totalUsers}
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="Enter user ID"
                    className="border px-3 py-2 rounded w-28"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Search</button>
                <button type="button" onClick={fetchRandomUser} className="bg-gray-600 text-white px-4 py-2 rounded">
                    Random
                </button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {profile && (
                <div className="border-t pt-4 mt-4">
                    <div className="flex gap-6">
                        <img
                            src={`data:image/png;base64,${profile.avatar_url}`}
                            alt="avatar"
                            className="w-24 h-24 rounded-full border"
                        />
                        <div>
                            <h3 className="text-xl font-bold">
                                {profile.first_name} {profile.surname} ({profile.gender})
                            </h3>
                            <div className="mt-2">
                                <h4 className="font-semibold">Interests</h4>
                                {profile.interests.map(({ name, score }) => (
                                    <div key={name} className="mb-1">
                                        <label className="flex justify-between">
                                            {name} <span>{percentFromScore(score)}%</span>
                                        </label>
                                        <div className="bg-gray-200 h-3 rounded">
                                            <div className="bg-blue-500 h-3 rounded" style={{ width: `${percentFromScore(score)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <h4 className="font-semibold">Tags</h4>
                                <div className="flex flex-wrap gap-1">
                                    {profile.tags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                                            {idx + 1}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">🧠 Recommended Connections</h4>
                        {recommendations.length > 0 ? (
                            <ul className="list-disc ml-6">
                                {recommendations.map((rec) => (
                                    <li key={rec.id}>
                                        ID: {rec.id} – Score: {rec.score.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recommendations available.</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
