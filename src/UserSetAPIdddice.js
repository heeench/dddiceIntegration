import React, { useEffect, useState } from "react";
import DiceRoller from "./DiceRoller";

const UserSetAPIdddice = () => {
    const [token, setToken] = useState('');
    const [roomSlug, setRoomSlug] = useState('');
    const [isUserCreated, setIsUserCreated] = useState(false);

    useEffect(() => {
        const createGuestUser = () => {    
            const url = new URL("https://dddice.com/api/1.0/user");
            const headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            };
            
            fetch(url, {
                method: "POST",
                headers,
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create guest user');
                }
                return response.json();
            })
            .then(data => {
                const userToken = data.data;
                setToken(userToken);
                localStorage.setItem('token', userToken);
                authUser(userToken);
            })
            .catch(error => console.error('Error:', error));
        };

        if (!isUserCreated) {
            createGuestUser();
        }
    }, [isUserCreated]);

    const authUser = (token) => {
        const url = new URL("https://dddice.com/api/1.0/user/token");
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        
        const body = {
            "name": "keshal"
        };
        
        fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to auth user');
            }
            return response.json();
        })
        .then(data => {
            const authToken = data.data;
            setToken(authToken);
            localStorage.setItem('token', authToken);
            createGuestRoom(authToken);
            setIsUserCreated(true); // Помечаем, что пользователь создан и аутентифицирован
        })
        .catch(error => console.error('Error:', error));
    };

    const createGuestRoom = (token) => {
        const url = new URL("https://dddice.com/api/1.0/room");
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        
        const body = {
            "is_public": true,
            "name": "guest_room"
        };
        
        fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to create guest room');
            }
            return response.json();
        })
        .then(data => {
            const slug = data.data.slug;
            setRoomSlug(slug);
            localStorage.setItem('slug', slug);
        })
        .catch(error => console.error('Error:', error));
    };

    console.log("GuestToken - " + token + "\nRoomSlug - " + roomSlug);
    return (
        <div className="userRoom">
            <DiceRoller token={token} roomSlug={roomSlug}/>
        </div>
    );
};

export default UserSetAPIdddice;
