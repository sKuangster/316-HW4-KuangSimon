/**
 * DatabaseManager - Interface for database operations
 * 
 * This class defines the common interface that all database implementations must follow.
 * It provides database platform independence - we can swap MongoDB for PostgreSQL
 * just by changing the .env file.
 * 
 * @author Your Name
 */
class DatabaseManager {
    /**
     * Initialize and connect to the database
     */
    async connect() {
        throw new Error('Method connect() must be implemented');
    }

    /**
     * Disconnect from the database
     */
    async disconnect() {
        throw new Error('Method disconnect() must be implemented');
    }

    // ==================== USER OPERATIONS ====================
    
    /**
     * Create a new user
     * @param {Object} userData - User data {firstName, lastName, email, passwordHash}
     * @returns {Object} Created user
     */
    async createUser(userData) {
        throw new Error('Method createUser() must be implemented');
    }

    /**
     * Find user by email
     * @param {String} email - User email
     * @returns {Object} User object or null
     */
    async findUserByEmail(email) {
        throw new Error('Method findUserByEmail() must be implemented');
    }

    /**
     * Find user by ID
     * @param {String} id - User ID
     * @returns {Object} User object or null
     */
    async findUserById(id) {
        throw new Error('Method findUserById() must be implemented');
    }

    /**
     * Update user
     * @param {String} id - User ID
     * @param {Object} updateData - Data to update
     * @returns {Object} Updated user
     */
    async updateUser(id, updateData) {
        throw new Error('Method updateUser() must be implemented');
    }

    // ==================== PLAYLIST OPERATIONS ====================
    
    /**
     * Create a new playlist
     * @param {Object} playlistData - Playlist data {name, ownerEmail, songs}
     * @returns {Object} Created playlist
     */
    async createPlaylist(playlistData) {
        throw new Error('Method createPlaylist() must be implemented');
    }

    /**
     * Find playlist by ID
     * @param {String} id - Playlist ID
     * @returns {Object} Playlist object or null
     */
    async findPlaylistById(id) {
        throw new Error('Method findPlaylistById() must be implemented');
    }

    /**
     * Get all playlists for a user (returns id/name pairs)
     * @param {String} ownerEmail - Owner's email
     * @returns {Array} Array of {_id, name} objects
     */
    async getPlaylistPairsByOwner(ownerEmail) {
        throw new Error('Method getPlaylistPairsByOwner() must be implemented');
    }

    /**
     * Update playlist
     * @param {String} id - Playlist ID
     * @param {Object} updateData - Data to update
     * @returns {Object} Updated playlist
     */
    async updatePlaylist(id, updateData) {
        throw new Error('Method updatePlaylist() must be implemented');
    }

    /**
     * Delete playlist by ID
     * @param {String} id - Playlist ID
     * @returns {Object} Result of deletion
     */
    async deletePlaylist(id) {
        throw new Error('Method deletePlaylist() must be implemented');
    }
}

/**
 * Factory function to get the appropriate database manager
 * Based on the DATABASE_TYPE environment variable
 * Uses singleton pattern to ensure only one instance exists
 */
let dbManagerInstance = null;

function getDatabaseManager() {
    // Return existing instance if already created
    if (dbManagerInstance) {
        return dbManagerInstance;
    }
    
    require('dotenv').config();
    const dbType = process.env.DATABASE_TYPE || 'mongodb';
    
    console.log(`Loading ${dbType} database manager...`);
    
    switch(dbType.toLowerCase()) {
        case 'mongodb':
            const MongoDBManager = require('./mongodb');
            dbManagerInstance = new MongoDBManager();
            return dbManagerInstance;
            
        case 'postgresql':
        case 'postgres':
            const PostgreSQLManager = require('./postgresql');
            dbManagerInstance = new PostgreSQLManager();
            return dbManagerInstance;
            
        default:
            throw new Error(`Unknown database type: ${dbType}. Use 'mongodb' or 'postgresql'`);
    }
}

module.exports = DatabaseManager;
module.exports.getDatabaseManager = getDatabaseManager;