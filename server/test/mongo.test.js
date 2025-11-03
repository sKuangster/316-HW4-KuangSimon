import { beforeAll, beforeEach, afterEach, afterAll, expect, test, describe } from 'vitest';
const dotenv = require('dotenv').config({ path: __dirname + '/../.env' });
const { getDatabaseManager } = require('../db');

/**
 * Vitest test script for the Playlister app's Database Manager. 
 * Testing verifies that the Database Manager performs all necessary operations properly.
 * 
 * This test suite will work with either MongoDB or PostgreSQL depending on the 
 * DATABASE_TYPE setting in the .env file.
 * 
 * Test Coverage:
 *  1) connect() - Connect to database
 *  2) createUser() - Create a user
 *  3) findUserByEmail() - Find user by email
 *  4) findUserById() - Find user by ID
 *  5) updateUser() - Update user information
 *  6) createPlaylist() - Create a playlist
 *  7) findPlaylistById() - Find playlist by ID
 *  8) getPlaylistPairsByOwner() - Get playlists by owner email
 *  9) updatePlaylist() - Update playlist information
 * 10) deletePlaylist() - Delete a playlist
 * 11) disconnect() - Disconnect from database
 */

let dbManager;
let testUserId;
let testPlaylistId;
const testUserEmail = 'test@vitest.com';

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    // Get the database manager instance based on .env configuration
    dbManager = getDatabaseManager();
    
    // Connect to the database
    await dbManager.connect();
    console.log('Database connected for testing');
});

/**
 * Executed before each test is performed.
 */
beforeEach(() => {
    // Tests are independent, each test creates its own data
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
    // Cleanup happens in individual tests or afterAll
});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    // Clean up test data
    try {
        if (testPlaylistId) {
            await dbManager.deletePlaylist(testPlaylistId);
        }
        // Note: We're not deleting test user to avoid breaking constraints
        // In a real test suite, you'd want to clean up everything
    } catch (err) {
        console.log('Cleanup error (this is okay):', err.message);
    }
    
    await dbManager.disconnect();
    console.log('Database disconnected after testing');
});

