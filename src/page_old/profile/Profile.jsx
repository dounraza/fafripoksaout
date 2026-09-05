import React, { useEffect, useState } from 'react';
import Nav from '../../component/nav/Nav';
import './Profile.scss';
import { updateProfile, uploadAvatar } from '../../services/authService';
import { getFullAvatarUrl } from '../../services/api';
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');

    const [pseudo, setPseudo] = useState(
        sessionStorage.getItem('userName') || ''
    );

    const [email, setEmail] = useState(
        sessionStorage.getItem('userEmail') || ''
    );

    const userIdAvatar = `avatar_${userId}`;

    const [selectedAvatar, setSelectedAvatar] = useState(
        sessionStorage.getItem(userIdAvatar) || ''
    );

    const [selectedFile, setSelectedFile] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    // Initialiser le pseudo / email depuis la session
    useEffect(() => {
        setPseudo(sessionStorage.getItem('userName') || '');
        setEmail(sessionStorage.getItem('userEmail') || '');
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setSelectedFile(file);

        // Aperçu local de la nouvelle photo
        const avatarUrl = URL.createObjectURL(file);
        setSelectedAvatar(avatarUrl);
    };

    const handleChangePhoto = () => {
        document.getElementById('profile-file')?.click();
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!pseudo.trim()) {
            return;
        }

        if (!email.trim()) {
            return;
        }

        setLoading(true);
        setSuccess('');

        try {
            let avatarUrl = selectedAvatar;

            // Upload de la nouvelle photo
            if (selectedFile) {
                avatarUrl = await uploadAvatar(selectedFile);
            }

            /*
             * On garde ton service actuel.
             *
             * Si updateProfile accepte déjà email/password,
             * adapte simplement ses paramètres ici.
             */
            await updateProfile(
                userId,
                pseudo.trim(),
                avatarUrl,
                email.trim(),
                password
            );

            // Sauvegarde session
            sessionStorage.setItem('userName', pseudo.trim());
            sessionStorage.setItem('userEmail', email.trim());

            if (avatarUrl) {
                sessionStorage.setItem(userIdAvatar, avatarUrl);
            }

            // Le mot de passe n'est jamais conservé dans la session
            setPassword('');

            setSuccess('C’est enregistré.');

        } catch (error) {
            console.error('Erreur mise à jour profil :', error);
            setSuccess('');
            alert('Erreur lors de la mise à jour du profil.');
        } finally {
            setLoading(false);
        }
    };

    const getAvatarSrc = () => {
        if (!selectedAvatar) return null;

        // Si c'est un aperçu local
        if (selectedAvatar.startsWith('blob:')) {
            return selectedAvatar;
        }

        return getFullAvatarUrl(selectedAvatar);
    };

    const avatarSrc = getAvatarSrc();

    const firstLetter = (
        pseudo?.trim()?.charAt(0) || 'J'
    ).toUpperCase();

    return (
      
        <div className="profile-container">
            <header className="depot-header">
                    <div className="depot-wrap depot-bar">
                        <div className="depot-brand">
                            Afripoks
                        </div>

                        <button
                            type="button"
                            className="depot-btn depot-btn-out"
                            onClick={() => navigate("/acceuil")}
                        >
                            Accueil
                        </button>
                    </div>
                </header>
            <main className="profile-content">

                <h1>Mon compte</h1>

                <p className="profile-sub">
                    Photo, pseudo, email, mot de passe.
                </p>

                <form
                    className="profile-form"
                    onSubmit={handleUpdateProfile}
                >

                    {/* PHOTO */}
                    <div className="photo-wrap">

                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt="Avatar"
                                className="avatar"
                            />
                        ) : (
                            <div className="avatar letter">
                                {firstLetter}
                            </div>
                        )}

                        <button
                            type="button"
                            className="pick"
                            onClick={handleChangePhoto}
                        >
                            Changer la photo
                        </button>

                        <input
                            id="profile-file"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                        />

                    </div>

                    {/* PSEUDO */}
                    <label htmlFor="pseudo">
                        Pseudo
                    </label>

                    <input
                        id="pseudo"
                        name="pseudo"
                        type="text"
                        value={pseudo}
                        required
                        onChange={(e) =>
                            setPseudo(e.target.value)
                        }
                    />

                    {/* EMAIL */}
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        required
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    {/* PASSWORD */}
                    <label htmlFor="password">
                        Nouveau mot de passe
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        minLength={6}
                        placeholder="Laisser vide pour ne pas changer"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    {/* ENREGISTRER */}
                    <button
                        className="go"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Enregistrement...'
                            : 'Enregistrer'}
                    </button>

                    {/* SUCCESS */}
                    <p className="ok">
                        {success}
                    </p>

                </form>

            </main>
        </div>
    );
};

export default Profile;
