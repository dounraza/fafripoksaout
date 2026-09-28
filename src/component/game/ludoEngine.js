const PLAYERS = {
  red: {
    label: "Red",
    messageColor: "red",
    start: 1,
    finish: 57,
    finalPrefix: "rf",
    homePrefix: "g_r",
    tokenPrefix: "r",
    next: "green",
  },
  green: {
    label: "Green",
    messageColor: "green",
    start: 14,
    finish: 18,
    finalPrefix: "gf",
    homePrefix: "g_g",
    tokenPrefix: "g",
    next: "yellow",
  },
  yellow: {
    label: "Yellow",
    messageColor: "rgb(255, 200, 0)",
    start: 27,
    finish: 31,
    finalPrefix: "yf",
    homePrefix: "g_y",
    tokenPrefix: "y",
    next: "green",
  },
  blue: {
    label: "Blue",
    messageColor: "blue",
    start: 40,
    finish: 44,
    finalPrefix: "bf",
    homePrefix: "g_b",
    tokenPrefix: "b",
    next: "red",
  },
};

const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);
const STEP_DURATION = 220;
const DICE_ROLL_DURATION = 1100;
const AUTO_MOVE_DELAY = 140;

const getElement = (id) => document.getElementById(String(id));
const FINISH_ZONE_IDS = {
  green: "out-green",
  yellow: "out-yellow",
  red: "out-red",
  blue: "out-blue",
};
const getFinishedDestination = (color) => {
  const zoneId = FINISH_ZONE_IDS[color];
  return zoneId ? getElement(zoneId) : null;
};

