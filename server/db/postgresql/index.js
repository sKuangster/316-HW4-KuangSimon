/**
 * PostgreSQLManager - PostgreSQL implementation of DatabaseManager
 * 
 * This class implements all database operations using Sequelize.
 * All Sequelize-specific code goes ONLY in this file.
 */
const DatabaseManager = require('../index');
const { Sequelize, DataTypes } = require('sequelize');

class PostgreSQLManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = null;
        this.User = null;
        this.Playlist = null;
    }

    /**
     * Initialize and connect to PostgreSQL
     */
    async connect() {
        try {
            // Create Sequelize connection
            this.sequelize = new Sequelize(
                process.env.POSTGRES_DB,
                process.env.POSTGRES_USER,
                process.env.POSTGRES_PASSWORD,
                {
                    host: process.env.POSTGRES_HOST,
                    port: process.env.POSTGRES_PORT,
                    dialect: 'postgres',
                    logging: false
                }
            );

            // Test connection
            await this.sequelize.authenticate();

            // Define models
            this._defineModels();

            // Sync tables (create if don't exist, but don't drop existing)
            await this.sequelize.sync({ alter: false });

            console.log('PostgreSQL connected successfully');
            return true;
        } catch (error) {
            console.error('PostgreSQL connection error:', error);
            throw error;
        }
    }

    /**
     * Define Sequelize models
     */
    _defineModels() {
        // User Model
        this.User = this.sequelize.define('User', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            tableName: 'users',
            timestamps: false
        });

        // Playlist Model
        this.Playlist = this.sequelize.define('Playlist', {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ownerEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            songs: {
                type: DataTypes.JSON,
                defaultValue: []
            }
        }, {
            tableName: 'playlists',
            timestamps: false
        });

        // Define relationships
        this.User.hasMany(this.Playlist, { 
            foreignKey: 'ownerEmail', 
            sourceKey: 'email' 
        });
        this.Playlist.belongsTo(this.User, { 
            foreignKey: 'ownerEmail', 
            targetKey: 'email' 
        });
    }

    /**
     * Disconnect from PostgreSQL
     */
    async disconnect() {
        await this.sequelize.close();
        console.log('PostgreSQL disconnected');
    }

    // ==================== USER OPERATIONS ====================
    
    async createUser(userData) {
        return await this.User.create(userData);
    }

    async findUserByEmail(email) {
        return await this.User.findOne({ where: { email: email } });
    }

    async findUserById(id) {
        return await this.User.findByPk(id);
    }

    async updateUser(id, updateData) {
        const user = await this.User.findByPk(id);
        if (user) {
            return await user.update(updateData);
        }
        return null;
    }

    // ==================== PLAYLIST OPERATIONS ====================
    
    async createPlaylist(playlistData) {
        return await this.Playlist.create(playlistData);
    }

    async findPlaylistById(id) {
        return await this.Playlist.findByPk(id);
    }

    async getPlaylistPairsByOwner(ownerEmail) {
        const playlists = await this.Playlist.findAll({
            where: { ownerEmail: ownerEmail },
            attributes: ['id', 'name']
        });
        
        // Return in the format expected by the frontend (_id instead of id)
        return playlists.map(playlist => ({
            _id: playlist.id,
            name: playlist.name
        }));
    }

    async updatePlaylist(id, updateData) {
        const playlist = await this.Playlist.findByPk(id);
        if (playlist) {
            return await playlist.update(updateData);
        }
        return null;
    }

    async deletePlaylist(id) {
        const playlist = await this.Playlist.findByPk(id);
        if (playlist) {
            await playlist.destroy();
            return playlist;
        }
        return null;
    }
}

module.exports = PostgreSQLManager;