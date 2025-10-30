const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
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

const User = sequelize.define('User', {
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
}, 
{
    tableName: 'users',
    timestamps: false
});

const Playlist = sequelize.define('Playlist', {
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
}, 
{
    tableName: 'playlists',
    timestamps: false
});

User.hasMany(Playlist, { foreignKey: 'ownerEmail', sourceKey: 'email' });
Playlist.belongsTo(User, { foreignKey: 'ownerEmail', targetKey: 'email' });

async function clearTables() {
    try {
        await sequelize.query('TRUNCATE TABLE "playlists", "users" CASCADE');
        console.log("Tables cleared");
    } catch (err) {
        console.log("Error clearing tables:", err.message);
    }
}

async function fillTables(data) {
    try {
        console.log(`\nInserting ${data.users.length} users...`);
        for (let i = 0; i < data.users.length; i++) {
            let user = data.users[i];
            console.log(`  - Creating user: ${user.firstName} ${user.lastName} (${user.email})`);
            await User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                passwordHash: user.passwordHash
            });
        }
        console.log("✓ Users filled");

        console.log(`\nInserting ${data.playlists.length} playlists...`);
        for (let i = 0; i < data.playlists.length; i++) {
            let playlist = data.playlists[i];
            console.log(`  - Creating playlist: ${playlist.name} (${playlist.songs.length} songs)`);
            await Playlist.create({
                id: playlist._id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs
            });
        }
        console.log("✓ Playlists filled");
    } catch (err) {
        console.log("Error filling tables:");
        console.log(err);
        throw err;
    }
}

async function resetPostgre() {
    const testData = require('../example-db-data.json');

    try {
        console.log("Connecting to PostgreSQL...");
        await sequelize.authenticate();
        console.log("Connection established successfully.");

        await sequelize.sync({ force: true });
        console.log("Tables synced");

        console.log("Resetting the PostgreSQL DB");
        await clearTables();
        await fillTables(testData);

        console.log("PostgreSQL reset complete");
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

resetPostgre();