export function createLudoEngine(diceImages, callbacks = {}) {
  const message = getElement("message");
  const diceElements = Object.fromEntries(
    Object.keys(PLAYERS).map((color) => [color, getElement(`die-${color}`)])
  );

  const state = {
    turn: "red",
    turnOrder: ["red", "green", "yellow", "blue"],
    count: 1,
    isAnimating: false,
    consecutiveSixes: {
      red: 0,
      green: 0,
      yellow: 0,
      blue: 0,
    },
    selectedIndex: {
      red: 0,
      green: 0,
      yellow: 0,
      blue: 0,
    },
    pendingCounts: {
      red: [],
      green: [],
      yellow: [],
      blue: [],
    },
    pawns: Object.fromEntries(
      Object.entries(PLAYERS).map(([color, config]) => [
        color,
        [1, 2, 3, 4].map((slot) => ({
          element: getElement(`${config.tokenPrefix}${slot}`),
          homeSlot: getElement(`${config.homePrefix}${slot}`),
          j: 0,
          move: 0,
          home: true,
          finished: false,
        })),
      ])
    ),
  };

  const setMessage = (color) => {
    if (!message) return;

    message.innerHTML = PLAYERS[color].label;
    message.style.color = PLAYERS[color].messageColor;
  };

  const setDieEnabled = (enabled) => {
    Object.entries(diceElements).forEach(([color, die]) => {
      if (!die) return;

      const isActive = color === state.turn;
      // L'activation réelle est contrôlée par React afin de respecter
      // toute la séquence dé + déplacement avant le changement de tour.
      die.classList.toggle("is-active", enabled && isActive);
    });
  };

  const setDiceFace = (color, count) => {
    const die = diceElements[color];
    if (!die || !diceImages[count]) return;

    die.style.backgroundImage = `url("${diceImages[count]}")`;
  };

  const animateDice = (color) => {
    const die = diceElements[color];
    if (!die) return;

    // Afficher le GIF pendant toute la durée du lancer. La face finale est
    // appliquée ensuite dans le timeout de `roll`.
    die.style.backgroundImage = 'url("/dice/dice.gif")';
    die.classList.add("is-rolling");

    window.setTimeout(() => {
      die.classList.remove("is-rolling");
    }, DICE_ROLL_DURATION);
  };

  const clearOtherPendingCounts = (activeColor) => {
    Object.keys(state.pendingCounts).forEach((color) => {
      if (color !== activeColor) {
        state.pendingCounts[color] = [];
        state.selectedIndex[color] = 0;
        state.consecutiveSixes[color] = 0;
      }
    });
  };

  const getNextColor = (color) => {
    const index = state.turnOrder.indexOf(color);
    return index === -1 ? color : state.turnOrder[(index + 1) % state.turnOrder.length];
  };

  const passTurn = (color, notifyServer = true) => {
    state.pendingCounts[color] = [];
    state.selectedIndex[color] = 0;
    state.consecutiveSixes[color] = 0;
    state.turn = getNextColor(color);
    setDieEnabled(true);
    setMessage(state.turn);
    refreshSelectablePawns();
    if (notifyServer) callbacks.onTurnPassed?.(color);
  };

  const canMovePawn = (pawn, count) => {
    if (pawn.finished) return false;
    if (pawn.home) {
      return count === 6;
    }

    return pawn.move + count < 57;
  };

  const hasValidMove = (color, count) => {
    return state.pawns[color].some((pawn) => canMovePawn(pawn, count));
  };

  const hasPendingMove = (color) => {
    return state.pendingCounts[color].length > 0;
  };

  const getValidPawnNumbers = (color, count) => {
    return state.pawns[color].reduce((numbers, pawn, index) => {
      if (canMovePawn(pawn, count)) {
        numbers.push(index + 1);
      }

      return numbers;
    }, []);
  };

  const refreshSelectablePawns = () => {
    Object.entries(state.pawns).forEach(([color, pawns]) => {
      pawns.forEach((pawn) => {
        if (!pawn.element) return;
        pawn.element.classList.remove("is-selectable");
        const count = state.pendingCounts[color]?.[state.selectedIndex[color]];
        if (color === state.turn && Number.isInteger(count) && canMovePawn(pawn, count)) {
          pawn.element.classList.add("is-selectable");
        }
      });
    });
  };

  const getDestination = (color, position, move) => {
    const config = PLAYERS[color];

    // Le compteur interne est zero-based : la ligne finale commence au 51e pas.
    if (move >= 50) {
      if (position === config.finish) {
        return getFinishedDestination(color);
      }

      return getElement(`${config.finalPrefix}${position}`);
    }

    return getElement(position);
  };

  const returnPawnHome = (color, pawn) => {
    pawn.j = 0;
    pawn.move = 0;
    pawn.home = true;
    pawn.finished = false;
    animateTo(pawn.element, pawn.homeSlot);
  };

  const animateTo = (element, destination) => {
    if (!element || !destination) return;

    const from = element.getBoundingClientRect();
    destination.appendChild(element);
    const to = element.getBoundingClientRect();
    const deltaX = from.left - to.left;
    const deltaY = from.top - to.top;

    element.classList.add("ludo-token-moving");
    element.style.transition = "none";
    element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.06)`;

    requestAnimationFrame(() => {
      element.style.transition = `transform ${STEP_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      element.style.transform = "translate(0, 0) scale(1)";
    });

    window.setTimeout(() => {
      element.classList.remove("ludo-token-moving");
      element.style.transition = "";
      element.style.transform = "";
    }, STEP_DURATION + 30);
  };

  // Le couloir final coloré est protégé : un pion qui y est entré
  // ne peut plus être capturé ni renvoyé dans son garage.
  const isProtectedPawn = (pawn) => Boolean(
    pawn && (pawn.finished === true || (Number(pawn.move) >= 50 && Number(pawn.move) <= 56))
  );

  const willCapture = (activeColor, position, activePawn = null) => {
    if (SAFE_CELLS.has(position) || isProtectedPawn(activePawn)) return false;
    return Object.entries(state.pawns).some(([color, pawns]) =>
      color !== activeColor && pawns.some((pawn) => pawn.j === position && !pawn.home && !isProtectedPawn(pawn))
    );
  };

  const killCheck = (activeColor, position, activePawn = null) => {
    if (SAFE_CELLS.has(position) || (activePawn && isProtectedPawn(activePawn))) return;

    Object.entries(state.pawns).forEach(([color, pawns]) => {
      if (color === activeColor) return;

      pawns.forEach((pawn) => {
        if (pawn.j === position && !pawn.home && !isProtectedPawn(pawn)) {
          returnPawnHome(color, pawn);
          state.turn = activeColor;
        }
      });
    });
  };

  const movePawn = (color, pawn, count, animate = true) => {
    const config = PLAYERS[color];

    if (!canMovePawn(pawn, count)) {
      return { moved: false, duration: 0 };
    }

    // Un pion au garage sort directement sur sa case de départ avec un 6.
    // Cette règle doit être évaluée avant tout déplacement sur le parcours.
    if (pawn.home) {
      if (count !== 6) return { moved: false, duration: 0 };

      const startDestination = getElement(config.start);
      if (animate) {
        animateTo(pawn.element, startDestination);
      } else if (pawn.element && startDestination) {
        startDestination.appendChild(pawn.element);
      }
      pawn.j = config.start;
      pawn.home = false;
      pawn.finished = false;
      return { moved: true, duration: STEP_DURATION + 30, finished: false };
    }

    if (pawn.j !== 0) {
      // L'arrivée réelle correspond au dernier pas du parcours (56).
      // Une case portant le même numéro peut être traversée bien avant.
      const willFinish = pawn.move + count === 56;
      let targetPosition = pawn.j + count;
      let stepDelay = 0;
      let finalPositionAtStep = pawn.j;
      let finalMoveAtStep = pawn.move;

      for (let position = pawn.j + 1; position <= targetPosition; position += 1) {
        if (color !== "red" && position === 53) {
          targetPosition = targetPosition - position + 1;
          pawn.j = 1;
          position = 1;
        }

        stepDelay += 1;
        const moveAtStep = pawn.move;
        const positionAtStep = position;
        finalPositionAtStep = positionAtStep;
        finalMoveAtStep = moveAtStep;

        if (animate) {
          setTimeout(() => {
            const destination = getDestination(color, positionAtStep, moveAtStep);
            animateTo(pawn.element, destination);
          }, STEP_DURATION * stepDelay);
        }

        pawn.move += 1;
      }

      pawn.j = targetPosition;
      pawn.finished = willFinish;
      if (animate) {
        setTimeout(() => killCheck(color, targetPosition, pawn), STEP_DURATION * (stepDelay + 1));
      } else {
        // La restauration ne doit pas programmer d'anciennes animations :
        // seule la position finale de l'historique doit être affichée.
        const finalDestination = pawn.finished
          ? getFinishedDestination(color)
          : getDestination(color, finalPositionAtStep, finalMoveAtStep);
        if (pawn.element && finalDestination) finalDestination.appendChild(pawn.element);
        killCheck(color, targetPosition, pawn);
      }
      return { moved: true, duration: STEP_DURATION * (stepDelay + 1), finished: willFinish };
    }

    return { moved: false, duration: 0 };
  };

  const restoreMoves = (history = []) => {
    Object.entries(state.pawns).forEach(([color, pawns]) => {
      pawns.forEach((pawn, index) => {
        pawn.j = 0;
        pawn.move = 0;
        pawn.home = true;
        pawn.finished = false;
        if (pawn.element && pawn.homeSlot) pawn.homeSlot.appendChild(pawn.element);
      });
      state.pendingCounts[color] = [];
      state.selectedIndex[color] = 0;
    });

    history.forEach((entry) => {
      const color = entry?.color;
      const pawnNumber = Number(entry?.pawnNumber);
      const diceValue = Number(entry?.diceValue);
      if (!PLAYERS[color] || !Number.isInteger(pawnNumber) || !Number.isFinite(diceValue)) return;
      const pawn = state.pawns[color][pawnNumber - 1];
      if (!pawn) return;
      // L'historique représente déjà l'état serveur. Le rejouer avec des
      // timeouts d'animation pouvait faire revenir le pion sur une ancienne
      // case après le rafraîchissement, notamment lorsqu'il venait d'arriver.
      const result = movePawn(color, pawn, diceValue, false);
      console.log(`Replay: ${color} pawn ${pawnNumber}, dice ${diceValue}, finished: ${result.finished}`);
    });

    state.isAnimating = false;
  };

  const choose = (color, pawnNumber, notifyServer = true, capturedOverride = null, finishedOverride = null) => {
    if (state.isAnimating) return;
    if (color !== state.turn && state.pendingCounts[color].length === 0) return;

    const pendingCounts = state.pendingCounts[color];
    const countIndex = state.selectedIndex[color];

    if (!pendingCounts.length) return;

    const pawn = state.pawns[color][pawnNumber - 1];
    const currentCount = pendingCounts[countIndex];
    const { moved, duration, finished } = movePawn(color, pawn, currentCount);

    if (!moved) return;
    const captured = capturedOverride === null
      ? willCapture(color, pawn.j, pawn)
      : capturedOverride;
    const hasFinished = finishedOverride === null ? finished : finishedOverride;
    if (notifyServer) callbacks.onPawnChosen?.(color, pawnNumber, captured, hasFinished);

    state.isAnimating = true;
    setDieEnabled(false);

    setTimeout(() => {
      state.isAnimating = false;
      callbacks.onMoveFinished?.(color, duration);

      if (countIndex === pendingCounts.length - 1) {
        state.pendingCounts[color] = [];
        state.selectedIndex[color] = 0;
        if (currentCount !== 6 && !captured && !hasFinished) state.turn = getNextColor(color);
        // Règle temporaire : un seul pion arrivé suffit pour gagner.
        const finishedPawns = state.pawns[color].filter((pawn) => pawn.finished).length;
        if (notifyServer && finishedPawns === 4) callbacks.onWin?.(color, finishedPawns);
        setDieEnabled(true);
      } else {
        state.selectedIndex[color] += 1;
      }
      refreshSelectablePawns();
    }, duration);
  };

  const applyRemoteMove = (color, pawnNumber, diceValue, captured = false, finished = false) => {
    const count = Number(diceValue);
    if (!PLAYERS[color] || !Number.isFinite(count) || count < 1 || count > 6) return;
    if (state.isAnimating) return;

    state.turn = color;
    state.pendingCounts[color] = [count];
    state.selectedIndex[color] = 0;
    choose(color, pawnNumber, false, captured === true, finished === true);
  };

  const autoMoveIfOnlyChoice = (color, count) => {
    const validPawnNumbers = getValidPawnNumbers(color, count);

    if (validPawnNumbers.length === 1) {
      // L'animation du dé est déjà terminée à ce stade.
      setTimeout(() => choose(color, validPawnNumbers[0]), AUTO_MOVE_DELAY);
      return true;
    }

    return false;
  };

  const roll = (requestedColor = state.turn, forcedCount = null) => {
    if (state.isAnimating) return;
    if (requestedColor !== state.turn) return;
    if (hasPendingMove(requestedColor)) return;

    const activeColor = state.turn;
    const result = forcedCount ?? Math.floor(Math.random() * 6 + 1);

    // Tant que le dé roule, aucun pion ne peut devenir actif ou se déplacer.
    state.isAnimating = true;
    setMessage(activeColor);
    animateDice(activeColor);

    window.setTimeout(() => {
      state.count = result;
      setDiceFace(activeColor, state.count);
      state.isAnimating = false;
      clearOtherPendingCounts(activeColor);

    if (state.count === 6) {
      state.consecutiveSixes[activeColor] += 1;

      if (state.consecutiveSixes[activeColor] > 2) {
        passTurn(activeColor, false);
        return;
      }

      if (hasValidMove(activeColor, state.count)) {
        state.pendingCounts[activeColor].push(state.count);
        setDieEnabled(false);
        refreshSelectablePawns();
        autoMoveIfOnlyChoice(activeColor, state.count);
        return;
      }

      passTurn(activeColor);
      return;
    }

    state.consecutiveSixes[activeColor] = 0;

    if (hasValidMove(activeColor, state.count)) {
      state.pendingCounts[activeColor].push(state.count);
      setDieEnabled(false);
      refreshSelectablePawns();
      // Le tour change seulement après le choix et le déplacement du pion.
      autoMoveIfOnlyChoice(activeColor, state.count);
      return;
    }

      passTurn(activeColor);
    }, DICE_ROLL_DURATION);
  };

  setMessage(state.turn);
  Object.keys(PLAYERS).forEach((color) => setDiceFace(color, state.count));
  setDieEnabled(true);

  return {
    roll,
    choose,
    applyRemoteMove,
    restoreMoves,
    syncTurn: (color, turnOrder = null, pendingDice = null) => {
      if (!PLAYERS[color]) return;
      if (Array.isArray(turnOrder) && turnOrder.length > 0) state.turnOrder = turnOrder;
      state.turn = color;
      const restoredDice = Number(pendingDice);
      state.pendingCounts[color] = Number.isInteger(restoredDice) && restoredDice >= 1 && restoredDice <= 6
        ? [restoredDice]
        : [];
      state.selectedIndex[color] = 0;
      setMessage(color);
      setDieEnabled(state.pendingCounts[color].length === 0);
      refreshSelectablePawns();
    },
  };
}
