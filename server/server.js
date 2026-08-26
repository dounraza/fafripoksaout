import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Table } from 'poker-ts';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Instance unique de la table sur le serveur
const pokerTable = new Table({ ante: 0, smallBlind: 20, bigBlind: 40 }, 9);
const playerSeats = new Map(); // Follow-up: add this

function emitTableUpdate() {
  const isHandInProgress = pokerTable.isHandInProgress();
  io.emit('tableUpdate', {
    seats: pokerTable.seats(),
    holeCards: isHandInProgress ? pokerTable.holeCards() : [],
    communityCards: isHandInProgress ? pokerTable.communityCards() : [],
    pots: isHandInProgress ? pokerTable.pots() : [],
    roundOfBetting: isHandInProgress ? pokerTable.roundOfBetting() : null,
    button: isHandInProgress ? pokerTable.button() : null,
    playerToAct: isHandInProgress ? pokerTable.playerToAct() : null,
  });
}

io.on('connection', (socket) => {
  console.log('Joueur connecté:', socket.id);

  socket.on('playerAction', (action) => {
    // On récupère le siège du joueur qui a envoyé l'action
    const seat = playerSeats.get(socket.id);
    
    // Si le joueur est bien assis et que c'est son tour
    if (seat !== undefined && pokerTable.playerToAct() === seat) {
      pokerTable.actionTaken(action.toLowerCase());
      emitTableUpdate();
    }
  });

  socket.on('sitDown', (payload) => {
    const data = typeof payload === 'string' ? { playerName: payload } : (payload || {});
    const playerName = data.playerName || 'Joueur';
    const preferredSeat = Number.isInteger(data.preferredSeat) ? data.preferredSeat : null;

    // Si déjà assis, on ignore
    if (playerSeats.has(socket.id)) return;

    // Siège préféré d'abord, sinon premier siège libre
    const seats = pokerTable.seats();
    const seat = preferredSeat !== null && seats[preferredSeat] === null
      ? preferredSeat
      : seats.findIndex((s) => s === null);
    
    if (seat !== -1) {
      const buyIn = Number(data.buyIn || data.cave || 4200);
      pokerTable.sitDown(seat, buyIn);
      playerSeats.set(socket.id, seat);
      
      console.log(`${playerName} s'assoit au siège ${seat}`);
      
      socket.emit('seatAssigned', seat);
      
      // Lancer la main si 2+ joueurs
      const activeSeats = pokerTable.seats().map((s, i) => s ? i : null).filter(s => s !== null);
      if (activeSeats.length >= 2 && !pokerTable.isHandInProgress()) {
        pokerTable.startHand();
      }

      // Diffuser l'état de la table à tout le monde
      emitTableUpdate();
    }
  });

  socket.on('disconnect', () => {
    console.log('Joueur déconnecté:', socket.id);
    const seat = playerSeats.get(socket.id);
    if (seat !== undefined) {
      playerSeats.delete(socket.id);
      pokerTable.standUp(seat);
      emitTableUpdate();
    }
  });
});

server.listen(3000, () => console.log('Serveur lancé sur le port 3000'));
