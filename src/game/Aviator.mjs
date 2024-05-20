// src/game/Aviator.mjs
import http from 'http';
import { Server } from 'socket.io';

const createSocketServer = (app) => {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002']
        }
    });

    // Initialize state variables
    let nextGameBetID = 0;
    let currentValue = 0;
    let fetchedValue = 0;
    let reachedMax = false;
    let countdown = 4;
    let loading = false;
    let loadingCountdown = 4;
    let xAxisMax = 2;
    let pauseIncrement = false;
    let pauseIncrementCountdown = 100;
    let displayedValue = 0;
    let fetchedValueHistory = [];
    let generatedNumbers = new Set();

    // Function to generate a unique random 6-digit number
    const generateUniqueNumber = () => {
        let BetID;
        do {
            // Generate a random 6-digit number
            BetID = Math.floor(100000 + Math.random() * 900000);
        } while (generatedNumbers.has(BetID)); // Check if the number already exists in the set
        return BetID;
    };

    // Function to reset state variables and generate a new unique number
    const resetState = () => {
        currentValue = 0;
        reachedMax = false;
        countdown = 4;
        loading = false;
        loadingCountdown = 4;
        fetchRandomValue();
        xAxisMax = 2;
        pauseIncrement = false;
        pauseIncrementCountdown = 100;
        displayedValue = 0;

        // Generate a new unique number for nextGameBetID
        nextGameBetID = generateUniqueNumber();
        // Add the new number to the set of generated numbers
        generatedNumbers.add(nextGameBetID);
    };

    // Function to fetch a random value
    const fetchRandomValue = () => {
        fetchedValue = parseFloat((Math.random() * (10.0 - 0) + 0).toFixed(2)); // Generate random number between 0 and 10
        console.log("fetchvalue", fetchedValue);
    };

    // Update state based on fetched value
    const updateState = () => {
        io.emit('backGroundSound');
        // Update current value based on fetched value
        if (!pauseIncrement && currentValue < fetchedValue) {
            currentValue = Math.min(currentValue + 0.005, fetchedValue);
        }
        // Update display value based on fetched value
        if (currentValue > 0 && displayedValue <= fetchedValue) {
            displayedValue = Math.min(displayedValue + 0.005, fetchedValue);
        }
        // Handle plane fly away conditions
        if (displayedValue === fetchedValue && !reachedMax) {
            reachedMax = true;
            io.emit('planeCashSound');
        } else if (reachedMax && currentValue < fetchedValue + 10) {
            currentValue = Math.min(currentValue + 0.05, fetchedValue + 10);
        }
        // Update x-axis maximum dynamically
        if (currentValue >= xAxisMax - 0.5) {
            pauseIncrement = true;
        }
    };

    // Function to handle incrementing x-axis max and pausing increment
    const handleIncrement = () => {
        xAxisMax += 0.005;
        pauseIncrementCountdown -= 1;
    };

    // WebSocket logic
    io.on('connection', (socket) => {
        // Emit initial state to the client
        socket.emit('updateNextGameBetID', nextGameBetID);
        socket.emit('updateCurrentValue', currentValue);
        socket.emit('updateFetchedValue', fetchedValue);
        socket.emit('updateReachedMax', reachedMax);
        socket.emit('updateCountdown', countdown);
        socket.emit('updateLoading', loading);
        socket.emit('updateLoadingCountdown', loadingCountdown);
        socket.emit('updateXAxisMax', xAxisMax);
        socket.emit('updateDisplayedValue', displayedValue);
        socket.emit('updatePauseIncrement', pauseIncrement); // Emit pauseIncrement
        socket.emit('updatePauseIncrementCountdown', pauseIncrementCountdown);

        // Handle other socket events as needed
    });

    // Initialize timeoutInterval outside the setInterval function
    let timeoutInterval;
    // Interval to update state and emit to clients
    setInterval(() => {
        updateState();
        // Check if pauseIncrement is true and countdown is greater than 0
        if (pauseIncrement && pauseIncrementCountdown > 0) {
            handleIncrement();
        } else if (pauseIncrementCountdown == 0) {
            pauseIncrement = false;
            pauseIncrementCountdown = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
        }
        io.emit('updateNextGameBetID', nextGameBetID);
        io.emit('updateCurrentValue', currentValue);
        io.emit('updateFetchedValue', fetchedValue);
        io.emit('updateReachedMax', reachedMax);
        io.emit('updateCountdown', countdown);
        io.emit('updateLoading', loading);
        io.emit('updateLoadingCountdown', loadingCountdown);
        io.emit('updateXAxisMax', xAxisMax);
        io.emit('updateDisplayedValue', displayedValue);
        io.emit('updatePauseIncrement', pauseIncrement);
        io.emit('updatePauseIncrementCountdown', pauseIncrementCountdown);

        // Function to update fetchedValueHistory after countdown reaches 0
        const updateFetchedValueHistory = () => {
            fetchedValueHistory.unshift(fetchedValue);
            fetchedValueHistory = fetchedValueHistory.slice(0, 40);
            io.emit('updateFetchedValueHistory', fetchedValueHistory);
        };

        // Start countdown when reachedMax is true
        if (reachedMax) {
            if (!timeoutInterval) { // Only start countdown if it hasn't started yet
                timeoutInterval = setInterval(() => {
                    // Decrement countdown
                    countdown -= 1;
                    // When countdown reaches 0, start loadingCountdown
                    if (countdown === 0) {
                        clearInterval(timeoutInterval);
                        loading = true;
                        timeoutInterval = null;
                        // Start loadingCountdown
                        timeoutInterval = setInterval(() => {
                            loadingCountdown -= 1;
                            // When loadingCountdown reaches 0, reset state
                            if (loadingCountdown === 0) {
                                clearInterval(timeoutInterval);
                                resetState();
                                console.log(' Aviator BetID No. ' + nextGameBetID);
                                io.emit('gameStartSound');
                                updateFetchedValueHistory(); // Update fetchedValueHistory
                                timeoutInterval = null; // Reset the timeoutInterval variable
                            }
                        }, 1000);
                    }
                }, 1000);
            }
        } else {
            // Clear the timeoutInterval if reachedMax is false
            clearInterval(timeoutInterval);
            timeoutInterval = null; // Reset the timeoutInterval variable
        }
    }, 10);

    //------------------------------------game logic--------------------------------------------//

    //-----------------------------------Logic  UserList ---------------------------------------//

    // Define a variable to store the list of users
    let userList = [];
    // Function to send the list of users to all connected clients
    const sendUserListToClients = () => {
        io.emit('userList', userList);
    }

    // Define a variable to store user sessions
    let userSessions = {};

    // Function to check if a user exists in the session
    const userExistsInSession = (userId) => {
        return userSessions.hasOwnProperty(userId);
    }

    io.on("connect", (socket) => {
        console.log("Incoming Connected");

        // received the data from client side.
        socket.on('userData', (data) => {
            console.log('Received user data from client:', data.userId, data.userName, data.userWallet);
            const { userId, userName, userWallet } = data;

            // Check if user already exists in session
            if (!userExistsInSession(userId)) {
                // If user does not exist in session, add to session and user list
                userSessions[userId] = {
                    socketId: socket.id,
                    userName: userName,
                    userWallet: userWallet
                };

                userList.push({
                    userId: userId,
                    userName: userName,
                    userWallet: userWallet
                });

                // Send updated user list to all clients
                sendUserListToClients();
            } else {
                // If user already exists, update the socket ID
                userSessions[userId].socketId = socket.id;
            }
        });

        // Handle disconnect event
        socket.on("disconnect", () => {
            console.log("User disconnected");
            // Remove the user from the session and user list
            Object.keys(userSessions).forEach(userId => {
                if (userSessions[userId].socketId === socket.id) {
                    delete userSessions[userId];
                    userList = userList.filter(user => user.userId !== userId);
                    // Send updated user list to all clients
                    sendUserListToClients();
                }
            });
        });
    });


    //-----------------------------------Logic UserList -------------------------------------//
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    }).on('error', (err) => {
        console.log(err);
        process.exit();
    });

};

export default createSocketServer;
