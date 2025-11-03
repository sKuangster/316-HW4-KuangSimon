import { beforeAll, beforeEach, afterEach, afterAll, expect, test, describe } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
const dotenv = require('dotenv').config({ path: __dirname + '/../.env' });
const { getDatabaseManager } = require('../db');

let dbManager;
let testUserId;
let testPlaylistId;

// Make unique identifiers so Postgres doesn’t fail unique constraints
const uniqueSuffix = Date.now();
const testUserEmail = `test_${uniqueSuffix}@vitest.com`;

beforeAll(async () => {
    dbManager = getDatabaseManager();
    await dbManager.connect();
    console.log(`Connected to ${process.env.DATABASE_TYPE} for testing`);
});

afterAll(async () => {
    try {
        if (testPlaylistId) await dbManager.deletePlaylist(testPlaylistId);
    } catch (err) {
        console.warn('Cleanup warning:', err.message);
    }
    await dbManager.disconnect();
    console.log('Disconnected after testing');
});

describe('Database Manager Tests', () => {
    test('Test #1: connect()', async () => {
        expect(dbManager).toBeDefined();
        expect(typeof dbManager.connect).toBe('function');
    });

    test('Test #2: createUser()', async () => {
        const testUser = {
            firstName: 'Vitest',
            lastName: 'User',
            email: testUserEmail,
            passwordHash: '$2a$10$testHashForVitestUser123456789'
        };

        const createdUser = await dbManager.createUser(testUser);
        testUserId = createdUser._id || createdUser.id;

        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe(testUserEmail);
    });

    test('Test #3: findUserByEmail()', async () => {
        const found = await dbManager.findUserByEmail(testUserEmail);
        expect(found).toBeDefined();
        expect(found.email).toBe(testUserEmail);
    });

    test('Test #4: findUserById()', async () => {
        const found = await dbManager.findUserById(testUserId);
        expect(found).toBeDefined();
        const foundId = (found._id || found.id).toString();
        expect(foundId).toBe(testUserId.toString());
    });

    test('Test #5: updateUser()', async () => {
        const updated = await dbManager.updateUser(testUserId, { firstName: 'Updated', lastName: 'VitestUser' });
        expect(updated).toBeDefined();
        expect(updated.firstName).toBe('Updated');
    });

    test('Test #6: createPlaylist()', async () => {
        const testPlaylist = {
            id: process.env.DATABASE_TYPE?.startsWith('postgres') ? uuidv4() : undefined,
            name: 'Vitest Playlist',
            ownerEmail: testUserEmail,
            songs: [
                { title: 'Song 1', artist: 'Artist 1', year: 2024, youTubeId: 'abc' },
                { title: 'Song 2', artist: 'Artist 2', year: 2024, youTubeId: 'def' }
            ]
        };

        const created = await dbManager.createPlaylist(testPlaylist);
        testPlaylistId = created._id || created.id;

        expect(created).toBeDefined();
        expect(created.name).toBe('Vitest Playlist');
        expect(testPlaylistId).toBeDefined();
    });

    test('Test #7: findPlaylistById()', async () => {
        const found = await dbManager.findPlaylistById(testPlaylistId);
        expect(found).toBeDefined();
        expect(found.name).toBe('Vitest Playlist');
    });

    test('Test #8: getPlaylistPairsByOwner()', async () => {
        const pairs = await dbManager.getPlaylistPairsByOwner(testUserEmail);
        expect(Array.isArray(pairs)).toBe(true);
        expect(pairs.length).toBeGreaterThan(0);
        const match = pairs.find(p => (p._id || p.id).toString() === testPlaylistId.toString());
        expect(match).toBeDefined();
    });

    test('Test #9: updatePlaylist()', async () => {
        const updated = await dbManager.updatePlaylist(testPlaylistId, {
            name: 'Updated Vitest Playlist',
            songs: [{ title: 'Updated Song', artist: 'New Artist', year: 2025, youTubeId: 'xyz' }]
        });
        expect(updated).toBeDefined();
        expect(updated.name).toBe('Updated Vitest Playlist');
    });

    test('Test #10: deletePlaylist()', async () => {
        const result = await dbManager.deletePlaylist(testPlaylistId);
        expect(result).toBeDefined();
        const check = await dbManager.findPlaylistById(testPlaylistId);
        expect(check).toBeNull();
        testPlaylistId = null;
    });

    test('Test #11: disconnect()', async () => {
        expect(typeof dbManager.disconnect).toBe('function');
    });
});
