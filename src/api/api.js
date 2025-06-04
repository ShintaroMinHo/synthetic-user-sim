const API_BASE_URL = '/api';

export const refreshDB = () => fetch(`${API_BASE_URL}/refresh_db`);
export const getTotalCount = () => fetch(`${API_BASE_URL}/get_total_count`).then(res => res.json());
export const simulateDay = () => fetch(`${API_BASE_URL}/simulate_day`).then(res => res.json());
export const getRandomUserId = () => fetch(`${API_BASE_URL}/random_user_id`).then(res => res.json());
export const getUserProfile = (id) => fetch(`${API_BASE_URL}/get_user_profile?id=${id}`).then(res => res.json());
export const getUserFriends = (id) => fetch(`${API_BASE_URL}/get_user_friends?id=${id}`).then(res => res.json());
export const recommendFOF = (id) => fetch(`${API_BASE_URL}/recommend_fof?id=${id}`).then(res => res.json());
export const recommendStrangers = (id) => fetch(`${API_BASE_URL}/recommend_strangers?id=${id}`).then(res => res.json());

export const batchGetSimpleProfiles = (ids) =>
    fetch(`${API_BASE_URL}/batch_get_simple_profiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ids)  // directement un tableau, pas { ids: [...] }
    }).then(res => res.json());