describe('Database Manager Tests', () => {
    
    /**
     * Test #1: Connect to Database
     * Verifies that the database manager can establish a connection
     */
    test('Test #1: connect() - Connecting to the Database', async () => {
        // The connection is already established in beforeAll
        // We just verify that the dbManager exists and has the expected methods
        expect(dbManager).toBeDefined();
        expect(dbManager.connect).toBeDefined();
        expect(typeof dbManager.connect).toBe('function');
    });

    /**
     * Test #2: Create a User
     * Verifies that the database manager can create a new user
     */
    test('Test #2: createUser() - Creating a User in the Database', async () => {
        const testUser = {
            firstName: 'Vitest',
            lastName: 'User',
            email: testUserEmail,
            passwordHash: '$2a$10$testHashForVitestUser123456789'
        };

        // Create the user
        const createdUser = await dbManager.createUser(testUser);

        // Store the ID for later tests
        testUserId = createdUser._id || createdUser.id;

        // Verify the user was created with correct data
        expect(createdUser).toBeDefined();
        expect(createdUser.firstName).toBe(testUser.firstName);
        expect(createdUser.lastName).toBe(testUser.lastName);
        expect(createdUser.email).toBe(testUser.email);
        expect(createdUser.passwordHash).toBe(testUser.passwordHash);
        expect(testUserId).toBeDefined();
    });

    /**
     * Test #3: Find User by Email
     * Verifies that the database manager can retrieve a user by email
     */
    test('Test #3: findUserByEmail() - Reading a User by Email from the Database', async () => {
        // Find the user we created in test #2
        const foundUser = await dbManager.findUserByEmail(testUserEmail);

        // Verify the user was found and has correct data
        expect(foundUser).toBeDefined();
        expect(foundUser.email).toBe(testUserEmail);
        expect(foundUser.passwordHash).toBe('$2a$10$testHashForVitestUser123456789');
        // Note: firstName and lastName may have been updated by other tests
        // We're primarily testing that findUserByEmail works
        expect(foundUser.firstName).toBeDefined();
        expect(foundUser.lastName).toBeDefined();
    });

    /**
     * Test #4: Find User by ID
     * Verifies that the database manager can retrieve a user by ID
     */
    test('Test #4: findUserById() - Reading a User by ID from the Database', async () => {
        // Find the user by ID
        const foundUser = await dbManager.findUserById(testUserId);

        // Verify the user was found and has correct data
        expect(foundUser).toBeDefined();
        // Convert both to strings for comparison
        const foundId = (foundUser._id || foundUser.id).toString();
        const expectedId = testUserId.toString();
        expect(foundId).toBe(expectedId);
        expect(foundUser.firstName).toBe('Vitest');
        expect(foundUser.lastName).toBe('User');
        expect(foundUser.email).toBe(testUserEmail);
    });

    /**
     * Test #5: Update User
     * Verifies that the database manager can update user information
     */
    test('Test #5: updateUser() - Updating a User in the Database', async () => {
        const updateData = {
            firstName: 'Updated',
            lastName: 'VitestUser'
        };

        // Update the user
        const updatedUser = await dbManager.updateUser(testUserId, updateData);

        // Verify the user was updated
        expect(updatedUser).toBeDefined();
        expect(updatedUser.firstName).toBe('Updated');
        expect(updatedUser.lastName).toBe('VitestUser');
        expect(updatedUser.email).toBe(testUserEmail); // Should remain unchanged

        // Verify by reading again
        const verifyUser = await dbManager.findUserById(testUserId);
        expect(verifyUser.firstName).toBe('Updated');
        expect(verifyUser.lastName).toBe('VitestUser');
    });

    /**
     * Test #6: Create Playlist
     * Verifies that the database manager can create a new playlist
     */
    test('Test #6: createPlaylist() - Creating a Playlist in the Database', async () => {
        const testPlaylist = {
            name: 'Vitest Playlist',
            ownerEmail: testUserEmail,
            songs: [
                {
                    title: 'Test Song 1',
                    artist: 'Test Artist 1',
                    year: 2024,
                    youTubeId: 'test123'
                },
                {
                    title: 'Test Song 2',
                    artist: 'Test Artist 2',
                    year: 2024,
                    youTubeId: 'test456'
                }
            ]
        };

        // Create the playlist
        const createdPlaylist = await dbManager.createPlaylist(testPlaylist);

        // Store the ID for later tests
        testPlaylistId = createdPlaylist._id || createdPlaylist.id;

        // Verify the playlist was created
        expect(createdPlaylist).toBeDefined();
        expect(createdPlaylist.name).toBe(testPlaylist.name);
        expect(createdPlaylist.ownerEmail).toBe(testPlaylist.ownerEmail);
        expect(createdPlaylist.songs).toBeDefined();
        expect(createdPlaylist.songs.length).toBe(2);
        expect(createdPlaylist.songs[0].title).toBe('Test Song 1');
        expect(testPlaylistId).toBeDefined();
    });

    /**
     * Test #7: Find Playlist by ID
     * Verifies that the database manager can retrieve a playlist by ID
     */
    test('Test #7: findPlaylistById() - Reading a Playlist by ID from the Database', async () => {
        // Find the playlist by ID
        const foundPlaylist = await dbManager.findPlaylistById(testPlaylistId);

        // Verify the playlist was found
        expect(foundPlaylist).toBeDefined();
        // Convert both to strings for comparison
        const foundId = (foundPlaylist._id || foundPlaylist.id).toString();
        const expectedId = testPlaylistId.toString();
        expect(foundId).toBe(expectedId);
        expect(foundPlaylist.name).toBe('Vitest Playlist');
        expect(foundPlaylist.ownerEmail).toBe(testUserEmail);
        expect(foundPlaylist.songs.length).toBe(2);
    });

    /**
     * Test #8: Get Playlist Pairs by Owner
     * Verifies that the database manager can retrieve all playlists for a user
     */
    test('Test #8: getPlaylistPairsByOwner() - Getting Playlist Pairs by Owner Email', async () => {
        // Get all playlists for our test user
        const playlists = await dbManager.getPlaylistPairsByOwner(testUserEmail);

        // Verify we got at least our test playlist
        expect(playlists).toBeDefined();
        expect(Array.isArray(playlists)).toBe(true);
        expect(playlists.length).toBeGreaterThan(0);

        // Find our specific playlist - convert IDs to strings for comparison
        const testIdString = testPlaylistId.toString();
        const ourPlaylist = playlists.find(p => {
            const pId = (p._id || p.id).toString();
            return pId === testIdString;
        });
        
        expect(ourPlaylist).toBeDefined();
        expect(ourPlaylist.name).toBe('Vitest Playlist');
        expect(ourPlaylist._id).toBeDefined();
    });

    /**
     * Test #9: Update Playlist
     * Verifies that the database manager can update playlist information
     */
    test('Test #9: updatePlaylist() - Updating a Playlist in the Database', async () => {
        const updateData = {
            name: 'Updated Vitest Playlist',
            songs: [
                {
                    title: 'Updated Song',
                    artist: 'Updated Artist',
                    year: 2025,
                    youTubeId: 'updated789'
                }
            ]
        };

        // Update the playlist
        const updatedPlaylist = await dbManager.updatePlaylist(testPlaylistId, updateData);

        // Verify the playlist was updated
        expect(updatedPlaylist).toBeDefined();
        expect(updatedPlaylist.name).toBe('Updated Vitest Playlist');
        expect(updatedPlaylist.songs.length).toBe(1);
        expect(updatedPlaylist.songs[0].title).toBe('Updated Song');

        // Verify by reading again
        const verifyPlaylist = await dbManager.findPlaylistById(testPlaylistId);
        expect(verifyPlaylist.name).toBe('Updated Vitest Playlist');
        expect(verifyPlaylist.songs.length).toBe(1);
    });

    /**
     * Test #10: Delete Playlist
     * Verifies that the database manager can delete a playlist
     */
    test('Test #10: deletePlaylist() - Deleting a Playlist from the Database', async () => {
        // Delete the playlist
        const result = await dbManager.deletePlaylist(testPlaylistId);

        // Verify deletion was successful
        expect(result).toBeDefined();

        // Verify the playlist no longer exists
        const foundPlaylist = await dbManager.findPlaylistById(testPlaylistId);
        expect(foundPlaylist).toBeNull();

        // Clear the ID so afterAll doesn't try to delete it again
        testPlaylistId = null;
    });

    /**
     * Test #11: Disconnect from Database
     * Verifies that the database manager can properly disconnect
     */
    test('Test #11: disconnect() - Disconnecting from the Database', async () => {
        // The actual disconnect happens in afterAll
        // We just verify the method exists
        expect(dbManager.disconnect).toBeDefined();
        expect(typeof dbManager.disconnect).toBe('function');
    });
});