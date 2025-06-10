import React, { useEffect, useState } from 'react';

export default function UserConnections({ userId }) {
    const [friends, setFriends] = useState([]);
    const [fof, setFof] = useState([]);
    const [strangers, setStrangers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setFriends([]);
            setFof([]);
            setStrangers([]);
            setError(null);
            setLoading(false);
            return;
        }

        let isCancelled = false;
        setLoading(true);
        setError(null);

        async function fetchData(endpoint) {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`Erreur ${res.status} sur ${endpoint}`);
            return res.json();
        }

        Promise.all([
            fetchData(`http://localhost:8080/api/get_user_friends?id=${userId}`),
            fetchData(`http://localhost:8080/api/recommend_fof?id=${userId}`),
            fetchData(`http://localhost:8080/api/recommend_strangers?id=${userId}`)
        ])
            .then(([friendsData, fofData, strangersData]) => {
                if (!isCancelled) {
                    setFriends(friendsData.friends || []);
                    setFof(fofData.recommendations || []);
                    setStrangers(strangersData.recommendations || []);
                }
            })
            .catch(err => {
                if (!isCancelled) setError(err.message);
            })
            .finally(() => {
                if (!isCancelled) setLoading(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [userId]);

    if (!userId) return null;

    if (loading) return <p>Chargement des connexions...</p>;

    if (error) return <p className="text-red-600">Erreur : {error}</p>;

    return (
        <section className="mt-6 bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Connexions</h3>

            <div>
                <h4 className="font-medium">Amis :</h4>
                {friends.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {friends.map((id) => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-600">Aucun ami trouvé.</p>
                )}
            </div>

            <div className="mt-4">
                <h4 className="font-medium">Recommandations Amis d'Amis :</h4>
                {fof.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {fof.map((id) => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-600">Aucune recommandation FOF.</p>
                )}
            </div>

            <div className="mt-4">
                <h4 className="font-medium">Recommandations Étrangers :</h4>
                {strangers.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {strangers.map((id) => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-600">Aucune recommandation d'étrangers.</p>
                )}
            </div>
        </section>
    );
}
