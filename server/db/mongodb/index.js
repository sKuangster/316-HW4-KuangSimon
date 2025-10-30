/**
 * MongoDBManager - MongoDB implementation of DatabaseManager
 * 
 * This class implements all database operations using Mongoose.
 * All MongoDB/Mongoose-specific code goes ONLY in this file.
 */
const DatabaseManager = require('../index');
const mongoose = require('mongoose');

class MongoDBManager extends DatabaseManager {
    constructor() {
        super();
        this.User = null;
        this.Playlist = null;
    }

    /**
     * Initialize and connect to MongoDB
     */
    async connect() {
        try {
            await mongoose.connect(process.env.DB_CONNECT, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            
            // Load models
            this.User = require('../../models/user-model');
            this.Playlist = require('../../models/playlist-model');
            
            console.log('MongoDB connected successfully');
            return true;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }

    // ==================== USER OPERATIONS ====================
    
    async createUser(userData) {
        const user = new this.User(userData);
        return await user.save();
    }

    async findUserByEmail(email) {
        return await this.User.findOne({ email: email });
    }

    async findUserById(id) {
        return await this.User.findById(id);
    }

    async updateUser(id, updateData) {
        return await this.User.findByIdAndUpdate(id, updateData, { new: true });
    }

    // ==================== PLAYLIST OPERATIONS ====================
    
    async createPlaylist(playlistData) {
        const playlist = new this.Playlist(playlistData);
        return await playlist.save();
    }

    async findPlaylistById(id) {
        return await this.Playlist.findById(id);
    }

    async getPlaylistPairsByOwner(ownerEmail) {
        const playlists = await this.Playlist.find({ ownerEmail: ownerEmail });
        // Return in the format expected by the frontend
        return playlists.map(playlist => ({
            _id: playlist._id,
            name: playlist.name
        }));
    }

    async updatePlaylist(id, updateData) {
        return await this.Playlist.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
    }

    async deletePlaylist(id) {
        return await this.Playlist.findByIdAndDelete(id);
    }
}

module.exports = MongoDBManager;