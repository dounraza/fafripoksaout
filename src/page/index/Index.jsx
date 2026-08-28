import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Index.scss';

const Index = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      // try {
      //   const { data } = await api.get('/auth/me');
      //   if (data && data.success && data.user) {
      //     setUser(data.user);
      //     localStorage.setItem('afripoks.user', JSON.stringify(data.user));
      //     localStorage.setItem('afripoks.bankroll', String(data.user.solde || data.user.chips || 0));
      //   } else {
      //     setUser(null);
      //   }
      // } catch (e) {
      //   setUser(null);
      // }
      setUser(null);
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('afripoks.user');
    localStorage.removeItem('afripoks.token');
    localStorage.removeItem('afripoks.bankroll');
    sessionStorage.removeItem('accessToken');
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="page-index">
      <header className="topbar">
        <div className="wrap">
          <Link className="logo" to="/">Afripoks</Link>
          <div className="account">
            {user ? (
              <div className="user-connected-bar">
                <span className="solde-badge">
                  💰 {Number(user.solde !== undefined ? user.solde : (user.chips || 0)).toLocaleString('fr-FR')} Ar
                </span>
                <span className="user-name-badge">
                  👤 {user.name || user.pseudo || 'Joueur'}
                </span>
                <a className="btn btn-gold" href="/lobby.html">Jouer</a>
                <a className="btn btn-ghost" href="/account.html">Compte</a>
                <button type="button" className="btn btn-ghost btn-logout" onClick={handleLogout}>
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">Connexion</Link>
                <Link className="btn btn-gold" to="/register">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="stage" id="stage">
        <div className="rings" aria-hidden="true">
          <div className="ring ring-out">
            <div className="slot" style={{ '--a': '0deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '30deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '60deg', '--d': '400px' }}><div className="card face"><i className="">♠</i></div></div>
            <div className="slot" style={{ '--a': '90deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '120deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '150deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '180deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '210deg', '--d': '400px' }}><div className="card face"><i className="r">♥</i></div></div>
            <div className="slot" style={{ '--a': '240deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '270deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '300deg', '--d': '400px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '330deg', '--d': '400px' }}><div className="card back"></div></div>
          </div>
          <div className="ring ring-in">
            <div className="slot" style={{ '--a': '22deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '67deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '112deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '157deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '202deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '247deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '292deg', '--d': '265px' }}><div className="card back"></div></div>
            <div className="slot" style={{ '--a': '337deg', '--d': '265px' }}><div className="card back"></div></div>
          </div>
        </div>

        <div className="collide" id="collide" aria-hidden="true">
          <div className="big bigcard" style={{ '--fx': '-1180px', '--fy': '-560px', '--r0': '510deg', '--r1': '13deg', '--t': '0.045s' }}><i className="">♠</i></div>
          <div className="big bigcard" style={{ '--fx': '1220px', '--fy': '-500px', '--r0': '-620deg', '--r1': '-4deg', '--t': '0.018s' }}><i className="r">♥</i></div>
          <div className="big bigchip" style={{ '--fx': '-1280px', '--fy': '340px', '--r0': '-620deg', '--r1': '14deg', '--t': '0.063s' }}></div>
          <div className="big bigcard" style={{ '--fx': '1240px', '--fy': '460px', '--r0': '-430deg', '--r1': '-10deg', '--t': '0.045s' }}><i className="r">♦</i></div>
          <div className="big bigchip" style={{ '--fx': '-40px', '--fy': '-880px', '--r0': '-430deg', '--r1': '-11deg', '--t': '0.054s' }}></div>
          <div className="big bigcard" style={{ '--fx': '-980px', '--fy': '760px', '--r0': '600deg', '--r1': '-14deg', '--t': '0.06s' }}><i className="">♣</i></div>
          <div className="big bigchip" style={{ '--fx': '1020px', '--fy': '780px', '--r0': '510deg', '--r1': '12deg', '--t': '0.065s' }}></div>
          <div className="big bigcard" style={{ '--fx': '-1340px', '--fy': '-90px', '--r0': '-620deg', '--r1': '-6deg', '--t': '0.062s' }}><i className="r">♥</i></div>
          <div className="big bigchip" style={{ '--fx': '1360px', '--fy': '-40px', '--r0': '-620deg', '--r1': '-12deg', '--t': '0.006s' }}></div>
        </div>

        <div className="pitch">
          <span className="eyebrow">Tables ouvertes 24h/24</span>
          <h1>Tu penses savoir bluffer&nbsp;?<br /><em>Prouve-le à la table</em></h1>
          <div className="cta-row">
            {user ? (
              <a className="btn btn-gold btn-lg" href="/lobby.html">Rejoindre une table</a>
            ) : (
              <Link className="btn btn-gold btn-lg" to="/register">Créer un compte</Link>
            )}
            <a className="btn btn-white btn-lg" href="#telecharger">Télécharger l'application</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Deux façons de jouer</h2>
            <p>Des tables ouvertes en permanence, du premier tapis à la table finale.</p>
          </div>
          <div className="grid">
            <article className="offer">
              <span className="suit">&diams;</span>
              <h3>Cash Games</h3>
              <p>Entrez et sortez à votre guise avec vos jetons. Vivez la liberté totale du poker en temps réel.</p>
              <Link className="link" to="/lobby">Rejoindre une table &rarr;</Link>
            </article>
            <article className="offer">
              <span className="suit">&spades;</span>
              <h3>Tournois</h3>
              <p>Des centaines de joueurs, un buy-in fixe et une place en table finale. Le défi ultime pour la gloire.</p>
              <Link className="link" to="/lobby">Voir le calendrier &rarr;</Link>
            </article>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <p className="legal">Afripoks est réservé aux personnes majeures.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
